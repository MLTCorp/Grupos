---
phase: 04-instances-mcp-foundation
plan: 02
subsystem: api, ui
tags: [whatsapp, supabase, shadcn, qrcode, crud, instances]

# Dependency graph
requires:
  - phase: 04-01
    provides: UAZAPI service layer and types
provides:
  - Internal instances CRUD API (/api/instances/*)
  - Instance card component with status badges
  - QR code connection modal with auto-refresh
  - Connection history tracking
  - Add/delete instance dialogs with validation
affects: [04-03, 05-categories-groups]

# Tech tracking
tech-stack:
  added: [dialog]
  patterns: [instance-card-layout, qr-polling, confirmation-dialogs]

key-files:
  created:
    - app/api/instances/route.ts
    - app/api/instances/[id]/route.ts
    - app/api/instances/[id]/history/route.ts
    - components/instances/instance-card.tsx
    - components/instances/qr-code-modal.tsx
    - components/instances/instance-history.tsx
    - components/instances/instance-list.tsx
    - components/instances/add-instance-dialog.tsx
    - components/instances/delete-instance-dialog.tsx
    - components/instances/index.ts
    - supabase/migrations/20260129000001_historico_conexoes.sql
  modified: []

key-decisions:
  - "Added Dialog component via shadcn for add instance dialog"
  - "Soft delete instances (set ativo=false) instead of hard delete"
  - "QR code auto-refresh every 2 minutes with countdown timer"
  - "Status polling every 3 seconds while waiting for connection"
  - "History table with RLS policies for org-scoped access"

patterns-established:
  - "Instance Card: Card with status badge (green/red/yellow), collapsible history"
  - "Delete Confirmation: Requires typing exact instance name"
  - "Plan Limit Check: Show upgrade message when at instance limit"
  - "QR Modal: Sheet with base64 image, countdown, auto-regenerate"

# Metrics
duration: 6min
completed: 2026-01-29
---

# Phase 04 Plan 02: Internal Instance CRUD API and UI Components Summary

**Internal instances API with Supabase CRUD and card-based UI components including QR code modal, history tracking, and confirmation dialogs**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-29T20:32:06Z
- **Completed:** 2026-01-29T20:38:00Z
- **Tasks:** 4
- **Files modified:** 11

## Accomplishments
- Internal API routes for instance CRUD with organization-scoped access
- Instance card component with status badges and collapsible history
- QR code modal with auto-refresh and connection polling
- Add dialog with plan limit checking and upgrade prompts
- Delete dialog requiring exact name confirmation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Internal Instances API** - `9638d95` (feat)
2. **Task 2: Create Instance Card Component** - `407ab9b` (feat)
3. **Task 3: Create QR Code Modal and History Components** - `16f5e00` (feat)
4. **Task 4: Create Add and Delete Instance Dialogs** - `09c5168` (feat)

## Files Created/Modified

- `app/api/instances/route.ts` - GET/POST list and create instances
- `app/api/instances/[id]/route.ts` - GET/DELETE single instance
- `app/api/instances/[id]/history/route.ts` - GET/POST connection history
- `components/instances/instance-card.tsx` - Card with status, actions, collapsible history
- `components/instances/qr-code-modal.tsx` - Sheet with QR code, countdown, auto-refresh
- `components/instances/instance-history.tsx` - Last 5 events with icons
- `components/instances/instance-list.tsx` - Responsive grid with empty state
- `components/instances/add-instance-dialog.tsx` - Name input with limit check
- `components/instances/delete-instance-dialog.tsx` - Name confirmation required
- `components/instances/index.ts` - Component exports
- `supabase/migrations/20260129000001_historico_conexoes.sql` - History table + RLS

## Decisions Made

1. **Soft delete instances** - Set `ativo=false` instead of hard delete to preserve history
2. **Dialog component added** - Used shadcn dialog for add instance form
3. **QR expiration handling** - 2 minute timeout with automatic regeneration
4. **Connection polling** - Check status every 3 seconds while QR displayed
5. **History table with RLS** - Organization-scoped access via join with usuarios_sistema

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Dialog component from shadcn**
- **Found during:** Task 4 (Add Instance Dialog)
- **Issue:** Dialog component not present in project, needed for add instance form
- **Fix:** Ran `npx shadcn@latest add dialog --yes`
- **Files modified:** components/ui/dialog.tsx, package.json
- **Verification:** Import succeeds, component renders
- **Committed in:** Part of initial setup (not tracked separately)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Dialog was necessary for the add instance form. No scope creep.

## Issues Encountered

None - all tasks executed as planned.

## User Setup Required

**Database migration required.** Run the historico_conexoes migration:

```sql
-- Run in Supabase SQL Editor or via CLI
-- File: supabase/migrations/20260129000001_historico_conexoes.sql
```

The migration creates:
- `historico_conexoes` table with foreign key to instancias_whatsapp
- Index on (instancia_id, created_at DESC) for efficient queries
- RLS policies for organization-scoped access

## Next Phase Readiness

- Internal API ready for instances page consumption
- UI components ready for integration in dashboard
- History tracking operational
- Next: Create instances page that assembles all components (04-03)

---
*Phase: 04-instances-mcp-foundation*
*Completed: 2026-01-29*
