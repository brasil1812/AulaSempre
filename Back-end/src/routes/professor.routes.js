import { Router } from 'express';
import { pool } from '../database/connection.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler, httpError, transaction } from '../utils/http.js';
import { id, text, region, integer, choice, timeRange } from '../utils/validation.js';
const router=Router();
const DAYS=['DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO'];
const select=`SELECT p.*,u.nome,u.email,u.telefone,
 COALESCE((SELECT ROUND(AVG(a.nota),1) FROM avaliacao a WHERE a.id_professor=p.id_professor),0) AS media_avaliacoes,
 (SELECT COUNT(*) FROM substituicao sub WHERE sub.id_professor=p.id_professor AND sub.status='REALIZADA') AS total_substituicoes,
 (SELECT CONCAT(f.curso,' — ',f.instituicao) FROM formacao f WHERE f.id_professor=p.id_professor ORDER BY f.ano_conclusao DESC LIMIT 1) AS formacao,
 (SELECT JSON_ARRAYAGG(d.nome) FROM professor_disciplina pd JOIN disciplina d ON d.id_disciplina=pd.id_disciplina WHERE pd.id_professor=p.id_professor) AS disciplinas,
 (SELECT JSON_ARRAYAGG(n.nome) FROM professor_nivel_ensino pn JOIN nivel_ensino n ON n.id_nivel_ensino=pn.id_nivel_ensino WHERE pn.id_professor=p.id_professor) AS niveis_ensino
 FROM professor p JOIN usuario u ON u.id_usuario=p.id_usuario WHERE u.ativo=1`;
async function detail(professorId){
 const [rows]=await pool.query(select+' AND p.id_professor=?',[professorId]);if(!rows.length)throw httpError(404,'Professor não encontrado.');
 const [formacoes]=await pool.query('SELECT * FROM formacao WHERE id_professor=? ORDER BY ano_conclusao DESC',[professorId]);
 const [disciplinas]=await pool.query('SELECT id_disciplina FROM professor_disciplina WHERE id_professor=?',[professorId]);
 const [niveis]=await pool.query('SELECT id_nivel_ensino FROM professor_nivel_ensino WHERE id_professor=?',[professorId]);
 const [disponibilidades]=await pool.query('SELECT * FROM disponibilidade WHERE id_professor=? AND ativo=1 ORDER BY dia_semana,horario_inicio',[professorId]);
 return {...rows[0],formacoes,disciplina_ids:disciplinas.map(d=>d.id_disciplina),nivel_ids:niveis.map(n=>n.id_nivel_ensino),disponibilidades};
}
router.get('/me',auth(['PROFESSOR']),asyncHandler(async(req,res)=>{
 const [rows]=await pool.query('SELECT id_professor FROM professor WHERE id_usuario=?',[req.user.id_usuario]);
 if(!rows.length)throw httpError(404,'Perfil não encontrado.');res.json(await detail(rows[0].id_professor));
}));
router.get('/',auth(),asyncHandler(async(req,res)=>{
 let sql=select;const params=[];
 for(const field of ['cidade','estado','status'])if(req.query[field]){sql+=` AND p.${field}=?`;params.push(text(req.query[field],field,100));}
 const [rows]=await pool.query(sql+' ORDER BY u.nome',params);res.json(rows);
}));
router.get('/:id',auth(),asyncHandler(async(req,res)=>res.json(await detail(id(req.params.id)))));
router.put('/:id',auth(['PROFESSOR']),asyncHandler(async(req,res)=>{
 const professorId=id(req.params.id),b=req.body || {};
 const fields=[],values=[];
 for(const field of ['nome_profissional','descricao','cidade','estado','anos_experiencia','status']){
  if(b[field]===undefined)continue;
  let value=b[field];
  if(field==='estado')value=region(value);
  else if(field==='anos_experiencia')value=integer(value,'Experiência');
  else if(field==='status')value=choice(value,['DISPONIVEL','INDISPONIVEL'],'Status');
  else value=text(value,field,field==='descricao'?10000:field==='cidade'?100:150,field==='cidade');
  fields.push(`${field}=?`);values.push(value);
 }
 const arrays=['disciplina_ids','nivel_ids','disponibilidades','formacoes'];
 for(const field of arrays)if(b[field]!==undefined && (!Array.isArray(b[field])||b[field].length>100))throw httpError(400,`${field} inválido.`);
 if(!fields.length&&!arrays.some(field=>b[field]!==undefined))throw httpError(400,'Nenhum campo para atualizar.');
 await transaction(pool,async c=>{
  const [owner]=await c.query('SELECT id_usuario FROM professor WHERE id_professor=? FOR UPDATE',[professorId]);
  if(!owner.length||owner[0].id_usuario!==req.user.id_usuario)throw httpError(403,'Você só pode editar seu próprio perfil.');
  if(fields.length)await c.query(`UPDATE professor SET ${fields.join(',')} WHERE id_professor=?`,[...values,professorId]);
  for(const [key,table,column,catalog]of [['disciplina_ids','professor_disciplina','id_disciplina','disciplina'],['nivel_ids','professor_nivel_ensino','id_nivel_ensino','nivel_ensino']]){
   if(b[key]===undefined)continue;
   const ids=[...new Set(b[key].map(value=>id(value,key)))];
   for(const item of ids){const [valid]=await c.query(`SELECT ${column} FROM ${catalog} WHERE ${column}=? AND ativo=1`,[item]);if(!valid.length)throw httpError(400,`${key} contém um item inexistente.`);}
   await c.query(`DELETE FROM ${table} WHERE id_professor=?`,[professorId]);
   for(const item of ids)await c.query(`INSERT INTO ${table} (id_professor,${column}) VALUES (?,?)`,[professorId,item]);
  }
  if(b.disponibilidades!==undefined){
   for(const disp of b.disponibilidades){choice(disp.dia_semana,DAYS,'Dia da semana');timeRange(disp.horario_inicio,disp.horario_fim);}
   await c.query('DELETE FROM disponibilidade WHERE id_professor=?',[professorId]);
   for(const disp of b.disponibilidades)await c.query('INSERT INTO disponibilidade (id_professor,dia_semana,horario_inicio,horario_fim) VALUES (?,?,?,?)',[professorId,disp.dia_semana,disp.horario_inicio,disp.horario_fim]);
  }
  if(b.formacoes!==undefined){
   const items=b.formacoes.map(f=>({curso:text(f.curso,'Curso'),instituicao:text(f.instituicao,'Instituição'),tipo:choice(f.tipo_formacao,['GRADUACAO','LICENCIATURA','BACHARELADO','POS_GRADUACAO','MESTRADO','DOUTORADO'],'Formação'),ano:f.ano_conclusao==null?null:integer(f.ano_conclusao,'Ano',2100),status:choice(f.status||'CONCLUIDO',['CONCLUIDO','EM_ANDAMENTO','INCOMPLETO'],'Status da formação')}));
   if(items.some(f=>f.ano!==null&&f.ano<1950))throw httpError(400,'Ano de conclusão inválido.');
   await c.query('DELETE FROM formacao WHERE id_professor=?',[professorId]);
   for(const f of items)await c.query('INSERT INTO formacao (id_professor,curso,instituicao,tipo_formacao,ano_conclusao,status) VALUES (?,?,?,?,?,?)',[professorId,f.curso,f.instituicao,f.tipo,f.ano,f.status]);
  }
 });res.json(await detail(professorId));
}));
router.get('/:id/substituicoes',auth(),asyncHandler(async(req,res)=>{
 const professorId=id(req.params.id);
 const [rows]=await pool.query(`SELECT sub.id_substituicao,sub.data_substituicao,sub.horario_inicio,sub.horario_fim,sub.status AS status_substituicao,e.nome AS escola,d.nome AS disciplina,s.turma,av.nota,av.comentario AS feedback_escola
 FROM substituicao sub JOIN solicitacao_substituicao s ON s.id_solicitacao=sub.id_solicitacao
 JOIN escola e ON e.id_escola=s.id_escola JOIN disciplina d ON d.id_disciplina=s.id_disciplina
 LEFT JOIN avaliacao av ON av.id_substituicao=sub.id_substituicao
 WHERE sub.id_professor=? AND ${req.user.tipo_usuario==='ESCOLA'?'s.id_escola=?':'sub.id_professor=(SELECT id_professor FROM professor WHERE id_usuario=?)'} ORDER BY sub.data_substituicao DESC`,[professorId,req.user.tipo_usuario==='ESCOLA'?req.user.id_escola:req.user.id_usuario]);res.json(rows);
}));
router.post('/:id/disponibilidade',auth(['PROFESSOR']),asyncHandler(async(req,res)=>{
 const professorId=id(req.params.id),b=req.body||{};choice(b.dia_semana,DAYS,'Dia da semana');timeRange(b.horario_inicio,b.horario_fim);
 const [owner]=await pool.query('SELECT id_usuario FROM professor WHERE id_professor=?',[professorId]);
 if(!owner.length||owner[0].id_usuario!==req.user.id_usuario)throw httpError(403,'Você só pode editar sua disponibilidade.');
 const [r]=await pool.query('INSERT INTO disponibilidade (id_professor,dia_semana,horario_inicio,horario_fim) VALUES (?,?,?,?)',[professorId,b.dia_semana,b.horario_inicio,b.horario_fim]);res.status(201).json({id_disponibilidade:r.insertId});
}));
export default router;
