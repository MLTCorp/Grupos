# Phase 1: Auth Foundation - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Autenticação de usuários via Supabase com páginas de login/signup e landing page completa. Usuários podem criar conta, logar, deslogar e acessar rotas protegidas. Landing page apresenta o produto com seções Hero, Features, HowItWorks, Pricing, FAQ, CTA e Footer.

</domain>

<decisions>
## Implementation Decisions

### Landing Page - Copiar do Sistema Original
- Copiar INTEGRALMENTE de `C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos`
- Componentes em `components/landing/`: header, hero, features, how-it-works, pricing, faq, cta, footer
- Preservar MagicUI components (AnimatedGradientText, shine effects)
- Preservar Framer Motion animations
- Preservar componentes customizados (Glow, Mockup, AnimatedGroup)

### Estilo Visual
- Tema claro como padrão
- Elementos shine do MagicUI
- Gradientes sutis do sistema original
- Grid pattern background no hero

### Hero Section
- Headline + preview visual (mockup do dashboard)
- Badge animado "Novo: Integração com IA"
- CTAs: "Começar Grátis" + "Ver Recursos"
- Stats: grupos gerenciados, empresas ativas, uptime

### Features Section
- Grid 4 colunas
- 8 features com ícones coloridos
- Animações on scroll via Framer Motion

### How It Works
- 4-5 passos detalhados do fluxo do usuário
- Cadastre → Conecte WhatsApp → Importe grupos → Categorize → Envie

### Signup Flow
- Campos: Nome, Nome da Empresa (opcional), Email, Senha
- Usa Supabase Auth com email confirmation
- Após signup: toast "Verifique seu email" + redirect para /login
- Card layout centralizado

### Login Flow
- Campos: Email, Senha
- Após login: redirect para /dashboard
- Link para signup se não tem conta

### Route Protection
- Middleware Supabase para proteger /dashboard/*
- Redirect para /login se não autenticado
- Sessão persiste via cookies Supabase

### Claude's Discretion
- Componentes específicos de UI (shadcn signup-01/login-01 ou manter Card do original)
- Ajustes menores de responsividade
- Loading states durante auth

</decisions>

<specifics>
## Specific Ideas

- Copiar landing page IDÊNTICA do sistema original - já funciona e tem o visual correto
- MagicUI shine elements são importantes para a estética
- "Verifique seu email para confirmar" - manter fluxo de confirmação por email
- Preservar stats do hero (10k+, 500+, 99.9%) - são placeholders mas estabelecem credibilidade

</specifics>

<deferred>
## Deferred Ideas

- Pricing funcional com checkout Stripe → Phase 2
- Trial countdown no dashboard → Phase 2
- Customer Portal Stripe → Phase 2
- OAuth login (Google, GitHub) → Out of scope v1

</deferred>

---

*Phase: 01-auth-foundation*
*Context gathered: 2026-01-28*
