import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// All writes use a new database. The application database is never reset by these tests.
const databaseName = `aulasempre_test_${randomUUID().replaceAll('-', '')}`;
const config = { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, multipleStatements: true };
let admin, pool, server, base, school, otherSchool, teachers, date, requestId, substitutionId;
async function request(path, { method = 'GET', token, body, status = 200 } = {}) {
  const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const result = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
  return result;
}
async function account(name, role) {
  const email = `${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(' ', '').toLowerCase()}@example.test`, senha = 'Integration123!';
  await request('/api/auth/cadastro', { method: 'POST', body: { nome: name, email, senha, tipo_usuario: role, cidade: 'São Paulo', estado: 'SP' }, status: 201 });
  return request('/api/auth/login', { method: 'POST', body: { email, senha } });
}
function payload(extra = {}) { return { id_disciplina: 1, id_nivel_ensino: 4, data_aula: date, horario_inicio: '08:00', horario_fim: '10:00', turma: 'Turma integração', modalidade: 'PRESENCIAL', cidade: 'São Paulo', endereco: 'Rua de teste, 100', valor: 150.50, conteudo: 'Álgebra', observacoes: 'Trazer material', formacao_minima: 'Licenciatura completa na área', experiencia_minima: 2, ...extra }; }
async function create(extra = {}) { return request('/api/solicitacoes', {method:'POST', token:school.token, body:payload(extra), status:201}); }
async function invite(idRequest, teacher) { return request('/api/convites', {method:'POST',token:school.token,body:{id_solicitacao:idRequest,id_professor:teacher.id},status:201}); }

before(async () => {
  admin = await mysql.createConnection(config);
  const sql = await readFile(new URL('../../Data-base/aulasempre.sql', import.meta.url), 'utf8');
  await admin.query(sql.replace(/\baulasempre\b/g, databaseName));
  process.env.DB_NAME = databaseName; process.env.JWT_SECRET = 'integration-test-secret-with-more-than-thirty-two-characters';
  ({pool} = await import('../src/database/connection.js'));
  const { migrate } = await import('../src/database/migrate.js');
  await migrate(); await migrate();
  const {default:app} = await import('../src/app.js');
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  school = await account('Escola Integração', 'ESCOLA'); otherSchool = await account('Outra Escola', 'ESCOLA');
  teachers = [];
  for (const name of ['Professor Um', 'Professor Dois']) {
    const user = await account(name, 'PROFESSOR');
    const profile = await request('/api/professores/me', {token:user.token});
    user.id=profile.id_professor;
    await request(`/api/professores/${user.id}`, {method:'PUT',token:user.token,body:{anos_experiencia:5,disciplina_ids:[1],nivel_ids:[4],formacoes:[{curso:'Matemática',instituicao:'USP',tipo_formacao:'LICENCIATURA',ano_conclusao:2020}],disponibilidades:['DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO'].map(dia_semana=>({dia_semana,horario_inicio:'07:00',horario_fim:'18:00'}))}});
    teachers.push(user);
  }
});
after(async () => {
  if(server) await new Promise(resolve=>server.close(resolve));
  if(pool) await pool.end();
  if(admin) { if(/^aulasempre_test_[a-f0-9]{32}$/.test(databaseName)) await admin.query(`DROP DATABASE IF EXISTS \`${databaseName}\``); await admin.end(); }
});

test('health checks the real database and protected routes require authentication',async()=>{
  assert.equal((await request('/health')).database,true);
  await request('/api/solicitacoes',{status:401});
  await request('/api/solicitacoes',{token:'invalid',status:401});
  await request('/api/solicitacoes',{token:teachers[0].token,status:403});
});
test('real seed credentials authenticate and no password is returned',async()=>{
  const result=await request('/api/auth/login',{method:'POST',body:{email:'lucas.matematica@gmail.com',senha:'AulaSempre123!'}});
  assert.ok(result.token);assert.equal(result.usuario.senha,undefined);
});
test('registration validates input and prevents unauthorized school linkage and duplicates',async()=>{
  const body={nome:'Teste',email:'novo@example.test',senha:'123456',tipo_usuario:'ESCOLA',cidade:'São Paulo',estado:'SP'};
  await request('/api/auth/cadastro',{method:'POST',body:{...body,id_escola:1},status:400});
  await request('/api/auth/cadastro',{method:'POST',body:{...body,email:'bad'},status:400});
  await request('/api/auth/cadastro',{method:'POST',body:{...body,estado:'XX'},status:400});
  await request('/api/auth/cadastro',{method:'POST',body:{...body,email:school.usuario.email},status:409});
  await request('/api/auth/login',{method:'POST',body:{email:school.usuario.email,senha:'wrong-password'},status:401});
});
test('profile returns catalog relations and changes are atomic and owner restricted',async()=>{
  const list=await request('/api/professores',{token:school.token});const t=list.find(p=>p.id_professor===teachers[0].id);
  assert.deepEqual(t.disciplinas,['Matemática']);assert.deepEqual(t.niveis_ensino,['Ensino Médio']);assert.ok(t.formacao);
  await request(`/api/professores/${teachers[0].id}`,{method:'PUT',token:teachers[1].token,body:{cidade:'Campinas'},status:403});
  await request(`/api/professores/${teachers[0].id}`,{method:'PUT',token:teachers[0].token,body:{cidade:'Campinas',disciplina_ids:[99999]},status:400});
  assert.equal((await request('/api/professores/me',{token:teachers[0].token})).cidade,'São Paulo');
  await request(`/api/professores/${teachers[0].id}/disponibilidade`,{method:'POST',token:teachers[0].token,body:{dia_semana:'SEGUNDA',horario_inicio:'12:00',horario_fim:'08:00'},status:400});
});
test('request validation rejects dates, times, prices and invalid catalogs',async()=>{
  for(const extra of [{data_aula:'2026-02-30'},{data_aula:'2000-01-01'},{horario_fim:'07:00'},{horario_inicio:'28:00'},{valor:-1},{valor:'abc'},{id_disciplina:99999}])await request('/api/solicitacoes',{method:'POST',token:school.token,body:payload(extra),status:400});
});
test('database constraints reject invalid prices and duplicate active substitutions',async()=>{
  await assert.rejects(pool.query('INSERT INTO solicitacao_substituicao (id_escola,id_disciplina,id_nivel_ensino,data_aula,horario_inicio,horario_fim,turma,valor) VALUES (?,1,4,?,\'08:00\',\'10:00\',\'DB constraint\',-1)',[school.usuario.id_escola,date]),error=>error.code==='ER_CHECK_CONSTRAINT_VIOLATED');
  const rid=(await create()).id_solicitacao;
  await pool.query('INSERT INTO substituicao (id_solicitacao,id_professor,data_substituicao,horario_inicio,horario_fim) VALUES (?,?,?,\'08:00\',\'10:00\')',[rid,teachers[0].id,date]);
  await assert.rejects(pool.query('INSERT INTO substituicao (id_solicitacao,id_professor,data_substituicao,horario_inicio,horario_fim) VALUES (?,?,?,\'08:00\',\'10:00\')',[rid,teachers[1].id,date]),error=>error.code==='ER_DUP_ENTRY');
  await pool.query('DELETE FROM substituicao WHERE id_solicitacao=?',[rid]);
});
test('request persists every frontend field and matching enforces qualifications and availability',async()=>{
  requestId=(await create()).id_solicitacao;
  const saved=await request(`/api/solicitacoes/${requestId}`,{token:school.token});
  assert.equal(saved.modalidade,'PRESENCIAL');assert.equal(Number(saved.valor),150.5);assert.equal(saved.conteudo,'Álgebra');assert.equal(saved.endereco_aula,'Rua de teste, 100');assert.equal(saved.experiencia_minima,2);
  const matches=await request(`/api/solicitacoes/${requestId}/matches`,{token:school.token});assert.ok(teachers.every(t=>matches.some(m=>m.id_professor===t.id)));
  const late=(await create({horario_inicio:'19:00',horario_fim:'20:00'})).id_solicitacao;
  assert.deepEqual(await request(`/api/solicitacoes/${late}/matches`,{token:school.token}),[]);
  await request('/api/convites',{method:'POST',token:school.token,body:{id_solicitacao:late,id_professor:teachers[0].id},status:400});
});
test('requests and invitations are isolated between schools',async()=>{
  await request(`/api/solicitacoes/${requestId}`,{token:otherSchool.token,status:404});
  await request(`/api/solicitacoes/${requestId}/status`,{method:'PATCH',token:otherSchool.token,body:{status:'CANCELADA'},status:404});
  const list=await request('/api/solicitacoes',{token:otherSchool.token});assert.ok(!list.some(r=>r.id_solicitacao===requestId));
});
test('concurrent accepts produce exactly one substitution and cancel competing invites',async()=>{
  const invitations=await Promise.all(teachers.map(t=>invite(requestId,t)));
  await request('/api/convites',{method:'POST',token:school.token,body:{id_solicitacao:requestId,id_professor:teachers[0].id},status:409});
  const outcomes=await Promise.all(invitations.map((c,i)=>fetch(base+`/api/convites/${c.id_convite}/resposta`,{method:'PATCH',headers:{Authorization:`Bearer ${teachers[i].token}`,'Content-Type':'application/json'},body:JSON.stringify({status:'ACEITO'})})));
  assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,409]);
  const [subs]=await pool.query('SELECT * FROM substituicao WHERE id_solicitacao=?',[requestId]);assert.equal(subs.length,1);substitutionId=subs[0].id_substituicao;
  const row=await request(`/api/solicitacoes/${requestId}`,{token:school.token});assert.equal(row.status,'PREENCHIDA');assert.ok(row.professor_confirmado_nome);
  const invites=await request('/api/convites',{token:school.token});assert.deepEqual(invites.filter(c=>c.id_solicitacao===requestId).map(c=>c.status).sort(),['ACEITO','CANCELADO']);
  const winner=teachers.find(t=>t.id===subs[0].id_professor);assert.equal((await request('/api/substituicoes',{token:winner.token})).filter(s=>s.id_solicitacao===requestId).length,1);
});
test('overlapping assignments are excluded but another time slot remains available',async()=>{
  const saved=await request(`/api/solicitacoes/${requestId}`,{token:school.token});
  const overlap=(await create()).id_solicitacao;
  assert.ok(!(await request(`/api/solicitacoes/${overlap}/matches`,{token:school.token})).some(m=>m.id_professor===saved.professor_confirmado_id));
  const later=(await create({horario_inicio:'11:00',horario_fim:'12:00'})).id_solicitacao;
  assert.ok((await request(`/api/solicitacoes/${later}/matches`,{token:school.token})).some(m=>m.id_professor===saved.professor_confirmado_id));
});
test('completion updates request and teacher state and allows exactly one assessment',async()=>{
  await request(`/api/substituicoes/${substitutionId}/avaliacao`,{method:'POST',token:school.token,body:{nota:5},status:400});
  await request(`/api/substituicoes/${substitutionId}/status`,{method:'PATCH',token:teachers[0].token,body:{status:'REALIZADA'},status:403});
  await request(`/api/substituicoes/${substitutionId}/status`,{method:'PATCH',token:school.token,body:{status:'REALIZADA'}});
  assert.equal((await request(`/api/solicitacoes/${requestId}`,{token:school.token})).status,'CONCLUIDA');
  await request(`/api/substituicoes/${substitutionId}/avaliacao`,{method:'POST',token:otherSchool.token,body:{nota:5},status:403});
  await request(`/api/substituicoes/${substitutionId}/avaliacao`,{method:'POST',token:school.token,body:{nota:5,comentario:'Excelente'},status:201});
  await request(`/api/substituicoes/${substitutionId}/avaliacao`,{method:'POST',token:school.token,body:{nota:4},status:409});
  await request(`/api/substituicoes/${substitutionId}/avaliacao`,{token:otherSchool.token,status:403});
  assert.equal((await request(`/api/substituicoes/${substitutionId}/avaliacao`,{token:school.token})).nota,5);
  await request(`/api/solicitacoes/${requestId}/status`,{method:'PATCH',token:school.token,body:{status:'CANCELADA'},status:409});
});
test('declining the last pending invitation reopens the request',async()=>{
  const rid=(await create({horario_inicio:'13:00',horario_fim:'14:00'})).id_solicitacao;const c=await invite(rid,teachers[0]);
  await request(`/api/convites/${c.id_convite}/resposta`,{method:'PATCH',token:teachers[1].token,body:{status:'RECUSADO'},status:404});
  await request(`/api/convites/${c.id_convite}/resposta`,{method:'PATCH',token:teachers[0].token,body:{status:'RECUSADO'}});
  assert.equal((await request(`/api/solicitacoes/${rid}`,{token:school.token})).status,'ABERTA');
});
test('cancellation propagates to pending invitations and confirmed substitutions',async()=>{
  for(const accepted of [false,true]){
    const rid=(await create({horario_inicio:'15:00',horario_fim:'16:00'})).id_solicitacao;const c=await invite(rid,teachers[0]);
    if(accepted)await request(`/api/convites/${c.id_convite}/resposta`,{method:'PATCH',token:teachers[0].token,body:{status:'ACEITO'}});
    await request(`/api/solicitacoes/${rid}/status`,{method:'PATCH',token:school.token,body:{status:'CANCELADA'}});
    await request(`/api/convites/${c.id_convite}/resposta`,{method:'PATCH',token:teachers[0].token,body:{status:'ACEITO'},status:409});
    const [subs]=await pool.query('SELECT status FROM substituicao WHERE id_solicitacao=?',[rid]);if(accepted)assert.equal(subs[0].status,'CANCELADA');
    const [profile]=await pool.query('SELECT status FROM professor WHERE id_professor=?',[teachers[0].id]);assert.equal(profile[0].status,'DISPONIVEL');
  }
});
test('disabled accounts cannot keep using old tokens and internal errors stay private',async()=>{
  await pool.query('UPDATE usuario SET ativo=0 WHERE id_usuario=?',[otherSchool.usuario.id_usuario]);
  await request('/api/auth/me',{token:otherSchool.token,status:401});
  const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'});assert.equal(response.status,400);assert.equal((await response.json()).erro,'JSON inválido.');
  await request('/api/not-found',{status:404});
});
