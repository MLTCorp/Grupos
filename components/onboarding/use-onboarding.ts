import { createClient } from '@/lib/supabase/server'

/**
 * Check if user needs onboarding tour.
 * Returns true if user has no WhatsApp instances connected.
 * Tour continues showing until user creates their first instance.
 */
export async function checkNeedsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check if user has any instances
  const { count, error } = await supabase
    .from('instances')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('[ONBOARDING] Error checking instances:', error)
    return false // Don't show tour on error
  }

  return count === 0
}
