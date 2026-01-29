"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { navigationItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const isMobile = useIsMobile()
  const pathname = usePathname()

  // Only render on mobile
  if (!isMobile) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 z-50 bg-background border-t pb-4 md:hidden">
      <div className="flex items-center justify-around h-full">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed"
              >
                <Icon className="size-5" />
                <span className="text-xs">{item.title}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
