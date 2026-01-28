# Project Research Summary

**Project:** Sincron Grupos v1 (Billing + AI Agent Additions)
**Domain:** SaaS WhatsApp Group Management with Subscription Billing + AI Assistant
**Researched:** 2026-01-28
**Confidence:** MEDIUM-HIGH

## Executive Summary

Sincron Grupos is a SaaS product for WhatsApp group management that needs three major additions: (1) Stripe-based subscription billing with 7-day trial and card upfront at R$ 147/month, (2) an AI chat agent that knows user context and can execute actions, and (3) polished authentication UI. The existing stack (Next.js 16, Supabase, UAZAPI, N8N) is solid and should be preserved—the additions integrate naturally without requiring architectural changes.

The recommended approach is to build in three sequential phases: Foundation (billing infrastructure and database schema), then Stripe Integration (checkout, webhooks, subscription gating), then AI Agent (chat interface with contextual awareness and action execution). This order ensures monetization capability is in place before investing in advanced features, and prevents the most critical pitfalls (trial transition errors, webhook security issues, user data isolation).

The key risk is that both billing webhooks and AI context handling are security-critical and easy to get wrong. Stripe webhooks require raw body parsing for signature verification (a Next.js App Router gotcha), and AI context must be strictly user-scoped to prevent data leaks. The roadmap must address these risks in Phase 1 and Phase 3 respectively, with explicit verification steps before deployment.

## Key Findings

### Recommended Stack

The existing stack is strong. Additions required are minimal and well-integrated: Stripe SDK for billing (`stripe@17.x` + `@stripe/stripe-js@5.x`), Vercel AI SDK for chat (`ai@4.x` + `@ai-sdk/openai@1.x`), and shadcn/ui auth blocks (login-01, signup-01) for polished auth UX.

**Core technologies:**
- **Stripe SDK (`stripe@17.x`)**: Server-side billing, webhooks, customer portal — official SDK with API version 2025-01-27.acacia support
- **Vercel AI SDK (`ai@4.x`)**: Unified streaming chat API with tool calling — enables contextual AI with minimal boilerplate
- **@ai-sdk/openai (`@1.x`)**: GPT-4o integration for AI agent — best-in-class LLM for chat use case
- **shadcn/ui blocks (login-01, signup-01)**: Production-ready auth UI — already using shadcn, these blocks match existing design system

**Critical implementation notes:**
- Stripe webhooks require raw body parsing (`request.text()` before verification) to avoid signature failures
- AI SDK `useChat` hook handles streaming automatically, minimal client code needed
- Database schema needs 6 Stripe-related columns added to users table
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`

### Expected Features

Research categorizes features into table stakes (users expect these), differentiators (competitive advantage), and anti-features (commonly requested but problematic).

**Must have (table stakes):**
- Credit card collection at signup with 7-day trial (Stripe Checkout with `trial_period_days: 7`)
- Trial countdown visible in dashboard (show days remaining)
- Clear pricing before signup (landing page + checkout confirmation)
- Auto-conversion to paid after trial (Stripe handles automatically)
- Payment failure notification (`invoice.payment_failed` webhook + email)
- Cancel subscription option (Stripe Customer Portal)
- View current plan/billing status (dashboard billing page)
- AI chat interface in sidebar with message history persistence
- AI context awareness (knows user's instances, groups, categories)
- Loading/typing indicators (Vercel AI SDK streaming)

**Should have (competitive):**
- AI action execution ("send message to group X") — tool calling with confirmation
- Contextual AI awareness (AI knows user data, feels "magical")
- Proactive AI suggestions (analyze patterns, suggest actions)
- Natural language queries ("how many groups in Vendas category?")
- Usage-based upsell prompts (show value before asking for more)

**Defer (v2+):**
- Multiple pricing tiers (learn first with single R$ 147 tier)
- Team/collaborator access (B2B complexity, different market)
- Automated triggers/workflows UI (N8N handles this, large effort)
- Advanced AI memory (cross-session learning has privacy/cost implications)
- OAuth login (email works, OAuth adds complexity)
- API for external integrations (validate core product first)

**Anti-features (do NOT build):**
- Free tier without card (massive support burden, low conversion)
- AI agent without guardrails (dangerous actions, cost explosion)
- Unlimited trial extensions (kills conversion pressure)
- AI memory across all time (token cost explosion, privacy concerns)

### Architecture Approach

The architecture is layered: API routes handle external webhooks and chat streaming, server actions/services contain business logic, Supabase provides data layer. No major structural changes needed—new features fit into existing patterns.

**Major components:**
1. **Stripe Webhook Handler** (`/api/webhooks/stripe`) — receives subscription events, verifies signatures, syncs status to Supabase
2. **Checkout API** (`/api/checkout`) — creates Stripe checkout sessions with trial configuration
3. **Subscription Service** (`lib/subscription.ts`) — checks user access, enforces trial limits, gates features
4. **AI Chat Route** (`/api/chat`) — streams AI responses with user context using Vercel AI SDK `streamText()`
5. **Chat Context Service** (`lib/ai/context.ts`) — provides user data (instances, groups, categories) to AI via tools
6. **Auth Middleware** (dashboard layout) — protects routes, gets current user, checks subscription status

**Key architectural patterns:**
- **Trial with card upfront**: Stripe Checkout mode `subscription` with `trial_period_days: 7`, auto-converts to paid
- **Webhook signature verification**: CRITICAL—must use `request.text()` before parsing, verify HMAC signature
- **AI streaming with context**: Build system prompt with user summary (not full data), use tools for detailed queries
- **Subscription guard**: Server component in dashboard layout checks status, redirects if expired
- **Idempotent webhooks**: Store processed event IDs to prevent duplicate processing

**File structure additions:**
```
app/
├── api/
│   ├── webhooks/stripe/route.ts    # Stripe webhook handler
│   ├── checkout/route.ts           # Create checkout session
│   ├── billing/portal/route.ts     # Billing portal session
│   └── chat/route.ts               # AI chat endpoint (streaming)
lib/
├── stripe.ts                        # Stripe SDK initialization
├── subscription.ts                  # Subscription checking utilities
└── ai/
    ├── tools.ts                     # AI tool definitions
    └── context.ts                   # Build AI context from user data
```

### Critical Pitfalls

Top 5 pitfalls from research, ranked by severity and phase impact:

1. **Trial-to-paid transition charging wrong user** — Trial ends and system charges wrong amount, charges before trial ends, or fails to charge at all. PREVENT: Use Stripe as source of truth, handle `customer.subscription.updated` webhook, test with Stripe test clocks. PHASE: Phase 1 (Billing Infrastructure).

2. **Webhook signature verification bypass** — Stripe webhooks fail verification, developer disables it, attackers forge subscription events. PREVENT: Always get raw body first (`request.text()`), never skip verification in production, use Stripe CLI locally for testing. PHASE: Phase 1 (Billing Infrastructure).

3. **AI context leaking between users** — AI agent responds with User A's data when User B asks question. PREVENT: Fetch context AFTER verifying authenticated user, add `user_id` filter to ALL database queries, never cache AI context at server level. PHASE: Phase 3 (AI Agent).

4. **Breaking existing UAZAPI/N8N integration** — New features break working WhatsApp integration, messages stop being received. PREVENT: Document existing webhook URL and never change it, webhook endpoints must be public (no auth middleware), test end-to-end after every deploy. PHASE: All phases (regression testing).

5. **Webhook event replay / duplicate processing** — Same Stripe event processed multiple times, causing duplicate subscriptions. PREVENT: Store processed event IDs, check before processing, return 200 quickly, use database transactions. PHASE: Phase 1 (Billing Infrastructure).

**Additional critical concerns:**
- **AI token cost explosion**: Limit system prompt context to essential data only, truncate conversation history, use gpt-4o-mini, set `maxTokens` limit, implement rate limits
- **Subscription state desync**: Always sync from Stripe, never trust local database alone, periodic reconciliation job
- **User isolation failure**: Audit all queries for `WHERE user_id = ?` clause, especially in AI context building

## Implications for Roadmap

Based on research, recommended 3-phase structure with clear dependencies:

### Phase 1: Billing Foundation
**Rationale:** Monetization infrastructure must be rock-solid before any other features. Billing bugs damage trust and require refunds. This phase establishes database schema, Stripe SDK, and subscription checking that later phases depend on.

**Delivers:** Database schema with Stripe fields, Stripe SDK initialization, subscription status checking utility, environment variable setup.

**Addresses:** Foundation for all billing features from FEATURES.md (trial management, payment handling, subscription gating).

**Avoids:** Sets up correct patterns to avoid trial transition errors, webhook security issues, and subscription desync (Pitfalls 1, 2, 5).

**Dependencies:** None (foundational phase).

**Research flag:** Standard patterns, no additional research needed. Stripe skill file provides complete patterns.

---

### Phase 2: Stripe Integration
**Rationale:** With foundation in place, implement complete billing flow: checkout, webhooks, subscription gating. This phase makes the product monetizable. Must be complete before AI features to ensure we can charge for them.

**Delivers:** Stripe Checkout with trial, webhook handlers for all subscription events, billing portal integration, subscription-gated dashboard access, trial status UI.

**Uses:** `stripe@17.x`, `@stripe/stripe-js@5.x` from STACK.md.

**Implements:** Stripe Webhook Handler, Checkout API, Subscription Guard components from ARCHITECTURE.md.

**Addresses:** All table stakes billing features from FEATURES.md—card collection, trial countdown, auto-conversion, payment failure handling, cancel option, billing status.

**Avoids:** Webhook signature verification pitfall (raw body parsing), webhook replay pitfall (idempotency checks), trial transition errors (Stripe test clocks).

**Dependencies:** Requires Phase 1 (database schema, SDK setup).

**Research flag:** Standard patterns, no additional research needed. Comprehensive Stripe skill documentation available.

---

### Phase 3: AI Chat Agent
**Rationale:** With monetization in place, build the key differentiator. AI agent requires careful security (user isolation) and cost controls (token limits, rate limiting). Building after billing ensures we can afford AI costs and have subscription data to include in AI context.

**Delivers:** AI chat interface in sidebar, streaming responses with Vercel AI SDK, user context injection (instances, groups, categories), tool calling for actions (list groups, send message), message history persistence, rate limiting.

**Uses:** `ai@4.x`, `@ai-sdk/openai@1.x`, `@ai-sdk/react@1.x` from STACK.md.

**Implements:** AI Chat Route, Chat Context Service components from ARCHITECTURE.md.

**Addresses:** AI differentiators from FEATURES.md—contextual awareness, action execution, natural language queries.

**Avoids:** AI context leaking between users (user_id filtering), token cost explosion (context limits, rate limiting), security issues (action confirmation).

**Dependencies:** Requires Phase 1 (auth, database), Phase 2 (subscription context for AI).

**Research flag:** NEEDS RESEARCH—complex integration with tool calling, context building, and cost optimization. Recommend `/gsd:research-phase` for AI tool patterns and token optimization strategies.

---

### Phase 4: Authentication UX Polish
**Rationale:** Can be built in parallel with or after other phases. Auth UX is important but not blocking for core functionality. shadcn/ui blocks provide production-ready components with minimal effort.

**Delivers:** Polished login/signup forms using shadcn login-01 and signup-01 blocks, integrated with Supabase Auth and Stripe Checkout flow.

**Uses:** shadcn/ui blocks from STACK.md.

**Addresses:** Table stakes auth expectations from FEATURES.md—email/password signup, clear next steps, progress indicators.

**Avoids:** Custom auth UI technical debt (use proven components).

**Dependencies:** Requires Phase 1 (Supabase Auth), Phase 2 (Stripe Checkout integration in signup flow).

**Research flag:** Standard patterns, no research needed. Component blocks are well-documented.

---

### Phase Ordering Rationale

**Why this order:**
1. **Foundation first**: Database schema and SDK setup are required by all other phases. Billing bugs are expensive to fix later.
2. **Billing before AI**: Ensures product can charge for AI costs. Subscription status becomes part of AI context ("You have X groups, your subscription renews on Y").
3. **AI after monetization**: Expensive feature (OpenAI costs) justified by paying customers. Prevents spending on users who won't convert.
4. **Auth UX last**: Least critical path, can iterate after launch. Supabase Auth already works, this just polishes it.

**Why this grouping:**
- Phase 1 + 2 form billing infrastructure—tightly coupled, but separated for testing (test schema before webhooks)
- Phase 3 isolated as separate concern (AI)—large surface area, different skill set, can be developed by different team member
- Phase 4 can run parallel or after—independent, cosmetic improvements

**How this avoids pitfalls:**
- Critical security pitfalls (webhook verification, user isolation) addressed in phases where they're introduced (Phase 2, Phase 3)
- UAZAPI regression testing included in every phase acceptance criteria
- Idempotency and error handling built from Phase 2, not retrofitted
- Token cost controls part of Phase 3 requirements, not afterthought

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (AI Agent)**: Complex integration—tool calling patterns, context optimization strategies, token cost estimation, rate limiting implementation. Recommend `/gsd:research-phase` for Vercel AI SDK tool calling best practices and OpenAI token optimization.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Billing Foundation)**: Standard Stripe integration—skill file provides complete patterns with code examples
- **Phase 2 (Stripe Integration)**: Well-documented webhook patterns—skill file covers all subscription events and edge cases
- **Phase 4 (Auth UX)**: Pre-built components—shadcn/ui blocks are production-ready, just need integration

**Additional research during execution:**
- Testing strategies for Stripe webhooks (Stripe CLI, test clocks)
- AI tool calling testing approaches (mocked vs. real database queries)
- Rate limiting implementation options (Vercel KV, Upstash Redis, simple in-memory)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with project skill files for Stripe, existing stack confirmed in package.json and codebase analysis. Vercel AI SDK versions MEDIUM (training data, not verified live). |
| Features | HIGH | Based on established SaaS billing patterns and AI chat expectations. Table stakes features validated against Stripe skill patterns. Anti-features identified from common mistakes documented in skill files. |
| Architecture | MEDIUM-HIGH | Patterns verified in Stripe and UAZAPI skill files. Next.js App Router patterns based on training knowledge. Component boundaries logical but not validated with team. |
| Pitfalls | HIGH | Critical pitfalls sourced from Stripe skill file (webhook security, trial handling) and UAZAPI skill (integration preservation). Security risks well-documented. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

Gaps discovered during research that need attention during planning/execution:

- **Vercel AI SDK current versions**: Training data shows `ai@4.x` but unable to verify latest versions. MITIGATION: Run `npm info ai` during Phase 3 planning to confirm current stable version.

- **AI token cost estimation**: No concrete data on expected token usage per conversation for this use case. MITIGATION: Instrument Phase 3 development environment to measure actual token consumption, establish cost per user projections before production.

- **Rate limiting strategy**: Multiple options (Vercel KV, Upstash Redis, in-memory), no clear recommendation for this scale. MITIGATION: Research during Phase 3 planning based on expected user volume and budget.

- **Subscription reconciliation frequency**: How often to sync Stripe state with database not specified. MITIGATION: Start with on-demand (webhook-driven) in Phase 2, add periodic reconciliation (daily cron) if desync issues emerge.

- **UAZAPI breaking changes**: No visibility into UAZAPI API stability or webhook contract changes. MITIGATION: Document current UAZAPI integration contract, add integration tests to detect breakage, monitor UAZAPI changelog if available.

- **AI guardrails implementation**: Clear need for confirmation on destructive actions, but no pattern for confirmation flow in streaming chat. MITIGATION: Research confirmation patterns during Phase 3 planning (modal before execution, explicit tool call approval).

- **Trial extension edge cases**: Manual trial extension mentioned as sales tool but no pattern provided. MITIGATION: Document Stripe API for trial extension (`subscription.trial_end` update) during Phase 2, build admin UI in Phase 2.1 or 3.1.

## Sources

### Primary (HIGH confidence)
- `.claude/skills/stripe/SKILL.md` — Stripe integration patterns, webhook security, subscription lifecycle management, API version 2025-01-27.acacia patterns
- `.claude/skills/uazapi-whatsapp-skill/SKILL.md` — UAZAPI integration, instance connection flows
- `.claude/skills/uazapi-whatsapp-skill/PATTERNS.md` — Webhook patterns, N8N integration, security considerations
- `.claude/skills/ui-components-skill/skill.md` — shadcn/ui component patterns, theme integration
- `.planning/codebase/STACK.md` — Current project stack verification (Next.js 16, React 19, Supabase, existing dependencies)
- `.planning/codebase/ARCHITECTURE.md` — Current architecture patterns, route groups, server components
- `.planning/codebase/CONCERNS.md` — Existing issues that compound with new features (no tests, large components, missing error boundaries)
- `.planning/PROJECT.md` — Project requirements and constraints
- `package.json` — Verified installed dependencies (zod 4.3.6, sonner 2.0.7, next-themes 0.4.6)

### Secondary (MEDIUM confidence)
- Training data on Vercel AI SDK v4.x — Core patterns stable but versions unverified
- Training data on Next.js App Router — Patterns for Route Handlers, Server Components, middleware
- Training data on SaaS billing best practices — Trial strategies, conversion patterns, subscription management
- Training data on AI chat UX patterns — Streaming responses, message history, tool calling UI

### Tertiary (LOW confidence)
- Competitor feature analysis — Based on domain knowledge, unable to verify with web search (marked as MEDIUM confidence in FEATURES.md with caveat)
- Token cost projections — No concrete usage data for this specific use case

**Note:** Web search and web fetch were unavailable during research. Findings about current market trends, latest package versions (Vercel AI SDK), and competitor analysis are based on training knowledge rather than real-time verification. Critical packages (Stripe SDK version 17.x) verified through project skill files which are authoritative.

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
