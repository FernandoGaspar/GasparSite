# Arquitetura do GasparSite

## 1. Visão geral

O GasparSite é uma SPA React/TypeScript entregue como arquivos estáticos pelo IIS. A aplicação é a interface web para finanças, atividades, integrações de comunicação, casa conectada, memória/IA e secretária via WhatsApp. Regras de autorização, isolamento de usuário, persistência e integração com provedores pertencem ao GasparAPI.

```text
Navegador
  ├─ React Router + páginas
  ├─ providers de tema, privacidade visual e sessão
  ├─ Axios/fetch
  └─ armazenamento local estritamente de UX/sessão
          │ HTTPS + Bearer token
          ▼
GasparAPI
  ├─ domínio e autorização
  ├─ SQL Server
  ├─ workers e fila/outbox
  └─ Google, Microsoft, WhatsApp e Home Assistant
```

O navegador nunca é uma fronteira de confiança. IDs, versões, permissões, URLs e estados apresentados pelo cliente devem ser novamente validados pela API.

## 2. Stack e execução

- React 18.3 e TypeScript 4.9;
- React Router 5;
- Axios para chamadas autenticadas e `fetch` isolado nas experiências públicas compartilhadas;
- `styled-components` como padrão visual, com Material UI em módulos legados;
- Create React App 5 para build e Jest;
- Playwright em cenários E2E específicos;
- IIS + URL Rewrite para hospedagem da SPA.

O runtime de produção é apenas o conteúdo estático da pasta `build`. Dependências de build não são executadas no servidor web.

## 3. Estrutura de código

```text
src/
├── assets/          imagens e SVGs versionados
├── components/      componentes reutilizáveis e widgets de domínio
├── hooks/           sessão, tema e preferências transversais
├── pages/           páginas ligadas às rotas
├── repositories/    resolução do endereço da API e cache de requisições
├── routes/          composição de rotas públicas e autenticadas
├── styles/          temas, tipagem e estilos globais
├── utils/           funções puras e controles transversais
├── App.tsx          tema global e roteamento
└── index.tsx        bootstrap, interceptors e providers
```

Regras:

- página nova fica em `src/pages/<Nome>`;
- componente compartilhado fica em `src/components/<Nome>`;
- estilos do módulo permanecem próximos ao componente;
- acesso HTTP novo deve reutilizar `URL_API` e o interceptor global;
- funções genéricas de segurança e formatação pertencem a `src/utils`;
- nenhuma página deve armazenar segredo ou decidir autorização de servidor.

## 4. Bootstrap e navegação

`src/index.tsx` configura os interceptors do Axios e monta, nesta ordem, os providers de tema, privacidade de valores e autenticação. `src/App.tsx` aplica o tema e os estilos globais. `src/routes/index.tsx` expõe primeiro as duas rotas públicas por convite e, para as demais URLs, escolhe rotas autenticadas ou login.

O guard web usa a presença de uma sessão local completa apenas para decidir a tela. O GasparAPI continua sendo a autoridade: um HTTP 401 limpa as credenciais locais e devolve a aplicação ao login. Não use o booleano legado `@minha-carteira:logged` como prova de autenticação.

## 5. Estado e persistência no navegador

| Estado | Local | Observação |
| --- | --- | --- |
| bearer token e ID do usuário | `localStorage` | compatibilidade atual; risco residual documentado em Segurança |
| nome/e-mail lembrado | `localStorage` | conveniência de UX; não autoriza acesso |
| tema e ocultação de valores | `localStorage` | preferência local |
| histórico recente do chat | `localStorage`, separado por usuário/agente | cache de UX; a API é a fonte persistente |
| tokens/sessões de convite | `sessionStorage` | isolados por aba; fragmento é removido da barra de endereço |
| operações em andamento | estado React e chaves de idempotência | a API mantém a verdade durável |

## 6. Comunicação com a API

O endereço é resolvido em `src/repositories/baseAPI.ts`: produção usa `https://api.fernandogasparjr.com`; desenvolvimento usa `http://127.0.0.1:5000`. Requisições Axios recebem `Authorization: Bearer` e o header legado `X-User-Id`. O segundo nunca substitui a identidade derivada do token no servidor.

DTOs são renderizados como texto React, que aplica escaping. URLs vindas da API passam pelas funções de `src/utils/safeUrl.ts` antes de navegação, abertura ou renderização como imagem.

Detalhes de endpoint, idempotência e erros estão em [API_INTEGRATION.md](API_INTEGRATION.md).

## 7. Fluxos assíncronos e concorrência

- leituras que podem demorar usam estados de carregamento e polling apenas com a aba visível;
- comandos críticos usam confirmação explícita, versão otimista e/ou `Idempotency-Key`;
- mensagens WhatsApp com resultado incerto bloqueiam novos envios até conferência humana;
- o front-end não interpreta timeout como falha definitiva de envio;
- respostas 409 provocam atualização do recurso antes de uma nova decisão;
- o worker, a outbox e as exclusões mútuas da secretária pertencem à API.

## 8. Decisões arquiteturais vigentes

| Decisão | Motivo | Consequência |
| --- | --- | --- |
| SPA estática no IIS | operação simples e infraestrutura existente | rewrite e headers ficam em `web.config` |
| API como única autoridade | navegador é controlado pelo usuário | guards web melhoram UX, não segurança de dados |
| URLs centralizadas | evitar ambientes e hosts divergentes | nenhuma URL de API deve surgir em páginas novas |
| saída de IA renderizada como texto | reduzir XSS e ambiguidades | não usar `dangerouslySetInnerHTML` com conteúdo remoto |
| falha fechada em envio WhatsApp | duplicidade é mais danosa que espera | indisponibilidade da verificação bloqueia o composer |
| contatos canônicos | nome e autorização não podem depender do título do provedor | edição local prevalece e permissão é por canal |
| compatibilidade CRA temporária | migração total teria alto raio de mudança | dívida da cadeia de build permanece no registro de riscos |

## 9. Evolução recomendada

1. Migrar autenticação web para cookie `HttpOnly`, `Secure`, `SameSite` e remover bearer token do JavaScript.
2. Migrar Create React App para uma cadeia mantida, com atualização coordenada da biblioteca de testes.
3. Centralizar clientes HTTP por domínio, mantendo os contratos descritos e testes de compatibilidade.
4. Adicionar telemetria de erros com redaction e endpoint CSP de relatório antes de ativar `report-to`.
