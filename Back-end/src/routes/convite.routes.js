import { Router } from 'express';
import { pool } from '../database/connection.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler, httpError, transaction } from '../utils/http.js';
import { id, choice, text, date } from '../utils/validation.js';
import { matches } from '../services/matching.js';
const router = Router();
router.post('/', auth(['ESCOLA']), asyncHandler(async (req,res) => {
 const requestId=id(req.body?.id_solicitacao), professorId=id(req.body?.id_professor);
 const result=await transaction(pool,async c => {
  const [rows]=await c.query('SELECT s.*,COALESCE(s.cidade,e.cidade) AS cidade FROM solicitacao_substituicao s JOIN escola e ON e.id_escola=s.id_escola WHERE s.id_solicitacao=? AND s.id_escola=? FOR UPDATE',[requestId,req.user.id_escola]);
  if (!rows.length) throw httpError(404,'Solicitação não encontrada.');
  const s=rows[0];
  if (!['ABERTA','EM_PROCESSO'].includes(s.status)) throw httpError(409,'Esta solicitação não aceita novos convites.');
  date(s.data_aula);
  const [prof]=await c.query('SELECT id_professor FROM professor WHERE id_professor=? FOR UPDATE',[professorId]);
  if (!prof.length || !(await matches(c,s)).some(p=>p.id_professor===professorId)) throw httpError(400,'Professor não atende à disciplina, nível, requisitos ou disponibilidade da aula.');
  const [r]=await c.query('INSERT INTO convite (id_solicitacao,id_professor,observacao) VALUES (?,?,?)',[requestId,professorId,text(req.body.observacao || null,'Observação',255,false)]);
  await c.query("UPDATE solicitacao_substituicao SET status='EM_PROCESSO' WHERE id_solicitacao=?",[requestId]);
  return r.insertId;
 }); res.status(201).json({id_convite:result,status:'PENDENTE'});
}));
router.get('/', auth(), asyncHandler(async (req,res) => {
 const [rows]=await pool.query(`SELECT c.*, e.nome AS escola, COALESCE(s.cidade,e.cidade) AS cidade_escola,
 COALESCE(s.endereco,e.endereco) AS endereco_aula, d.nome AS disciplina, ne.nome AS nivel_ensino,
 s.data_aula,s.horario_inicio,s.horario_fim,s.turma,s.modalidade,s.valor,s.conteudo,s.observacoes,
 s.status AS status_solicitacao,u.nome AS professor_nome,sub.id_substituicao,sub.status AS status_substituicao
 FROM convite c JOIN solicitacao_substituicao s ON s.id_solicitacao=c.id_solicitacao
 JOIN escola e ON e.id_escola=s.id_escola JOIN disciplina d ON d.id_disciplina=s.id_disciplina
 JOIN nivel_ensino ne ON ne.id_nivel_ensino=s.id_nivel_ensino JOIN professor p ON p.id_professor=c.id_professor
 JOIN usuario u ON u.id_usuario=p.id_usuario LEFT JOIN substituicao sub ON sub.id_convite=c.id_convite
 WHERE ${req.user.tipo_usuario==='ESCOLA' ? 's.id_escola' : 'p.id_usuario'}=? ORDER BY c.data_envio DESC,c.id_convite DESC`,[req.user.tipo_usuario==='ESCOLA'?req.user.id_escola:req.user.id_usuario]);
 res.json(rows);
}));
router.patch('/:id/resposta', auth(['PROFESSOR']), asyncHandler(async (req,res) => {
 const status=choice(req.body?.status,['ACEITO','RECUSADO'],'Resposta');
 await transaction(pool,async c => {
  // Every lifecycle operation locks the request first, then the teacher. This serializes competing accepts.
  const [links]=await c.query('SELECT id_solicitacao FROM convite WHERE id_convite=?',[id(req.params.id)]);
  if (!links.length) throw httpError(404,'Convite não encontrado.');
  const [requests]=await c.query('SELECT * FROM solicitacao_substituicao WHERE id_solicitacao=? FOR UPDATE',[links[0].id_solicitacao]);
  const [prof]=await c.query('SELECT id_professor FROM professor WHERE id_usuario=? FOR UPDATE',[req.user.id_usuario]);
  if (!prof.length) throw httpError(404,'Professor não encontrado.');
  const [invites]=await c.query('SELECT * FROM convite WHERE id_convite=? AND id_professor=? FOR UPDATE',[req.params.id,prof[0].id_professor]);
  if (!invites.length) throw httpError(404,'Convite não encontrado.');
  const invite=invites[0], s=requests[0];
  if (invite.status!=='PENDENTE' || !['ABERTA','EM_PROCESSO'].includes(s.status)) throw httpError(409,'O convite já foi respondido ou a solicitação foi encerrada.');
  if (status === 'ACEITO') date(s.data_aula);
  if (status==='ACEITO') {
   const [conflicts]=await c.query("SELECT id_substituicao FROM substituicao WHERE id_professor=? AND status IN ('AGENDADA','EM_ANDAMENTO') AND data_substituicao=? AND horario_inicio<? AND horario_fim>?",[prof[0].id_professor,s.data_aula,s.horario_fim,s.horario_inicio]);
   if (conflicts.length) throw httpError(409,'Professor já possui substituição nesse horário.');
   await c.query("INSERT INTO substituicao (id_solicitacao,id_professor,id_convite,data_substituicao,horario_inicio,horario_fim) VALUES (?,?,?,?,?,?)",[s.id_solicitacao,prof[0].id_professor,invite.id_convite,s.data_aula,s.horario_inicio,s.horario_fim]);
   await c.query("UPDATE solicitacao_substituicao SET status='PREENCHIDA' WHERE id_solicitacao=?",[s.id_solicitacao]);
   await c.query("UPDATE convite SET status='CANCELADO',data_resposta=NOW() WHERE id_solicitacao=? AND id_convite!=? AND status='PENDENTE'",[s.id_solicitacao,invite.id_convite]);
  }
  await c.query('UPDATE convite SET status=?,data_resposta=NOW(),observacao=COALESCE(?,observacao) WHERE id_convite=?',[status,text(req.body.observacao || null,'Observação',255,false),invite.id_convite]);
  if (status==='RECUSADO') await c.query("UPDATE solicitacao_substituicao SET status=IF(EXISTS(SELECT 1 FROM convite WHERE id_solicitacao=? AND status='PENDENTE'),'EM_PROCESSO','ABERTA') WHERE id_solicitacao=?",[s.id_solicitacao,s.id_solicitacao]);
 }); res.json({mensagem:status==='ACEITO'?'Convite aceito e substituição agendada.':'Convite recusado.'});
}));
export default router;
