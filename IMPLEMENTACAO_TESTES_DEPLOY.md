# GasparSite — implementação, testes e deploy

## Fluxo obrigatório de implementação

1. Atualize a branch local e confirme que o diretório de trabalho não contém mudanças inesperadas.
2. Descreva o comportamento esperado e identifique páginas, componentes e endpoints afetados.
3. Implemente respeitando [ARQUITETURA.md](ARQUITETURA.md), sem misturar acesso HTTP, regra de apresentação e estilos quando puderem ser separados.
4. Se o contrato HTTP mudar, implemente e teste primeiro a compatibilidade no GasparAPI.
5. Valide os estados feliz, carregando, vazio, erro e sem autorização.
6. Teste temas claro/escuro e larguras desktop/mobile.
7. Execute os testes e gere um build de produção antes do commit.
8. Revise o diff para impedir publicação de tokens, senhas, arquivos `.env`, logs ou dados pessoais.

## Preparação local

No PowerShell:

```powershell
cd "C:\Dev\Gaspar Solutions\GasparSite"
npm ci --legacy-peer-deps
```

Para desenvolvimento:

```powershell
npm start
```

O servidor do Create React App normalmente abre `http://localhost:3000`.

Antes de testar, confirme `src/repositories/baseAPI.ts`. O ambiente local deve apontar para `http://localhost:5000` (API direta) ou `http://localhost:8075` (proxy Nginx do Docker). Produção deve usar a URL HTTPS pública. Escreva `localhost`, não `locahost`.

## Testes mínimos

### Automatizados

```powershell
npm test -- --watchAll=false
npm run build
```

O build é parte da validação: falhas de TypeScript, imports e empacotamento impedem o deploy.

Para toda regra nova relevante, adicione teste com React Testing Library. Priorize:

- renderização e interação do componente;
- autenticação e proteção de rotas;
- formatação de valores e datas;
- tratamento de sucesso e falha das chamadas HTTP;
- regressões do defeito corrigido.

### Validação manual

- login e logout;
- dashboard, listas, filtros e totais;
- alteração, exclusão, parcelas e anexos de transações;
- investimentos, saúde, rastreador, chat e casa inteligente quando afetados;
- navegação direta e atualização do navegador em rotas internas;
- temas claro e escuro;
- Chrome/Edge em desktop e viewport móvel;
- console do navegador sem erros e aba Network sem chamadas incorretas.

## Build de produção

```powershell
cd "C:\Dev\Gaspar Solutions\GasparSite"
npm ci --legacy-peer-deps
npm test -- --watchAll=false
npm run build
```

O artefato publicável é o conteúdo da pasta `build`, não o código-fonte.

O IIS precisa do arquivo `web.config` junto do `index.html` publicado. Como o `web.config` está atualmente na raiz do repositório, copie-o explicitamente para `build` antes de publicar:

```powershell
Copy-Item -LiteralPath ".\web.config" -Destination ".\build\web.config" -Force
```

## Deploy em produção no IIS

Destino obrigatório:

```text
C:\Site\Gastos
```

### Pré-requisitos do servidor

- IIS instalado;
- módulo IIS URL Rewrite instalado;
- site/aplicação do IIS com caminho físico `C:\Site\Gastos`;
- Application Pool em `No Managed Code`;
- identidade do Application Pool com permissão de leitura na pasta;
- binding HTTPS e certificado configurados para o domínio de produção.

### Publicação segura

Execute como administrador no servidor de produção, após criar um backup da versão vigente:

```powershell
$release = "C:\Dev\Gaspar Solutions\GasparSite\build"
$target = "C:\Site\Gastos"
$backup = "C:\Site\Backups\Gastos-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

New-Item -ItemType Directory -Path $backup -Force | Out-Null
Copy-Item -Path "$target\*" -Destination $backup -Recurse -Force
robocopy $release $target /MIR
if ($LASTEXITCODE -ge 8) { throw "Falha no robocopy: $LASTEXITCODE" }
```

`robocopy /MIR` remove do destino arquivos que não existem mais no build. Confira cuidadosamente os valores de `$release` e `$target` antes de executar.

Recicle somente o Application Pool associado ao site, usando o nome real configurado no IIS:

```powershell
Import-Module WebAdministration
Restart-WebAppPool -Name "NOME_REAL_DO_APP_POOL"
```

Não assuma que o nome do pool é `Gastos`; confirme-o no IIS Manager.

### Smoke test após o deploy

- abra a URL pública e faça login;
- atualize o navegador em uma rota interna para validar o rewrite da SPA;
- confirme que arquivos JS/CSS retornam HTTP 200;
- valide uma consulta somente leitura da API;
- verifique console e Network;
- confirme que a URL usada pelo build é a API HTTPS de produção.

Se o smoke test falhar, restaure o backup para `C:\Site\Gastos`, recicle o Application Pool e investigue fora da pasta publicada.

## Checklist de liberação

- [ ] diff revisado e aprovado;
- [ ] nenhuma credencial ou dado pessoal no commit/build;
- [ ] testes automatizados concluídos;
- [ ] `npm run build` concluído;
- [ ] `web.config` presente dentro de `build`;
- [ ] API de produção selecionada no build;
- [ ] backup criado;
- [ ] conteúdo de `build` publicado em `C:\Site\Gastos`;
- [ ] Application Pool reciclado;
- [ ] smoke test concluído;
- [ ] rollback disponível.
