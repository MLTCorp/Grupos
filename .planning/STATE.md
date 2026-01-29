# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Automacao inteligente de grupos WhatsApp sem precisar compartilhar acesso a instancia
**Current focus:** Phase 4 - Instances & MCP Foundation (IN PROGRESS)

## Current Position

Phase: 4 of 7 (Instances & MCP Foundation)
Plan: 3 of 4 in current phase (04-01, 04-02, 04-04 complete)
Status: In progress
Last activity: 2026-01-29 - Completed 04-02-PLAN.md (Internal Instance CRUD API & UI)

Progress: [==============] 65%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 4.4 min
- Total execution time: 1.03 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-auth-foundation | 3 | 15 min | 5 min |
| 02-stripe-billing | 5 | 22 min | 4.4 min |
| 03-dashboard-shell | 3 | 12 min | 4 min |
| 04-instances-mcp-foundation | 3 | 12 min | 4 min |

**Recent Trend:**
- Last 5 plans: 03-02 (3 min), 03-03 (5 min), 04-04 (2 min), 04-01 (4 min), 04-02 (6 min)
- Trend: Consistently fast

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 7 phases derived from requirement categories (AUTH, BILL, DASH, INST, CAT+GRP, MSG, AGNT)
- [Roadmap]: Billing before features ensures monetization capability before AI costs
- [Roadmap]: MCP tools distributed across phases where features are built (not centralized)
- [01-01]: Used @supabase/ssr patterns (not deprecated @supabase/auth-helpers)
- [01-01]: Added MagicUI animations via CSS keyframes in globals.css
- [01-01]: Supabase client pattern: createClient() from lib/supabase/client or lib/supabase/server
- [01-02]: Default org name as 'Organizacao de {name}' when not provided
- [01-02]: Portuguese UI text for Brazilian Portuguese localization
- [01-02]: User metadata (name, org_name) stored in Supabase user on signup
- [01-03]: Middleware route protection for /dashboard/* with auth check
- [01-03]: Logout redirects to / (home) rather than /login
- [01-03]: Dashboard layout has server-side auth check as defense in depth
- [02-01]: Updated Stripe API version to 2026-01-28.clover (current SDK version)
- [02-01]: Service client uses createClient directly (not SSR) for webhook handlers
- [02-02]: Hardcoded prices in landing page (marketing content, separate from Stripe billing)
- [02-02]: Trial badge uses Badge component with green styling and Clock icon
- [02-02]: Enterprise uses WhatsApp link with pre-filled message
- [02-03]: Price IDs from env vars, not database (simplicity and reliability for checkout)
- [02-03]: Server Action pattern for checkout form handling with redirect
- [02-04]: Get current_period from subscription.items.data[0] (Stripe API 2026-01-28.clover structure)
- [02-04]: Grace period allows view but not send (canSendMessages: false)
- [02-04]: BILL-07 email notifications deferred to Phase 6 (logged for monitoring)
- [02-05]: Dashboard graceful degradation - billing errors default to allowing access
- [02-05]: Webhook routes bypass auth in proxy (use Stripe signature verification)
- [02-05]: Trial badge in header (visible on all dashboard pages)
- [03-01]: Theme default dark, class attribute for Tailwind compatibility
- [03-01]: Toast position top-right, durations 3s success / 7s error
- [03-01]: Mounted state pattern for ThemeToggle to prevent hydration mismatch
- [03-02]: Navigation items centralized in lib/navigation.ts for sidebar and bottom nav
- [03-02]: Disabled nav items visible for full app structure visibility from day one
- [03-02]: User avatar initials derived from user name as fallback
- [03-03]: driver.js for onboarding tour (Portuguese localized)
- [03-03]: Tour triggers based on instancias_whatsapp count via usuarios_sistema
- [03-03]: Billing sync added to syncSubscription - updates organizacoes table
- [03-03]: Tour skips on mobile (bottom nav is self-explanatory)
- [04-04]: MCP_API_KEY environment variable for shared secret authentication
- [04-04]: MCPTool interface following modelcontextprotocol.io spec
- [04-04]: _meta field in MCP response for version tracking
- [04-01]: Ported UAZAPI implementation from original project with proven logic
- [04-01]: API routes use https.Agent with rejectUnauthorized: false for dev SSL issues
- [04-01]: Webhook excludeMessages includes wasSentByApi to prevent infinite loops
- [04-01]: UAZAPIService singleton pattern with getUAZAPIService() for client-side calls
- [04-02]: Soft delete instances (set ativo=false) instead of hard delete
- [04-02]: QR code auto-refresh every 2 minutes with countdown timer
- [04-02]: Status polling every 3 seconds while waiting for connection
- [04-02]: History table with RLS for organization-scoped access

### Pending Todos

None yet.

### Blockers/Concerns

- User needs to configure Supabase environment variables before auth can be tested
- User needs to configure Stripe environment variables (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- User needs to run billing schema migration in Supabase SQL Editor
- WhatsApp number placeholder (5511999999999) needs to be configured for Enterprise contact
- User needs to configure NEXT_PUBLIC_STRIPE_PRICE_INICIAL and NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL with Stripe Price IDs
- User needs to configure MCP_API_KEY environment variable for MCP endpoint authentication
- User needs to configure UAZAPI_BASE_URL, UAZAPI_API_KEY, WEBHOOK_N8N_URL for WhatsApp integration
- User needs to run historico_conexoes migration in Supabase SQL Editor

## Session Continuity

Last session: 2026-01-29T20:38:00Z
Stopped at: Completed 04-02-PLAN.md (Internal Instance CRUD API & UI)
Resume file: None

---
*State initialized: 2026-01-28*
*Last updated: 2026-01-29*
