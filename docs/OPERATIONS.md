# Operação, qualidade e publicação do GasparSite

## 1. Ambiente suportado

- Node.js 20 LTS;
- npm compatível com o lockfile;
- Windows/PowerShell no ambiente atual de desenvolvimento;
- IIS com URL Rewrite no servidor;
- GasparAPI acessível no ambiente correspondente.

Instalação reproduzível:

```powershell
cd "C:\Dev\Gaspar Solutions\GasparSite"
npm ci --legacy-peer-deps
```

Não use `npm audit fix --force`. Alterações no lockfile precisam de auditoria, testes e build.

## 2. Configuração

O Site não aceita segredos. Variáveis `REACT_APP_*` são compiladas no JavaScript público.

| Variável | Finalidade | Padrão |
| --- | --- | --- |

A URL do GasparAPI está em `src/repositories/baseAPI.ts`. Qualquer futura parametrização deve validar origem e continuar sem segredos.

## 3. Desenvolvimento

```powershell
npm start
```

O servidor normalmente usa `http://localhost:3000`; a API local é `http://127.0.0.1:5000`. O dev server é apenas para rede confiável e não deve ficar publicado na internet.

## 4. Gates de qualidade

Execute antes de commit/release:

```powershell
npx tsc --noEmit
$env:CI='true'
npm test -- --watchAll=false --runInBand --silent
npm audit --omit=dev --audit-level=high
$env:CI='false'
$env:GENERATE_SOURCEMAP='false'
npm run build
Copy-Item -LiteralPath '.\web.config' -Destination '.\build\web.config' -Force
```

Critérios:

- TypeScript sem erro;
- todas as suites aprovadas;
- nenhuma vulnerabilidade alta/crítica no runtime;
- build concluído sem expor source maps;
- `build/web.config` presente;
- diff sem `.env`, token, senha, PII real, logs de conteúdo ou artefato temporário.

Testes manuais proporcionais ao escopo:

- login, expiração 401 e logout entre abas;
- atualização direta de rota interna;
- temas e viewport móvel;
- console/Network sem erro ou dado sensível;
- comandos externos com confirmação;
- conflito 409 e timeout sem duplicidade;
- WhatsApp bloqueado durante atenção desconhecida;
- links OAuth/provedor abrindo apenas HTTPS esperado;
- rotas públicas sem detalhes antes do código.

## 5. Integração contínua

`.github/workflows/ci.yml` executa em pull requests e pushes para `main`/`master`:

1. checkout com permissão somente de leitura;
2. Node 20 e `npm ci`;
3. auditoria das dependências de runtime;
4. type-check;
5. testes em modo CI;
6. build sem source map;
7. inclusão do `web.config`;
8. upload do artefato por sete dias.

O workflow não publica produção. Deploy continua sendo uma etapa controlada, após revisão e aprovação.

O build atual conclui com avisos de lint herdados (Hooks, comparações, imports e acessibilidade). Por isso o passo de build mantém `CI=false`, enquanto type-check e testes continuam bloqueantes. Código novo não deve ampliar esse conjunto. A correção deve ser incremental, com regressão por módulo; depois dela, o build deve voltar a `CI=true` e o lint deve se tornar um gate separado.

## 6. Artefato e IIS

O artefato é o conteúdo de `build`, incluindo `web.config`. Configuração mínima:

- caminho físico de produção: `C:\Site\Gastos`;
- Application Pool em `No Managed Code`;
- módulo URL Rewrite;
- binding HTTPS e certificado válidos;
- identidade do pool com leitura no diretório;

Antes de publicar, valide o XML:

```powershell
$xml = New-Object System.Xml.XmlDocument
$xml.Load((Resolve-Path '.\build\web.config'))
```

## 7. Publicação e rollback

Em janela aprovada, crie backup e confira caminhos absolutos antes do espelhamento:

```powershell
$releasePath = 'C:\Dev\Gaspar Solutions\GasparSite\build'
$sitePath = 'C:\Site\Gastos'
$backupPath = "C:\Site\Backups\Gastos-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
Copy-Item -LiteralPath $sitePath -Destination $backupPath -Recurse -Force
robocopy $releasePath $sitePath /MIR
if ($LASTEXITCODE -ge 8) { throw "Falha no robocopy: $LASTEXITCODE" }
```

`/MIR` é destrutivo no destino. Resolva e confira os três caminhos antes de executar. Não reinicie API, banco, proxy ou workers ao publicar apenas o Site. Recicle somente o Application Pool correto se necessário.

Rollback:

1. interrompa novas publicações;
2. restaure o backup validado para `C:\Site\Gastos`;
3. recicle o pool correto;
4. repita smoke tests;
5. registre release, motivo e resultado.

## 8. Smoke test de produção

- página inicial e login respondem por HTTPS;
- rota interna atualizada diretamente retorna a SPA;
- JS/CSS/manifest retornam 200;
- `web.config` não é servido como conteúdo;
- chamada somente leitura autenticada responde;
- `Content-Security-Policy`, `nosniff`, `DENY`, `no-referrer` e HSTS estão presentes;
- OAuth retorna host oficial esperado;
- central de WhatsApp carrega conexão, atenções e contatos;
- nenhuma chamada contém bearer token ou `user_id` na URL; mídia de câmera usa somente ticket efêmero;
- console não apresenta violação CSP funcional;
- endpoint essencial da API continua respondendo.

Após confirmação, aplique a regra do workspace: encerre apenas processos de desenvolvimento iniciados por esta alteração se nenhuma outra tarefa estiver usando o ambiente. Nunca encerre produção, banco, proxy ou worker programado nessa limpeza.

## 9. Observabilidade e retenção

- não registrar conteúdo de mensagem, token, OTP ou payload financeiro no navegador;
- erros visíveis devem ser úteis sem stack trace;
- correlação deve usar IDs opacos de operação, não PII;
- builds e backups precisam de prazo de retenção definido;
- falha de CSP deve ser validada no console antes de liberar novos hosts;
- alertas de dependência devem distinguir runtime de ferramenta de build.
