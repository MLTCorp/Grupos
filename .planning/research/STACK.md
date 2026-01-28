# Stack Research: Sincron Grupos v1 Additions

**Domain:** SaaS billing, AI chatbot, modern auth UI for WhatsApp group management
**Researched:** 2026-01-28
**Confidence:** HIGH (verified with project skill files and package.json)

## Context

This research covers ADDITIONS to an existing stack. The following are already working and should NOT be changed:

- Next.js 16.1.6 + React 19.2.3 + TypeScript 5.x
- Supabase (Auth + Database)
- UAZAPI (WhatsApp API)
- N8N (webhook processing)
- Shadcn/UI 3.7.0 + Radix UI primitives
- Tailwind CSS 4.x

This document covers: **Stripe billing**, **Vercel AI SDK**, and **improved auth UX**.

---

## Recommended Stack

### Stripe Integration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `stripe` | ^17.x | Server-side Stripe SDK | Official Node.js SDK for subscriptions, webhooks, customer portal. API version 2025-01-27.acacia is current. |
| `@stripe/stripe-js` | ^5.x | Client-side Stripe.js loader | Required for secure PCI-compliant checkout. Loads Stripe.js asynchronously. |

**Confidence:** HIGH - Verified with project Stripe skill file (`.claude/skills/stripe/SKILL.md`)

**Implementation Pattern:**
```typescript
// lib/stripe.ts (server-side)
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// lib/stripe-client.ts (client-side)
import { loadStripe } from "@stripe/stripe-js";
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**Key Webhooks for R$ 147/month + 7-day trial:**
- `checkout.session.completed` - User completes checkout
- `customer.subscription.created` - Trial starts
- `customer.subscription.updated` - Trial ends, billing starts
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed, trigger retry logic

**Database Fields (add to Supabase users table):**
```sql
stripeCustomerId    TEXT UNIQUE
stripeSubscriptionId TEXT
stripePriceId       TEXT
stripeCurrentPeriodEnd TIMESTAMP
stripeTrialEnd      TIMESTAMP
```

---

### Vercel AI SDK (AI Chatbot)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `ai` | ^4.x | Vercel AI SDK core | Unified API for streaming, tool calling, multi-provider support. Official Vercel package. |
| `@ai-sdk/openai` | ^1.x | OpenAI provider | Best-in-class GPT-4 and GPT-4o integration. Alternative: Anthropic provider. |
| `@ai-sdk/react` | ^1.x | React hooks | `useChat`, `useCompletion` hooks for streaming UI. |

**Confidence:** MEDIUM - Based on training knowledge. Recommend verifying current versions with `npm info ai` before installation.

**Implementation Pattern:**
```typescript
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get user context from Supabase
  const context = await getUserContext(userId);

  const result = await streamText({
    model: openai("gpt-4o"),
    system: `You are a WhatsApp group management assistant.
User has ${context.instanceCount} instances, ${context.groupCount} groups.
Categories: ${context.categories.join(", ")}`,
    messages,
  });

  return result.toDataStreamResponse();
}

// components/chat.tsx
"use client";
import { useChat } from "@ai-sdk/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  // ... render chat UI
}
```

**Tool Calling for Actions:**
The Vercel AI SDK supports tool calling for agent actions (list groups, send messages, etc.):
```typescript
import { tool } from "ai";
import { z } from "zod";

const tools = {
  listGroups: tool({
    description: "List all WhatsApp groups for the user",
    parameters: z.object({
      categoryId: z.string().optional(),
    }),
    execute: async ({ categoryId }) => {
      // Query Supabase for groups
      return await getGroups(userId, categoryId);
    },
  }),
  sendMessage: tool({
    description: "Send a message to a WhatsApp group",
    parameters: z.object({
      groupId: z.string(),
      message: z.string(),
    }),
    execute: async ({ groupId, message }) => {
      // Call UAZAPI to send message
      return await sendUazapiMessage(groupId, message);
    },
  }),
};
```

---

### Authentication UI (shadcn/ui Blocks)

| Component | Source | Purpose | Why Recommended |
|-----------|--------|---------|-----------------|
| `login-01` | shadcn/ui blocks | Login form | Two-column layout, email/password, clean design. |
| `signup-01` | shadcn/ui blocks | Signup form | Matches login-01 style, includes password confirmation. |

**Confidence:** HIGH - shadcn/ui blocks are stable and well-documented.

**Installation:**
```bash
# These are blocks, not CLI-installable components
# Copy from https://ui.shadcn.com/blocks/authentication
# Or use shadcn@latest add with specific registry

npx shadcn@latest add input label card
```

**Customization for Stripe Checkout:**
The signup flow should include:
1. Email/password form (signup-01)
2. On submit: Create Supabase user
3. Redirect to Stripe Checkout (embedded or hosted)
4. Webhook creates subscription with trial

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | 4.3.6 (already installed) | Schema validation | Validate Stripe webhooks, chat inputs, API payloads |
| `sonner` | 2.0.7 (already installed) | Toast notifications | Payment success/error feedback, chat actions |
| `@supabase/supabase-js` | ^2.x | Supabase client | Auth, database queries (already used in project) |
| `next-themes` | 0.4.6 (already installed) | Theme management | Dark/light mode for dashboard |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Stripe CLI | Local webhook testing | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Supabase CLI | Local dev, migrations | `supabase db push` for schema changes |

---

## Installation

```bash
# Stripe (billing)
npm install stripe @stripe/stripe-js

# Vercel AI SDK (chatbot)
npm install ai @ai-sdk/openai @ai-sdk/react
```

**No dev dependencies needed** - Stripe CLI is installed globally.

---

## Environment Variables

```bash
# Stripe (add to .env.local)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# OpenAI for AI SDK
OPENAI_API_KEY="sk-..."

# App URL (for Stripe callbacks)
NEXT_PUBLIC_APP_URL="https://sincron-grupos.vercel.app"
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `stripe` | Paddle, LemonSqueezy | If MoR (Merchant of Record) is needed for international sales. Stripe requires own tax handling. |
| `ai` (Vercel) | LangChain.js | If complex chains/agents needed. Vercel AI SDK is simpler for chat UIs. |
| `@ai-sdk/openai` | `@ai-sdk/anthropic` | If Claude models preferred over GPT-4. Both work identically with Vercel AI SDK. |
| shadcn login-01 | NextAuth.js UI | If OAuth providers (Google, GitHub) needed. v1 uses email/password only. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `stripe-node` (old name) | Deprecated package name | Use `stripe` (official npm package) |
| `openai` SDK directly | No streaming helpers, more boilerplate | Use `@ai-sdk/openai` with Vercel AI SDK |
| `langchain` | Overkill for simple chat, heavy dependency | Use Vercel AI SDK for chat UIs |
| `react-stripe-js` (Elements) | Not needed for Checkout Sessions | Use `@stripe/stripe-js` + redirect to Stripe-hosted checkout |
| Custom auth UI from scratch | Wastes time, inconsistent | Use shadcn/ui blocks (login-01, signup-01) |

---

## Stack Patterns by Use Case

**If using Stripe Checkout (hosted page):**
- Server: Create checkout session with `stripe.checkout.sessions.create()`
- Client: Redirect with `window.location.href = session.url`
- No Elements needed, simplest integration

**If using Stripe Embedded Checkout:**
- Requires `@stripe/stripe-js` and embedded Checkout component
- More complex but keeps user on your domain
- Recommendation: Start with hosted, migrate to embedded in v2 if needed

**If using multiple AI providers:**
- Install both `@ai-sdk/openai` and `@ai-sdk/anthropic`
- Switch models with config: `const model = openai("gpt-4o")` or `anthropic("claude-3-opus")`
- Same `streamText()` API works for both

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `ai@4.x` | `@ai-sdk/openai@1.x` | Must use matching major versions |
| `stripe@17.x` | Next.js 16.x | Full App Router support, works in Route Handlers |
| `@stripe/stripe-js@5.x` | React 19.x | Compatible with React 19 |
| `zod@4.x` | `ai@4.x` | Vercel AI SDK uses Zod for tool parameters |

---

## Database Schema Additions

For Supabase, add these fields to the users table:

```sql
-- Stripe billing fields
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN stripe_price_id TEXT;
ALTER TABLE users ADD COLUMN stripe_current_period_end TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN stripe_trial_end TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'none';

-- Index for faster lookups
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

**Subscription status values:**
- `none` - No subscription
- `trialing` - In 7-day trial
- `active` - Paying customer
- `past_due` - Payment failed, retrying
- `canceled` - Subscription ended

---

## File Structure Recommendation

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts          # Vercel AI SDK chat endpoint
│   ├── checkout/
│   │   └── route.ts          # Stripe checkout session creation
│   ├── billing/
│   │   └── portal/
│   │       └── route.ts      # Stripe customer portal
│   └── webhooks/
│       └── stripe/
│           └── route.ts      # Stripe webhook handler
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Uses login-01 block
│   └── signup/
│       └── page.tsx          # Uses signup-01 block
└── (dashboard)/
    └── chat/
        └── page.tsx          # AI chatbot interface

lib/
├── stripe.ts                  # Server-side Stripe client
├── stripe-client.ts           # Client-side Stripe.js loader
├── ai/
│   ├── tools.ts               # AI SDK tool definitions
│   └── context.ts             # User context builder for AI
└── supabase/
    └── subscription.ts        # Subscription status helpers
```

---

## Sources

- `.claude/skills/stripe/SKILL.md` - Authoritative Stripe patterns with API version 2025-01-27.acacia (HIGH confidence)
- `.claude/skills/ui-components-skill/skill.md` - UI component integration patterns (HIGH confidence)
- `.planning/codebase/STACK.md` - Current project stack analysis (HIGH confidence)
- `package.json` - Verified installed dependencies (HIGH confidence)
- Training knowledge for Vercel AI SDK v4.x (MEDIUM confidence - verify versions before install)

---

## Confidence Summary

| Area | Confidence | Reason |
|------|------------|--------|
| Stripe packages | HIGH | Verified with project skill file, API version confirmed |
| Stripe patterns | HIGH | Skill file provides complete working examples |
| Vercel AI SDK packages | MEDIUM | Based on training knowledge, versions may have updated |
| AI SDK patterns | MEDIUM | Core patterns stable, verify hooks API |
| shadcn/ui blocks | HIGH | Stable, well-documented, already using shadcn/ui |
| Environment variables | HIGH | Standard patterns, verified with skill file |
| Database schema | HIGH | Standard Stripe integration pattern |

---

*Stack research for: Sincron Grupos v1 (Stripe + AI + Auth UX)*
*Researched: 2026-01-28*
