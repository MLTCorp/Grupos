import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Valid event types for history
type EventType = 'connected' | 'disconnected' | 'created' | 'deleted' | 'error'

/**
 * GET - Return last 5 connection events for instance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const instanceId = parseInt(id, 10)

    if (isNaN(instanceId)) {
      return NextResponse.json(
        { error: 'ID de instancia invalido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_sistema')
      .select('id_organizacao')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado no sistema' },
        { status: 404 }
      )
    }

    // Verify instance belongs to user's organization
    const { data: instance, error: instanceError } = await supabase
      .from('instancias_whatsapp')
      .select('id')
      .eq('id', instanceId)
      .eq('id_organizacao', usuario.id_organizacao)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instancia nao encontrada' },
        { status: 404 }
      )
    }

    // Get last 5 history events
    const { data: history, error: historyError } = await supabase
      .from('historico_conexoes')
      .select('*')
      .eq('instancia_id', instanceId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (historyError) {
      console.error('Error fetching history:', historyError)
      return NextResponse.json(
        { error: 'Erro ao buscar historico' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('Instance history get error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST - Add new history event
 * Body: { event_type: EventType, details?: object }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const instanceId = parseInt(id, 10)

    if (isNaN(instanceId)) {
      return NextResponse.json(
        { error: 'ID de instancia invalido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: { event_type: EventType; details?: Record<string, unknown> }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON invalido no corpo da requisicao' },
        { status: 400 }
      )
    }

    const { event_type, details } = body

    // Validate event type
    const validEventTypes: EventType[] = ['connected', 'disconnected', 'created', 'deleted', 'error']
    if (!event_type || !validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Tipo de evento invalido. Use: connected, disconnected, created, deleted, error' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_sistema')
      .select('id_organizacao')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado no sistema' },
        { status: 404 }
      )
    }

    // Verify instance belongs to user's organization
    const { data: instance, error: instanceError } = await supabase
      .from('instancias_whatsapp')
      .select('id')
      .eq('id', instanceId)
      .eq('id_organizacao', usuario.id_organizacao)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instancia nao encontrada' },
        { status: 404 }
      )
    }

    // Insert history event
    const { data: historyEvent, error: insertError } = await supabase
      .from('historico_conexoes')
      .insert({
        instancia_id: instanceId,
        event_type,
        details: details || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting history:', insertError)
      return NextResponse.json(
        { error: 'Erro ao registrar evento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event: historyEvent }, { status: 201 })
  } catch (error) {
    console.error('Instance history post error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
