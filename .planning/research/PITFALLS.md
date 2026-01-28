# Pitfalls Research

**Domain:** SaaS Billing (Stripe) + AI Integration (Vercel AI SDK) in Next.js
**Researched:** 2026-01-28
**Confidence:** MEDIUM (based on training data + project skills documentation; web search unavailable)

## Critical Pitfalls

### Pitfall 1: Trial-to-Paid Transition Charging Wrong User

**What goes wrong:**
Trial ends and system charges wrong amount, charges before trial ends, or fails to charge at all. Users get free service indefinitely or are charged unexpectedly during trial period.

**Why it happens:**
- Stripe `trial_end` timestamp calculated incorrectly (timezone issues, off-by-one errors)
- Webhook `customer.subscription.updated` not handled when trial converts to active
- Database subscription state out of sync with Stripe reality
- `trial_period_days` confused with `trial_end` timestamp

**How to avoid:**
1. Always use Stripe as source of truth for subscription state - never trust local database alone
2. Store `stripeCurrentPeriodEnd` timestamp and check it server-side on every protected request
3. Handle `customer.subscription.updated` webhook to sync trial->active transitions
4. Use Stripe's built-in trial management (`trial_period_days: 7` on price) rather than manual timestamps
5. Test with Stripe test clocks to simulate trial endings

**Warning signs:**
- Users reporting charges during trial
- Users able to access features after trial without payment
- `stripeCurrentPeriodEnd` in database doesn't match Stripe dashboard
- Webhook logs show missed `subscription.updated` events

**Phase to address:**
Phase 1 (Billing Infrastructure) - This must be correct from day one; fixing later risks refunds and trust damage.

---

### Pitfall 2: Webhook Signature Verification Bypass

**What goes wrong:**
Stripe webhooks fail signature verification, so developers disable it or parse JSON before verification. Attackers can then forge webhook events to grant themselves free subscriptions.

**Why it happens:**
- Next.js App Router automatically parses JSON body, but Stripe needs raw body for HMAC verification
- Developer sees "Invalid signature" error and removes verification to "fix" it
- `request.json()` called before `request.text()`, corrupting raw body
- Webhook secret (`whsec_...`) environment variable missing or wrong

**How to avoid:**
1. Always get raw body first: `const body = await request.text()`
2. Never call `request.json()` before signature verification
3. Verify in production - never skip signature check
4. Use Stripe CLI locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
5. Store webhook secret in environment, never hardcode

**Warning signs:**
- "Invalid signature" errors in production logs
- Webhook endpoint accepting any POST request
- No `STRIPE_WEBHOOK_SECRET` in environment
- Using `request.json()` before `constructEvent()`

**Phase to address:**
Phase 1 (Billing Infrastructure) - Security critical; must be correct from initial implementation.

---

### Pitfall 3: AI Context Leaking Between Users (Multi-Tenant Data Exposure)

**What goes wrong:**
AI agent responds with information from User A's context when User B asks a question. User B sees groups, instances, or messages belonging to User A.

**Why it happens:**
- System prompt includes context from wrong user due to async race condition
- Context fetched before authentication verified
- Shared AI provider instance caches previous conversation context
- Database queries missing `WHERE user_id = ?` clause
- Server component caches context across requests

**How to avoid:**
1. Always fetch context AFTER verifying authenticated user
2. Pass `userId` explicitly to every context-fetching function
3. Never cache AI context at server level - context must be request-scoped
4. Add `user_id` filter to EVERY database query that fetches user data
5. Use Vercel AI SDK's message history per-user, never share conversation state
6. Audit every function that builds AI context for proper user scoping

**Warning signs:**
- Users seeing unfamiliar group names in AI responses
- AI referencing instance tokens or data user doesn't own
- Context functions not accepting userId parameter
- Database queries in AI context without user filter

**Phase to address:**
Phase 3 (AI Agent) - But security audit must happen before any AI feature goes live.

---

### Pitfall 4: Breaking Existing UAZAPI/N8N Integration

**What goes wrong:**
New billing or AI features break the working WhatsApp integration. Messages stop being received, webhooks fail silently, or instance connections drop.

**Why it happens:**
- Changing database schema without migrating existing data
- Modifying webhook endpoint path without updating N8N workflow
- New middleware (auth, billing check) blocking webhook requests
- Environment variables overwritten during deployment
- Trial/billing logic blocking instance operations for paying users

**How to avoid:**
1. Document existing webhook URL and never change it: `https://workflows.sincronia.digital/webhook/sincron-tracker/`
2. Webhook endpoints must be public (no auth middleware for incoming UAZAPI webhooks)
3. Create database migration scripts, never modify schema directly
4. Test UAZAPI connection flow end-to-end after every deploy
5. Billing checks should be at UI level, not at webhook processing level

**Warning signs:**
- N8N workflow errors after deploy
- Instance status stuck on "connecting"
- Messages sent but not received in system
- QR code connection flow failing

**Phase to address:**
All phases - Every phase must include regression testing for UAZAPI/N8N integration.

---

### Pitfall 5: Webhook Event Replay / Duplicate Processing

**What goes wrong:**
Same Stripe webhook event processed multiple times, causing duplicate subscriptions, double charges to users, or corrupted database state.

**Why it happens:**
- Stripe retries webhooks if response is slow (>30 seconds)
- No idempotency check - same event ID processed multiple times
- Database transaction fails but webhook returns 200
- Multiple server instances receive same webhook

**How to avoid:**
1. Store processed event IDs: `processed_stripe_events` table with `event_id` unique constraint
2. Check event ID before processing: `if (await eventExists(event.id)) return`
3. Return 200 quickly, process asynchronously if slow
4. Use database transactions for subscription state changes
5. Make all webhook handlers idempotent (same input = same result)

**Warning signs:**
- Duplicate rows in subscription or user tables
- Same subscription ID appearing multiple times
- Stripe dashboard showing multiple retry attempts
- Logs showing same event processed at different times

**Phase to address:**
Phase 1 (Billing Infrastructure) - Must be implemented from the start.

---

### Pitfall 6: AI Token Cost Explosion

**What goes wrong:**
AI agent costs spiral out of control. Single user conversation costs dollars instead of cents. Monthly AI bill exceeds revenue.

**Why it happens:**
- System prompt too large (including full database dumps as context)
- No token limit on user messages
- Conversation history grows unbounded
- Using expensive models (GPT-4) when cheaper models suffice
- No rate limiting per user/instance

**How to avoid:**
1. Limit system prompt context to essential data only (counts, not full lists)
2. Truncate conversation history (keep last N messages, summarize older)
3. Use gpt-4o-mini for most interactions, escalate to larger models only when needed
4. Set `maxTokens` limit on responses
5. Implement per-user rate limits (X messages per hour)
6. Monitor token usage per user, alert on anomalies
7. Cache repeated context queries (user's group count doesn't change every message)

**Warning signs:**
- OpenAI/Anthropic invoices increasing unexpectedly
- Single conversations taking 10+ seconds
- System prompt exceeding 2000 tokens
- No rate limiting on chat endpoint

**Phase to address:**
Phase 3 (AI Agent) - Build with limits from day one.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip webhook idempotency | Faster implementation | Duplicate charges, corrupted data | Never |
| Use client-side subscription check | Quick to implement | Users can bypass billing | Only as UX enhancement, never as security |
| Store subscription state only locally | No Stripe API calls | Out of sync with reality | Never - always sync from Stripe |
| Hardcode trial period | Simple trial logic | Impossible to A/B test trial lengths | Only for MVP if documented |
| Single AI model for all queries | Simpler architecture | High costs for simple queries | Never - always tier by complexity |
| No conversation history limit | Better AI context | Unbounded token costs | Never - always limit |
| Skip UAZAPI integration tests | Faster deploys | Silent breakage discovered by users | Never |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Webhooks | Parsing JSON before signature verification | Get raw body with `request.text()` first |
| Stripe Trial | Using custom trial tracking instead of Stripe's | Use `trial_period_days` on subscription creation |
| Stripe Customer | Creating checkout without existing customer | Create customer first, then checkout with `customer` param |
| Vercel AI SDK | Sharing conversation state across users | Each user gets isolated message history |
| Vercel AI SDK | Fetching context without user filter | Every context query must include `userId` |
| UAZAPI Webhook | Adding auth middleware to webhook endpoint | Webhook endpoints must be public |
| UAZAPI | Polling instance status without backoff | Use exponential backoff with max attempts |
| N8N | Changing webhook URL path | Document and never change: webhook URL is infrastructure |
| Supabase | Missing RLS policies on new tables | Every table needs row-level security from creation |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full group list in AI context | Slow AI responses (5+ seconds) | Include only counts and summaries | 100+ groups per user |
| Unbounded conversation history | Token limit errors, high costs | Truncate to last 20 messages | 50+ messages in conversation |
| Sync Stripe API calls in request | Slow page loads | Cache subscription status with short TTL | 100+ concurrent users |
| No database indexes | Slow dashboard load | Add indexes on user_id, instance_id | 10K+ groups total |
| Polling instance status constantly | UAZAPI rate limiting | Use webhooks for status, poll only for QR | 50+ active instances |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| AI context includes instance tokens | Token exposure via AI response | Never include secrets in AI context |
| Subscription check only client-side | Users bypass billing | Server-side check on every protected API route |
| User can query other users' groups via AI | Data breach | Filter ALL context by authenticated userId |
| Webhook endpoint accepts any origin | Attackers forge subscription events | Verify Stripe signature on every webhook |
| AI can execute actions without confirmation | Accidental mass message sends | Require explicit confirmation for destructive actions |
| Instance token stored in localStorage | XSS can steal tokens | Store only in httpOnly cookies or server-side |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No trial remaining indicator | Users surprised by charge | Show "X days left in trial" prominently |
| Silent webhook failures | User thinks message sent, it wasn't | Show delivery confirmation or error |
| AI suggests impossible actions | Frustration, distrust | AI should only suggest what it can actually do |
| No billing portal access | Users can't update card | Always link to Stripe Customer Portal |
| Charge failure with no notification | Service cut without warning | Email + in-app banner on payment failure |
| Instance disconnect without explanation | Confusion about WhatsApp status | Clear status indicators with reconnect flow |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Stripe Integration:** Often missing `invoice.payment_failed` handler -- verify payment failure flow works
- [ ] **Trial Logic:** Often missing trial expiration email -- verify users get warned before trial ends
- [ ] **Subscription Sync:** Often missing periodic reconciliation -- verify Stripe and DB stay in sync
- [ ] **AI Context:** Often missing user isolation tests -- verify User A can't see User B's data
- [ ] **AI Actions:** Often missing confirmation step -- verify destructive actions require confirmation
- [ ] **Instance Connection:** Often missing reconnect flow -- verify users can reconnect after disconnect
- [ ] **Webhook Security:** Often missing signature verification -- verify forged webhooks are rejected
- [ ] **Error States:** Often missing retry logic -- verify transient failures are retried

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Trial charged wrong | MEDIUM | Refund via Stripe, extend subscription manually, apologize |
| AI data leak | HIGH | Rotate affected credentials, audit logs, notify affected users |
| Duplicate webhook processing | MEDIUM | Deduplicate database, add idempotency check, replay clean events |
| UAZAPI integration broken | MEDIUM | Restore last working env, rollback deploy, regression test |
| Token cost explosion | LOW | Set hard limits, implement rate limiting, optimize context |
| Missing webhook handler | LOW | Add handler, manually sync affected subscriptions from Stripe |
| User isolation failure | HIGH | Audit all queries, fix filters, review affected conversations |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Trial-to-paid transition errors | Phase 1: Billing | Test with Stripe test clocks; verify trial end flow |
| Webhook signature bypass | Phase 1: Billing | Attempt forged webhook in test; verify rejection |
| AI user context leaking | Phase 3: AI Agent | Create 2 test users; verify isolation in responses |
| Breaking UAZAPI/N8N | Every phase | End-to-end test: send message, verify receipt in dashboard |
| Webhook duplicate processing | Phase 1: Billing | Send same webhook twice; verify single processing |
| AI token cost explosion | Phase 3: AI Agent | Monitor token usage in dev; set alerts for anomalies |
| Missing billing error handling | Phase 1: Billing | Test card decline flow; verify user notification |
| Subscription state desync | Phase 1: Billing | Modify subscription in Stripe; verify DB updates |

## Project-Specific Concerns from CONCERNS.md

The existing codebase has issues that compound with billing/AI pitfalls:

| Existing Concern | How It Compounds | Mitigation |
|------------------|------------------|------------|
| No test infrastructure | Can't catch billing regressions | Add test framework before billing phase |
| Large component files | Billing UI will become unmaintainable | Refactor before adding billing components |
| Missing error boundaries | Billing errors crash entire app | Add error boundaries before billing phase |
| Hardcoded sample data | Sample data mixed with real billing | Clean separation of concerns |
| No logging/monitoring | Can't detect billing issues | Add observability before billing goes live |

## Sources

- `.claude/skills/stripe/SKILL.md` - Stripe integration patterns and common issues
- `.claude/skills/uazapi-whatsapp-skill/PATTERNS.md` - UAZAPI webhook security patterns
- `.planning/PROJECT.md` - Project context and constraints
- `.planning/codebase/CONCERNS.md` - Existing codebase issues
- Training data on SaaS billing and AI integration (MEDIUM confidence - unable to verify with web search)

---
*Pitfalls research for: SaaS Billing + AI Integration*
*Researched: 2026-01-28*
