import app from "./app.js";
import { testConnection } from "./database/connection.js";
import { pool } from './database/connection.js';

const PORT = process.env.PORT || 3000;

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32 || process.env.JWT_SECRET.startsWith('substitua-')) throw new Error('Configure JWT_SECRET com um segredo aleatório de pelo menos 32 caracteres no .env.');
  await testConnection();
  const server = app.listen(PORT, () => {
    console.log(`AulaSempre API rodando em http://localhost:${PORT}`);
  });
  server.on('error', error => { console.error('Falha ao abrir a porta:', error.message); process.exit(1); });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(async () => { await pool.end(); process.exit(0); }));
} catch (error) {
  console.error("Não foi possível iniciar a API:", error);
  process.exit(1);
}
