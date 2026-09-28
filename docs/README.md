# Documentação do GasparSite

Este diretório é a fonte de verdade da interface web do ecossistema Gaspar. A documentação descreve o estado implementado em 27 de setembro de 2026; mudanças de contrato ou comportamento devem atualizar o documento correspondente no mesmo pull request.

## Mapa da documentação

| Documento | Conteúdo | Público principal |
| --- | --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | limites, componentes, fluxo de dados e decisões estruturais | engenharia e arquitetura |
| [FUNCTIONALITY.md](FUNCTIONALITY.md) | rotas, módulos, regras funcionais e estados do produto | produto, QA e suporte |
| [API_INTEGRATION.md](API_INTEGRATION.md) | autenticação, convenções HTTP, grupos de endpoints e concorrência | front-end e API |
| [SECURITY.md](SECURITY.md) | ameaças, controles, dados sensíveis, riscos residuais e resposta a incidentes | AppSec, operação e engenharia |
| [OPERATIONS.md](OPERATIONS.md) | ambiente, testes, CI, build, publicação, smoke test e rollback | DevOps e responsáveis por release |

## Regras de manutenção

1. Não registre segredos, tokens, dados pessoais reais ou respostas integrais de produção.
2. Mudança de rota ou funcionalidade exige atualização do catálogo funcional.
3. Mudança de endpoint, DTO, header, autenticação ou idempotência exige atualização do contrato de integração.
4. Mudança de dependência, política do IIS ou armazenamento local exige revisão de segurança.
5. Mudança no processo de release exige atualização operacional e do workflow de CI.
6. O código e os testes prevalecem quando uma divergência for encontrada; a divergência deve ser corrigida no mesmo trabalho.

## Documentos históricos

Os arquivos `ARQUITETURA.md` e `IMPLEMENTACAO_TESTES_DEPLOY.md` na raiz permanecem como atalhos compatíveis para este conjunto. Não adicione regras novas apenas nesses atalhos.
