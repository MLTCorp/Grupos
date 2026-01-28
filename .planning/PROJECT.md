# Sincron Grupos

## O que é

Gerenciador de grupos WhatsApp com automações inteligentes. Usuários conectam suas próprias instâncias UAZAPI e controlam grupos através de um painel administrativo com agent IA contextual. Sistema SaaS com trial de 7 dias e cobrança recorrente via Stripe.

## Core Value

**Automação inteligente de grupos WhatsApp sem precisar compartilhar acesso à instância.** Usuário mantém controle total do seu WhatsApp enquanto o sistema executa gatilhos, envia mensagens agendadas e fornece insights via IA.

## Requirements

### Validated

(Migrando do projeto original - funcionalidades já comprovadas)

- ✓ Usuário pode conectar instância UAZAPI via QR Code — existente
- ✓ Sistema configura webhooks automaticamente após conexão — existente
- ✓ Usuário pode categorizar grupos para organização — existente
- ✓ Sistema processa eventos WhatsApp via N8N — existente
- ✓ Landing page com Hero, Features, Pricing, FAQ, CTA — existente

### Active

(v1 - MVP do novo projeto)

**Autenticação & Onboarding:**
- [ ] Usuário pode criar conta com email/senha (Supabase Auth)
- [ ] Usuário vê componentes shadcn login-01 e signup-01
- [ ] Usuário cadastra cartão Stripe durante signup
- [ ] Sistema inicia trial de 7 dias automaticamente
- [ ] Sistema cobra R$ 147/mês por instância após trial

**Landing Page & Checkout:**
- [ ] Landing page mostra plano único: R$ 147/mês por instância
- [ ] Botão "Começar" redireciona para signup com Stripe checkout
- [ ] Preservar componentes: Header, Hero, Features, HowItWorks, Pricing, FAQ, CTA, Footer

**Instâncias WhatsApp:**
- [ ] Usuário pode adicionar instância UAZAPI (nome + token)
- [ ] Sistema valida token com UAZAPI antes de salvar
- [ ] Usuário vê status de conexão (conectado/desconectado/conectando)
- [ ] Usuário pode conectar instância via QR Code
- [ ] Sistema polling detecta conexão e configura webhook N8N automaticamente
- [ ] Usuário pode desconectar instância
- [ ] Usuário vê histórico de conexões da instância

**Categorias:**
- [ ] Usuário pode criar categoria (nome + cor)
- [ ] Usuário pode editar categoria existente
- [ ] Usuário pode deletar categoria vazia
- [ ] Sistema mostra contador de grupos por categoria

**Grupos:**
- [ ] Usuário pode importar grupos da instância conectada
- [ ] Durante importação, usuário seleciona categoria para cada grupo
- [ ] Usuário vê lista de grupos com: nome, categoria, participantes
- [ ] Usuário pode filtrar grupos por categoria
- [ ] Usuário pode reatribuir grupo para outra categoria
- [ ] Usuário pode remover grupo (desvincula, não deleta no WhatsApp)

**Mensagens:**
- [ ] Usuário pode enviar mensagem de texto para um grupo
- [ ] Usuário pode enviar mensagem para múltiplos grupos (por categoria)
- [ ] Usuário pode agendar envio de mensagem (data/hora futura)
- [ ] Sistema executa mensagens agendadas no horário correto
- [ ] Usuário vê histórico de mensagens enviadas
- [ ] Usuário pode cancelar mensagem agendada pendente

**Agent IA:**
- [ ] Usuário acessa chat do agent via sidebar
- [ ] Agent tem contexto: instâncias, grupos, categorias do usuário
- [ ] Agent pode responder perguntas sobre grupos ("quantos grupos tenho?")
- [ ] Agent pode executar ações ("mostre meus grupos da categoria Vendas")
- [ ] Chat preserva histórico de conversas
- [ ] UI baseada em Vercel AI Chatbot template

**Dashboard:**
- [ ] Usuário vê sidebar com navegação (Instances, Categories, Groups, Messages, Agent)
- [ ] Layout responsivo (mobile + desktop)
- [ ] Tema dark/light mode persistido
- [ ] Feedback visual para ações (toasts/notificações)

### Out of Scope

(Explicitamente NÃO incluído no v1)

- Gatilhos/Triggers automáticos — v2 (N8N já processa, mas UI não expõe configuração)
- Transcrição de áudios — v2 (código existe, mas não refazemos UI)
- Gerenciamento de equipe/colaboradores — v2
- Múltiplos planos Stripe — v1 tem apenas um plano fixo
- OAuth login (Google, GitHub) — v1 usa apenas email/senha
- Exportação de relatórios — v2
- API pública para integrações — v2
- Dashboard analytics avançado — v2 (métricas de mensagens recebidas ficam pra depois)

## Context

### Projeto Original

Existe implementação funcional em produção em `C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos`:
- Next.js 16 + Supabase + UAZAPI
- Funcionalidades comprovadas: conexão instâncias, importação grupos, webhooks N8N
- UX/UI considerada "estranha" e com componentes "ruins"
- **Reaproveitar**: lógica de negócio, integração UAZAPI, configuração webhooks, landing page
- **Refazer**: toda UI/UX do dashboard, fluxo de onboarding, integração Stripe

### Arquitetura de Mensagens

```
WhatsApp → UAZAPI → Webhook N8N → Processa gatilhos → UAZAPI → WhatsApp
```

**Webhook URL**: `https://workflows.sincronia.digital/webhook/sincron-tracker/`
- Configurado automaticamente após primeira conexão
- Events: `messages`, `connection`, `groups`
- Exclude: `wasSentByApi` (previne loops)

### Vercel AI Chatbot

Template instalado neste repositório (projeto novo).
Configuração necessária:
- Integrar com contexto do usuário (queries Supabase)
- Expor ações: listar grupos, enviar mensagens, criar categorias
- UI: tela limpa tipo ChatGPT com histórico

### Skills Disponíveis

- **uazapi-whatsapp-skill**: Integração completa UAZAPI (já documentada)
- **ui-components-skill**: Shadcn/UI + Aceternity components
- **n8n-development-skill**: Criar workflows N8N
- **stripe**: Integração pagamentos (checkout, webhooks, customer portal)
- **posthog**: Analytics (futuro)
- **seo-technical**: SEO Next.js (futuro)

## Constraints

- **Stack**: Next.js 16 + React 19 + TypeScript (já instalado)
- **Database**: Supabase do projeto legado (mesmo env, mesmas tabelas)
- **WhatsApp API**: UAZAPI obrigatório (skill já configurada)
- **Webhooks**: N8N obrigatório (URL fixa em produção)
- **Pagamentos**: Stripe obrigatório (plano único R$ 147/mês)
- **UI**: Shadcn/UI obrigatório (já tem components instalados)
- **Trial**: 7 dias fixo (não configurável no v1)
- **Ambiente**: Variáveis de ambiente do projeto legado (`.env.local` migrado)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Preservar landing page original | Já está adiantada visualmente | — Pending |
| Supabase do projeto legado | Evita recriar schema, aproveita dados existentes | — Pending |
| N8N externo (não interno) | Mensagens recebidas já passam por lá, arquitetura validada | — Pending |
| Plano único Stripe (R$ 147) | Simplifica v1, múltiplos planos v2+ | — Pending |
| Vercel AI Chatbot template | Acelera implementação, padrão moderno | — Pending |
| Shadcn login-01/signup-01 | Componentes prontos, visual consistente | — Pending |
| Trial obrigatório com cartão | Reduz fricção, usuário já testa com instância real | — Pending |
| Gatilhos UI em v2 | MVP foca em envio manual, automação vem depois | — Pending |

---
*Last updated: 2026-01-28 after initialization*
