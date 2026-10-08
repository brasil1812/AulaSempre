import { pool } from './connection.js';
import { pathToFileURL } from 'node:url';

export async function migrate(database = pool) {
  const columns = {
    modalidade: "ENUM('PRESENCIAL','ONLINE') NOT NULL DEFAULT 'PRESENCIAL'",
    cidade: 'VARCHAR(100) NULL', endereco: 'VARCHAR(255) NULL', valor: 'DECIMAL(10,2) NULL',
    conteudo: 'TEXT NULL', formacao_minima: 'VARCHAR(100) NULL', experiencia_minima: 'INT NOT NULL DEFAULT 0',
  };
  const [existing] = await database.query('SHOW COLUMNS FROM solicitacao_substituicao');
  for (const [name, ddl] of Object.entries(columns)) {
    if (!existing.some(column => column.Field === name)) await database.query(`ALTER TABLE solicitacao_substituicao ADD COLUMN ${name} ${ddl}`);
  }
  const [constraints] = await database.query('SELECT CONSTRAINT_NAME FROM information_schema.table_constraints WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=\'solicitacao_substituicao\'');
  for (const [name, check] of Object.entries({chk_solic_valor:'valor IS NULL OR valor >= 0',chk_solic_experiencia:'experiencia_minima >= 0'})) {
    if (!constraints.some(item => item.CONSTRAINT_NAME === name)) await database.query(`ALTER TABLE solicitacao_substituicao ADD CONSTRAINT ${name} CHECK (${check})`);
  }
  const [subColumns] = await database.query('SHOW COLUMNS FROM substituicao');
  if (!subColumns.some(item => item.Field === 'active_request_id')) await database.query('ALTER TABLE substituicao ADD COLUMN active_request_id INT NULL');
  const [triggers] = await database.query("SELECT TRIGGER_NAME FROM information_schema.triggers WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE='substituicao'");
  for (const [name, event] of Object.entries({tr_substituicao_ativa_insert:'INSERT',tr_substituicao_ativa_update:'UPDATE'})) {
    if (!triggers.some(item => item.TRIGGER_NAME === name)) await database.query(`CREATE TRIGGER ${name} BEFORE ${event} ON substituicao FOR EACH ROW SET NEW.active_request_id = IF(NEW.status IN ('AGENDADA','EM_ANDAMENTO'), NEW.id_solicitacao, NULL)`);
  }
  await database.query("UPDATE substituicao SET active_request_id = IF(status IN ('AGENDADA','EM_ANDAMENTO'), id_solicitacao, NULL)");
  const [indexes] = await database.query('SHOW INDEX FROM substituicao');
  if (!indexes.some(item => item.Key_name === 'uq_substituicao_ativa')) await database.query('ALTER TABLE substituicao ADD CONSTRAINT uq_substituicao_ativa UNIQUE (active_request_id)');
  await database.query(`UPDATE solicitacao_substituicao s SET status = 'PREENCHIDA'
    WHERE s.status IN ('ABERTA','EM_PROCESSO') AND EXISTS (SELECT 1 FROM substituicao sub WHERE sub.id_solicitacao = s.id_solicitacao AND sub.status IN ('AGENDADA','EM_ANDAMENTO'))`);
  await database.query(`UPDATE solicitacao_substituicao s SET status = 'EM_PROCESSO'
    WHERE s.status = 'ABERTA' AND EXISTS (SELECT 1 FROM convite c WHERE c.id_solicitacao = s.id_solicitacao AND c.status = 'PENDENTE')`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await migrate(); console.log('Migração concluída; dados existentes preservados.'); }
  finally { await pool.end(); }
}
