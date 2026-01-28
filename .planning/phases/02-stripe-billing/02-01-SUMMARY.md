---
phase: 02-stripe-billing
plan: 01
subsystem: payments
tags: [stripe, supabase, database, billing, subscriptions]

# Dependency graph
requires:
  - phase: 01-auth-foundation
    provides: Supabase client patterns, auth.users table
provides:
  - Stripe SDK server initialization (lib/stripe.ts)
  - Stripe.js client loader (lib/stripe-client.ts)
  - Supabase service client for webhooks (lib/supabase/service.ts)
  - Billing database schema (customers, products, prices, subscriptions)
affects: [02-02, 02-03, 02-04, 02-05]

# Tech tracking
tech-stack:
  added: [stripe@19.x, @stripe/stripe-js@8.x]
  patterns: [service-client-for-admin-ops, stripe-sdk-singleton]

key-files:
  created:
    - lib/stripe.ts
    - lib/stripe-client.ts
    - lib/supabase/service.ts
    - supabase/migrations/20260128000001_billing_schema.sql

key-decisions:
  - "Updated Stripe API version to 2026-01-28.clover (current SDK version)"
  - "Service client uses createClient directly (not SSR) for webhook handlers"

patterns-established:
  - "Stripe server SDK: import { stripe } from '@/lib/stripe'"
  - "Stripe client loader: import { getStripe } from '@/lib/stripe-client'"
  - "Admin operations: import { createServiceClient } from '@/lib/supabase/service'"

# Metrics
duration: 4min
completed: 2026-01-28
---

# Phase 02 Plan 01: Stripe SDK & Billing Schema Summary

**Stripe SDK initialization with server/client loaders and database schema for customers, products, prices, and subscriptions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-28T22:25:56Z
- **Completed:** 2026-01-28T22:29:53Z
- **Tasks:** 3
- **Files modified:** 6 (including package.json and package-lock.json)

## Accomplishments
- Stripe SDK initialized for server-side operations
- Client-side Stripe.js loader for checkout redirects
- Service client for webhook handlers (bypasses RLS)
- Complete billing database schema with RLS policies

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Stripe SDK initialization files** - `99c1c36` (feat)
2. **Task 2: Create Supabase service client for admin operations** - `65a48cd` (feat)
3. **Task 3: Create database migration for billing schema** - `7e52d63` (feat)

## Files Created/Modified
- `lib/stripe.ts` - Server-side Stripe SDK singleton
- `lib/stripe-client.ts` - Client-side loadStripe wrapper
- `lib/supabase/service.ts` - Admin Supabase client for webhooks
- `supabase/migrations/20260128000001_billing_schema.sql` - Billing tables
- `package.json` - Added stripe and @stripe/stripe-js dependencies
- `package-lock.json` - Lock file updated

## Decisions Made
- **API Version Update:** Plan specified `2025-01-27.acacia` but SDK required `2026-01-28.clover` - updated to current version
- **Service Client Pattern:** Used direct `createClient` from `@supabase/supabase-js` instead of SSR client since webhooks don't have cookie context

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated Stripe API version**
- **Found during:** Task 1 (Stripe SDK initialization)
- **Issue:** Plan specified API version `2025-01-27.acacia` but TypeScript required `2026-01-28.clover`
- **Fix:** Updated apiVersion in lib/stripe.ts to `2026-01-28.clover`
- **Files modified:** lib/stripe.ts
- **Verification:** Build succeeded after change
- **Committed in:** 99c1c36 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Minor version update required by SDK. No scope creep.

## Issues Encountered
None - tasks executed smoothly after API version fix.

## User Setup Required

**External services require manual configuration.** The plan frontmatter specifies:

**Stripe Dashboard:**
1. Get API keys from Developers -> API keys
   - `STRIPE_SECRET_KEY` (Secret key)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)

2. Create Products with Prices:
   - "Sincron Grupos - Inicial" - R$ 147/month (BRL), metadata: {plan: "inicial", instances: 1, groups: 10}
   - "Sincron Grupos - Profissional" - R$ 347/month (BRL), metadata: {plan: "profissional", instances: 3, groups: 30}

3. Configure Customer Portal (Settings -> Billing -> Customer Portal):
   - Enable: Update payment method, Cancel subscription, View invoice history

4. Create Webhook Endpoint (Developers -> Webhooks):
   - Get `STRIPE_WEBHOOK_SECRET` from signing secret

**Supabase Dashboard:**
- Run migration `20260128000001_billing_schema.sql` in SQL Editor
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is in environment variables

## Next Phase Readiness
- Stripe SDK ready for checkout session creation (02-02)
- Database schema ready for subscription sync via webhooks
- Service client ready for webhook handlers (02-04)

---
*Phase: 02-stripe-billing*
*Completed: 2026-01-28*
