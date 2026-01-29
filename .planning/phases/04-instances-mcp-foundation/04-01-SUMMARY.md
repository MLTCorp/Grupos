---
phase: 04-instances-mcp-foundation
plan: 01
subsystem: api
tags: [uazapi, whatsapp, webhook, next-api-routes, typescript]

# Dependency graph
requires:
  - phase: 01-auth-foundation
    provides: Supabase server client for database operations
provides:
  - UAZAPI TypeScript types and interfaces
  - UAZAPIService singleton for client-side API calls
  - API routes for WhatsApp instance management
  - Webhook configuration with Supabase database sync
affects: [04-02 instance UI, 05-groups, 06-messages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "UAZAPI proxy pattern: client calls /api/uazapi/*, routes proxy to UAZAPI"
    - "JID extraction: extractPhoneFromJID handles string and object JID formats"
    - "Phone formatting: formatPhoneNumber for Brazilian phone display"
    - "Webhook security: URL from ENV, excludeMessages prevents loops"

key-files:
  created:
    - lib/uazapi/types.ts
    - lib/uazapi/service.ts
    - lib/uazapi/index.ts
    - app/api/uazapi/instances/route.ts
    - app/api/uazapi/instances/[token]/route.ts
    - app/api/uazapi/instances/[token]/status/route.ts
    - app/api/uazapi/instances/[token]/connect/route.ts
    - app/api/uazapi/instances/[token]/webhook/route.ts
  modified: []

key-decisions:
  - "Ported UAZAPI service from original project with minimal changes"
  - "API routes proxy to UAZAPI with https agent for dev SSL issues"
  - "Webhook excludeMessages includes wasSentByApi to prevent loops"
  - "Status route enriches response with extractedStatus object"

patterns-established:
  - "UAZAPIService singleton: getUAZAPIService() for client-side calls"
  - "Fetch timeout wrapper: fetchWithTimeout for 10s request limit"
  - "Status enrichment: API route extracts phone, formats, adds extractedStatus"

# Metrics
duration: 4min
completed: 2026-01-29
---

# Phase 4 Plan 1: UAZAPI Service Layer Summary

**TypeScript UAZAPI integration with service class, types, and 5 API routes for WhatsApp instance management**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-29T20:23:06Z
- **Completed:** 2026-01-29T20:27:23Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Complete UAZAPI TypeScript type definitions including InstanciaWhatsApp, status types, webhook types
- UAZAPIService singleton class with methods for all instance operations
- 5 API routes proxying to UAZAPI: create, disconnect/delete, status, connect, webhook
- Webhook route includes Supabase database sync for webhook_url

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UAZAPI Types** - `d4f0d20` (feat)
2. **Task 2: Create UAZAPI Service Class** - `86b5700` (feat)
3. **Task 3: Create UAZAPI API Routes** - `b230525` (feat)

## Files Created/Modified

- `lib/uazapi/types.ts` - TypeScript interfaces for UAZAPI (InstanciaWhatsApp, status, webhook)
- `lib/uazapi/service.ts` - UAZAPIService class with all client-side methods
- `lib/uazapi/index.ts` - Re-exports for clean imports
- `app/api/uazapi/instances/route.ts` - POST create instance
- `app/api/uazapi/instances/[token]/route.ts` - POST disconnect, DELETE remove
- `app/api/uazapi/instances/[token]/status/route.ts` - GET status with phone extraction
- `app/api/uazapi/instances/[token]/connect/route.ts` - POST generate QR code
- `app/api/uazapi/instances/[token]/webhook/route.ts` - POST/GET webhook config

## Decisions Made

- [04-01]: Ported UAZAPI implementation from original project (sincron-grupos) with proven logic
- [04-01]: API routes use https.Agent with rejectUnauthorized: false for dev SSL issues
- [04-01]: Webhook configuration hardcodes excludeMessages: ['wasSentByApi'] to prevent infinite loops
- [04-01]: Status route enriches UAZAPI response with extractedStatus object containing formatted phone
- [04-01]: Service class uses /api/uazapi prefix (proxied routes, not direct UAZAPI calls)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration:**

Environment variables needed:
- `UAZAPI_BASE_URL` - UAZAPI dashboard subdomain URL (e.g., https://yourname.uazapi.com)
- `UAZAPI_API_KEY` - Admin Token from UAZAPI dashboard for instance management
- `WEBHOOK_N8N_URL` - N8N workflow webhook URL for receiving WhatsApp events

## Next Phase Readiness

- UAZAPI service layer complete, ready for instance management UI (Plan 04-02)
- API routes available at /api/uazapi/instances/* for frontend consumption
- Types exported from lib/uazapi for component development

---
*Phase: 04-instances-mcp-foundation*
*Completed: 2026-01-29*
