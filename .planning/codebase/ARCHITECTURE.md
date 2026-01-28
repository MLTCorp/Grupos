# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Next.js Server Components (RSC) with Client Component Islands

**Key Characteristics:**
- Next.js 16 App Router (file-based routing)
- React 19 with Server Components as default
- UI layer built entirely with shadcn/ui components
- Complex interactive tables with drag-and-drop via dnd-kit
- State management via React hooks (useState, useEffect) at component level
- Responsive design with Tailwind CSS 4 and custom CSS variables
- No server-side state management (state is client-side only)
- No backend API routes detected (purely frontend UI showcase)

## Layers

**Layout/Routing Layer:**
- Purpose: Establish app structure and entry points
- Location: `app/layout.tsx`, `app/page.tsx`, `app/dashboard/page.tsx`
- Contains: Root layout, page components, metadata definition
- Depends on: React, Next.js types, global CSS
- Used by: Browser runtime

**Component Composition Layer:**
- Purpose: Compose UI from reusable components
- Location: `components/*.tsx`, `components/ui/*.tsx`
- Contains: Page-level components (AppSidebar, SiteHeader, DataTable), UI primitives (Button, Card, Input, Select, etc.)
- Depends on: Radix UI, Lucide React, Remix Icon, Tabler Icons, class-variance-authority
- Used by: Page components

**Interaction/State Layer:**
- Purpose: Handle user interactions and local state
- Location: Component internals (useState, useEffect, custom hooks)
- Contains: Form handling, table sorting/filtering, drag-drop logic, modal state
- Depends on: React hooks, dnd-kit for drag-drop, TanStack React Table for data tables
- Used by: Components that need interactivity

**Styling Layer:**
- Purpose: Apply consistent theming and responsive design
- Location: `app/globals.css`, Tailwind CSS utilities
- Contains: CSS variables, theme configuration, custom animations via tw-animate-css
- Depends on: Tailwind CSS 4, shadcn theme system
- Used by: All components via class names

**Utilities Layer:**
- Purpose: Provide helper functions and hooks
- Location: `lib/utils.ts`, `hooks/use-mobile.ts`
- Contains: Class merging utility (cn), responsive breakpoint detection
- Depends on: clsx, tailwind-merge
- Used by: Components for styling and responsive logic

## Data Flow

**Component Initialization Flow:**

1. Browser loads `app/layout.tsx` (RootLayout)
2. Fonts are loaded from Google Fonts (Figtree, Geist)
3. Global styles applied from `app/globals.css`
4. Root component renders children (either `app/page.tsx` or `app/dashboard/page.tsx`)
5. Page components render nested UI components

**Dashboard Page Data Flow:**

1. `/dashboard` route triggers `app/dashboard/page.tsx`
2. Page renders `SidebarProvider` wrapper
3. Sidebar and main content initialized in parallel
4. `DataTable` imports static `data.json` for initial table data
5. Table state managed internally via `useReactTable` hook

**Interactive Component Flow (DataTable example):**

1. User interaction (drag, sort, filter, pagination, etc.)
2. Component-level state updates via React hooks
3. Table re-renders with new state
4. Drag-drop handled via dnd-kit context
5. No server communication (fully client-side)

**State Management:**
- All state is client-side via React hooks (useState, useEffect)
- DataTable uses: rowSelection, columnVisibility, columnFilters, sorting, pagination states
- Modal/Dialog states managed per component (component-example.tsx)
- No global state management library (Context API not used)
- Data persists only in component memory (lost on page reload)

## Key Abstractions

**Component Architecture:**

**UI Primitive Components** (`components/ui/*.tsx`):
- Purpose: Encapsulate Radix UI primitives with shadcn styling
- Examples: `Button`, `Card`, `Select`, `Dropdown`, `Dialog`, `Table`, `Sidebar`
- Pattern: Wrapper components that apply Tailwind classes and expose Radix props via spread syntax
- Usage: Composed into higher-level features

**Feature/Composite Components** (`components/*.tsx`):
- Purpose: Combine primitives into feature-complete UI sections
- Examples: `DataTable` (table + drag-drop + forms), `AppSidebar` (navigation + user menu), `SiteHeader` (header bar)
- Pattern: "Use client" components that manage local state and compose UI primitives
- Contains: Business logic like data transformations, event handling, form state

**Page Components** (`app/*/page.tsx`):
- Purpose: Assemble feature components into complete pages
- Examples: `app/dashboard/page.tsx` (dashboard layout), `app/page.tsx` (home)
- Pattern: Server or client components that import and layout feature components
- Responsibility: Route-specific layout, data passing via props

## Entry Points

**Web Entry Point:**
- Location: `app/layout.tsx` (RootLayout)
- Triggers: Initial page load or navigation to any route
- Responsibilities: Establish HTML structure, load fonts, apply global styles, render page content

**Dashboard Page:**
- Location: `app/dashboard/page.tsx`
- Triggers: Navigation to `/dashboard` route
- Responsibilities: Compose dashboard layout with sidebar, header, and main content sections

**Home Page:**
- Location: `app/page.tsx`
- Triggers: Navigation to `/` or initial load
- Responsibilities: Display ComponentExample (showcase of UI components and patterns)

## Error Handling

**Strategy:** No error boundaries or error handling detected in current codebase

**Patterns:**
- Missing error states in async operations (none present, all data is static)
- No try-catch blocks in component code
- No fallback UI for failed states
- Form submissions show toast notifications but no error catching
- DataTable shows "No results" fallback if data is empty

## Cross-Cutting Concerns

**Logging:** Not detected. No console logging or external logging service configured.

**Validation:**
- Zod schema used in `DataTable` for type safety: `z.object({id, header, type, status, target, limit, reviewer})`
- Input validation in forms is HTML-level only (required attributes)
- No server-side validation

**Authentication:** Not implemented. No auth context, providers, or protected routes.

**Responsive Design:**
- Mobile breakpoint: 768px (defined in `hooks/use-mobile.ts`)
- Responsive components use Tailwind breakpoints (sm, md, lg, @container)
- DataTable has mobile-specific views (Select instead of Tabs on small screens)
- Sidebar collapsible to icon-only on small screens

---

*Architecture analysis: 2026-01-28*
