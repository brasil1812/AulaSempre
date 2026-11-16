-- Desativa, no banco de PRODUÇÃO, as contas fictícias da carga inicial.
-- A senha dessas contas está publicada no README, então elas não podem ficar ativas no site publicado.
-- Contas desativadas perdem o acesso imediatamente, inclusive tokens já emitidos.
-- Não execute no banco local se quiser continuar usando as contas de demonstração.
UPDATE usuario
SET ativo = 0
WHERE email IN (
  'renata.coord@colegiosaopaulo.com.br',
  'carlos.direcao@domboscoedu.com.br',
  'mariana.rh@modernacampinas.com.br',
  'lucas.matematica@gmail.com',
  'beatriz.letras@gmail.com',
  'rodrigo.fisica@gmail.com',
  'camila.historia@gmail.com',
  'fernando.biologia@gmail.com'
);
-- Conferência: deve retornar as 8 contas com ativo = 0.
SELECT email, ativo FROM usuario WHERE email IN (
  'renata.coord@colegiosaopaulo.com.br','carlos.direcao@domboscoedu.com.br','mariana.rh@modernacampinas.com.br',
  'lucas.matematica@gmail.com','beatriz.letras@gmail.com','rodrigo.fisica@gmail.com',
  'camila.historia@gmail.com','fernando.biologia@gmail.com');
