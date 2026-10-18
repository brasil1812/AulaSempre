import 'dotenv/config';

// Bancos gerenciados (Aiven, Railway, etc.) exigem conexão com SSL.
// Local: não defina DB_SSL e nada muda.
// Online: DB_SSL=true. Se tiver o certificado da CA, informe em DB_SSL_CA (verificação completa);
// sem ele, a conexão é criptografada mas o certificado não é verificado.
export function sslOptions() {
  if (process.env.DB_SSL !== 'true') return {};
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
  return { ssl: ca ? { ca } : { rejectUnauthorized: false } };
}
