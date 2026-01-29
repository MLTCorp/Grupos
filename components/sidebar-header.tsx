"use client"

import { useSidebar } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export function AppSidebarHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">SG</span>
        </div>
        {!isCollapsed && (
          <span className="font-semibold truncate">Sincron Grupos</span>
        )}
      </div>
      {!isCollapsed && <ThemeToggle />}
    </div>
  )
}
