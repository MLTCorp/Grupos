import { createClient } from '@/lib/supabase/server'

/**
 * Check if user needs onboarding tour.
 * Returns true if user has no WhatsApp instances connected.
 * Tour continues showing until user creates their first instance.
 *
 * Database structure:
 * - auth.users (auth_user_id)
 * - usuarios_sistema (auth_user_id → id_organizacao)
 * - instancias_whatsapp (id_organizacao)
 */
export async function checkNeedsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // First, get the user's organization
  const { data: userSystem, error: userError } = await supabase
    .from('usuarios_sistema')
    .select('id_organizacao')
    .eq('auth_user_id', userId)
    .single()

  if (userError || !userSystem?.id_organizacao) {
    console.error('[ONBOARDING] Error getting user organization:', userError)
    // If user doesn't have an organization yet, they definitely need onboarding
    return true
  }

  // Check if organization has any WhatsApp instances
  const { count, error: instanceError } = await supabase
    .from('instancias_whatsapp')
    .select('*', { count: 'exact', head: true })
    .eq('id_organizacao', userSystem.id_organizacao)

  if (instanceError) {
    console.error('[ONBOARDING] Error checking instances:', instanceError)
    return false // Don't show tour on error
  }

  return count === 0
}
