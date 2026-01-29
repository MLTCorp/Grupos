import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'grace_period'
  | 'blocked'
  | 'none'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  daysRemaining: number | null
  subscription: any | null
  canSendMessages: boolean
}

// Used by webhooks (admin context)
export async function syncSubscription(subscription: Stripe.Subscription) {
  const supabase = createServiceClient()

  const userId = subscription.metadata.user_id
  console.log('[SYNC] user_id from metadata:', userId)

  if (!userId) {
    console.error('[SYNC ERROR] No user_id in subscription metadata')
    return
  }

  // Get period dates from the first subscription item (new Stripe API structure)
  const firstItem = subscription.items.data[0]
  const currentPeriodStart = firstItem?.current_period_start
  const currentPeriodEnd = firstItem?.current_period_end

  const { error } = await supabase.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: firstItem?.price.id,
    quantity: firstItem?.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    current_period_start: currentPeriodStart
      ? new Date(currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })

  if (error) {
    console.error('[SYNC ERROR] Failed to upsert subscription:', error)
  } else {
    console.log('[SYNC SUCCESS] Subscription saved for user:', userId)

    // Sync billing info to organization
    const stripeCustomerId = subscription.customer as string
    await syncOrganizationBilling(supabase, userId, stripeCustomerId, subscription)
  }
}

// Sync billing info to organizacoes table
async function syncOrganizationBilling(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  stripeCustomerId: string,
  subscription: Stripe.Subscription
) {
  // Get user's organization
  const { data: userSistema } = await supabase
    .from('usuarios_sistema')
    .select('id_organizacao')
    .eq('auth_user_id', userId)
    .single()

  if (!userSistema?.id_organizacao) {
    console.error('[SYNC ORG] User has no organization:', userId)
    return
  }

  // Update organization with billing info
  const { error } = await supabase.from('organizacoes').update({
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null
  }).eq('id', userSistema.id_organizacao)

  if (error) {
    console.error('[SYNC ORG ERROR] Failed to update organization:', error)
  } else {
    console.log('[SYNC ORG SUCCESS] Organization updated:', userSistema.id_organizacao)
  }
}

// Used by webhooks (admin context)
export async function createCustomerRecord(userId: string, stripeCustomerId: string) {
  const supabase = createServiceClient()

  await supabase.from('customers').upsert({
    id: userId,
    stripe_customer_id: stripeCustomerId,
  })
}

// Used by app (user context)
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due', 'canceled'])
    .order('created', { ascending: false })
    .limit(1)
    .single()

  if (!sub) {
    return { status: 'none', daysRemaining: null, subscription: null, canSendMessages: false }
  }

  const now = new Date()

  // Active subscription
  if (sub.status === 'active') {
    return { status: 'active', daysRemaining: null, subscription: sub, canSendMessages: true }
  }

  // In trial
  if (sub.status === 'trialing' && sub.trial_end) {
    const trialEnd = new Date(sub.trial_end)
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      status: 'trialing',
      daysRemaining: Math.max(0, daysRemaining),
      subscription: sub,
      canSendMessages: true
    }
  }

  // Grace period (7 days after trial/subscription end) - per CONTEXT.md
  if (sub.status === 'past_due' || sub.status === 'canceled') {
    const endDate = new Date(sub.current_period_end || sub.trial_end)
    const gracePeriodEnd = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (now < gracePeriodEnd) {
      const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: 'grace_period',
        daysRemaining,
        subscription: sub,
        canSendMessages: false // Per CONTEXT.md: can view but not send during grace
      }
    }
  }

  return { status: 'blocked', daysRemaining: 0, subscription: sub, canSendMessages: false }
}
