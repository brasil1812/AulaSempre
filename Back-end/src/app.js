import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool } from './database/connection.js';

import authRoutes from "./routes/auth.routes.js";
import professorRoutes from "./routes/professor.routes.js";
import escolaRoutes from "./routes/escola.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import solicitacaoRoutes from "./routes/solicitacao.routes.js";
import conviteRoutes from "./routes/convite.routes.js";
import substituicaoRoutes from "./routes/substituicao.routes.js";

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN === '*' ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',').map(value => value.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get("/health", async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: true, projeto: 'AulaSempre API' }); }
  catch { res.status(503).json({ ok: false, database: false }); }
});

app.use("/api/auth", authRoutes);
app.use("/api/professores", professorRoutes);
app.use("/api/escolas", escolaRoutes);
app.use("/api/catalogos", catalogRoutes);
app.use("/api/solicitacoes", solicitacaoRoutes);
app.use("/api/convites", conviteRoutes);
app.use("/api/substituicoes", substituicaoRoutes);

const frontend = fileURLToPath(new URL('../../Front-end/dist/aulasempre/browser/', import.meta.url));
if (existsSync(frontend + 'index.html')) {
  app.use(express.static(frontend));
  app.get('*', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(frontend + 'index.html');
  });
}

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((err, req, res, next) => {
  const errors = {
    ER_DUP_ENTRY: [409, 'Este cadastro, convite ou avaliação já existe.'],
    ER_NO_REFERENCED_ROW_2: [400, 'Registro relacionado não encontrado.'],
    ER_CHECK_CONSTRAINT_VIOLATED: [400, 'Dados fora dos limites permitidos.'],
    ER_DATA_TOO_LONG: [400, 'Um dos campos excede o tamanho permitido.'],
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: [400, 'Valor inválido.'],
    ER_LOCK_DEADLOCK: [409, 'Outra operação alterou este registro. Atualize os dados e tente novamente.'],
  };
  const [status, message] = errors[err.code] || [err.status || 500, err.status && err.status < 500 ? err.message : 'Erro interno do servidor.'];
  if (status >= 500) console.error(err);
  res.status(status).json({ erro: err.type === 'entity.parse.failed' ? 'JSON inválido.' : message });
});

export default app;
