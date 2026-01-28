---
phase: "02"
plan: "03"
subsystem: "billing"
tags: ["stripe", "checkout", "subscription", "trial", "server-action"]

dependency_graph:
  requires: ["02-01"]
  provides: ["checkout-flow", "stripe-checkout-session", "plan-selection"]
  affects: ["02-04", "02-05"]

tech_stack:
  added: []
  patterns:
    - "Server Actions for form handling"
    - "Environment variable price IDs for Stripe"
    - "Client component with server action integration"

key_files:
  created:
    - "lib/actions/stripe.ts"
    - "app/(auth)/checkout/page.tsx"
  modified:
    - "app/(auth)/signup/page.tsx"
    - "proxy.ts"

decisions:
  - id: "02-03-01"
    description: "Price IDs from env vars, not database"
    rationale: "Simplicity and reliability for checkout; database prices for display/reporting"
  - id: "02-03-02"
    description: "Server Action pattern for checkout"
    rationale: "Next.js recommended pattern for form submissions with redirects"

metrics:
  duration: "4 min"
  completed: "2026-01-28"
---

# Phase 02 Plan 03: Checkout Flow with Plan Selection Summary

**One-liner:** Signup-to-checkout flow with Inicial/Profissional plan selection and Stripe Checkout redirect with 7-day trial.

## What Was Built

### Server Action for Stripe Checkout (lib/actions/stripe.ts)
- `createCheckoutSession(priceId)` server action
- Creates Stripe Checkout session with subscription mode
- 7-day trial period automatically applied
- Payment method collected upfront (per CONTEXT.md requirement)
- Checks for existing customer in database to avoid duplicates
- Handles success/cancel URL redirects
- Portuguese locale (pt-BR) configured
- Promotion codes enabled

### Checkout Page (app/(auth)/checkout/page.tsx)
- Plan selection UI with two cards (Inicial, Profissional)
- Inicial: R$ 147/mes - 1 instance, 10 groups
- Profissional: R$ 347/mes - 3 instances, 30 groups
- 7-day trial badge prominently displayed
- Canceled checkout detection via query parameter
- Loading states during checkout process
- Client component with server action integration

### Signup Flow Update
- Redirect changed from /login to /checkout
- Toast message updated: "Conta criada! Escolha seu plano para continuar."

### Proxy Configuration
- /checkout added to public routes
- Authenticated users can access checkout (needed after signup)

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| eb5c3f3 | feat(02-03): create stripe checkout session server action | lib/actions/stripe.ts |
| f2a2494 | feat(02-03): create checkout page with plan selection | app/(auth)/checkout/page.tsx |
| 1bb193d | feat(02-03): update signup redirect and proxy for checkout flow | app/(auth)/signup/page.tsx, proxy.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `npm run build` succeeds
- [x] Signup flow redirects to /checkout after account creation
- [x] Checkout page shows two plans with correct prices
- [x] Plan selection triggers Stripe Checkout with 7-day trial
- [x] Success URL points to dashboard, cancel URL returns to checkout
- [x] Portuguese copy throughout

## Configuration Required

Before testing the checkout flow, user must:

1. **Create Products/Prices in Stripe Dashboard:**
   - Product: "Sincron Grupos - Inicial" with price R$ 147/month
   - Product: "Sincron Grupos - Profissional" with price R$ 347/month

2. **Add Price IDs to .env.local:**
   ```
   NEXT_PUBLIC_STRIPE_PRICE_INICIAL=price_xxxxxxxx
   NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL=price_xxxxxxxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Key Implementation Notes

### Price ID Strategy
Price IDs are stored in environment variables rather than fetched from database:
- `NEXT_PUBLIC_STRIPE_PRICE_INICIAL` for Inicial plan
- `NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL` for Profissional plan

This approach chosen for:
- Reliability: No database query needed at checkout time
- Simplicity: Direct mapping, no sync issues
- Security: Price IDs are not sensitive (they're public Stripe identifiers)

### Checkout Session Configuration
```typescript
{
  mode: 'subscription',
  payment_method_collection: 'always',  // Card upfront
  subscription_data: {
    trial_period_days: 7,
    metadata: { user_id: user.id }
  },
  locale: 'pt-BR',
  allow_promotion_codes: true,
}
```

## Next Phase Readiness

**For 02-04 (Webhook Handler):**
- Checkout session includes `user_id` in metadata
- Success URL includes `?checkout=success` query param
- Webhook will need to handle `checkout.session.completed` event

**For 02-05 (Trial UI):**
- Checkout creates subscription with 7-day trial
- Dashboard will need to show trial status badge

---

*Completed: 2026-01-28*
*Duration: 4 minutes*
