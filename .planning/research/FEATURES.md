# Feature Research

**Domain:** SaaS with Trials + Billing + AI Chat Agent (WhatsApp Group Management)
**Researched:** 2026-01-28
**Confidence:** MEDIUM (based on established patterns; WebSearch unavailable for current trends)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Billing & Subscription

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Credit card collection at signup | Standard for credit-card-required trials | MEDIUM | Stripe Checkout handles this; use `mode: "subscription"` with trial_period_days |
| Trial countdown/status visible | Users need to know when trial ends | LOW | Show days remaining in dashboard header or settings |
| Clear pricing before signup | Users won't enter card without knowing cost | LOW | Landing page already has pricing; ensure checkout confirms R$ 147/month |
| Auto-conversion to paid | Expected behavior after trial | LOW | Stripe handles automatically when trial_end is set |
| Payment failure notification | Users expect to know if payment failed | LOW | Webhook `invoice.payment_failed` + email notification |
| Cancel subscription option | Legal requirement in most countries | LOW | Stripe Customer Portal handles cancellation |
| View current plan/billing status | Users need to see subscription state | LOW | Dashboard billing page showing status, next billing date |
| Invoice/receipt access | Common expectation for business expense tracking | LOW | Stripe Customer Portal provides this automatically |
| Update payment method | Cards expire, users switch banks | LOW | Stripe Customer Portal handles this |

#### Onboarding

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email + password signup | Basic auth expectation | MEDIUM | Supabase Auth handles this; shadcn login-01/signup-01 |
| Email verification | Security expectation | LOW | Supabase Auth built-in; defer until after first value per UX skill |
| Clear next step after signup | Users shouldn't be lost | LOW | Redirect to onboarding checklist or first action |
| Progress indicator during onboarding | Reduces anxiety, shows end is near | LOW | 3-5 step checklist per UX skill |
| Skip/defer onboarding option | Some users know what they want | LOW | "I'll do this later" link |

#### AI Chat Agent

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Chat interface in sidebar/panel | Standard pattern for AI assistants | MEDIUM | Vercel AI Chatbot template; conversation-based UI |
| Message history persistence | Users expect context to survive page refresh | MEDIUM | Store in Supabase; user-scoped conversations |
| Clear typing/loading indicator | Users need feedback that AI is working | LOW | Vercel AI SDK provides streaming; show dots/spinner |
| Copy message content | Standard chat feature | LOW | Copy button on each message |
| Clear/new conversation option | Users want fresh starts | LOW | Button to start new chat |

#### Dashboard Core

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Responsive sidebar navigation | Standard SaaS pattern | LOW | Already in place with shadcn sidebar |
| Loading states | Users need feedback during data fetch | LOW | Skeleton screens per UX skill |
| Error states with recovery | Graceful degradation | LOW | Toast notifications + retry options |
| Dark/light mode | Common accessibility expectation | LOW | Already configured with shadcn themes |
| Mobile-responsive layout | Users access from phones | MEDIUM | Current layout supports this |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

#### AI Agent Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Contextual awareness (knows user's groups/instances) | AI that "knows your data" feels magical | HIGH | Requires injecting user context into prompts; query Supabase for user's data |
| Action execution (not just answers) | AI that does things, not just talks | HIGH | Tool calling with Vercel AI SDK; expose actions like "send message to group" |
| Proactive suggestions | AI anticipates needs | MEDIUM | Analyze patterns; suggest actions based on group activity |
| Natural language queries | "How many groups do I have in Vendas?" | MEDIUM | RAG or prompt engineering with user data context |
| Multi-step task completion | "Send welcome message to all new groups" | HIGH | Requires agent loop with confirmation steps |

#### Billing Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Trial extension (manual) | Sales tool for converting hesitant users | LOW | Admin function to extend trial via Stripe API |
| Usage-based upsell prompts | Show value before asking for more money | MEDIUM | Track usage, show "You've sent 500 messages this month" |
| Annual discount option | Higher LTV, lower churn | LOW | Create annual price in Stripe; offer 2 months free |
| Referral credits | Growth hack | MEDIUM | Credit system; extend trial or discount for referrals |

#### Onboarding Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Interactive first-instance setup | Guided experience reduces friction | MEDIUM | Step-by-step wizard: add token, scan QR, see groups |
| Sample data/demo mode | See product value before setup | HIGH | Requires mock data layer; significant complexity |
| Video walkthrough (optional) | Some users prefer watching | LOW | Embed Loom/YouTube; don't make it mandatory |
| Contextual tooltips on first use | Help without blocking | LOW | Per UX skill; show once, remember dismissal |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Free tier (no card required) | Reduce signup friction | Massive support burden, low conversion, bot abuse | 7-day trial with card required is better conversion |
| Multiple subscription tiers at launch | "Flexibility" | Complexity overhead, decision paralysis, harder to change later | Single tier R$ 147/month; add tiers in v2 after learning |
| AI agent without guardrails | "Let AI do anything" | Dangerous actions (mass message, delete groups), cost explosion | Explicit tool list, confirmation for destructive actions, rate limits |
| Real-time billing updates | "Always accurate balance" | Webhook reliability issues, race conditions | Near-real-time is fine; sync on login + webhook events |
| Offline mode for AI chat | "Works anywhere" | AI requires internet; creates confusing partial state | Clear "offline" indicator; queue messages for retry |
| OAuth-only login (no email) | "Modern" | Not all users have Google/GitHub; creates lock-in | Offer OAuth as addition to email/password, not replacement |
| Prorate everything automatically | "Fair billing" | Accounting complexity, refund edge cases | Stripe handles basic proration; don't add custom logic |
| Unlimited trial extensions | Customer success "flexibility" | Kills conversion pressure, creates entitlement | Max 2 extensions, then must convert or lose access |
| AI memory across all time | "True personalization" | Token cost explosion, privacy concerns, context confusion | Session-based memory + key facts extraction |
| White-label/custom branding | "Enterprise feature" | Massive complexity for v1; distraction | Defer to v2+; use consistent brand in v1 |

## Feature Dependencies

```
[Authentication]
    |
    +--requires--> [Supabase Auth Setup]
    |
    +--enables--> [Billing (Stripe)]
    |                 |
    |                 +--requires--> [Stripe Checkout Integration]
    |                 |
    |                 +--enables--> [Trial Management]
    |                                   |
    |                                   +--enables--> [Subscription Conversion]
    |
    +--enables--> [Dashboard Access]
                      |
                      +--enables--> [Instance Management]
                      |                 |
                      |                 +--requires--> [UAZAPI Integration]
                      |                 |
                      |                 +--enables--> [Group Import]
                      |                                   |
                      |                                   +--enables--> [AI Context (knows user's groups)]
                      |
                      +--enables--> [AI Chat Agent]
                                        |
                                        +--requires--> [User Data Context]
                                        |
                                        +--requires--> [Vercel AI SDK]
                                        |
                                        +--enhances--> [Group Management] (via action execution)
```

### Dependency Notes

- **Authentication requires Supabase Auth Setup:** Auth is foundation for all user-scoped features
- **Billing requires Authentication:** Must know who to charge; Stripe customer linked to user
- **AI Context requires Instance + Group data:** Agent can only "know" what's been imported
- **AI Action Execution enhances Group Management:** Agent becomes useful when it can do things, not just answer
- **Trial Management requires Billing:** Trial is a subscription state in Stripe

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept.

**Authentication & Billing:**
- [x] Email/password signup with Supabase Auth -- foundation for everything
- [x] Stripe Checkout during signup with trial -- monetization from day 1
- [x] Trial status visible in dashboard -- users know their state
- [x] Auto-conversion after 7 days -- revenue without manual intervention
- [x] Payment failure handling -- don't lose paying customers to failed cards
- [x] Cancel via Stripe Customer Portal -- legal requirement, low effort

**Instance & Groups:**
- [x] Add/connect UAZAPI instance -- core product value
- [x] Import groups from instance -- primary use case
- [x] Categorize groups -- organizational value
- [x] Send messages to groups -- action capability

**AI Agent:**
- [x] Chat interface in sidebar -- differentiator
- [x] Context awareness (user's instances, groups, categories) -- magical moment
- [x] Basic queries ("how many groups?", "list my categories") -- immediate value
- [x] Message history persistence -- expected behavior

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] AI action execution ("send message to X group") -- trigger: users ask for it
- [ ] Scheduled messages -- trigger: users manually schedule enough
- [ ] Annual billing option -- trigger: users ask about yearly discount
- [ ] Usage analytics (messages sent, groups managed) -- trigger: need retention data
- [ ] Onboarding checklist -- trigger: support tickets about "what do I do first"

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Multiple pricing tiers -- why defer: need to learn what features segment users
- [ ] Team/collaborator access -- why defer: B2B complexity, different value prop
- [ ] Automated triggers/workflows -- why defer: N8N already handles this; UI is large effort
- [ ] Advanced AI memory (cross-session learning) -- why defer: cost and privacy implications
- [ ] OAuth login (Google, GitHub) -- why defer: email works; OAuth adds complexity
- [ ] API for external integrations -- why defer: need to validate core product first
- [ ] White-label/custom branding -- why defer: enterprise feature, different market

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Stripe Checkout + Trial | HIGH | MEDIUM | P1 |
| Email/Password Auth | HIGH | LOW | P1 |
| Instance Connection (QR Code) | HIGH | MEDIUM | P1 |
| Group Import | HIGH | MEDIUM | P1 |
| AI Chat (basic queries) | HIGH | HIGH | P1 |
| Category Management | MEDIUM | LOW | P1 |
| Message Sending | HIGH | MEDIUM | P1 |
| Trial Status Display | MEDIUM | LOW | P1 |
| Payment Failure Handling | MEDIUM | LOW | P1 |
| Stripe Customer Portal | MEDIUM | LOW | P1 |
| AI Context Injection | HIGH | MEDIUM | P1 |
| Message History Persistence | MEDIUM | MEDIUM | P1 |
| AI Action Execution | HIGH | HIGH | P2 |
| Scheduled Messages | MEDIUM | MEDIUM | P2 |
| Onboarding Checklist | MEDIUM | LOW | P2 |
| Usage Analytics | LOW | MEDIUM | P2 |
| Annual Billing | LOW | LOW | P2 |
| Multiple Pricing Tiers | LOW | MEDIUM | P3 |
| Team Access | MEDIUM | HIGH | P3 |
| Automated Triggers UI | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

*Note: Based on domain knowledge. WebSearch unavailable for current competitor data.*

| Feature | Generic SaaS Billing Tools | WhatsApp Automation Tools | Our Approach |
|---------|---------------------------|---------------------------|--------------|
| Trial Period | Varies (7-30 days common) | Often no trial or freemium | 7-day trial, card required upfront -- better conversion |
| Billing Model | Per seat or flat rate | Per message or per instance | Per instance (R$ 147/month) -- simple, predictable |
| AI Assistant | Rare in SaaS dashboards | Non-existent in WhatsApp tools | Contextual AI agent -- major differentiator |
| Onboarding | Often neglected wizard | Usually technical setup docs | Progressive disclosure, checklist, guided first instance |
| Customer Portal | Standard Stripe/Paddle | Custom or none | Stripe Customer Portal -- low effort, high quality |

## Trial Strategy Analysis

### Credit Card Upfront vs Free Trial

**Credit Card Upfront (our approach):**
- PRO: Higher conversion rate (30-60% vs 2-5% for free trials)
- PRO: Filters out tire-kickers and bots
- PRO: Lower support burden
- PRO: Revenue predictability
- CON: Higher barrier to entry
- CON: Some users won't try without risk-free option

**Recommendation:** Stick with credit card upfront for R$ 147/month price point. At this price, users who won't enter a card are unlikely to convert anyway. Focus on reducing friction in the signup flow, not removing the card requirement.

### Trial Duration

**7 days (our approach):**
- PRO: Creates urgency
- PRO: Enough time to see value for WhatsApp use case
- PRO: Aligns with weekly business cycles
- CON: May rush users

**Recommendation:** 7 days is appropriate. WhatsApp group management value is apparent quickly (connect instance, import groups, send a message). Longer trials reduce conversion pressure without adding value demonstration.

## AI Agent Feature Depth

### Context Injection Strategy

The AI agent needs to know about the user's data to be useful. Strategy:

1. **System prompt includes:**
   - User's instance count and names
   - User's category count and names
   - User's group count per category
   - User's subscription status

2. **On-demand queries for:**
   - Specific group details (members, last activity)
   - Message history
   - Detailed instance status

3. **Tool calling for:**
   - List groups (with filters)
   - Send message to group
   - Create category
   - Get instance status

**Complexity:** HIGH -- requires careful prompt engineering, tool definitions, and Supabase queries integrated with Vercel AI SDK.

### Guardrails Required

| Risk | Guardrail |
|------|-----------|
| Mass messaging abuse | Rate limit: max 10 messages per request |
| Destructive actions | Confirmation required for delete/disconnect |
| Token cost explosion | Max context window per query |
| Irrelevant responses | Scope AI to WhatsApp group management only |
| Prompt injection | Input sanitization, role boundaries |

## Sources

- Stripe SKILL.md (local) -- HIGH confidence for billing patterns
- UX Design SKILL.md (local) -- HIGH confidence for onboarding patterns
- PROJECT.md requirements -- HIGH confidence for specific features
- Domain expertise (training data) -- MEDIUM confidence for general SaaS patterns
- Vercel AI SDK documentation (from project context) -- MEDIUM confidence

**Note:** WebSearch was unavailable. Findings about competitor features and current trends are based on established patterns rather than real-time research. Consider validating differentiator claims with market research.

---
*Feature research for: SaaS with Trials + Billing + AI Chat Agent*
*Researched: 2026-01-28*
