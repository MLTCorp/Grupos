# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- UI components: PascalCase (e.g., `Button.tsx`, `DataTable.tsx`, `AppSidebar.tsx`)
- Utility files: camelCase (e.g., `use-mobile.ts`, `utils.ts`)
- Hooks: camelCase with `use-` prefix (e.g., `use-mobile.ts`)
- Index/barrel files: `index.ts` format (implicit re-exports)

**Functions:**
- React components: PascalCase (e.g., `Button`, `DataTable`, `ComponentExample`)
- Helper/utility functions: camelCase (e.g., `cn`, `useIsMobile`)
- Internal component functions: PascalCase (e.g., `DragHandle`, `DraggableRow`, `TableCellViewer`)

**Variables:**
- State variables: camelCase (e.g., `isMobile`, `rowSelection`, `columnVisibility`)
- Constants: camelCase or UPPER_SNAKE_CASE for important values (e.g., `MOBILE_BREAKPOINT`, `schema`)
- CSS class strings: kebab-case (via Tailwind utility classes)

**Types:**
- React component props: `React.ComponentProps<"element">` pattern for extensibility
- Zod schemas: PascalCase for schema names (e.g., `schema = z.object(...)`)
- Extracted types: Use `z.infer<typeof schema>` to derive types from Zod validators
- Type aliases for props: Defined inline with component parameters

## Code Style

**Formatting:**
- No explicit formatter configured (eslint-config-next provides formatting rules)
- Whitespace: 2-space indentation (inferred from tsconfig and code samples)
- Line length: No strict limit observed, but pragmatic wrapping used in long component definitions

**Linting:**
- Framework: ESLint v9 with Next.js configuration
- Config: `eslint.config.mjs` (using new flat config format)
- Base configs used:
  - `eslint-config-next/core-web-vitals`: Core Web Vitals rules
  - `eslint-config-next/typescript`: TypeScript support
- Ignored paths: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Import Organization

**Order:**
1. React imports (`import * as React from "react"` or specific hooks)
2. Third-party library imports (Radix UI, dnd-kit, Tabler icons, Remix icons, Recharts, etc.)
3. Custom utility imports (`@/lib/utils` for `cn()` function)
4. Custom component imports (from `@/components/ui/*`)
5. Hook imports (from `@/hooks/*`)
6. Type imports (Zod schemas, TypeScript types)

**Path Aliases:**
- `@/*`: Maps to root directory (configured in `tsconfig.json`)
- Used consistently throughout: `@/lib/utils`, `@/components/ui/button`, `@/hooks/use-mobile`

**Example pattern from `data-table.tsx`:**
```typescript
import * as React from "react"
import {
  closestCenter,
  DndContext,
  // ... other imports
} from "@dnd-kit/core"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
```

## Error Handling

**Patterns:**
- Validation via Zod schemas (e.g., `z.object({id: z.number(), header: z.string(), ...})`)
- Type safety through TypeScript strict mode (`"strict": true` in tsconfig)
- No explicit try/catch blocks observed; validation happens at schema level
- Promise-based toast notifications for async operations: `toast.promise(promise, {loading, success, error})`
- No global error boundaries observed; components handle their own states

## Logging

**Framework:** Not detected

**Patterns:**
- Conditional logging: No console statements observed in analyzed code
- Debug approach: Relies on React DevTools and browser debugging
- Toast notifications for user feedback (via `sonner` package)

## Comments

**When to Comment:**
- Minimal commenting observed; code is self-documenting through clear naming
- Comments used only for clarifying non-obvious behavior
- Example: "Create a separate component for the drag handle" comment above `DragHandle` component

**JSDoc/TSDoc:**
- Not used in analyzed components
- Type documentation handled by TypeScript types and Zod schemas

## Function Design

**Size:**
- Pragmatic sizing; components range from 5-20 lines (utility) to 100+ lines (complex tables)
- Sub-components extracted for reuse (e.g., `DragHandle`, `DraggableRow`, `TableCellViewer`)

**Parameters:**
- Destructured props pattern: `function Button({ className, variant = "default", size = "default", asChild = false, ...props })`
- Default values used for optional props
- Spread operator used for remaining HTML attributes

**Return Values:**
- Components return JSX elements directly
- Utilities return CSS class strings or boolean values
- No void functions; all have explicit return values

## Module Design

**Exports:**
- Named exports used exclusively (no default exports)
- Multiple related exports grouped together:
  ```typescript
  export {
    Button,
    buttonVariants
  }
  ```
- Barrel pattern: UI components grouped under `components/ui/` directory

**Barrel Files:**
- Component-example.tsx imports multiple UI components and re-exports them implicitly
- Pattern: Single responsibility with clear export lists

## Component Composition

**Pattern:**
- Radix UI primitives wrapped with styling and extended prop handling
- CVA (class-variance-authority) for managing variant styles
- `cn()` utility (clsx + tailwind-merge) for merging CSS classes safely
- Data attributes used for styling hooks: `data-slot="button"`, `data-variant={variant}`

**Reusable Patterns:**
- Field wrapper components: `FieldGroup`, `FieldLabel` for consistent form styling
- Icon usage: Consistent pattern with Tabler/Remix icon libraries
- State management: `React.useState` for local component state
- Hooks for shared logic: `useIsMobile`, `useSortable`, `useReactTable`
