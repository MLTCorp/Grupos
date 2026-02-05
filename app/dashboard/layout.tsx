import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TrialBadge } from "@/components/trial-badge"
import { getSubscriptionStatus } from "@/lib/subscription"
import { AppSidebar } from "@/components/app-sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { TourProvider } from "@/components/onboarding/tour-provider"
import { checkNeedsOnboarding } from "@/components/onboarding/use-onboarding"
import { CheckoutPendingHandler } from "@/components/checkout-pending-handler"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check subscription status with error handling
  let subscriptionInfo
  try {
    subscriptionInfo = await getSubscriptionStatus(user.id)
  } catch (error) {
    // If database is unreachable or query fails, allow access with degraded experience
    // Log error for monitoring, but don't block user from their dashboard
    console.error('[BILLING] Failed to get subscription status:', error)
    // Default to allowing access - billing issues shouldn't block dashboard
    subscriptionInfo = { status: 'active' as const, daysRemaining: null, subscription: null, canSendMessages: true }
  }

  // If blocked, redirect to block screen
  if (subscriptionInfo.status === 'blocked') {
    redirect("/blocked")
  }

  // If no subscription at all, show pending handler
  // This handles the race condition where user returns from Stripe checkout
  // but the webhook hasn't synced the subscription yet
  if (subscriptionInfo.status === 'none') {
    return <CheckoutPendingHandler />
  }

  // Get user name from metadata or fallback to email prefix
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'

  // Check if user needs onboarding tour (no instances yet)
  let needsOnboarding = false
  try {
    needsOnboarding = await checkNeedsOnboarding(user.id)
  } catch (error) {
    // Don't show tour on error - graceful degradation
    console.error('[ONBOARDING] Failed to check onboarding status:', error)
  }

  return (
    <SidebarProvider>
      <AppSidebar user={{ name: userName, email: user.email || '' }} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <TrialBadge
            status={subscriptionInfo.status}
            daysRemaining={subscriptionInfo.daysRemaining}
          />
        </header>
        <main className="flex-1 p-4 pb-20 md:pb-4">
          {children}
        </main>
      </SidebarInset>
      <BottomNav />
      <TourProvider userId={user.id} needsOnboarding={needsOnboarding} />
    </SidebarProvider>
  )
}
