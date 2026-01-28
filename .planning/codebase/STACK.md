# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.x - Full application codebase (React components, utilities, configuration)
- JSX/TSX - React component syntax throughout application

**Secondary:**
- JavaScript (Node.js runtime for build and development)

## Runtime

**Environment:**
- Node.js 24.5.0 (verified in environment)

**Package Manager:**
- npm (v10+ implied)
- Lockfile: `package-lock.json` (v3 lockfile format present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack framework (app directory architecture, React Server Components)
- React 19.2.3 - UI library with latest features
- React DOM 19.2.3 - DOM rendering layer

**UI & Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework with PostCSS integration
- shadcn/ui 3.7.0 - Component library built on Radix UI primitives
- Class Variance Authority (CVA) 0.7.1 - CSS class composition for component variants
- Tailwind Merge 3.4.0 - Smart Tailwind class merging utility

**UI Components (Radix UI Foundation):**
- @radix-ui/react-avatar 1.1.11 - Avatar component primitive
- @radix-ui/react-checkbox 1.3.3 - Checkbox primitive
- @radix-ui/react-collapsible 1.1.12 - Collapsible content primitive
- @radix-ui/react-dialog 1.1.15 - Modal dialog primitive
- @radix-ui/react-dropdown-menu 2.1.16 - Dropdown menu primitive
- @radix-ui/react-label 2.1.8 - Label primitive
- @radix-ui/react-select 2.2.6 - Select primitive
- @radix-ui/react-separator 1.1.8 - Separator/divider primitive
- @radix-ui/react-slot 1.2.4 - Slot composition primitive
- @radix-ui/react-tabs 1.1.13 - Tabs primitive
- @radix-ui/react-toggle 1.1.10 - Toggle button primitive
- @radix-ui/react-toggle-group 1.1.11 - Toggle group primitive
- @radix-ui/react-tooltip 1.2.8 - Tooltip primitive
- radix-ui 1.4.3 - Complete Radix UI package

**Icon Libraries:**
- @tabler/icons-react 3.36.1 - Icon components (Tabler icon set)
- @remixicon/react 4.8.0 - Alternative icon library
- lucide-react 0.563.0 - Modern icon library

**Data Management:**
- @tanstack/react-table 8.21.3 - Headless table component logic
- zod 4.3.6 - Schema validation and TypeScript inference

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Core drag-and-drop system
- @dnd-kit/sortable 10.0.0 - Sortable functionality (used in `data-table.tsx`)
- @dnd-kit/modifiers 9.0.0 - Drag modifiers
- @dnd-kit/utilities 3.2.2 - Utility functions

**Notifications & Feedback:**
- sonner 2.0.7 - Toast notification system
- vaul 1.1.2 - Drawer/sheet component primitive

**Additional Utilities:**
- next-themes 0.4.6 - Theme management (dark mode support)
- clsx 2.1.1 - Utility for conditional class names
- tw-animate-css 1.4.0 - Animation utilities
- @base-ui/react 1.1.0 - Alternative UI primitives library

**Charting:**
- recharts 2.15.4 - Chart component library (used in `chart-area-interactive.tsx`)

## Configuration

**Environment:**
- No `.env` files detected - project uses defaults
- Environment variables are ignored in `.gitignore` if needed (`.env*`)

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with `strict: true` enabled
- `next.config.ts - Basic Next.js configuration (minimal setup)
- `postcss.config.mjs` - PostCSS with Tailwind CSS 4 plugin
- `eslint.config.mjs` - ESLint configuration using flat config format (Next.js recommended)
- `components.json` - shadcn/ui configuration (New York style, Remixicon icons, RSC enabled)

**Path Aliases:**
- `@/*` resolves to project root (configured in `tsconfig.json`)

## Development Tools

**Testing:**
- None configured (no test framework in dependencies)

**Linting & Formatting:**
- ESLint 9.x - Configured with Next.js Core Web Vitals and TypeScript rules
- No Prettier configuration (relies on ESLint for formatting)

**Fonts:**
- Next.js built-in Google Fonts loading
- Geist Sans and Mono (Vercel's font family)
- Figtree (custom sans-serif variable)

## Platform Requirements

**Development:**
- Node.js 24.5.0+
- npm 10.x+
- Modern browser with ES2017+ support

**Production:**
- Deployment target: Vercel platform recommended (Next.js native)
- Could deploy to any Node.js hosting (AWS, Netlify, Railway, etc.)

---

*Stack analysis: 2026-01-28*
