// Limita tentativas de login com senha incorreta por e-mail (risco R1 da avaliação de segurança).
// Após MAX_FAILURES falhas dentro de WINDOW_MS, novas tentativas para o mesmo e-mail recebem 429
// até o bloqueio expirar. Um login bem-sucedido zera o contador.
// O contador fica em memória: vale para uma instância da API e reinicia quando o serviço reinicia.
const MAX_FAILURES = Number(process.env.LOGIN_MAX_FAILURES || 5);
const WINDOW_MS = Number(process.env.LOGIN_WINDOW_MINUTES || 15) * 60 * 1000;
const MAX_ENTRIES = 10000;

const attempts = new Map(); // email -> { failures, first, blockedUntil }

function current(email, now) {
  const entry = attempts.get(email);
  if (!entry) return null;
  const expired = entry.blockedUntil ? now >= entry.blockedUntil : now - entry.first >= WINDOW_MS;
  if (expired) { attempts.delete(email); return null; }
  return entry;
}

function prune(now) {
  if (attempts.size < MAX_ENTRIES) return;
  for (const email of attempts.keys()) current(email, now);
  if (attempts.size >= MAX_ENTRIES) attempts.delete(attempts.keys().next().value);
}

/** Retorna os segundos restantes de bloqueio, ou 0 se o e-mail pode tentar. */
export function blockedFor(email, now = Date.now()) {
  const entry = current(email, now);
  return entry?.blockedUntil ? Math.ceil((entry.blockedUntil - now) / 1000) : 0;
}

export function registerFailure(email, now = Date.now()) {
  prune(now);
  const entry = current(email, now) || { failures: 0, first: now, blockedUntil: 0 };
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) entry.blockedUntil = now + WINDOW_MS;
  attempts.set(email, entry);
}

export function registerSuccess(email) {
  attempts.delete(email);
}

export function resetLoginLimiter() {
  attempts.clear();
}

export const loginLimits = { MAX_FAILURES, WINDOW_MS };
