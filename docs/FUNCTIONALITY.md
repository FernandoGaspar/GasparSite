# Catálogo funcional do GasparSite

## 1. Rotas

### Públicas por convite

| Rota | Função | Proteção funcional |
| --- | --- | --- |
| `/activity-share#<convite>` | acompanhamento de uma atividade compartilhada | capacidade do link + código de e-mail + sessão por aba |
| `/assigned-activities#<convite>` | atividades atribuídas a uma pessoa | capacidade do link + código de e-mail + sessão por aba |

O fragmento do convite é capturado e removido imediatamente da URL. Sem convite válido, a tela não oferece chamadas de verificação.

### Autenticadas

| Rota | Módulo | Principais capacidades |
| --- | --- | --- |
| `/` | Dashboard | saldos, gastos, faturas e visão de investimentos |
| `/list/:type` | Lançamentos | filtros, atualização bancária, duplicidades e anexos |
| `/CardList/:Banco/:AnoMes` | Fatura | itens consolidados por banco e competência |
| `/planning` | Planejamento | projeção de 90 dias, fluxos programados e próxima fatura |
| `/investment` | Investimentos | carteira, cotações, sincronização e acompanhamento manual |
| `/health` | Saúde | treinos, resultados e visão analítica |
| `/home` | Casa | dispositivos, ambientes, câmeras e automações Home Assistant |
| `/tracker` | Rastreamento | dispositivos conhecidos e estado recente |
| `/assistant` | Agentes | coordenador, especialistas, alertas e ações estruturadas |
| `/activities` | Atividades | foco, quadro, pessoas, rotinas, agenda, compartilhamento e integrações |
| `/communications` | Comunicação | Gmail pessoal, Microsoft profissional, Teams e WhatsApp |
| `/second-brain` | Segundo Cérebro | notas, fontes, busca, grafo, revisão e importação/exportação |
| `/ai-context` | Memória de IA | perfil, domínios, memórias, backfill e grafo de evidências |
| `/settings` | Contas | OAuth Google/Microsoft, WhatsApp e atalhos de configuração |
| `/settings/automations` | Automações | definições, agenda, ativação e histórico |
| `/settings/contas-recorrentes` | Fluxos programados | receitas, despesas, investimentos e ocorrências |
| `/settings/budget` | Budget | limites mensais por grupo contábil |

Rotas autenticadas não encontradas permanecem dentro do layout atual; uma página 404 explícita é uma melhoria futura recomendada.

## 2. Planejamento financeiro

A tela representa fluxo de caixa, não o cronograma individual de compras do cartão:

- receitas, despesas e investimentos programados aparecem individualmente;
- investimentos ficam separados nos indicadores, embora alterem o saldo;
- compras/parcelas futuras de cartão não são somadas individualmente;
- a próxima fatura aparece uma única vez, consolidada por emissor/cartão;
- a data da fatura representa competência, salvo quando o backend fornecer vencimento confirmado.

Essa regra impede dupla contagem no contrato `GET /financial-planning`.

## 3. Atividades e compartilhamento

Atividades suportam área pessoal/profissional, status, prioridade, prazo, responsável, projeto, recorrência e subtarefas. Fontes Gmail, Outlook, Teams e WhatsApp podem preparar rascunhos; salvar continua sendo uma decisão explícita do usuário.

A visão Pessoas mostra somente responsáveis que possuem atividades abertas no filtro atual. Cadastros e nomes que aparecem apenas no histórico concluído ficam fora dessa visão, sem alterar ou apagar os registros históricos. A interface não oferece ação de inativação.

Compartilhamentos não expõem a sessão principal. O convidado recebe um link-capability, confirma o e-mail com código e recebe uma sessão temporária limitada à atividade ou pessoa. Atualizações permitidas são status, comentário, solicitação de conclusão e subtarefas expostas pela API.

## 4. Comunicação

### Gmail pessoal

- lista mensagens espelhadas, categorias e explicações;
- organiza por ações explícitas e preferências;
- cria rascunho antes de enviar;
- exige confirmação humana no envio;
- links do provedor só são exibidos quando usam URL segura.

### Microsoft 365 profissional

- separa agenda, Outlook e Teams do contexto pessoal;
- converte evento/mensagem em rascunho de atividade;
- sincroniza snapshots em segundo plano;
- preserva link validado para o item original.

### WhatsApp e secretária

A área possui quatro visões: conversas, agendamentos, contatos e estilo.

Contatos canônicos:

- nome local prevalece sobre o título importado;
- canal pode ser ativado/desativado;
- consentimento da secretária (`agentAllowed`) é separado do uso manual;
- números são mascarados na agenda e identidade completa só trafega para a API.

Envio manual:

1. carrega conexão, histórico e atenções duráveis;
2. bloqueia o composer enquanto a verificação está carregando ou falhou;
3. pede confirmação antes de enviar;
4. reutiliza a mesma chave para a mesma conversa/texto após resultado ambíguo;
5. se o resultado for incerto, impede qualquer novo envio;
6. somente “Conferi a conversa” libera uma nova tentativa com nova chave.

Secretária:

- primeiro contato sempre depende de aprovação;
- pergunta de identidade, valores/pagamento, mídia, link ou assunto fora do mandato pausa o fluxo;
- modo `negotiate_only` pede aprovação final;
- modo `negotiate_and_book` só pode concluir dentro de limites explícitos validados pela API;
- perguntas que tentem identificar quem escreve exigem intervenção humana;
- a mensagem não se apresenta como IA/assistente e não afirma falsamente ser o usuário;
- ações usam versão otimista; 409 exige recarregar antes de decidir;
- envio tardio ou de resultado desconhecido permanece como atenção bloqueante.

O compromisso confirmado cria uma atividade interna. Escrita direta em Google/Outlook Calendar não é responsabilidade desta versão.

Estilo configurável inclui formalidade, cordialidade, concisão, emojis, saudação, despedida e instruções adicionais. Estilo nunca amplia autorização.

## 5. IA, memória e Segundo Cérebro

Conteúdo remoto e Markdown são renderizados como nós React, sem HTML arbitrário. Evidências devem ser revisadas antes de uma relação sugerida virar memória confirmada. Alertas e ações da IA são tratados como dados não confiáveis; URLs inválidas deixam de ser exibidas.

O chat separa histórico por usuário e agente, reutiliza chave de idempotência durante retry e tenta recuperar resposta persistida após timeout. A API decide ações e permissões; o componente não executa código retornado pelo modelo.

## 6. Estados obrigatórios de interface

Todo módulo novo deve representar, quando aplicável:

- carregamento;
- conteúdo vazio;
- sucesso;
- erro recuperável;
- indisponibilidade/sem configuração;
- conflito de versão;
- ação em andamento e prevenção de duplo clique;
- permissão insuficiente;
- viewport móvel, foco visível e navegação por teclado.
