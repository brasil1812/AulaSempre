import { test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { readFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';

test('browser: school and teacher complete the real database workflow, including failures', {timeout:150000}, async () => {
  const name=`aulasempre_test_${randomUUID().replaceAll('-','')}`;
  let admin,pool,server,browser;
  const artifacts=new URL('../../.test-artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
  const runtimeErrors=[];
  try {
    admin=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true});
    const sql=await readFile(new URL('../../Data-base/aulasempre.sql',import.meta.url),'utf8');await admin.query(sql.replace(/\baulasempre\b/g,name));
    process.env.DB_NAME=name;process.env.JWT_SECRET='browser-integration-test-secret-more-than-thirty-two-characters';
    ({pool}=await import('../src/database/connection.js'));
    const {default:app}=await import('../src/app.js');server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:process.platform==='win32'?{channel:'msedge'}:{})});
    const schoolContext=await browser.newContext({viewport:{width:1366,height:1000}}),teacherContext=await browser.newContext({viewport:{width:1366,height:1000}});
    const school=await schoolContext.newPage(),teacher=await teacherContext.newPage();
    for(const page of [school,teacher]){page.setDefaultTimeout(12000);page.on('pageerror',error=>runtimeErrors.push(error.message));}
    async function register(page,role,email,nome){
      await page.goto(base+'/entrar');await page.getByRole('button',{name:'Cadastre-se',exact:true}).click();
      await page.locator('[formcontrolname="name"]').fill(nome);await page.locator('[formcontrolname="email"]').fill(email);
      await page.locator('[formcontrolname="password"]').fill('Browser123!');await page.locator('[formcontrolname="city"]').fill('São Paulo');await page.locator('[formcontrolname="state"]').fill('SP');
      await page.getByRole('button',{name:role==='ESCOLA'?'🏫 Sou uma escola':'👩‍🏫 Sou professor',exact:true}).click();
      await page.getByRole('button',{name:'Criar conta',exact:true}).click();await page.waitForURL(base+(role==='ESCOLA'?'/instituicao':'/professor'));
    }
    await school.goto(base+'/instituicao/solicitacoes');await school.waitForURL(base+'/entrar');
    await register(school,'ESCOLA','escola.browser@example.test','Escola Browser');
    await register(teacher,'PROFESSOR','professor.browser@example.test','Professor Browser');
    await teacher.getByRole('link',{name:'Meu perfil'}).click();await teacher.locator('input[name="cidade"]').waitFor();
    await teacher.locator('input[name="nome_profissional"]').fill('Professor Browser');await teacher.locator('input[name="experiencia"]').fill('5');
    await teacher.getByText('Matemática',{exact:true}).locator('input').check();await teacher.getByText('Ensino Médio',{exact:true}).locator('input').check();
    await teacher.getByRole('button',{name:'Adicionar horário',exact:true}).click();await teacher.getByRole('button',{name:'Adicionar formação',exact:true}).click();
    await teacher.getByLabel('Curso',{exact:true}).fill('Licenciatura em Matemática');await teacher.getByLabel('Instituição',{exact:true}).fill('USP');await teacher.getByLabel('Ano de conclusão',{exact:true}).fill('2020');
    await teacher.getByRole('button',{name:'Salvar perfil',exact:true}).click();await teacher.getByText('Perfil salvo.',{exact:true}).waitFor();
    await teacher.reload();await teacher.locator('input[name="cidade"]').waitFor();assert.equal(await teacher.locator('input[name="experiencia"]').inputValue(),'5');
    const day=new Date(Date.now()+14*86400000);while(day.getUTCDay()!==1)day.setUTCDate(day.getUTCDate()+1);const date=day.toISOString().slice(0,10);
    async function fillRequest(turma){
      await school.goto(base+'/instituicao/solicitar');await school.locator('select[formcontrolname="disciplina"] option').filter({hasText:'Matemática'}).waitFor({state:'attached'});
      await school.locator('[formcontrolname="disciplina"]').selectOption({label:'Matemática'});await school.locator('[formcontrolname="nivel"]').selectOption({label:'Ensino Médio'});await school.locator('[formcontrolname="turma"]').fill(turma);await school.locator('[formcontrolname="conteudo"]').fill('Conteúdo browser');
      await school.getByRole('button',{name:'Continuar',exact:true}).click();await school.locator('[formcontrolname="data"]').fill(date);await school.locator('[formcontrolname="horarioInicio"]').fill('08:00');await school.locator('[formcontrolname="horarioFim"]').fill('10:00');await school.locator('[formcontrolname="endereco"]').fill('Rua Browser, 10');
      await school.getByRole('button',{name:'Continuar',exact:true}).click();await school.locator('[formcontrolname="valor"]').fill('180');await school.locator('[formcontrolname="formacao"]').selectOption({label:'Licenciatura completa na área'});await school.locator('[formcontrolname="experiencia"]').selectOption({label:'Pelo menos 2 anos'});await school.locator('[formcontrolname="observacoes"]').fill('Observação browser');await school.getByRole('button',{name:'Continuar',exact:true}).click();
    }
    await fillRequest('Fluxo completo');
    await school.route('**/api/solicitacoes',route=>route.request().method()==='POST'?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({erro:'Falha de gravação simulada'})}):route.continue());
    await school.getByRole('button',{name:'Publicar solicitação',exact:true}).click();await school.getByText('Falha de gravação simulada',{exact:true}).waitFor();assert.equal(await school.getByText('Solicitação criada!',{exact:true}).count(),0);
    assert.equal((await pool.query("SELECT COUNT(*) AS n FROM solicitacao_substituicao WHERE turma='Fluxo completo'"))[0][0].n,0);
    await school.unroute('**/api/solicitacoes');await school.getByRole('button',{name:'Publicar solicitação',exact:true}).click();await school.getByText('Solicitação criada!',{exact:true}).waitFor();
    async function sendInvite(turma){
      await school.getByRole('button',{name:'Buscar professores agora',exact:true}).click();const select=school.locator('.select-req-box select');await select.locator('option').filter({hasText:turma}).waitFor({state:'attached'});
      const rid=await select.locator('option').filter({hasText:turma}).getAttribute('value');await select.selectOption(rid);
      const card=school.locator('.teacher-card').filter({hasText:'Professor Browser'});await card.waitFor();await card.getByRole('button',{name:'Convidar para substituição',exact:true}).click();await school.getByText('Convite enviado para Professor Browser! Aguardando resposta.',{exact:true}).waitFor();return rid;
    }
    const rid=await sendInvite('Fluxo completo');
    await teacher.goto(base+'/professor/convites');const pending=teacher.locator('.invite-card').filter({hasText:'Fluxo completo'});await pending.waitFor();assert.ok((await pending.innerText()).includes('180.00'));
    await teacher.route('**/api/convites/*/resposta',route=>route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({erro:'Conflito simulado'})}));
    await pending.getByRole('button',{name:'Aceitar convite',exact:true}).click();await teacher.getByText('Conflito simulado',{exact:true}).waitFor();assert.equal(await pending.count(),1);
    await teacher.unroute('**/api/convites/*/resposta');await pending.getByRole('button',{name:'Aceitar convite',exact:true}).click();await pending.waitFor({state:'detached'});
    await teacher.getByRole('link',{name:'Confirmadas'}).click();await teacher.getByText('Fluxo completo · Escola Browser',{exact:true}).waitFor();
    await school.goto(base+'/instituicao/solicitacoes');const requestCard=school.locator('.req-card').filter({hasText:'Fluxo completo'});await requestCard.getByText('Professor confirmado',{exact:true}).waitFor();
    await school.screenshot({path:new URL('school-confirmed.png',artifacts).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true,animations:'disabled'});
    await requestCard.getByRole('button',{name:'Concluir aula',exact:true}).click();await requestCard.getByRole('button',{name:'Avaliar professor',exact:true}).click();await requestCard.locator('textarea').fill('Avaliação pelo navegador');await requestCard.getByRole('button',{name:'Enviar avaliação',exact:true}).click();await requestCard.getByText('Avaliação: 5/5',{exact:true}).waitFor();
    await school.reload();await school.locator('.req-card').filter({hasText:'Fluxo completo'}).getByText('Avaliação: 5/5',{exact:true}).waitFor();
    const [saved]=await pool.query('SELECT s.*,sub.status AS substitution_status,av.nota FROM solicitacao_substituicao s JOIN substituicao sub ON sub.id_solicitacao=s.id_solicitacao JOIN avaliacao av ON av.id_substituicao=sub.id_substituicao WHERE s.id_solicitacao=?',[rid]);assert.equal(saved[0].status,'CONCLUIDA');assert.equal(saved[0].substitution_status,'REALIZADA');assert.equal(saved[0].nota,5);assert.equal(saved[0].conteudo,'Conteúdo browser');assert.equal(Number(saved[0].valor),180);
    await fillRequest('Fluxo recusa');await school.getByRole('button',{name:'Publicar solicitação',exact:true}).click();await school.getByText('Solicitação criada!',{exact:true}).waitFor();const declinedId=await sendInvite('Fluxo recusa');
    await teacher.goto(base+'/professor/convites');const declineCard=teacher.locator('.invite-card').filter({hasText:'Fluxo recusa'});await declineCard.getByRole('button',{name:'Recusar convite',exact:true}).click();await declineCard.waitFor({state:'detached'});assert.equal((await pool.query('SELECT status FROM solicitacao_substituicao WHERE id_solicitacao=?',[declinedId]))[0][0].status,'ABERTA');
    await fillRequest('Fluxo cancelamento');await school.getByRole('button',{name:'Publicar solicitação',exact:true}).click();await school.getByText('Solicitação criada!',{exact:true}).waitFor();const canceledId=await sendInvite('Fluxo cancelamento');
    await school.goto(base+'/instituicao/solicitacoes');const cancelCard=school.locator('.req-card').filter({hasText:'Fluxo cancelamento'});await cancelCard.getByRole('button',{name:'Cancelar',exact:true}).click();await cancelCard.getByText('Cancelada',{exact:true}).waitFor();assert.equal((await pool.query('SELECT status FROM convite WHERE id_solicitacao=?',[canceledId]))[0][0].status,'CANCELADO');
    await teacher.goto(base+'/instituicao');await teacher.waitForURL(base+'/professor');
    await school.getByRole('button',{name:'Sair',exact:true}).click();await school.waitForURL(base+'/');await register(school,'ESCOLA','outra.browser@example.test','Outra Escola Browser');await school.goto(base+'/instituicao/solicitacoes');await school.getByText('Nenhuma solicitação encontrada',{exact:false}).waitFor();assert.equal(await school.locator('.req-card').count(),0);
    await school.setViewportSize({width:390,height:844});
    for(const route of ['/instituicao/solicitar','/instituicao/professores']) {
      await school.goto(base+route);await school.locator('h1').waitFor();
      assert.ok(await school.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`Mobile layout overflow at ${route}`);
    }
    await teacher.setViewportSize({width:390,height:844});await teacher.goto(base+'/professor/perfil');await teacher.locator('input[name="cidade"]').waitFor();
    assert.ok(await teacher.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile profile layout overflow');
    await teacher.screenshot({path:new URL('teacher-profile-mobile.png',artifacts).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true,animations:'disabled'});
    assert.deepEqual(runtimeErrors,[]);
    console.log('Browser flow validated: registration, profile, create, failed write, matching, invite, failed accept, confirm, complete, evaluate, decline, cancel, role guard, account isolation.');
  } catch(error) {
    if(browser){for(const context of browser.contexts()){for(const [i,page]of context.pages().entries()){await page.screenshot({path:new URL(`failure-${context===browser.contexts()[0]?'school':'teacher'}-${i}.png`,artifacts).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true}).catch(()=>{});console.error((await page.locator('body').innerText().catch(()=>'' )).slice(0,3500));}}}
    throw error;
  } finally {
    if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));if(pool)await pool.end();if(admin){if(/^aulasempre_test_[a-f0-9]{32}$/.test(name))await admin.query(`DROP DATABASE IF EXISTS \`${name}\``);await admin.end();}
  }
});
