import mysql from "mysql2/promise";
import "dotenv/config";
import { sslOptions } from "./ssl.js";

export const pool = mysql.createPool({
  ...sslOptions(),
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "aulasempre",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

export async function testConnection() {
  const connection = await pool.getConnection();
  try { await connection.ping(); } finally { connection.release(); }
  console.log("MySQL conectado.");
}
