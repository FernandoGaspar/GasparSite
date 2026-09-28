# Segurança do GasparSite

## 1. Objetivo e modelo de ameaça

O Site manipula dados financeiros, atividades, comunicações, memória de IA, dispositivos domésticos e comandos para serviços externos. As ameaças prioritárias são:

- roubo de sessão por XSS, extensão maliciosa ou dispositivo comprometido;
- acesso indevido por confiar em IDs enviados pelo navegador;
- navegação/script por URL maliciosa retornada por API ou provedor;
- duplicidade de mensagem/comando após timeout;
- vazamento por logs, query strings, referrer, source map ou bundle;
- clickjacking e carregamento de conteúdo ativo;
- confusão entre contexto pessoal/profissional ou entre contatos;
- supply chain na instalação e no build;
- prompt injection ou conteúdo remoto tentando virar ação.

O navegador e toda saída de IA são não confiáveis. Autorização, ownership, consentimento e transições de estado devem ser garantidos no GasparAPI.

## 2. Classificação de dados

| Classe | Exemplos | Regras no Site |
| --- | --- | --- |
| credencial | bearer token, convite, sessão compartilhada, código OTP | nunca em log; mínimo tempo/escopo; não inserir em URL quando houver alternativa |
| sensível | finanças, e-mail, WhatsApp, câmeras, memória | somente após autorização; evitar cache e telemetria de conteúdo |
| pessoal | nomes, telefones, e-mails, responsáveis | mascarar quando possível; não usar como chave pública |
| operacional | versão, estado, timestamps, contagens | pode ser exibido conforme contexto autorizado |
| público | assets e textos institucionais | pode integrar o bundle |

## 3. Controles implementados

### Sessão

- a UI só considera sessão local completa quando token e ID coexistem;
- o booleano legado de login não concede acesso;
- Axios adiciona credenciais apenas quando a sessão está completa;
- HTTP 401 limpa credenciais e sincroniza logout na aplicação;
- evento `storage` sincroniza logout entre abas;
- a API continua responsável por validar token, usuário e recurso.

### XSS e navegação

- React faz escaping de texto e o projeto não usa `dangerouslySetInnerHTML` para conteúdo remoto;
- Markdown do Segundo Cérebro é convertido em elementos React;
- `src/utils/safeUrl.ts` aceita apenas HTTP(S), bloqueia credenciais embutidas e HTTP remoto;
- redirects OAuth exigem URL absoluta validada;
- data URLs de imagem aceitam formatos raster, não SVG ativo;
- links em nova aba usam `noopener noreferrer`;
- CSP bloqueia script externo/inline, objetos e framing.

### Convites públicos

- tokens chegam no fragmento, não no request HTTP inicial;
- o fragmento é removido imediatamente da barra/histórico corrente;
- token e sessão ficam em `sessionStorage`, limitados à aba;
- confirmação por e-mail é necessária antes dos dados;
- requests usam `no-store` e `no-referrer`;
- link ausente não dispara chamadas de verificação.

### Mídia autenticada

- câmera nunca coloca bearer token ou `user_id` na query string;
- uma chamada Axios autenticada obtém ticket HMAC efêmero;
- o ticket é vinculado a usuário, entidade e modo (`snapshot`/`stream`);
- snapshot e stream usam tickets distintos e a atualização solicita um novo;
- falha de mídia permite apenas uma renovação automática, evitando tanto indisponibilidade permanente por expiração quanto loops de requisição;
- a URL resultante contém somente a capacidade curta `media_ticket`.

### Comandos e IA

- confirmação humana antes de envio externo;
- chaves de idempotência usam `crypto.randomUUID` ou `getRandomValues`;
- versão otimista evita sobrescrita concorrente;
- resultado WhatsApp incerto fecha o composer até conferência;
- conteúdo do modelo é texto/dado, nunca código;
- estilo da secretária não altera permissões;
- vínculos canônicos evitam selecionar contato por título aproximado.

### Política HTTP no IIS

`web.config` entrega:

- `Content-Security-Policy`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY` e `frame-ancestors 'none'`;
- `Referrer-Policy: no-referrer`;
- `Permissions-Policy` restritiva;
- `Cross-Origin-Opener-Policy: same-origin`;
- HSTS por um ano em respostas HTTPS;
- `Cache-Control: no-store` para a aplicação sensível.

O reverse proxy/CDN não deve remover ou enfraquecer esses headers. HSTS deve ser confirmado apenas após validar que o domínio permanece exclusivamente HTTPS.

## 4. Supply chain

Auditoria de 27/09/2026:

- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilidades** no conjunto entregue ao navegador;
- `npm audit fix` sem `--force` atualizou dependências transitivas compatíveis; com a limpeza subsequente de dependências sem uso, o total caiu de **155** para **35** alertas;
- residual da árvore de desenvolvimento: **14 altos, 12 moderados e 9 baixos**;
- os residuais estão concentrados no Create React App/Jest antigo e em transitivos de build; eles não integram o bundle de runtime, mas importam em máquinas e runners de CI.

Não usar `npm audit fix --force`: a recomendação automática instala versões incompatíveis, inclusive `react-scripts@0.0.0`. O plano correto é migrar o bundler/test stack em trabalho isolado, com build e E2E completos. Até lá:

- CI roda com permissões mínimas e código confiável;
- não construir branches não confiáveis com segredos disponíveis;
- usar exclusivamente o npm, com `package-lock.json` como lockfile canônico versionado, e `npm ci` em ambientes limpos;
- não processar SVG/CSS/artefatos não confiáveis no build;
- acompanhar advisories em toda alteração de lockfile.

Dependências sem uso devem ser removidas junto com seus transitivos exclusivos. Não manter lockfiles de outros gerenciadores em paralelo, pois eles podem divergir do `package-lock.json` canônico.

## 5. Riscos residuais

| ID | Risco | Severidade | Situação/mitigação |
| --- | --- | --- | --- |
| WEB-01 | bearer token acessível ao JavaScript em `localStorage` | alta | CSP e ausência de HTML arbitrário reduzem exposição; migrar para cookie HttpOnly exige contrato da API |
| WEB-02 | cadeia CRA/Jest com 35 advisories de desenvolvimento | média | runtime limpo; runner isolado e migração planejada |
| WEB-03 | ausência de página 404 autenticada | baixa | não expõe dados; prejudica diagnóstico/navegação |
| WEB-04 | CSP ainda depende de `style-src 'unsafe-inline'` | média | necessário para styled-components/estilos existentes; remover após adoção de nonce/arquitetura compatível |
| WEB-05 | sem coleta de violações CSP/erros com redaction | baixa | monitoramento manual; adotar endpoint antes de ativar reporting |
| WEB-06 | avisos legados de lint, inclusive dependências de Hooks e acessibilidade | média | type-check, testes e build passam; limpar por módulo e então tornar lint um gate bloqueante |

Nenhum risco residual deve ser descrito como “100% seguro”. Segurança é uma propriedade operacional contínua.

## 6. Requisitos para código novo

- não confiar em guard, botão desabilitado, ID ou role do cliente;
- não renderizar URL remota diretamente;
- nunca usar `dangerouslySetInnerHTML` com dado externo;
- não gravar conteúdo sensível em `console.*`, analytics ou mensagens de exceção;
- usar `encodeURIComponent` em segmentos variáveis;
- confirmar comando externo e tratar timeout como resultado desconhecido;
- usar idempotência estável durante retries;
- preservar separação de contexto e consentimento por canal;
- cobrir erro, 401, 409, 429, loading e duplo clique;
- revisar CSP ao introduzir host, worker, iframe, fonte ou mídia.

## 7. Resposta a incidente web

1. Conter: invalidar tokens/sessões na API, bloquear integração afetada e preservar evidências.
2. Identificar: release, rota, usuário/escopo, headers e intervalo; não copiar conteúdo sensível para tickets.
3. Corrigir: menor patch possível, testes de regressão e rotação de qualquer segredo exposto.
4. Publicar: backup, deploy atômico, smoke test e verificação dos headers.
5. Recuperar: acompanhar erros/uso anômalo e restaurar somente se o rollback for mais seguro.
6. Aprender: registrar causa, impacto, linha do tempo e ação preventiva sem atribuição pessoal.

Canal e responsáveis por incidente devem ser definidos na documentação operacional privada; não grave contatos pessoais neste repositório.
