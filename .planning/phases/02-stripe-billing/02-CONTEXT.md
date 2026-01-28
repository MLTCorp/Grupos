# Phase 2: Stripe Billing - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Usuários pagam pelo serviço via assinatura trial-based. Fluxo: signup → checkout → dashboard. Trial de 7 dias, depois carência de 7 dias, depois bloqueio. Três planos: Inicial, Profissional, Enterprise.

</domain>

<decisions>
## Implementation Decisions

### Fluxo de Checkout
- Cartão pedido APÓS signup, ANTES de acessar dashboard
- Stripe Checkout hosted (redireciona para página do Stripe)
- Checkout minimalista: nome do plano, preço, trial de 7 dias
- Após checkout bem-sucedido: tela de sucesso indicando próximo passo, depois dashboard

### Estrutura de Planos
- **Inicial:** R$ 147/mês — 1 instância, até 10 grupos
- **Profissional:** R$ 347/mês — 3 instâncias, até 30 grupos, Agente IA incluso
- **Enterprise:** Fale Conosco (link para WhatsApp)
- Trial de 7 dias disponível para Inicial e Profissional (Enterprise negocia separado)

### Experiência do Trial
- Trial por usuário (não por instância)
- Countdown mostrado como badge discreto no sidebar
- Notificação por email 3 dias antes e no último dia do trial
- Trial = 7 dias de uso completo

### Período de Carência
- Após trial expirar: 7 dias de carência com aviso "Renove em X dias"
- Durante carência: acesso limitado (pode ver e gerenciar, NÃO pode enviar mensagens)
- Countdown de 7 para 0 dias

### Bloqueio por Assinatura
- Após 14 dias totais (7 trial + 7 carência): bloqueio total
- Tela de bloqueio com tom amigável: "Sentimos sua falta!"
- Sem acesso ao dashboard, apenas opção de assinar

### Seção de Preços (Landing)
- Layout: tabela comparativa (features nas linhas, planos nas colunas)
- Sem destaque de plano "recomendado" — todos iguais
- Enterprise: botão "Fale Conosco" abre WhatsApp com mensagem pré-preenchida

### Claude's Discretion
- Design exato do badge de trial no sidebar
- Copy específico dos emails de notificação
- Animações e transições na tela de checkout/bloqueio
- Estrutura exata da tabela comparativa de preços

</decisions>

<specifics>
## Specific Ideas

- Período de carência de 7 dias mostra urgência com countdown decrescente
- Durante carência, usuário pode ver dados mas não agir — incentivo a renovar
- Enterprise via WhatsApp para contato direto e conversão pessoal

</specifics>

<deferred>
## Deferred Ideas

- Onboarding guiado para criar primeira instância — Phase 4 (Instances)
- Upgrade/downgrade de planos mid-cycle — avaliar após MVP
- Cupons de desconto — backlog

</deferred>

---

*Phase: 02-stripe-billing*
*Context gathered: 2026-01-28*
