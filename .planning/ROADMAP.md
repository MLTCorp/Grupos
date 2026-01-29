# Roadmap: Sincron Grupos

## Overview

Sincron Grupos transforms from a UI showcase into a production SaaS for WhatsApp group management with billing and AI. The journey builds authentication and landing page foundation first, adds Stripe billing for monetization, establishes dashboard navigation shell, integrates WhatsApp instances via UAZAPI, enables group organization with categories, delivers message sending capabilities, and culminates with an AI agent that understands user context and executes actions. Each phase delivers complete, verifiable functionality.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Auth Foundation** - Supabase authentication with polished login/signup UI and landing page basics
- [x] **Phase 2: Stripe Billing** - Trial-based subscription with checkout, webhooks, and subscription gating
- [x] **Phase 3: Dashboard Shell** - Responsive sidebar navigation and global UI patterns
- [ ] **Phase 4: Instances + MCP Foundation** - WhatsApp instance management via UAZAPI with core MCP tools
- [ ] **Phase 5: Categories & Groups** - Group organization system with import, categorization, and filtering
- [ ] **Phase 6: Messages** - Message sending to groups with scheduling and history
- [ ] **Phase 7: Agent IA** - AI chat assistant with user context and action execution

## Phase Details

### Phase 1: Auth Foundation
**Goal**: Users can create accounts, log in, and access protected dashboard routes
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, LAND-01, LAND-04
**Success Criteria** (what must be TRUE):
  1. User can create account with email and password and sees confirmation
  2. User can log in with existing credentials and is redirected to dashboard
  3. User can log out from any dashboard page and is redirected to home
  4. Accessing /dashboard without login redirects to /login
  5. Landing page displays Hero, Features, HowItWorks, FAQ, CTA, Footer sections on mobile and desktop
**Plans**: 3 plans in 2 waves

Plans:
- [x] 01-01-PLAN.md — Supabase setup + landing page migration (Wave 1)
- [x] 01-02-PLAN.md — Auth pages: login and signup (Wave 2)
- [x] 01-03-PLAN.md — Route protection + auth callback (Wave 2)

### Phase 2: Stripe Billing
**Goal**: Users pay for service via trial-based subscription with automatic conversion
**Depends on**: Phase 1 (requires authenticated users)
**Requirements**: BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, BILL-07, BILL-08, BILL-09, BILL-10, LAND-02, LAND-03, LAND-05, MCP-11
**Success Criteria** (what must be TRUE):
  1. New user completes signup with credit card and sees 7-day trial start
  2. User sees trial countdown in dashboard showing days remaining
  3. User can access Stripe Customer Portal to update card or cancel subscription
  4. User with expired trial and no active subscription cannot access dashboard features
  5. Landing page pricing section shows R$ 147/month per instance with clear CTA to signup
**Plans**: 5 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md — Stripe SDK + database schema (Wave 1)
- [x] 02-02-PLAN.md — Landing page pricing with 3 plans (Wave 1)
- [x] 02-03-PLAN.md — Checkout flow after signup (Wave 2)
- [x] 02-04-PLAN.md — Webhook handler for subscription sync (Wave 2)
- [x] 02-05-PLAN.md — Subscription gating, trial badge, billing page, block screen (Wave 3)

### Phase 3: Dashboard Shell
**Goal**: Users navigate application via consistent sidebar and receive visual feedback for actions
**Depends on**: Phase 2 (requires subscription gating in place)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. User sees sidebar with navigation items: Instances, Categories, Groups, Messages, Agent
  2. Sidebar collapses to icons on mobile and expands on desktop
  3. User can toggle dark/light theme and preference persists across sessions
  4. Actions trigger toast notifications for success and error states
  5. New user without instances sees onboarding guidance prompting first instance setup
**Plans**: 3 plans in 3 waves

Plans:
- [x] 03-01-PLAN.md — Theme system + toast notifications (Wave 1)
- [x] 03-02-PLAN.md — Sidebar navigation + mobile bottom nav (Wave 2)
- [x] 03-03-PLAN.md — Onboarding tour for new users (Wave 3)

### Phase 4: Instances + MCP Foundation
**Goal**: Users connect WhatsApp instances via UAZAPI and system establishes MCP tool infrastructure
**Depends on**: Phase 3 (requires dashboard shell)
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05, INST-06, INST-07, INST-08, INST-09, MCP-01, MCP-07, MCP-12, MCP-13
**Success Criteria** (what must be TRUE):
  1. User can add new instance with name and UAZAPI token, sees validation feedback
  2. User can scan QR code to connect instance and sees status change to "connected"
  3. User can view connection history for each instance
  4. MCP discovery endpoint at /api/mcp lists available tools with authentication required
  5. System automatically configures N8N webhook after successful first connection
**Plans**: 4 plans in 3 waves

Plans:
- [ ] 04-01-PLAN.md — UAZAPI service layer + API routes (Wave 1)
- [ ] 04-02-PLAN.md — Instance components + internal CRUD API (Wave 2)
- [ ] 04-03-PLAN.md — Instances page + polling + verification (Wave 3)
- [ ] 04-04-PLAN.md — MCP discovery endpoint with API key auth (Wave 1)

### Phase 5: Categories & Groups
**Goal**: Users organize WhatsApp groups into categories for targeted messaging
**Depends on**: Phase 4 (requires connected instances)
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, GRP-01, GRP-02, GRP-03, GRP-04, GRP-05, GRP-06, GRP-07, GRP-08, MCP-02, MCP-03, MCP-04
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and delete categories with name and color
  2. User can import groups from connected WhatsApp instance and assign categories during import
  3. User can view groups list showing name, category, and participant count
  4. User can filter groups by category and search groups by name
  5. User can move groups between categories individually or in bulk
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Messages
**Goal**: Users send messages to groups immediately or scheduled for future delivery
**Depends on**: Phase 5 (requires groups and categories)
**Requirements**: MSG-01, MSG-02, MSG-03, MSG-04, MSG-05, MSG-06, MSG-07, MSG-08, MSG-09, MCP-05, MCP-06
**Success Criteria** (what must be TRUE):
  1. User can compose and send text message to a single group with preview before sending
  2. User can send message to multiple groups by selecting individually or by category
  3. User can schedule message for future date/time and cancel pending scheduled messages
  4. User can view history of sent messages with delivery status
  5. User can save and reuse message templates
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

### Phase 7: Agent IA
**Goal**: Users interact with AI assistant that understands their data and executes actions
**Depends on**: Phase 6 (requires all features for AI context)
**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, AGNT-07, AGNT-08, AGNT-09, AGNT-10, MCP-08, MCP-09, MCP-10, MCP-14
**Success Criteria** (what must be TRUE):
  1. User can access AI chat via sidebar and sees conversation history preserved
  2. User can ask questions about their data and receives accurate responses (e.g., "quantos grupos tenho?")
  3. User can request actions and agent executes with confirmation (e.g., "envie mensagem para grupo X")
  4. Agent shows typing indicators during response generation with streaming text
  5. Agent displays structured results when executing tools (tables, lists, confirmations)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth Foundation | 3/3 | Complete | 2026-01-28 |
| 2. Stripe Billing | 5/5 | Complete | 2026-01-28 |
| 3. Dashboard Shell | 3/3 | Complete | 2026-01-29 |
| 4. Instances + MCP Foundation | 0/4 | Planned | - |
| 5. Categories & Groups | 0/3 | Not started | - |
| 6. Messages | 0/3 | Not started | - |
| 7. Agent IA | 0/3 | Not started | - |

---
*Roadmap created: 2026-01-28*
*Last updated: 2026-01-29 (Phase 4 planned)*
