# Integração GasparSite ↔ GasparAPI

## 1. Endereços e transporte

| Ambiente | Base URL |
| --- | --- |
| produção | `https://api.fernandogasparjr.com` |
| desenvolvimento | `http://127.0.0.1:5000` |

`src/repositories/baseAPI.ts` é o único local que resolve a base URL. Produção deve usar HTTPS. Não adicione chaves, tokens ou credenciais em variáveis `REACT_APP_*`: qualquer valor desse prefixo é público no bundle.

## 2. Autenticação

O login envia `{ email, senha }` para `POST /login`. A resposta legada aceita uma lista cujo primeiro item contém `Token`, `idUsuario` e `Apelido`.

Chamadas Axios autenticadas recebem:

```http
Authorization: Bearer <token>
X-User-Id: <id-legado>
```

`X-User-Id` existe por compatibilidade; a API precisa comparar/ignorar esse valor e derivar o usuário efetivo do bearer token. HTTP 401 fora do login invalida a sessão web, preservando apenas o e-mail lembrado.

As rotas públicas de compartilhamento não recebem bearer token. Elas usam `X-Share-Link` e, após o código de e-mail, `X-Share-Session`, ambos limitados pelo servidor.

## 3. Convenções de comando

### Idempotência

Operações que podem causar efeitos repetidos enviam:

```http
Idempotency-Key: <escopo>:<uuid-aleatório>
```

- envio manual WhatsApp mantém a chave por identidade da conversa + texto até resultado definitivo;
- retry automático do chat mantém a mesma chave;
- contatos, estilo e ações da secretária usam chave e controle de versão;
- IDs de rascunho de provedor funcionam como identidade adicional no fluxo de e-mail.

Não gere nova chave para repetir uma operação cujo resultado anterior é desconhecido. Primeiro consulte/reconcilie o estado durável.

### Concorrência otimista

Recursos versionados enviam `expectedVersion`. HTTP 409 indica que o front-end deve buscar novamente o recurso e exigir nova revisão humana; não deve sobrescrever silenciosamente o estado mais recente.

### Confirmação humana

Comandos externos irreversíveis enviam `confirmed: true` somente após uma ação explícita e próxima ao resumo do que será executado. Desabilitar um botão não substitui a validação no handler nem na API.

## 4. Erros

| Status/código | Tratamento web esperado |
| --- | --- |
| 400/422 | mostrar mensagem validada da API e preservar entrada corrigível |
| 401 | invalidar sessão autenticada; em compartilhamento, apagar somente a sessão do convite |
| 403 | informar falta de autorização sem tentar alterar identidade |
| 404 | atualizar lista quando o recurso puder ter sido removido |
| 409 | recarregar versão/estado; nunca repetir cegamente |
| 429 | informar limite e não fazer retry automático de login |
| 5xx/rede | preservar formulário; só repetir automaticamente operações comprovadamente idempotentes |
| `outcome_unknown` | bloquear envio e solicitar conferência humana |
| `snapshot_pending` | não reenviar; aguardar/reconciliar snapshot |
| `manual_attention_pending` | carregar atenção durável e manter composer fechado |

Mensagens de erro nunca devem incluir token, headers, corpo completo de e-mail/WhatsApp ou stack trace.

## 5. Grupos de endpoint consumidos

Esta é uma visão por capacidade, não uma especificação substituta dos testes da API.

| Capacidade | Endpoints principais |
| --- | --- |
| sessão | `POST /login` |
| dashboard financeiro | `/gastos`, `/gastosAgrupados`, `/saldo`, `/getValorFatura` |
| planejamento | `/financial-planning`, `/financial-planning/duplicates*` |
| contas recorrentes | `/contas-recorrentes*` |
| investimentos | `/investments/dashboard`, `/investments/pluggy/sync`, `/investments/watchlist/*` |
| sincronização bancária | `/pluggy/transactions/refresh`, `/atualizaTransacoesBancos`, `/bancosUsuario` |
| atividades | `/activities*`, `/activity-people*` |
| compartilhamento público | `/shared-activities*`, `/shared-people*` |
| Google | `/gmail/connection`, `/gmail/messages*`, `/gmail/drafts*`, `/gmail/preferences`, `/gmail/organize` |
| Microsoft | `/microsoft/connection`, `/microsoft/calendar`, `/microsoft/messages*`, `/microsoft/teams/messages`, `/microsoft/activity-draft` |
| WhatsApp | `/whatsapp/connection`, `/whatsapp/preferences`, `/whatsapp/conversations*`, `/whatsapp/messages`, `/whatsapp/outbound-attentions*` |
| contatos | `/contacts`, `/contacts/:id` |
| secretária | `/secretary/style`, `/secretary/scheduling*` |
| assistentes | `/assistant/agents`, `/assistant/agents/status`, `/assistant/chat` |
| Segundo Cérebro | `/second-brain*` |
| contexto e memória | `/api/ai/context*`, `/api/ai/memories*`, `/api/ai/memory-graph*` |
| casa conectada | `/home-assistant/states`, `/home-assistant/service`, `/home-assistant/camera/*` |
| rastreamento | `/tracker/devices` |
| automações | `/automations*` |
| notícias | `/news` |

## 6. Contrato WhatsApp/secretária no cliente

Identidades WhatsApp completas são comparadas pelo JID normalizado. O sufixo de dispositivo `:<n>` pode ser removido, mas domínios `@lid` e `@s.whatsapp.net` nunca são considerados equivalentes apenas pelo número local.

Antes de enviar manualmente, o cliente precisa obter tanto os acompanhamentos da secretária quanto `/whatsapp/outbound-attentions`. Falha em qualquer consulta bloqueia a escrita. Uma atenção só é liberada por `POST /whatsapp/outbound-attentions/:commandId/acknowledge` com `confirmed` e `expectedVersion`.

A lista de agendamentos contém estados ativos, pausados, aguardando decisão e terminais. `pauseReason` é um dado funcional; motivos `outbound_outcome_unknown` e `outbound_sent_after_state_changed` continuam bloqueantes mesmo quando o mandato está terminal.

### Mídia de câmeras

Bearer token e ID de usuário não podem aparecer na URL de snapshot/stream. O Site primeiro chama, com autenticação normal:

```http
POST /home-assistant/camera/{entity_id}/media-ticket
Content-Type: application/json

{ "mode": "snapshot" | "stream" }
```

A resposta `{ ticket, mode, expiresAt, path }` gera a URL de mídia `GET /home-assistant/camera/{entity_id}?mode=<mode>&media_ticket=<ticket>`. O ticket expira rapidamente e é vinculado no servidor a usuário, entidade e modo. Snapshot e stream sempre recebem tickets separados; atualizar a imagem solicita um novo ticket. Se o elemento de mídia falhar — por exemplo, após uma reconexão além do TTL — o Site solicita um único ticket novo; uma segunda falha é exibida ao usuário e não entra em loop.

## 7. Conteúdo não confiável

- texto remoto é renderizado como texto React;
- HTML remoto não é injetado;
- URLs passam por `safeHttpUrl`, `safeExternalUrl`, `safeInternalPath` ou `safeImageSource`;
- URL de OAuth precisa ser absoluta e HTTPS (HTTP somente em loopback de desenvolvimento);
- data URL aceita para imagem é raster; SVG remoto embutido é recusado;
- IDs entram em paths via `encodeURIComponent`;
- parâmetros opcionais entram via `axios.params` ou `URLSearchParams`.

## 8. Compatibilidade e mudança de contrato

Uma alteração incompatível deve seguir esta ordem:

1. API aceita contrato antigo e novo;
2. testes de integração cobrem ambos;
3. Site publica o contrato novo;
4. telemetria confirma ausência de clientes antigos;
5. API remove a compatibilidade em release posterior.

Nunca coordene quebra de contrato apenas por data ou por suposição de deploy simultâneo.
