# GasparSite

Interface web React/TypeScript do ecossistema Gaspar para finanças, atividades, comunicações, casa conectada, memória/IA e secretária via WhatsApp.

## Começar

Requisitos: Node.js 20 LTS e npm.

```powershell
npm ci --legacy-peer-deps
npm start
```

O desenvolvimento abre normalmente em `http://localhost:3000` e usa o GasparAPI em `http://127.0.0.1:5000`. Produção usa `https://api.fernandogasparjr.com`.

## Validar

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

O artefato publicável é `build`. Não use `npm audit fix --force`.

## Documentação

- [Índice e governança](docs/README.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Catálogo funcional](docs/FUNCTIONALITY.md)
- [Integração com a API](docs/API_INTEGRATION.md)
- [Segurança e riscos](docs/SECURITY.md)
- [Testes, CI, deploy e rollback](docs/OPERATIONS.md)

## Segurança

Não adicione segredos em código ou variáveis `REACT_APP_*`: elas são públicas no bundle. Consulte [SECURITY.md](SECURITY.md) para reporte e [docs/SECURITY.md](docs/SECURITY.md) para os controles técnicos.
