# GasparSite — visão do sistema, arquitetura e layout

## O que o sistema faz

O GasparSite é a interface web do ecossistema pessoal Gaspar. Ele concentra informações financeiras e rotinas pessoais em uma SPA responsiva, incluindo:

- autenticação de usuário;
- visão consolidada de saldos, gastos, orçamento e transações;
- consulta e manutenção de lançamentos, parcelas, faturas e anexos;
- atualização de transações bancárias e visualização por banco/cartão;
- acompanhamento de investimentos e indicadores;
- saúde e treinos;
- rastreamento de dispositivos;
- chat e recursos de IA;
- painel de casa inteligente integrado ao Home Assistant.
- planejamento financeiro com insights, calendário e projeção de saldo.

O front-end consome principalmente o GasparAPI. Endereços externos ou de serviços independentes ficam centralizados em `src/repositories/baseAPI.ts`.

## Regra visual do planejamento financeiro

A tela `src/pages/Planning` representa fluxo de caixa, não o cronograma de compras do cartão:

- mostra receitas, despesas e investimentos programados pendentes como eventos individuais;
- mantém investimentos separados das despesas nos indicadores, embora ambos reduzam o saldo projetado;
- não mostra compras ou parcelas futuras do cartão individualmente;
- mostra somente a fatura consolidada do próximo mês, separada por emissor/cartão;
- trata a data exibida para a fatura como competência mensal, não como vencimento confirmado;
- deve manter a observação dessa limitação visível ao usuário.

O contrato correspondente é `GET /financial-planning`. A soma da próxima fatura já inclui as compras do cartão, portanto esses lançamentos não podem ser somados novamente na projeção.

A configuração fica em `/settings/contas-recorrentes`, apresentada ao usuário como **Fluxos programados**. O formulário oferece os tipos Receita, Despesa e Investimento e filtra as categorias contábeis compatíveis com o tipo selecionado. Ao escolher Investimento, um segundo controle define se o fluxo é **Custo** (por exemplo, parcela de imóvel) ou **Receita** (por exemplo, aluguel recebido).

A recorrência pode ser **Mensal**, com dia do mês, ou **Semanal**, com escolha explícita do dia da semana. Cada ocorrência semanal recebe data e identificador próprios no calendário e no acompanhamento.

## Agentes especializados

Os sete especialistas e o Coordenador geral ficam na rota autenticada `/assistant`, acessível pelo item **Assistente** do menu lateral. A tela consulta `GET /assistant/agents` para exibir papel, especialidades, fontes, frequência e prompt completo, e `GET /assistant/agents/status` para mostrar alertas, última execução e próxima execução estimada. O Gestor de atividades relaciona projetos, responsáveis, prazos e memória, mantendo as recomendações dentro de seu próprio chat.

Cada agente tem um histórico visual e persistente separado. A chave local inclui usuário e `AgentCode`, e a API também filtra e grava pelo código do agente. O Coordenador pode receber memória recente da equipe como contexto interno e delegar uma solicitação, mas sua tela continua mostrando apenas a conversa do próprio Coordenador. Alertas do especialista ficam disponíveis dentro de seu chat e podem iniciar uma pergunta contextualizada.

## Tecnologias

- React 18 e TypeScript;
- Create React App (`react-scripts`);
- React Router 5;
- Axios;
- `styled-components` como padrão visual principal;
- Material UI e bibliotecas especializadas apenas onde já são utilizadas;
- temas claro e escuro persistidos em `localStorage`.

## Arquitetura que deve ser preservada

```text
src/
├── assets/          # imagens, ícones e SVGs
├── components/      # componentes reutilizáveis
│   └── Componente/
│       ├── index.tsx
│       └── styles.ts
├── hooks/           # estado transversal: autenticação, tema etc.
├── mocks/           # dados simulados, nunca dados de produção
├── pages/           # telas ligadas às rotas
│   └── Pagina/
│       ├── index.tsx
│       └── styles.ts
├── repositories/    # endereços e contratos de acesso às APIs
├── routes/          # rotas públicas e autenticadas
├── styles/          # estilos globais, tipagem e temas
├── utils/           # funções puras de formatação e datas
├── App.tsx          # tema visual global e rotas
└── index.tsx        # providers e montagem da aplicação
```

Ao implementar uma funcionalidade:

1. mantenha a página em `src/pages/<Nome>`;
2. extraia elementos usados em mais de uma tela para `src/components/<Nome>`;
3. mantenha a lógica visual em `styles.ts`, ao lado do componente;
4. coloque funções puras e genéricas em `src/utils`;
5. centralize URLs e configuração de APIs em `src/repositories`;
6. registre páginas autenticadas em `src/routes/app.routes.tsx` e públicas em `auth.routes.tsx`;
7. preserve a composição de providers em `src/index.tsx` e o `ThemeProvider` visual em `src/App.tsx`.

Não introduza uma segunda organização por funcionalidade, outro roteador ou outro framework de CSS sem uma migração planejada para todo o projeto.

## Como aplicar o layout e os estilos

O padrão do projeto é `styled-components`. Cada página ou componente deve importar seus elementos do arquivo local `styles.ts`:

```tsx
// index.tsx
import { Container, Header, Card } from './styles';

export function Example() {
  return (
    <Container>
      <Header>Título</Header>
      <Card>Conteúdo</Card>
    </Container>
  );
}
```

```ts
// styles.ts
import styled from 'styled-components';

export const Container = styled.main`
  min-height: 100%;
  padding: 24px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const Header = styled.h1`
  margin-bottom: 16px;
`;

export const Card = styled.section`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.tertiary};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.secondary};
`;
```

### Regras visuais

- Use sempre `theme.colors`; não replique cores hexadecimais nos componentes sem necessidade.
- As paletas oficiais ficam em `src/styles/themes/dark.ts` e `light.ts`.
- Resets, tipografia global e custom properties de bibliotecas ficam em `src/styles/GlobalStyles.ts`.
- Preserve a semântica atual: `primary` para o fundo, `secondary` para superfícies, `tertiary` para bordas/detalhes, `success` para destaque positivo, `info` para informação e `warning` para alerta/ação destrutiva.
- Todo layout novo deve funcionar nos dois temas e em telas móveis.
- Prefira `gap`, Grid e Flexbox. Evite posicionamento absoluto para a estrutura principal.
- Estados de carregamento, vazio, erro, foco, hover e desabilitado fazem parte do layout e devem ser implementados.
- Antes de criar um novo botão, card, cabeçalho ou modal, verifique se já há equivalente em `src/components`.
- CSS global só deve ser usado para reset, elementos raiz ou adaptação inevitável de bibliotecas externas.

## Fluxo de dados

```text
Página/componente → Axios → URL_API → GasparAPI → Modelo/Auxiliar → SQL Server
                                      └──────────→ Home Assistant
```

Autenticação e identificação do usuário são mantidas pelo hook `src/hooks/auth.tsx`. Não espalhe leitura e gravação direta das mesmas chaves de `localStorage` por novas páginas.

### Comunicação e contas conectadas

- `/communications` é a interface operacional de e-mail e separa explicitamente os contextos **Pessoal** (Gmail) e **Profissional** (Microsoft 365).
- `/settings` é o único ponto de conexão OAuth, desconexão e configuração das automações de e-mails marcados.
- A agenda corporativa permanece em `/activities`; e-mails não são exibidos como uma aba de Atividades.
- Atividades originadas por Gmail usam `area=personal` e `sourceType=gmail_mail`; Outlook usa `area=work` e `sourceType=microsoft_mail`.
- A referência externa abre o provedor correto e impede que a mesma mensagem crie atividades duplicadas.

## Critérios de preservação

Uma alteração está arquiteturalmente consistente quando:

- segue a separação `pages`, `components`, `hooks`, `repositories`, `utils` e `styles`;
- não duplica componentes nem regras de tema;
- mantém contratos existentes da API ou coordena a mudança com o GasparAPI;
- não contém URLs, tokens ou segredos novos diretamente no código;
- mantém compatibilidade com o build estático usado pelo IIS.

O processo obrigatório de implementação, teste e publicação está em [IMPLEMENTACAO_TESTES_DEPLOY.md](IMPLEMENTACAO_TESTES_DEPLOY.md).
