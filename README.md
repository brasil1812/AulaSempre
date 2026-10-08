# AulaSempre

Plataforma de substituição de professores com MySQL, API Express e interface Angular.
Escolas publicam aulas e convidam professores compatíveis. Professores cadastram
seu perfil e respondem aos convites. A escola conclui a aula e registra a avaliação.

## Iniciar no Windows

Requisitos: Node.js 24, npm e MySQL 8.x. O Docker Desktop também pode iniciar o MySQL
com a configuração de `Data-base/docker-compose.yml`.

Na raiz do projeto:

```powershell
.\start.ps1
```

O script instala dependências ausentes, prepara o banco sem apagar registros,
compila a interface e inicia a API em segundo plano. Se `.env` não existir, cria
uma configuração local com segredo de sessão aleatório. O MySQL local já preparado
em `Data-base/.runtime` é utilizado quando disponível; em uma instalação nova,
inicie seu MySQL ou deixe o Docker Desktop aberto.

Abra **http://localhost:3000**. A interface e a API usam a mesma origem. Os logs
ficam em `.runtime/api-out.log` e `.runtime/api-err.log`. O script valida
`/health`, incluindo a conexão real ao banco. Para iniciar sem recompilar uma
interface já atualizada, execute `./start.ps1 -SkipBuild`.

Se uma versão anterior da API já estiver executando na mesma porta, encerre esse
processo antes de iniciar a versão atualizada. O script preserva processos já ativos.

## Configuração manual

Copie `Back-end/.env.example` para `Back-end/.env`, ajuste a conexão MySQL e substitua
`JWT_SECRET` por um segredo aleatório de pelo menos 32 caracteres. Para gerá-lo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Depois, na raiz:

```powershell
npm run install:all
npm run db:ensure
npm run build
npm start
```

`db:ensure` inicializa apenas bancos vazios e aplica as alterações de estrutura
em bancos existentes. `npm --prefix Back-end run db:migrate` aplica somente a
migração. O SQL completo contém `DROP TABLE` e deve ser usado apenas para criar
um ambiente descartável; não o reexecute sobre dados que precisam ser preservados.

Para desenvolvimento com atualização automática, use dois terminais:

```powershell
npm run dev:api
npm run dev:front
```

O front-end de desenvolvimento abre em **http://localhost:4200** e encaminha
`/api` para a API na porta 3000. Se alterar a porta da API, ajuste
`Front-end/proxy.conf.json`. Em produção, a API entrega a interface compilada,
incluindo as rotas internas acessadas diretamente.

## Contas locais dos dados fictícios

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Escola | renata.coord@colegiosaopaulo.com.br | AulaSempre123! |
| Professor | lucas.matematica@gmail.com | AulaSempre123! |

Essas contas pertencem à carga inicial de desenvolvimento. Também é possível
criar contas pela tela de cadastro. Um professor novo deve preencher **Meu perfil**
com disciplinas, níveis, horários e formações antes de aparecer nas buscas compatíveis.

A demonstração é explícita, usa dados fictícios separados e não grava na API.
As contas reais consultam o banco; erros de conexão são exibidos. Atualize os dados
na barra lateral para consultar mudanças feitas em outra sessão. Navegar para as
listas e painéis também consulta os dados atuais.

## Regras integradas

- A busca verifica disciplina, nível, disponibilidade semanal, cidade para aulas
  presenciais, formação, experiência e conflitos de horário.
- O convite valida novamente os critérios no servidor.
- O aceite cria uma substituição e cancela convites concorrentes em uma transação.
  Aceites simultâneos não podem preencher a mesma aula duas vezes.
- A recusa do último convite pendente reabre a solicitação.
- O cancelamento encerra os convites pendentes e substituições ativas relacionados.
- A conclusão atualiza a solicitação e permite uma avaliação por substituição.
- Escolas acessam suas próprias solicitações; professores alteram seu próprio perfil
  e respondem aos próprios convites. Contas desativadas perdem o acesso por token.

## Testes

Com o MySQL acessível e `Back-end/.env` configurado:

```powershell
npm test
```

O comando executa os 14 testes de API/banco, compila a interface e realiza o fluxo
completo pelo navegador. Os testes criam bancos com nomes `aulasempre_test_<uuid>`
e removem apenas esses bancos ao terminar, sem reinicializar o banco da aplicação.
O usuário MySQL de teste precisa de permissão para criar e remover bancos.

No Windows o teste utiliza o Microsoft Edge instalado. Em Linux, instale o navegador
uma vez com `npx playwright install --with-deps chromium` na pasta `Back-end`.
Para escolher outro canal instalado, defina `PLAYWRIGHT_CHANNEL`.

As imagens dos testes ficam em `.test-artifacts`. A automação de integração está
em `.github/workflows/integration.yml`. A validação local é descrita em `VALIDACAO.md`.
