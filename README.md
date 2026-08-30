# Gaspar

Projeto front-end React (Create React App) para gerenciar finanças pessoais/empresariais.

**Resumo**
- SPA em React + TypeScript com `styled-components`, Material UI e várias libs auxiliares.
- Comunicação com back-end via `axios`; endpoints definidos em `src/repositories/baseAPI.ts`.
- Autenticação simples com token salvo em `localStorage`.
- Planejamento de 90 dias com contas recorrentes e próxima fatura consolidada; compras do cartão não são projetadas individualmente.

**Requisitos**
- Node.js 16+ (recomendado 18 LTS)
- npm 8+ ou yarn

**Instalação**
1. Na raiz do projeto, instale dependências:

```bash
npm install --legacy-peer-deps
```

2. O feed de notícias é consultado pelo backend. Configure `NEWS_API_KEY` somente no `.env` da API; nunca use uma variável `REACT_APP_*` para segredos, pois ela seria incorporada ao JavaScript público.

O projeto instala com `npm install`; dependências antigas e incompatíveis que não eram utilizadas foram removidas.

Se preferir `yarn`:

```bash
yarn
```

**Executar em desenvolvimento**

```bash
npm start
```

Isso iniciará o servidor dev (Create React App) e normalmente abre http://localhost:3000.

**Build de produção**

```bash
npm run build
```

**Configuração da API**
- Endpoints/URLs da API estão em [src/repositories/baseAPI.ts](src/repositories/baseAPI.ts). Em produção o projeto usa `https://api.fernandogasparjr.com`.
- Se precisar apontar para um backend local, edite `URL_API` em `src/repositories/baseAPI.ts`.

**Autenticação**
- `src/hooks/auth.tsx` implementa a sessão web; um interceptor envia `Authorization` e `X-User-Id`. A API valida o token e impede que IDs enviados pelo cliente substituam o usuário autenticado.

**Principais comandos de ajuda**

```bash
# Instalar dependências
npm install

# Rodar em dev
npm start

# Gerar build de produção
npm run build
```

**Problemas comuns**
- Erro `react-scripts não é reconhecido`: normalmente significa que `node_modules` não está instalado ou a instalação falhou. Rode `npm install --legacy-peer-deps` e tente `npm start` novamente.
- O build ainda emite avisos de lint do código legado; eles não impedem a compilação, mas devem ser eliminados gradualmente.

**Arquitetura & pontos importantes**
- Entrada: [src/index.tsx](src/index.tsx) → providers (`Theme`, `ShowNumber`, `Auth`) → `App`.
- Rotas: [src/routes/index.tsx](src/routes/index.tsx) escolhe entre `app.routes` e `auth.routes` conforme `useAuth()`.
- Exemplo de componente com lógica de domínio: [src/components/HistoryFinanceModal/index.tsx](src/components/HistoryFinanceModal/index.tsx).
- Formatação de datas: [src/utils/formatDate.ts](src/utils/formatDate.ts).

**Validação**
- `npm test -- --watchAll=false`: 4 testes;
- `npm run build`: build de produção por rota;
- `npm audit --omit=dev`: zero vulnerabilidades conhecidas em dependências entregues ao navegador em 28/08/2026.

**Contribuição**
- Abra issues e pull requests. Mantenha consistência de estilo e execute testes locais antes de enviar PRs.

---
Arquivo criado: [README.md](README.md)

