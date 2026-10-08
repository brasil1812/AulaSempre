import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler, httpError, transaction } from '../utils/http.js';
import { text, choice, region } from '../utils/validation.js';
const router = Router();
function email(value) {
  const result = text(value, 'E-mail').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw httpError(400, 'E-mail inválido.');
  return result;
}
router.post('/login', asyncHandler(async (req, res) => {
  const mail = email(req.body?.email);
  const password = text(req.body?.senha, 'Senha', 72);
  const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ? AND ativo = 1 LIMIT 1', [mail]);
  if (!rows.length || !await bcrypt.compare(password, rows[0].senha)) throw httpError(401, 'E-mail ou senha inválidos.');
  const { senha, ...usuario } = rows[0];
  const token = jwt.sign({ id_usuario: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario });
}));
router.get('/me', auth(), asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id_usuario, id_escola, nome, email, telefone, tipo_usuario FROM usuario WHERE id_usuario = ?', [req.user.id_usuario]);
  res.json(rows[0]);
}));
router.post('/cadastro', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const nome = text(body.nome, 'Nome');
  const mail = email(body.email);
  const senha = text(body.senha, 'Senha', 72);
  if (senha.length < 6 || Buffer.byteLength(senha) > 72) throw httpError(400, 'A senha deve ter entre 6 e 72 bytes.');
  const tipo = choice(body.tipo_usuario, ['ESCOLA', 'PROFESSOR'], 'Tipo de usuário');
  if (body.id_escola != null) throw httpError(400, 'O cadastro público cria uma nova escola; não permite vincular contas a escolas existentes.');
  const cidade = text(body.cidade, 'Cidade', 100);
  const estado = region(body.estado);
  const telefone = text(body.telefone || null, 'Telefone', 20, false);
  const endereco = text(body.endereco || null, 'Endereço', 255, false);
  const hash = await bcrypt.hash(senha, 10);
  const result = await transaction(pool, async connection => {
    let escolaId = null;
    if (tipo === 'ESCOLA') {
      const [school] = await connection.query('INSERT INTO escola (nome, email, telefone, cidade, estado, endereco) VALUES (?, ?, ?, ?, ?, ?)', [nome, mail, telefone, cidade, estado, endereco]);
      escolaId = school.insertId;
    }
    const [user] = await connection.query('INSERT INTO usuario (id_escola, nome, email, senha, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)', [escolaId, nome, mail, hash, telefone, tipo]);
    if (tipo === 'PROFESSOR') await connection.query('INSERT INTO professor (id_usuario, cidade, estado) VALUES (?, ?, ?)', [user.insertId, cidade, estado]);
    return { id_usuario: user.insertId, id_escola: escolaId };
  });
  res.status(201).json({ ...result, mensagem: 'Usuário cadastrado com sucesso.' });
}));
export default router;
