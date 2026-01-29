# Phase 4: Instances + MCP Foundation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Usuários conectam instâncias WhatsApp via UAZAPI e o sistema estabelece infraestrutura de ferramentas MCP que permite que gerenciem grupos. Gerenciamento de instâncias inclui adicionar, conectar via QR code, monitorar status e histórico. Tokens são gerenciados pelo sistema (modelo SaaS) — usuário final não precisa saber sobre tokens. O que precisamos é de uma interface boa e que siga os padrões do sistema. Verificar componentes existentes e o padrão desejado. Não seguir padrão visual e componentes do projeto original, pois serão refeitos a partir dos elementos desse novo projeto, e caso haja algum elemento de status server, cards de status, algo do tipo na internet pode ser aproveitado.

**Referência:** Projeto original em `C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos` tem implementação funcional. UX será refeita, lógica pode ser aproveitada.

</domain>

<decisions>
## Implementation Decisions

### Gerenciamento de instâncias
- Layout em **cards** (não tabela)
- Info por card: nome, status (badge), número conectado, última atividade, ações
- Ações disponíveis: Conectar/Desconectar, Ver histórico, Renomear, Excluir
- Adicionar instância: campo de nome + botão gerar QR code (simples)
- Token invisível ao usuário — sistema gerencia (SaaS model)
- Exclusão requer modal de confirmação com digitação do nome da instância
- Limite de instâncias definido pelo plano de billing
- Ao atingir limite: mensagem de bloqueio + botão para upgrade de plano

### Fluxo de conexão
- QR code aparece em **modal** sobre a lista de instâncias
- Durante escaneamento: QR code + texto "Escaneie com WhatsApp" + spinner discreto
- Conexão bem-sucedida: modal fecha automaticamente + toast de sucesso
- Expiração do QR: seguir timeout padrão da UAZAPI
- QR expirado: regenera automaticamente sem ação do usuário

### Status e monitoramento
- Indicador visual: **badge colorido** (verde "Conectado" / vermelho "Desconectado")
- Atualização: **polling a cada 30 segundos**
- Histórico: lista simples com data/hora de conexões e desconexões
- Acesso ao histórico: **dropdown expandível** no próprio card (últimos 5 eventos)

### Tratamento de erros
- Erro de API: mensagem **inline no card** com botão retry
- Desconexão inesperada: **3 feedbacks combinados**
  - Toast imediato avisando da desconexão
  - Card atualiza para "Desconectado"
  - Banner persistente no topo do dashboard até reconectar
- Auto-retry: **3 tentativas** antes de marcar como falha
- Mensagens de erro: sempre **amigáveis/traduzidas** (sem jargão técnico)

### Claude's Discretion
- Design específico dos cards (spacing, shadows, etc.)
- Implementação técnica do polling
- Estrutura dos endpoints MCP
- Configuração automática do N8N webhook

</decisions>

<specifics>
## Specific Ideas

- Projeto original em `C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos` serve como referência de lógica
- Skill UAZAPI disponível para consulta de API
- temos tambem os uazapi-openapi-spec que tem tudo sobre as chamadas da uazapi ali dentro
- Token já configurado no env (modelo SaaS — transparente ao usuário)
- Cards devem ser clean e modernos (similar ao padrão já estabelecido no dashboard)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-instances-mcp-foundation*
*Context gathered: 2026-01-29*
