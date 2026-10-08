# Validação local — 8 de outubro de 2026

Ambiente utilizado: Windows, Node.js 24.15.0, MySQL 8.4.9 e Microsoft Edge em modo
sem interface. A interface Angular foi compilada para produção com sucesso.

## Evidências

- 14 testes automáticos de API e banco passaram.
- O teste de navegador passou com duas sessões independentes: escola e professor.
- As gravações foram verificadas no MySQL, incluindo conteúdo, endereço, valor,
  requisitos, confirmação e avaliação. Os dados permaneceram após recarregar a tela.
- Uma falha de gravação simulada não apresentou sucesso nem criou solicitação.
- Uma falha simulada no aceite manteve o convite pendente até o servidor confirmar.
- Aceites simultâneos criaram exatamente uma substituição; o convite concorrente
  foi cancelado. Horários conflitantes foram excluídos da busca.
- Foram verificados acesso entre perfis, isolamento entre escolas, edição do perfil
  alheio, token inválido, conta desativada e avaliações duplicadas.
- Foram exercitados cadastro, perfil, criação, busca, convite, aceite, conclusão,
  avaliação, recusa, cancelamento e troca de conta pelo navegador.
- As telas de criação, busca e perfil foram verificadas também em largura de 390 pixels.
- A migração foi aplicada no banco local existente preservando os registros.

Os testes de gravação usaram bancos temporários separados. Não foram executados
em um servidor de produção, nem validam infraestrutura de hospedagem, TLS, backups
ou capacidade sob carga. A evidência confirma os fluxos e o ambiente descritos.

Execute `npm test` para repetir a validação após alterações.
