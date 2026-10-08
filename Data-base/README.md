# Banco AulaSempre

MySQL 8.x com tabelas, relações, índices, validações e dados fictícios de desenvolvimento. O arquivo canônico é `Data-base/aulasempre.sql`; `Back-end/aulasempre.sql` é uma cópia compatível.

Para iniciar pelo Docker, nesta pasta:

```powershell
docker compose up -d
```

O script é aplicado somente na criação de um volume vazio. Ele contém `DROP TABLE` e não deve ser reaplicado sobre dados a preservar. A senha de desenvolvimento do banco é `root`, ajustável com `MYSQL_ROOT_PASSWORD`. Use a mesma senha em `Back-end/.env`.

Para atualizar um banco existente, na raiz:

```powershell
npm --prefix Back-end run db:migrate
```

A migração acrescenta os campos da aula e proteções de integridade sem apagar registros. Modalidade, cidade, endereço, valor, conteúdo, formação e experiência são persistidos. A combinação de chave única e gatilhos impede duas substituições ativas na mesma solicitação. As transações da API também serializam aceites concorrentes.

A senha dos usuários fictícios é `AulaSempre123!`. As contas e a inicialização completa estão descritas em `../README.md`. Os testes usam bancos separados, e a automação do repositório fica em `../.github/workflows/integration.yml`.
