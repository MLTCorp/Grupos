"use client"

import * as React from "react"

import { navigationItems, settingsItems } from "@/lib/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { AppSidebarHeader } from "@/components/sidebar-header"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <DashboardNav items={navigationItems} />
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Configuracoes</SidebarGroupLabel>
          <DashboardNav items={settingsItems} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: '' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
