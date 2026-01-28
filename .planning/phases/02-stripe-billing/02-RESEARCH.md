# Phase 2: Stripe Billing - Research

**Researched:** 2026-01-28
**Domain:** Payment processing, subscription management, trial-based billing
**Confidence:** HIGH

## Summary

This phase implements Stripe-based subscription billing with a 7-day trial period for a Next.js 16 application using Supabase. The research covers hosted Stripe Checkout for subscription signup, webhook handling for subscription lifecycle events, Customer Portal for self-service management, and database schema for subscription tracking.

The implementation uses Stripe Checkout (hosted pages) rather than custom payment forms, which aligns with the user decision to use "Stripe Checkout hosted." This approach is simpler, more secure, and handles PCI compliance automatically. Trial management uses `subscription_data.trial_period_days` with `payment_method_collection: 'always'` to collect card upfront (per user decision: card AFTER signup, BEFORE dashboard).

**Primary recommendation:** Use `stripe` Node.js SDK with Server Actions for checkout/portal creation, webhook route handler with raw body parsing, and Supabase tables for subscription state synchronized via webhooks.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^19.x | Server-side Stripe API | Official Node.js SDK with TypeScript support |
| @stripe/stripe-js | ^8.x | Client-side Stripe.js loader | Required for hosted checkout redirects |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/ssr | 0.8.0 | Already installed | Database operations for subscription data |
| sonner | 2.0.7 | Already installed | Toast notifications for billing actions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Checkout (hosted) | Stripe Elements (embedded) | More customization but more complexity and PCI burden |
| Webhook sync | Stripe Sync Engine | Auto-sync but more infrastructure overhead |
| Server Actions | API Routes | Server Actions are simpler for form-based flows in Next.js 15+ |

**Installation:**
```bash
npm install stripe @stripe/stripe-js
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── webhooks/
│       └── stripe/
│           └── route.ts      # Stripe webhook handler
├── (auth)/
│   ├── signup/
│   │   └── page.tsx          # Existing - redirect to checkout after signup
│   └── checkout/
│       └── page.tsx          # Intercept page before dashboard
├── dashboard/
│   ├── layout.tsx            # Add subscription check, trial badge
│   └── billing/
│       └── page.tsx          # Subscription status, portal link
├── blocked/
│   └── page.tsx              # Friendly block screen for expired subscriptions
lib/
├── stripe.ts                 # Stripe SDK initialization
├── stripe-client.ts          # Client-side Stripe.js loader
├── actions/
│   └── stripe.ts             # Server Actions for checkout/portal
└── subscription.ts           # Subscription status utilities
components/
├── trial-badge.tsx           # Countdown badge for sidebar
├── subscription-status.tsx   # Status display component
└── landing/
    └── pricing.tsx           # Update with 3 plans table
```

### Pattern 1: Server Action for Checkout Session
**What:** Create Stripe Checkout Session via Server Action, redirect to Stripe hosted page
**When to use:** After signup completes, before user accesses dashboard
**Example:**
```typescript
// Source: Context7 /stripe/stripe-node, verified with official docs
// lib/actions/stripe.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check if customer already exists
  const { data: customer } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_collection: 'always', // Collect card upfront
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id }
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
    customer: customer?.stripe_customer_id || undefined,
    customer_email: customer?.stripe_customer_id ? undefined : user.email,
    metadata: { user_id: user.id },
  })

  redirect(session.url!)
}
```

### Pattern 2: Webhook Handler with Raw Body
**What:** Process Stripe webhook events with signature verification
**When to use:** Receive subscription lifecycle events from Stripe
**Example:**
```typescript
// Source: Context7 /stripe/stripe-node, pedroalonso.net guide
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text() // MUST use text(), not json()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await syncSubscription(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    case 'customer.subscription.trial_will_end':
      await handleTrialEnding(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}
```

### Pattern 3: Subscription Status Check
**What:** Check subscription validity for access control
**When to use:** Middleware/layout for protected routes
**Example:**
```typescript
// Source: Derived from project patterns and Stripe docs
// lib/subscription.ts
import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'grace_period'
  | 'blocked'
  | 'none'

export async function getSubscriptionStatus(userId: string): Promise<{
  status: SubscriptionStatus
  daysRemaining: number | null
  subscription: any | null
}> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due', 'canceled'])
    .order('created', { ascending: false })
    .limit(1)
    .single()

  if (!sub) {
    return { status: 'none', daysRemaining: null, subscription: null }
  }

  const now = new Date()

  // Active subscription
  if (sub.status === 'active') {
    return { status: 'active', daysRemaining: null, subscription: sub }
  }

  // In trial
  if (sub.status === 'trialing' && sub.trial_end) {
    const trialEnd = new Date(sub.trial_end)
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      status: 'trialing',
      daysRemaining: Math.max(0, daysRemaining),
      subscription: sub
    }
  }

  // Grace period (7 days after trial/subscription end)
  if (sub.status === 'past_due' || sub.status === 'canceled') {
    const endDate = new Date(sub.current_period_end || sub.trial_end)
    const gracePeriodEnd = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (now < gracePeriodEnd) {
      const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { status: 'grace_period', daysRemaining, subscription: sub }
    }
  }

  return { status: 'blocked', daysRemaining: 0, subscription: sub }
}
```

### Anti-Patterns to Avoid
- **Parsing webhook body as JSON before verification:** Always use `req.text()` not `req.json()` for Stripe webhooks
- **Trusting client-side subscription status:** Always verify server-side via Supabase/Stripe
- **Storing credit card details:** Never store card data; let Stripe handle it via Customer Portal
- **Skipping idempotency:** Webhooks can retry; always check if event was already processed
- **Blocking on trial without card:** User decision requires card upfront, so no need for "missing_payment_method" handling

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment form | Custom card input | Stripe Checkout hosted | PCI compliance, 3DS, fraud protection |
| Subscription management UI | Custom billing page | Stripe Customer Portal | Invoice history, card update, cancellation |
| Retry failed payments | Custom retry logic | Stripe Smart Retries | ML-optimized retry timing |
| Trial notifications | Custom cron job | Stripe automatic emails + webhook | Dashboard setting for 7-day reminder |
| Proration calculation | Manual math | Stripe `proration_behavior` | Handles edge cases automatically |

**Key insight:** Stripe has spent years optimizing conversion, fraud detection, and compliance. Using their hosted solutions means better conversion rates and less liability.

## Common Pitfalls

### Pitfall 1: Webhook Body Parsing
**What goes wrong:** Signature verification fails with "Invalid signature" error
**Why it happens:** Next.js App Router auto-parses JSON, but Stripe needs raw body for signature
**How to avoid:** Use `await req.text()` instead of `await req.json()`
**Warning signs:** 400 errors on webhook endpoint, "Webhook signature verification failed" logs

### Pitfall 2: Missing Subscription Sync on Page Load
**What goes wrong:** User sees stale subscription status after changes in Customer Portal
**Why it happens:** Only checking database, not syncing from Stripe
**How to avoid:** Webhooks handle async updates; for immediate needs, fetch from Stripe API
**Warning signs:** User reports wrong status after canceling/updating via portal

### Pitfall 3: Trial-to-Paid Conversion Failure
**What goes wrong:** Card collected but first charge fails after trial
**Why it happens:** Card expired, insufficient funds, or 3DS required but not completed
**How to avoid:**
1. Listen for `invoice.payment_failed` webhook
2. Send email notification (BILL-07 requirement)
3. Use Stripe's automatic dunning emails
**Warning signs:** Subscriptions going to `past_due` status silently

### Pitfall 4: Vercel Deployment Protection Blocking Webhooks
**What goes wrong:** Stripe webhooks return 403 or redirect to auth
**Why it happens:** Vercel deployment protection requires authentication
**How to avoid:** Disable deployment protection for `/api/webhooks/*` path, or use `x-vercel-protection-bypass` header
**Warning signs:** Webhook events showing as failed in Stripe Dashboard

### Pitfall 5: Duplicate Webhook Processing
**What goes wrong:** Same event processed multiple times
**Why it happens:** Stripe retries failed webhooks; network issues cause re-delivery
**How to avoid:** Store `event.id` and check before processing, use database transactions
**Warning signs:** Duplicate emails, duplicate database entries

### Pitfall 6: Grace Period Logic Complexity
**What goes wrong:** Users blocked too early or allowed access after they should be blocked
**Why it happens:** Complex date math with trial end + 7-day grace period
**How to avoid:** Store explicit `access_until` timestamp in database, updated by webhooks
**Warning signs:** Customer complaints about access timing

## Code Examples

Verified patterns from official sources:

### Stripe SDK Initialization
```typescript
// Source: Context7 /stripe/stripe-node
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})
```

### Customer Portal Session
```typescript
// Source: Context7 /websites/stripe billing portal docs
// lib/actions/stripe.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function redirectToCustomerPortal() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: customer } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!customer?.stripe_customer_id) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  redirect(session.url)
}
```

### Subscription Sync Function
```typescript
// Source: Derived from Supabase quickstart schema + Stripe docs
// lib/subscription.ts
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export async function syncSubscription(subscription: Stripe.Subscription) {
  const supabase = createServiceClient()

  // Get user_id from subscription metadata
  const userId = subscription.metadata.user_id
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  await supabase.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })
}
```

### Trial Badge Component
```typescript
// Source: Derived from shadcn Badge + project patterns
// components/trial-badge.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface TrialBadgeProps {
  daysRemaining: number
  status: 'trialing' | 'grace_period'
}

export function TrialBadge({ daysRemaining, status }: TrialBadgeProps) {
  const isUrgent = daysRemaining <= 3
  const label = status === 'trialing'
    ? `Trial: ${daysRemaining}d`
    : `Renove em ${daysRemaining}d`

  return (
    <Badge
      variant={isUrgent ? 'destructive' : 'secondary'}
      className="gap-1 text-xs"
    >
      <Clock className="h-3 w-3" />
      {label}
    </Badge>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe API routes | Server Actions | Next.js 14+ (2024) | Simpler code, type safety |
| @stripe/stripe-react | @stripe/stripe-js + redirect | Current best practice | Hosted checkout preferred |
| Manual subscription tables | Stripe-synced via webhooks | Always recommended | Single source of truth |
| Custom billing UI | Customer Portal | 2020+ | Less maintenance, better UX |

**Deprecated/outdated:**
- `@stripe/react-stripe-js` Elements: Still valid but Checkout is preferred for subscriptions
- Manual card input forms: Avoid unless specific UX requirement
- Stripe.js v2 (legacy): Use v3+ (loadStripe pattern)

## Open Questions

Things that couldn't be fully resolved:

1. **Grace period implementation details**
   - What we know: 7-day grace period after trial/subscription ends per user decision
   - What's unclear: Whether to use Stripe's `past_due` status or calculate locally
   - Recommendation: Store `access_until` timestamp, update via webhook, simpler to reason about

2. **Email notification timing**
   - What we know: Stripe sends `customer.subscription.trial_will_end` 3 days before
   - What's unclear: User requested notification "3 days before AND last day"
   - Recommendation: Use Stripe's 3-day webhook + cron job for last-day notification, or configure Stripe's built-in email (7 days before) via Dashboard

3. **Plan upgrade/downgrade**
   - What we know: Deferred to post-MVP per CONTEXT.md
   - What's unclear: Whether to disable upgrade buttons or just not build them
   - Recommendation: Don't show upgrade options in v1, simpler than disabling

## Sources

### Primary (HIGH confidence)
- Context7 `/stripe/stripe-node` - Checkout sessions, webhooks, subscriptions API
- Context7 `/websites/stripe` - Billing portal, trial configuration, webhook events
- Stripe official docs (`docs.stripe.com`) - Trial periods, subscription webhooks

### Secondary (MEDIUM confidence)
- [Pedro Alonso Stripe + Next.js Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) - Server Action patterns
- [Supabase SQL Quickstart](https://supabase-sql.vercel.app/stripe-subscriptions) - Database schema
- [Vercel Next.js Subscription Payments](https://github.com/vercel/nextjs-subscription-payments) - Architecture reference

### Tertiary (LOW confidence)
- Community blog posts on trial countdown UI - General patterns only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Context7 verified, official Stripe SDK
- Architecture: HIGH - Follows Next.js 15+ App Router patterns, validated with multiple sources
- Pitfalls: HIGH - Well-documented in official docs and community guides
- Database schema: HIGH - Based on Supabase official quickstart

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - Stripe API stable, patterns well-established)

---

## Environment Variables Required

```bash
# Server-side (secret - never expose to client)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Client-side (publishable - safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# App URL (already exists in project)
NEXT_PUBLIC_APP_URL="https://your-app.com"
```

## Database Schema (Supabase)

```sql
-- Enum types
create type subscription_status as enum (
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');

-- Customers table (links auth.users to Stripe)
create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text unique
);
alter table customers enable row level security;

-- Products table (synced from Stripe)
create table products (
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access" on products for select using (true);

-- Prices table (synced from Stripe)
create table prices (
  id text primary key,
  product_id text references products,
  active boolean,
  description text,
  unit_amount bigint,
  currency text check (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
alter table prices enable row level security;
create policy "Allow public read-only access" on prices for select using (true);

-- Subscriptions table (synced from Stripe)
create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  status subscription_status,
  metadata jsonb,
  price_id text references prices,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  trial_end timestamp with time zone default timezone('utc'::text, now())
);
alter table subscriptions enable row level security;
create policy "Can only view own subs data" on subscriptions for select using (auth.uid() = user_id);
```

## Webhook Events to Configure

Configure these events in Stripe Dashboard (Developers > Webhooks):

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Link Stripe customer to user, provision access |
| `customer.subscription.created` | Initial subscription sync |
| `customer.subscription.updated` | Status changes, plan changes |
| `customer.subscription.deleted` | Revoke access on cancellation |
| `customer.subscription.trial_will_end` | Send trial ending notification (3 days before) |
| `invoice.paid` | Confirm successful payment, extend access |
| `invoice.payment_failed` | Notify user of payment issue (BILL-07) |

## Stripe Dashboard Configuration

1. **Products & Prices:**
   - Create product "Sincron Grupos - Inicial" with price R$ 147/month
   - Create product "Sincron Grupos - Profissional" with price R$ 347/month
   - Set `trial_period_days: 7` on each price (or use subscription_data in checkout)

2. **Customer Portal:**
   - Enable "Update payment method"
   - Enable "Cancel subscription"
   - Enable "View invoice history"
   - Set return URL to dashboard

3. **Email Settings:**
   - Enable "Free trial ending" reminder (7 days before) - optional since we handle via webhook
