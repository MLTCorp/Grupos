# Architecture Research

**Domain:** SaaS with Billing (Stripe) + AI Chat (Vercel AI SDK) + WhatsApp Integration
**Researched:** 2026-01-28
**Confidence:** MEDIUM (based on skill documentation + training knowledge, WebSearch/WebFetch unavailable)

## System Overview

```
                                    EXTERNAL SERVICES
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
    │   │    Stripe    │    │   UAZAPI     │    │     N8N      │             │
    │   │  (Payments)  │    │  (WhatsApp)  │    │  (Workflows) │             │
    │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
    │          │                   │                    │                     │
    └──────────┼───────────────────┼────────────────────┼─────────────────────┘
               │                   │                    │
               │ Webhooks          │ Webhooks           │
               ▼                   ▼                    ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                          API ROUTES LAYER                               │
    │                                                                          │
    │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
    │   │ /api/webhooks/ │  │ /api/uazapi/   │  │ /api/chat/     │           │
    │   │ stripe/        │  │ instances/     │  │ (AI SDK)       │           │
    │   └───────┬────────┘  └───────┬────────┘  └───────┬────────┘           │
    │           │                   │                    │                    │
    └───────────┼───────────────────┼────────────────────┼────────────────────┘
               │                   │                    │
               ▼                   ▼                    ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                        SERVER ACTIONS / SERVICES                        │
    │                                                                          │
    │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
    │   │ Subscription   │  │ Instance       │  │ Chat Context   │           │
    │   │ Service        │  │ Service        │  │ Service        │           │
    │   └───────┬────────┘  └───────┬────────┘  └───────┬────────┘           │
    │           │                   │                    │                    │
    │           └───────────────────┼────────────────────┘                    │
    │                               │                                         │
    └───────────────────────────────┼─────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           DATA LAYER                                    │
    │                                                                          │
    │                    ┌──────────────────────┐                             │
    │                    │      Supabase        │                             │
    │                    │  ┌────────────────┐  │                             │
    │                    │  │ users          │  │                             │
    │                    │  │ subscriptions  │  │                             │
    │                    │  │ instances      │  │                             │
    │                    │  │ groups         │  │                             │
    │                    │  │ categories     │  │                             │
    │                    │  │ messages       │  │                             │
    │                    │  │ chat_history   │  │                             │
    │                    │  └────────────────┘  │                             │
    │                    └──────────────────────┘                             │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Stripe Webhook Handler** | Receive + verify subscription events, sync status to DB | Next.js Route Handler at `/api/webhooks/stripe` |
| **Checkout API** | Create Stripe checkout sessions with trial config | Route Handler returning checkout URL |
| **Portal API** | Create Stripe billing portal sessions | Route Handler for subscription management |
| **Subscription Service** | Check user access, enforce trial limits, gate features | Server-side utility in `lib/subscription.ts` |
| **UAZAPI Routes** | Proxy UAZAPI calls, configure webhooks | Existing pattern in project |
| **AI Chat Route** | Stream AI responses with user context | Vercel AI SDK `streamText` in Route Handler |
| **Chat Context Service** | Provide user data (instances, groups, categories) to AI | Tools/functions the AI can call |
| **Auth Middleware** | Protect routes, get current user | Supabase Auth + middleware |

## Recommended Project Structure

```
app/
├── (auth)/                    # Auth routes (no sidebar)
│   ├── login/
│   │   └── page.tsx           # Login form (shadcn login-01)
│   └── signup/
│       └── page.tsx           # Signup with Stripe checkout
├── (dashboard)/               # Protected dashboard routes
│   ├── layout.tsx             # Sidebar + subscription check
│   ├── page.tsx               # Dashboard overview
│   ├── instances/
│   │   └── page.tsx           # WhatsApp instances
│   ├── groups/
│   │   └── page.tsx           # Group management
│   ├── categories/
│   │   └── page.tsx           # Category management
│   ├── messages/
│   │   └── page.tsx           # Message sending + history
│   └── chat/
│       └── page.tsx           # AI agent interface
├── (marketing)/               # Public routes (landing page)
│   ├── layout.tsx             # Marketing layout
│   └── page.tsx               # Landing page
├── api/
│   ├── webhooks/
│   │   └── stripe/
│   │       └── route.ts       # Stripe webhook handler
│   ├── checkout/
│   │   └── route.ts           # Create checkout session
│   ├── billing/
│   │   └── portal/
│   │       └── route.ts       # Billing portal session
│   ├── chat/
│   │   └── route.ts           # AI chat endpoint (streaming)
│   └── uazapi/                # UAZAPI integration routes
│       └── instances/
│           └── [token]/
│               └── webhook/
│                   └── route.ts
└── globals.css
lib/
├── stripe.ts                  # Stripe SDK initialization
├── supabase/
│   ├── client.ts              # Browser client
│   ├── server.ts              # Server client
│   └── middleware.ts          # Auth middleware helper
├── subscription.ts            # Subscription checking utilities
└── ai/
    ├── tools.ts               # AI tool definitions (list groups, etc.)
    └── context.ts             # Build AI context from user data
```

### Structure Rationale

- **Route groups `(auth)`, `(dashboard)`, `(marketing)`:** Separate layouts for different app sections without affecting URLs
- **`api/webhooks/stripe`:** Isolated webhook handler, raw body access for signature verification
- **`lib/subscription.ts`:** Centralized subscription logic avoids duplicate checks across components
- **`lib/ai/`:** AI-related utilities separated for maintainability

## Architectural Patterns

### Pattern 1: Stripe Webhook Handler (Critical)

**What:** Dedicated route handler for Stripe webhooks with signature verification
**When to use:** Always for subscription events
**Trade-offs:** Raw body parsing required (no JSON middleware)

**Example:**
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.text(); // Raw body required
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Extract userId from metadata, create subscription record
      await handleCheckoutComplete(supabase, session);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionStatus(supabase, subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(supabase, subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(supabase, invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### Pattern 2: Trial with Card Upfront

**What:** 7-day trial that requires card during signup, auto-converts to paid
**When to use:** For this project (per PROJECT.md requirements)
**Trade-offs:** Lower signup conversion, but higher trial-to-paid conversion

**Example:**
```typescript
// app/api/checkout/route.ts
export async function POST(request: NextRequest) {
  const { userId, email } = await getAuthUser();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID!, // R$147/month
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?setup=complete`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: email,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}
```

### Pattern 3: AI Chat with Streaming + Context

**What:** Vercel AI SDK route with user-specific context and tools
**When to use:** AI agent that needs access to user data
**Trade-offs:** More complex setup, but enables contextual AI

**Example:**
```typescript
// app/api/chat/route.ts
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { messages, userId } = await request.json();
  const supabase = await createClient();

  // Build context from user data
  const { data: instances } = await supabase
    .from("instancias_whatsapp")
    .select("*")
    .eq("user_id", userId);

  const { data: groups } = await supabase
    .from("grupos")
    .select("*, categorias(*)")
    .eq("user_id", userId);

  const systemPrompt = `You are an assistant for managing WhatsApp groups.
User has ${instances?.length || 0} instances and ${groups?.length || 0} groups.
Available categories: ${getCategories(groups)}.
You can help with: listing groups, sending messages, managing categories.`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    tools: {
      listGroups: tool({
        description: "List user's WhatsApp groups, optionally filtered by category",
        parameters: z.object({
          categoryId: z.string().optional(),
        }),
        execute: async ({ categoryId }) => {
          // Return filtered groups
          return groups?.filter(g => !categoryId || g.categoria_id === categoryId);
        },
      }),
      sendMessage: tool({
        description: "Send a message to a WhatsApp group",
        parameters: z.object({
          groupId: z.string(),
          text: z.string(),
        }),
        execute: async ({ groupId, text }) => {
          // Queue message for sending via UAZAPI
          return { status: "queued", groupId, text };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

### Pattern 4: Subscription Guard (Server Component)

**What:** Check subscription status before rendering protected content
**When to use:** Dashboard layout, feature-gated pages
**Trade-offs:** Server-side only, requires Supabase server client

**Example:**
```typescript
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/subscription";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await checkSubscription(supabase, user.id);

  if (!subscription.active && !subscription.trialing) {
    redirect("/pricing?reason=subscription_required");
  }

  return (
    <SidebarProvider>
      <AppSidebar subscription={subscription} />
      <main>{children}</main>
    </SidebarProvider>
  );
}
```

## Data Flow

### Checkout + Trial Flow

```
User clicks "Start Trial"
    ↓
POST /api/checkout
    ↓
Stripe Checkout Session created (trial_period_days: 7)
    ↓
Redirect to Stripe Checkout
    ↓
User enters card, completes checkout
    ↓
Stripe sends webhook: checkout.session.completed
    ↓
POST /api/webhooks/stripe
    ↓
Handler extracts userId from metadata
    ↓
Supabase: Insert subscription record (status: "trialing")
    ↓
User redirected to /dashboard
```

### Subscription Status Sync Flow

```
Stripe subscription changes (trial ends, payment fails, cancelled)
    ↓
Stripe sends webhook: customer.subscription.updated
    ↓
POST /api/webhooks/stripe
    ↓
Handler looks up user by stripe_customer_id
    ↓
Supabase: Update subscription status
    ↓
Next request: Dashboard layout checks subscription
    ↓
Access granted/denied based on status
```

### AI Chat Flow

```
User sends message in chat UI
    ↓
POST /api/chat with messages array
    ↓
Server fetches user context (instances, groups, categories)
    ↓
Builds system prompt with context
    ↓
Vercel AI SDK streamText() called
    ↓
If tool call needed (listGroups, sendMessage):
    ↓ Execute tool, return result to model
Streaming response back to client
    ↓
Client renders streaming text via useChat hook
```

### Webhook Integration Overview

```
STRIPE WEBHOOKS:                    UAZAPI WEBHOOKS:
───────────────                     ────────────────
checkout.session.completed ─────▶ /api/webhooks/stripe
customer.subscription.updated ──▶     │
customer.subscription.deleted ──▶     │
invoice.payment_failed ─────────▶     │
                                      ▼
                               Update Supabase
                               (subscriptions table)

                        messages ─────────────▶ N8N (external)
WhatsApp events ───▶    connection ───────────▶ https://workflows.sincronia.digital/webhook/
                        groups ───────────────▶ sincron-tracker/
                                                    │
                                                    ▼
                                              Process triggers
                                              (handled by N8N)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is fine. Single Supabase project, single Stripe account. |
| 1k-100k users | Add rate limiting to AI chat endpoint. Consider Supabase Pro for connection pooling. Cache subscription status (5 min TTL). |
| 100k+ users | Move AI chat to edge runtime if latency matters. Consider dedicated webhook processing queue (BullMQ/Vercel KV). Shard by user region. |

### Scaling Priorities

1. **First bottleneck:** AI chat endpoint costs. Implement token limits per user, usage tracking.
2. **Second bottleneck:** Supabase connections during webhook spikes. Use connection pooling or edge functions.

## Anti-Patterns

### Anti-Pattern 1: Parsing Webhook Body Before Verification

**What people do:** Use `request.json()` before verifying Stripe signature
**Why it's wrong:** Stripe requires raw body for HMAC verification; parsing changes the bytes
**Do this instead:** Always use `request.text()` first, verify, then parse

```typescript
// WRONG
const body = await request.json(); // Signature will NEVER match
stripe.webhooks.constructEvent(JSON.stringify(body), sig, secret);

// CORRECT
const body = await request.text();
const event = stripe.webhooks.constructEvent(body, sig, secret);
```

### Anti-Pattern 2: Checking Subscription on Every Request

**What people do:** Query database for subscription status on every API call
**Why it's wrong:** Adds latency, unnecessary database load
**Do this instead:** Check in layout/middleware, pass status via context or cache for 5 minutes

### Anti-Pattern 3: AI Context Without Limits

**What people do:** Load all user data into AI context
**Why it's wrong:** Token limits, cost explosion, irrelevant context hurts quality
**Do this instead:** Load summary counts, let AI request specific data via tools

```typescript
// WRONG - loads all groups into context
const systemPrompt = `Groups: ${JSON.stringify(allGroups)}`;

// CORRECT - summary + tools
const systemPrompt = `User has ${groups.length} groups. Use listGroups tool for details.`;
```

### Anti-Pattern 4: Storing Stripe Secrets in Database

**What people do:** Store webhook secrets or API keys in database for "flexibility"
**Why it's wrong:** Security risk, unnecessary complexity
**Do this instead:** Use environment variables. One Stripe account = one set of keys.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Stripe** | SDK + Webhooks | Use `stripe` npm package server-side only. Webhooks at `/api/webhooks/stripe`. |
| **Supabase** | SDK + Row Level Security | Use server client for API routes, browser client for real-time only. |
| **UAZAPI** | REST API + Webhooks to N8N | Existing pattern. Webhooks go to N8N, not directly to app. |
| **Vercel AI SDK** | Route Handler with streaming | Use `ai` package. OpenAI model via `@ai-sdk/openai`. |
| **N8N** | External webhook receiver | Fixed URL: `https://workflows.sincronia.digital/webhook/sincron-tracker/` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Auth ↔ Dashboard | Redirect + Session | Supabase handles session, middleware redirects unauthenticated |
| Dashboard ↔ Subscription | Server Components + Context | Check in layout, pass via React context if needed client-side |
| Chat ↔ Data | AI Tools | AI requests data through defined tools, not raw queries |
| App ↔ N8N | Outbound webhooks only | App configures UAZAPI to send to N8N. App doesn't receive from N8N. |

## Build Order (Dependencies)

Based on component dependencies, recommended build order:

```
Phase 1: Foundation
─────────────────
├── Supabase schema (subscriptions table additions)
├── Stripe SDK initialization (lib/stripe.ts)
├── Subscription checking utility (lib/subscription.ts)
└── Environment variables setup

Phase 2: Stripe Integration
───────────────────────────
├── Stripe webhook handler (depends on: Phase 1)
├── Checkout session API (depends on: Phase 1)
├── Billing portal API (depends on: Phase 1)
└── Signup flow with Stripe (depends on: all above)

Phase 3: Subscription Gating
────────────────────────────
├── Dashboard layout subscription check (depends on: Phase 2)
├── Trial status UI components (depends on: Phase 2)
└── Feature gating logic (depends on: Phase 2)

Phase 4: AI Chat
────────────────
├── Vercel AI SDK route handler (depends on: Phase 1 for auth)
├── AI tools (listGroups, sendMessage) (depends on: existing data)
├── Chat UI component (depends on: route handler)
└── Context building (depends on: AI tools working)
```

**Critical dependencies:**
- Webhook handler MUST be deployed before Stripe checkout tested
- Subscription table MUST have stripe_customer_id column before webhook processing
- AI chat can be built independently of Stripe, only needs auth

## Database Schema Additions

For Stripe integration, add to existing schema:

```sql
-- Add to users table (or create subscriptions table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
-- Values: 'none', 'trialing', 'active', 'past_due', 'cancelled'

-- For AI chat history (optional)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Sources

- `.claude/skills/stripe/SKILL.md` - Stripe integration patterns (HIGH confidence)
- `.claude/skills/uazapi-whatsapp-skill/SKILL.md` - UAZAPI integration (HIGH confidence)
- `.claude/skills/uazapi-whatsapp-skill/PATTERNS.md` - Webhook patterns (HIGH confidence)
- `.planning/PROJECT.md` - Project requirements (HIGH confidence)
- `.planning/codebase/ARCHITECTURE.md` - Current architecture (HIGH confidence)
- Vercel AI SDK patterns - Based on training knowledge (MEDIUM confidence - could not verify with official docs)
- Next.js App Router patterns - Based on training knowledge (MEDIUM confidence)

---
*Architecture research for: SaaS Billing + AI Chat Integration*
*Researched: 2026-01-28*
