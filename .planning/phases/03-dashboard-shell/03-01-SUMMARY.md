---
phase: 03-dashboard-shell
plan: 01
subsystem: ui-infrastructure
tags: [theming, toast, next-themes, sonner]

dependency-graph:
  requires: [02-stripe-billing]
  provides: [theme-toggle, toast-system, provider-wrapper]
  affects: [03-02, 03-03, 03-04]

tech-stack:
  added: []
  patterns: [client-component-wrapper, mounted-state-hydration]

key-files:
  created:
    - components/theme-provider.tsx
    - components/theme-toggle.tsx
    - lib/toast.ts
  modified:
    - app/layout.tsx
    - tsconfig.json

decisions:
  - id: theme-default-dark
    choice: defaultTheme="dark"
    reason: User preference from CONTEXT.md
  - id: toast-position
    choice: position="top-right"
    reason: CONTEXT.md specification
  - id: toast-durations
    choice: success=3s, error=7s
    reason: CONTEXT.md specification - errors need more read time

metrics:
  duration: 4 min
  completed: 2026-01-29
---

# Phase 03 Plan 01: Theming & Toast Infrastructure Summary

**One-liner:** ThemeProvider with dark default, ThemeToggle with Sun/Moon icons, Toaster at top-right, toast helper enforcing 3s/7s durations.

## What Was Built

### Theme System
- `components/theme-provider.tsx`: Client component wrapping NextThemesProvider from next-themes v0.4.6
- `components/theme-toggle.tsx`: Button with Sun/Moon icons, CSS transitions for rotation/scale, mounted state check to prevent hydration mismatch, Portuguese sr-only text "Alternar tema"

### Toast System
- `lib/toast.ts`: Helper functions showSuccess (3000ms) and showError (7000ms) enforcing CONTEXT.md duration conventions
- Toaster component integrated in root layout with position="top-right" and richColors

### Root Layout Updates
- ThemeProvider wraps all children with attribute="class", defaultTheme="dark", enableSystem, disableTransitionOnChange
- Toaster component rendered inside ThemeProvider
- suppressHydrationWarning on html element
- lang changed from "en" to "pt-BR"
- Metadata updated to "Sincron Grupos" with Portuguese description

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 8ae36f9 | feat | create theme provider and toggle components |
| 233aecd | feat | configure root layout with providers |
| 3c1a0be | feat | create toast helper utility |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Excluded supabase/functions from tsconfig**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** Build failed because supabase/functions contains Deno edge functions with Deno-specific imports (https://deno.land/...) that TypeScript cannot resolve
- **Fix:** Added "supabase/functions" to tsconfig.json exclude array
- **Files modified:** tsconfig.json
- **Commit:** 233aecd

## Verification Results

- [x] npm run build passes without errors
- [x] ThemeProvider wraps entire app with dark default
- [x] Toaster positioned top-right, ready for notifications
- [x] Toast helper enforces 3s success / 7s error durations
- [x] ThemeToggle component ready for sidebar integration (Plan 02)
- [x] suppressHydrationWarning prevents theme flash warning

## Technical Notes

**Hydration Pattern:** ThemeToggle uses mounted state pattern to prevent hydration mismatch. Returns null on server render, only renders button after useEffect confirms client mount.

**Icon Animation:** Sun and Moon icons overlap using absolute positioning. CSS transitions rotate and scale icons based on dark class - Sun rotates out (-90deg, scale 0) in dark mode, Moon rotates in (0deg, scale 1).

**Theme Persistence:** next-themes automatically persists theme choice to localStorage. enableSystem allows following system preference when user hasn't explicitly chosen.

## Next Phase Readiness

Ready for Plan 02 (Sidebar):
- ThemeToggle component ready for integration in sidebar header
- Toast system ready for user feedback on actions
- Provider structure established in root layout
