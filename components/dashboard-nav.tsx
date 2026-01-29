"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  disabled: boolean
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <SidebarMenuItem key={item.href}>
            {item.disabled ? (
              <SidebarMenuButton
                tooltip={item.title}
                className="opacity-50 cursor-not-allowed"
                id={`nav-${item.href.split('/').pop()}`}
              >
                <Icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                id={`nav-${item.href.split('/').pop()}`}
              >
                <Link href={item.href}>
                  <Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
