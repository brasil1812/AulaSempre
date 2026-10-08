# Interface AulaSempre

Interface Angular integrada à API Express e ao banco MySQL. Consulte `../README.md` para iniciar o projeto completo.

Na pasta Front-end:

```powershell
npm ci
npm start
```

A interface abre em http://localhost:4200. A configuração `proxy.conf.json` encaminha `/api` para http://127.0.0.1:3000. Inicie também a API e o MySQL.

```powershell
npm run build
npm test
```

A compilação gera `dist/aulasempre/browser`, servido pela API na porta 3000. O teste recompila a interface e executa o fluxo de navegador da pasta Back-end com MySQL real e bancos temporários.

As rotas privadas verificam a sessão e o perfil. O estado real é carregado da API e as ações aguardam a gravação antes de mostrar sucesso. A demonstração em `/demo` é identificada na tela e tem armazenamento separado.

Professores completam disciplinas, níveis, formação e horários em **Meu perfil**. Escolas criam solicitações, buscam professores compatíveis, enviam convites e concluem e avaliam as aulas.
