# API AulaSempre

API Express/MySQL integrada à interface Angular. Consulte `../README.md` para iniciar o projeto completo e `../VALIDACAO.md` para as evidências de teste.

Na pasta Back-end:

```powershell
npm ci
npm run db:ensure
npm start
```

Configure `.env` a partir de `.env.example`, incluindo um segredo JWT aleatório com pelo menos 32 caracteres. `db:ensure` só aplica a carga inicial quando o banco está vazio; `db:migrate` preserva os registros existentes.

Endpoints principais:

| Grupo | Operações |
| --- | --- |
| `/health` | Verifica API e banco |
| `/api/auth` | `POST /cadastro`, `POST /login`, `GET /me` |
| `/api/catalogos` | `GET /disciplinas`, `GET /niveis-ensino` |
| `/api/escolas` | `GET /me` |
| `/api/professores` | `GET /`, `GET /me`, `GET /:id`, `PUT /:id`, `POST /:id/disponibilidade`, `GET /:id/substituicoes` |
| `/api/solicitacoes` | `POST /`, `GET /`, `GET /:id`, `GET /:id/matches`, `PATCH /:id/status` para cancelar |
| `/api/convites` | `POST /`, `GET /`, `PATCH /:id/resposta` |
| `/api/substituicoes` | `GET /`, `PATCH /:id/status`, `POST /:id/avaliacao`, `GET /:id/avaliacao` |

Use `Authorization: Bearer <token>` nas rotas privadas. O servidor verifica o usuário ativo a cada operação. Respostas de erro contêm `{ "erro": "mensagem" }`.

O perfil de professor é criado durante o cadastro. `PUT /professores/:id` recebe também `disciplina_ids`, `nivel_ids`, `disponibilidades` e `formacoes` para atualização atômica. As formações usam `curso`, `instituicao`, `tipo_formacao`, `ano_conclusao` e `status`; os horários usam `dia_semana`, `horario_inicio` e `horario_fim`.

`npm test` executa os 14 testes integrados com MySQL real. `npm run test:e2e` executa o fluxo pelo navegador com a interface previamente compilada. Ambos usam bancos temporários separados.
