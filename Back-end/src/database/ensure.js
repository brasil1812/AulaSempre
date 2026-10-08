import 'dotenv/config';
import mysql from 'mysql2/promise';
const name=process.env.DB_NAME||'aulasempre';
const admin=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD});
let empty;
try { const [rows]=await admin.query('SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema=?',[name]); empty=rows[0].n===0; }
finally { await admin.end(); }
if(empty) await import('./setup.js');
const {migrate}=await import('./migrate.js');
const {pool}=await import('./connection.js');
try { await migrate(); console.log('Banco pronto; registros existentes preservados.'); }
finally { await pool.end(); }
