import { Router } from 'express';
import { pool } from '../database/connection.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler, httpError, transaction } from '../utils/http.js';
import { id, text, choice, date, timeRange, integer } from '../utils/validation.js';
import { matches, syncProfessor } from '../services/matching.js';
const router = Router();
const select = `SELECT s.*, e.nome AS escola, COALESCE(s.cidade, e.cidade) AS cidade_escola,
 e.estado AS estado_escola, COALESCE(s.endereco, e.endereco) AS endereco_aula,
 d.nome AS disciplina, ne.nome AS nivel_ensino,
 sub.id_substituicao, sub.status AS status_substituicao, sub.id_professor AS professor_confirmado_id,
 u.nome AS professor_confirmado_nome, av.nota AS nota_avaliacao
 FROM solicitacao_substituicao s JOIN escola e ON e.id_escola = s.id_escola
 JOIN disciplina d ON d.id_disciplina = s.id_disciplina JOIN nivel_ensino ne ON ne.id_nivel_ensino = s.id_nivel_ensino
 LEFT JOIN substituicao sub ON sub.id_substituicao = (SELECT MAX(s2.id_substituicao) FROM substituicao s2 WHERE s2.id_solicitacao = s.id_solicitacao AND s2.status != 'CANCELADA')
 LEFT JOIN professor p ON p.id_professor = sub.id_professor LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
 LEFT JOIN avaliacao av ON av.id_substituicao = sub.id_substituicao`;
router.post('/', auth(['ESCOLA']), asyncHandler(async (req, res) => {
 const b = req.body || {};
 const disciplina = id(b.id_disciplina, 'Disciplina'), nivel = id(b.id_nivel_ensino, 'Nível');
 const data = date(b.data_aula); timeRange(b.horario_inicio, b.horario_fim);
 const modalidade = choice(b.modalidade || 'PRESENCIAL', ['PRESENCIAL','ONLINE'], 'Modalidade');
 const cidade = text(b.cidade || null, 'Cidade', 100, modalidade === 'PRESENCIAL');
 const turma = text(b.turma, 'Turma', 50);
 const valor = b.valor == null || b.valor === '' ? null : Number(b.valor);
 if (valor !== null && (!Number.isFinite(valor) || valor < 0 || valor > 99999999.99)) throw httpError(400, 'Valor inválido.');
 const formacao = b.formacao_minima || null;
 if (formacao) choice(formacao, ['Qualquer licenciatura','Licenciatura completa na área','Pós-graduação na área','Mestrado ou Doutorado'], 'Formação mínima');
 const [catalog] = await pool.query('SELECT (SELECT COUNT(*) FROM disciplina WHERE id_disciplina = ? AND ativo = 1) AS disciplina, (SELECT COUNT(*) FROM nivel_ensino WHERE id_nivel_ensino = ? AND ativo = 1) AS nivel', [disciplina, nivel]);
 if (!catalog[0].disciplina || !catalog[0].nivel) throw httpError(400, 'Disciplina ou nível de ensino inexistente.');
 const [result] = await pool.query(`INSERT INTO solicitacao_substituicao (id_escola,id_disciplina,id_nivel_ensino,data_aula,horario_inicio,horario_fim,turma,observacoes,modalidade,cidade,endereco,valor,conteudo,formacao_minima,experiencia_minima) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
 [req.user.id_escola,disciplina,nivel,data,b.horario_inicio,b.horario_fim,turma,text(b.observacoes || null,'Observações',10000,false),modalidade,cidade,text(b.endereco || null,'Endereço',255,false),valor,text(b.conteudo || null,'Conteúdo',10000,false),formacao,integer(b.experiencia_minima || 0,'Experiência')]);
 res.status(201).json({id_solicitacao:result.insertId,status:'ABERTA'});
}));
router.get('/', auth(['ESCOLA']), asyncHandler(async (req,res) => {
 let sql = select + ' WHERE s.id_escola = ?'; const params = [req.user.id_escola];
 if (req.query.status) { sql += ' AND s.status = ?'; params.push(req.query.status); }
 const [rows] = await pool.query(sql + ' ORDER BY s.data_aula, s.horario_inicio', params); res.json(rows);
}));
router.get('/:id/matches', auth(['ESCOLA']), asyncHandler(async (req,res) => {
 const [rows] = await pool.query('SELECT s.*, COALESCE(s.cidade,e.cidade) AS cidade FROM solicitacao_substituicao s JOIN escola e ON e.id_escola=s.id_escola WHERE s.id_solicitacao=? AND s.id_escola=?',[id(req.params.id),req.user.id_escola]);
 if (!rows.length) throw httpError(404,'Solicitação não encontrada.');
 res.json(['ABERTA','EM_PROCESSO'].includes(rows[0].status) ? await matches(pool,rows[0]) : []);
}));
router.get('/:id', auth(['ESCOLA']), asyncHandler(async (req,res) => {
 const [rows] = await pool.query(select + ' WHERE s.id_solicitacao = ? AND s.id_escola = ?', [id(req.params.id),req.user.id_escola]);
 if (!rows.length) throw httpError(404,'Solicitação não encontrada.'); res.json(rows[0]);
}));
router.patch('/:id/status', auth(['ESCOLA']), asyncHandler(async (req,res) => {
 if (req.body?.status !== 'CANCELADA') throw httpError(400,'Use os convites e substituições para avançar o status; aqui é permitido apenas cancelar.');
 await transaction(pool,async c => {
  const [rows] = await c.query('SELECT * FROM solicitacao_substituicao WHERE id_solicitacao=? AND id_escola=? FOR UPDATE',[id(req.params.id),req.user.id_escola]);
  if (!rows.length) throw httpError(404,'Solicitação não encontrada.');
  if (rows[0].status === 'CONCLUIDA') throw httpError(409,'Solicitação concluída não pode ser cancelada.');
  const [subs] = await c.query('SELECT id_professor FROM substituicao WHERE id_solicitacao=? AND status IN (\'AGENDADA\',\'EM_ANDAMENTO\')',[req.params.id]);
  await c.query("UPDATE convite SET status='CANCELADO',data_resposta=NOW() WHERE id_solicitacao=? AND status='PENDENTE'",[req.params.id]);
  await c.query("UPDATE substituicao SET status='CANCELADA' WHERE id_solicitacao=? AND status IN ('AGENDADA','EM_ANDAMENTO')",[req.params.id]);
  await c.query("UPDATE solicitacao_substituicao SET status='CANCELADA' WHERE id_solicitacao=?",[req.params.id]);
  for (const sub of subs) await syncProfessor(c,sub.id_professor);
 }); res.json({mensagem:'Solicitação e seus convites/substituições cancelados.'});
}));
export default router;
