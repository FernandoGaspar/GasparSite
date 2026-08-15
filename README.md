# Minha Carteira

Projeto front-end React (Create React App) para gerenciar finanças pessoais/empresariais.

**Resumo**
- SPA em React + TypeScript com `styled-components`, Material UI e várias libs auxiliares.
- Comunicação com back-end via `axios`; endpoints definidos em `src/repositories/baseAPI.ts`.
- Autenticação simples com token salvo em `localStorage`.

**Requisitos**
- Node.js 16+ (recomendado 18 LTS)
- npm 8+ ou yarn

**Instalação**
1. Na raiz do projeto, instale dependências:

```bash
npm install --legacy-peer-deps
```

2. (Opcional) Se desejar usar o feed de notícias real na tela de investimentos, adicione no arquivo `.env` a chave da NewsAPI:

```bash
REACT_APP_NEWSAPI_KEY=d394c4f38e1c49789d41305b66cf526c
```

Substitua o valor acima pelo seu próprio token obtido em https://newsapi.org/. O CRA carregará essa variável automaticamente.

Observação: neste repositório há um conflito de peer-dependencies (ex.: `@react-pdf/renderer` exige React 16/17). Usamos `--legacy-peer-deps` para prosseguir com a instalação. Para uma correção definitiva, atualize ou remova pacotes incompatíveis.

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
- Endpoints/URLs da API estão em [src/repositories/baseAPI.ts](src/repositories/baseAPI.ts). Por padrão o projeto aponta para `http://fernandogasparjr.ddns.net:8075`.
- Se precisar apontar para um backend local, edite `URL_API` em `src/repositories/baseAPI.ts`.

**Autenticação**
- `src/hooks/auth.tsx` implementa `signIn` que salva `@minha-carteira:token` e `@minha-carteira:usuarioId` no `localStorage`.

**Principais comandos de ajuda**

```bash
# Instalar dependências (com fallback para peer deps conflitantes)
npm install --legacy-peer-deps

# Rodar em dev
npm start

# Gerar build de produção
npm run build
```

**Problemas comuns**
- Erro `react-scripts não é reconhecido`: normalmente significa que `node_modules` não está instalado ou a instalação falhou. Rode `npm install --legacy-peer-deps` e tente `npm start` novamente.
- Conflitos de peer-deps: atualize as versões nos `dependencies` ou instale com `--legacy-peer-deps`.

**Arquitetura & pontos importantes**
- Entrada: [src/index.tsx](src/index.tsx) → providers (`Theme`, `ShowNumber`, `Auth`) → `App`.
- Rotas: [src/routes/index.tsx](src/routes/index.tsx) escolhe entre `app.routes` e `auth.routes` conforme `useAuth()`.
- Exemplo de componente com lógica de domínio: [src/components/HistoryFinanceModal/index.tsx](src/components/HistoryFinanceModal/index.tsx).
- Formatação de datas: [src/utils/formatDate.ts](src/utils/formatDate.ts).

**Melhorias recomendadas**
- Atualizar/remover `@react-pdf/renderer` ou trocar por versão compatível com React 18.
- Melhor tratamento de erros nas chamadas `axios` (feedback ao usuário).
- Migrar upload para `readAsArrayBuffer` (em vez de `readAsBinaryString`).
- Adicionar testes unitários e de integração.

**Contribuição**
- Abra issues e pull requests. Mantenha consistência de estilo e execute testes locais antes de enviar PRs.

---
Arquivo criado: [README.md](README.md)

