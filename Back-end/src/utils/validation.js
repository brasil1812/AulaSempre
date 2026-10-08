import { httpError } from "./http.js";

export function text(value, field, max = 150, required = true) {
  if (value == null && !required) return null;
  if (typeof value !== "string" || (required && !value.trim()) || value.length > max) {
    throw httpError(400, `${field} inválido.`);
  }
  return value.trim();
}

export function id(value, field = "id") {
  if (!['number','string'].includes(typeof value) || String(value).trim() === '') throw httpError(400, `${field} inválido.`);
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 1) throw httpError(400, `${field} inválido.`);
  return result;
}

export function choice(value, values, field) {
  if (!values.includes(value)) throw httpError(400, `${field} inválido.`);
  return value;
}

export function timeRange(start, end) {
  const valid = value => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
  if (!valid(start) || !valid(end) || start.padEnd(8, ':00') >= end.padEnd(8, ':00')) {
    throw httpError(400, "Informe horários válidos; o término deve ser posterior ao início.");
  }
}

export function date(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw httpError(400, "Data inválida.");
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw httpError(400, "Data inválida.");
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (value < today) throw httpError(400, "A data da aula não pode estar no passado.");
  return value;
}

export function region(value) {
  return choice(text(value, "Estado", 2).toUpperCase(), ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'], "Estado");
}

export function integer(value, field, max = 100) {
  if (!['number','string'].includes(typeof value) || String(value).trim() === '') throw httpError(400, `${field} inválido.`);
  if (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > max) throw httpError(400, `${field} inválido.`);
  return Number(value);
}
