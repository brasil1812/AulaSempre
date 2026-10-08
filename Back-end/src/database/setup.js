import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
const name = process.env.DB_NAME || 'aulasempre';
if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('DB_NAME inválido.');
const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, multipleStatements: true });
try {
  const [rows] = await connection.query('SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema=?', [name]);
  if (rows[0].total) throw new Error('O banco já contém tabelas. Use npm run db:migrate para preservar os dados.');
  const sql = await readFile(new URL('../../../Data-base/aulasempre.sql', import.meta.url), 'utf8');
  await connection.query(sql.replace(/\baulasempre\b/g, name));
  console.log('Banco inicializado.');
} finally { await connection.end(); }
