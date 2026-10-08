export async function matches(connection, request) {
  const [rows] = await connection.query(`SELECT p.id_professor, u.nome AS professor, p.anos_experiencia,
    COALESCE((SELECT AVG(a.nota) FROM avaliacao a WHERE a.id_professor = p.id_professor), 0) AS media_avaliacoes
    FROM professor p JOIN usuario u ON u.id_usuario = p.id_usuario
    WHERE u.ativo = 1 AND p.status != 'INDISPONIVEL'
    AND (? = 'ONLINE' OR p.cidade = ?)
    AND p.anos_experiencia >= ?
    AND EXISTS (SELECT 1 FROM professor_disciplina pd WHERE pd.id_professor = p.id_professor AND pd.id_disciplina = ?)
    AND EXISTS (SELECT 1 FROM professor_nivel_ensino pn WHERE pn.id_professor = p.id_professor AND pn.id_nivel_ensino = ?)
    AND (? IS NULL OR ? = 'Qualquer licenciatura' OR EXISTS (
      SELECT 1 FROM formacao f WHERE f.id_professor = p.id_professor AND f.status = 'CONCLUIDO'
      AND ((? = 'Licenciatura completa na área' AND f.tipo_formacao = 'LICENCIATURA')
        OR (? = 'Pós-graduação na área' AND f.tipo_formacao IN ('POS_GRADUACAO','MESTRADO','DOUTORADO'))
        OR (? = 'Mestrado ou Doutorado' AND f.tipo_formacao IN ('MESTRADO','DOUTORADO')))))
    AND EXISTS (SELECT 1 FROM disponibilidade disp WHERE disp.id_professor = p.id_professor AND disp.ativo = 1
      AND disp.dia_semana = ELT(DAYOFWEEK(?), 'DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO')
      AND disp.horario_inicio <= ? AND disp.horario_fim >= ?)
    AND NOT EXISTS (SELECT 1 FROM substituicao sub WHERE sub.id_professor = p.id_professor
      AND sub.status IN ('AGENDADA','EM_ANDAMENTO') AND sub.data_substituicao = ?
      AND sub.horario_inicio < ? AND sub.horario_fim > ?)
    ORDER BY media_avaliacoes DESC, p.anos_experiencia DESC`, [
    request.modalidade, request.cidade, request.experiencia_minima || 0, request.id_disciplina, request.id_nivel_ensino,
    request.formacao_minima, request.formacao_minima, request.formacao_minima, request.formacao_minima, request.formacao_minima,
    request.data_aula, request.horario_inicio, request.horario_fim, request.data_aula, request.horario_fim, request.horario_inicio,
  ]);
  return rows;
}

export async function syncProfessor(connection, idProfessor) {
  await connection.query(`UPDATE professor p SET status = CASE
    WHEN EXISTS (SELECT 1 FROM substituicao sub WHERE sub.id_professor = p.id_professor AND sub.status = 'EM_ANDAMENTO')
    THEN 'EM_SUBSTITUICAO' ELSE 'DISPONIVEL' END WHERE id_professor = ? AND status != 'INDISPONIVEL'`, [idProfessor]);
}
