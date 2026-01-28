# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
sincron-grupos/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx          # Root layout wrapper for all pages
│   ├── page.tsx            # Home page at /
│   ├── dashboard/          # Dashboard route
│   │   ├── page.tsx        # Dashboard page at /dashboard
│   │   └── data.json       # Static table data
│   └── globals.css         # Global styles and Tailwind config
├── components/             # React components
│   ├── ui/                 # Shadcn UI primitive components
│   ├── app-sidebar.tsx     # Dashboard sidebar navigation
│   ├── component-example.tsx # Component showcase with examples
│   ├── data-table.tsx      # Advanced table with drag-drop, filtering, sorting
│   ├── site-header.tsx     # Page header with sidebar trigger
│   ├── nav-*.tsx           # Navigation components (menu items)
│   ├── team-switcher.tsx   # Team selection dropdown
│   ├── section-cards.tsx   # Card grid section
│   └── chart-area-interactive.tsx # Interactive area chart
├── hooks/                  # Custom React hooks
│   └── use-mobile.ts       # Mobile breakpoint detection hook
├── lib/                    # Utility functions
│   └── utils.ts            # Class merging utility (cn)
├── public/                 # Static assets
├── .next/                  # Next.js build output (generated)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── components.json         # Shadcn CLI configuration
├── postcss.config.mjs      # PostCSS/Tailwind configuration
└── eslint.config.mjs       # ESLint configuration
```

## Directory Purposes

**`app/` - Routes and Layout:**
- Purpose: Define application routes using Next.js App Router file-based routing
- Contains: Route segments (page.tsx), layout components (layout.tsx), and route-specific data
- Key files: `app/layout.tsx` (root wrapper), `app/page.tsx` (home), `app/dashboard/page.tsx` (dashboard)

**`components/` - Reusable UI Components:**
- Purpose: House all React components organized by type
- Contains: UI primitives (ui/), feature components, page sections
- Subdivisions:
  - `components/ui/` - Shadcn primitives (Button, Card, Dialog, etc.)
  - Root level - Feature components (DataTable, AppSidebar, etc.)

**`hooks/` - Custom React Hooks:**
- Purpose: Encapsulate reusable stateful logic
- Contains: Custom hooks for responsive design, state management
- Example: `use-mobile.ts` - Detects if viewport is below 768px breakpoint

**`lib/` - Utility Functions:**
- Purpose: Provide pure functions and helpers
- Contains: Utility functions not tied to components
- Example: `utils.ts` - Class name merging (clsx + tailwind-merge)

**`public/` - Static Assets:**
- Purpose: Serve static files (images, icons, fonts)
- Contains: Files referenced in HTML (avatars in sidebar example)

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root HTML layout, font loading, global styles
- `app/page.tsx` - Home page at `/` route
- `app/dashboard/page.tsx` - Dashboard page at `/dashboard` route

**Configuration:**
- `tsconfig.json` - TypeScript config with path alias `@/*` pointing to project root
- `next.config.ts` - Next.js app configuration (currently minimal)
- `components.json` - Shadcn CLI config for component generation and aliases
- `postcss.config.mjs` - Tailwind CSS and PostCSS setup
- `eslint.config.mjs` - ESLint rules (Next.js preset)

**Core Logic:**
- `components/data-table.tsx` - Complex table with state management, drag-drop, filtering
- `components/app-sidebar.tsx` - Navigation sidebar with team switcher and menu
- `components/component-example.tsx` - Component showcase page

**Data:**
- `app/dashboard/data.json` - Static JSON data for dashboard table

**Testing:**
- None detected - no test files found

## Naming Conventions

**Files:**
- `use-*.ts` - Custom hook files (e.g., `use-mobile.ts`)
- `*.tsx` - React components
- `*.ts` - TypeScript utilities
- `*-example.tsx` - Example/showcase components
- `*-interactive.tsx` - Interactive/stateful components
- `nav-*.tsx` - Navigation-related components
- `page.tsx` - Route page components (Next.js convention)
- `layout.tsx` - Layout wrapper components (Next.js convention)

**Directories:**
- `app/` - Routes (Next.js convention)
- `components/` - React components
- `ui/` - Shadcn UI primitives
- `hooks/` - React hooks
- `lib/` - Utilities and helpers
- `public/` - Static assets

**Components:**
- PascalCase for component names: `AppSidebar`, `DataTable`, `SiteHeader`
- Descriptive names indicating purpose: `TeamSwitcher`, `NavMain`, `ComponentExample`

**Variables/Functions:**
- camelCase for hooks: `useReactTable`, `useIsMobile`, `useSortable`
- camelCase for utility functions: `cn`, `arrayMove`
- camelCase for state variables: `isMobile`, `rowSelection`, `columnFilters`

## Where to Add New Code

**New Page/Route:**
- Create directory under `app/` (e.g., `app/new-feature/`)
- Add `page.tsx` file with default export component
- Import and compose feature components from `components/`

**New Feature Component:**
- Primary implementation: `components/feature-name.tsx`
- If uses "use client" directive, place at top of file
- Import UI primitives from `components/ui/`
- Use TypeScript types for all props

**New UI Component:**
- Add to `components/ui/ui-name.tsx`
- Wrap Radix UI primitive with Tailwind classes
- Export component and sub-components (e.g., CardHeader, CardContent)
- Follow shadcn pattern: shallow wrapper with className composition

**Utilities and Helpers:**
- Shared helpers: `lib/utils.ts` (or create `lib/feature-utils.ts`)
- Custom hooks: `hooks/hook-name.ts`
- Types/schemas: Define inline in component or `lib/types.ts` if shared

**Styling:**
- Component classes: Use Tailwind utilities in className
- Global styles: `app/globals.css` (CSS variables, custom themes)
- CSS variables: Define in `:root` in `app/globals.css`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output directory
- Generated: Yes (automatically by `npm run build` or `npm run dev`)
- Committed: No (should be in .gitignore)
- Contains: Compiled JavaScript, build manifests, page routes

**`components/ui/`:**
- Purpose: Shadcn UI primitive components
- Generated: Yes (via `shadcn-cli add <component>`)
- Committed: Yes (components are committed to version control)
- Pattern: Each component is self-contained, wrapped Radix UI

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)

**Path Alias Configuration:**
- Alias: `@/*` maps to project root (defined in `tsconfig.json`)
- Usage: `import { Button } from "@/components/ui/button"`
- Benefit: Cleaner imports regardless of file nesting depth

---

*Structure analysis: 2026-01-28*
