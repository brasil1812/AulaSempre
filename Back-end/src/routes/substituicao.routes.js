import { Router } from 'express';
import { pool } from '../database/connection.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler, httpError, transaction } from '../utils/http.js';
import { id, text, choice } from '../utils/validation.js';
import { syncProfessor } from '../services/matching.js';
const router=Router();
const select=`SELECT sub.*,s.id_escola,e.nome AS escola,d.nome AS disciplina,s.turma,p.id_usuario,
 av.nota,av.comentario FROM substituicao sub JOIN solicitacao_substituicao s ON s.id_solicitacao=sub.id_solicitacao
 JOIN escola e ON e.id_escola=s.id_escola JOIN disciplina d ON d.id_disciplina=s.id_disciplina
 JOIN professor p ON p.id_professor=sub.id_professor LEFT JOIN avaliacao av ON av.id_substituicao=sub.id_substituicao`;
router.get('/',auth(),asyncHandler(async(req,res)=>{
 const [rows]=await pool.query(select+` WHERE ${req.user.tipo_usuario==='ESCOLA'?'s.id_escola':'p.id_usuario'}=? ORDER BY sub.data_substituicao DESC`,[req.user.tipo_usuario==='ESCOLA'?req.user.id_escola:req.user.id_usuario]);res.json(rows);
}));
router.patch('/:id/status',auth(['ESCOLA']),asyncHandler(async(req,res)=>{
 const status=choice(req.body?.status,['EM_ANDAMENTO','REALIZADA','CANCELADA','FALTA_PROFESSOR'],'Status');
 await transaction(pool,async c=>{
  const [links]=await c.query('SELECT id_solicitacao FROM substituicao WHERE id_substituicao=?',[id(req.params.id)]);
  if(!links.length)throw httpError(404,'Substituição não encontrada.');
  await c.query('SELECT id_solicitacao FROM solicitacao_substituicao WHERE id_solicitacao=? FOR UPDATE',[links[0].id_solicitacao]);
  const [rows]=await c.query(select+' WHERE sub.id_substituicao=? FOR UPDATE',[req.params.id]);
  const sub=rows[0];
  if(sub.id_escola!==req.user.id_escola)throw httpError(403,'Sem permissão.');
  const transitions={AGENDADA:['EM_ANDAMENTO','REALIZADA','CANCELADA','FALTA_PROFESSOR'],EM_ANDAMENTO:['REALIZADA','CANCELADA','FALTA_PROFESSOR']};
  if(!transitions[sub.status]?.includes(status))throw httpError(409,'Esta substituição não permite essa alteração de status.');
  await c.query('SELECT id_professor FROM professor WHERE id_professor=? FOR UPDATE',[sub.id_professor]);
  await c.query('UPDATE substituicao SET status=? WHERE id_substituicao=?',[status,req.params.id]);
  await c.query('UPDATE solicitacao_substituicao SET status=? WHERE id_solicitacao=?',[['REALIZADA','FALTA_PROFESSOR'].includes(status)?'CONCLUIDA':status==='CANCELADA'?'CANCELADA':'PREENCHIDA',sub.id_solicitacao]);
  await syncProfessor(c,sub.id_professor);
 });res.json({mensagem:'Status atualizado.'});
}));
router.post('/:id/avaliacao',auth(['ESCOLA']),asyncHandler(async(req,res)=>{
 const nota=Number(req.body?.nota);if(!Number.isInteger(nota)||nota<1||nota>5)throw httpError(400,'A nota deve ser de 1 a 5.');
 const [rows]=await pool.query(select+' WHERE sub.id_substituicao=?',[id(req.params.id)]);
 if(!rows.length)throw httpError(404,'Substituição não encontrada.');
 const sub=rows[0];if(sub.id_escola!==req.user.id_escola)throw httpError(403,'Sem permissão.');
 if(sub.status!=='REALIZADA')throw httpError(400,'A avaliação exige uma substituição realizada.');
 const [r]=await pool.query('INSERT INTO avaliacao (id_substituicao,id_professor,nota,comentario) VALUES (?,?,?,?)',[sub.id_substituicao,sub.id_professor,nota,text(req.body.comentario || null,'Comentário',10000,false)]);
 res.status(201).json({id_avaliacao:r.insertId});
}));
router.get('/:id/avaliacao',auth(),asyncHandler(async(req,res)=>{
 const [rows]=await pool.query(select+' WHERE sub.id_substituicao=?',[id(req.params.id)]);
 if(!rows.length||rows[0].nota==null)throw httpError(404,'Avaliação não encontrada.');
 const sub=rows[0];if(req.user.tipo_usuario==='ESCOLA'?sub.id_escola!==req.user.id_escola:sub.id_usuario!==req.user.id_usuario)throw httpError(403,'Sem permissão.');
 res.json({nota:sub.nota,comentario:sub.comentario});
}));
export default router;
