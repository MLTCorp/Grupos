import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUAZAPIInstance, deleteUAZAPIInstance } from '@/lib/uazapi/server'

// Types for instancias_whatsapp table
interface Instance {
  id: number
  nome_instancia: string
  api_key: string | null
  api_url: string | null
  status: string | null
  numero_telefone: string | null
  profile_name: string | null
  profile_pic_url: string | null
  webhook_url: string | null
  is_business: boolean | null
  platform: string | null
  last_disconnect_at: string | null
  last_disconnect_reason: string | null
  ativo: boolean | null
  dt_create: string | null
  dt_update: string | null
  id_organizacao: number
}

/**
 * GET - List instances for current user's organization
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Get user's organization from usuarios_sistema
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_sistema')
      .select('id_organizacao')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      console.error('Error getting user organization:', usuarioError)
      return NextResponse.json(
        { error: 'Usuario nao encontrado no sistema' },
        { status: 404 }
      )
    }

    // Get instances for the organization
    const { data: instances, error: instancesError } = await supabase
      .from('instancias_whatsapp')
      .select('*')
      .eq('id_organizacao', usuario.id_organizacao)
      .eq('ativo', true)
      .order('dt_create', { ascending: false })

    if (instancesError) {
      console.error('Error fetching instances:', instancesError)
      return NextResponse.json(
        { error: 'Erro ao buscar instancias' },
        { status: 500 }
      )
    }

    return NextResponse.json({ instances: instances || [] })
  } catch (error) {
    console.error('Instances list error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new instance
 * Body: { nome_instancia: string }
 */
export async function POST(request: NextRequest) {
  try {
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
    let body: { nome_instancia: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON invalido no corpo da requisicao' },
        { status: 400 }
      )
    }

    const { nome_instancia } = body

    // Validate name (3-50 chars)
    if (!nome_instancia || nome_instancia.length < 3 || nome_instancia.length > 50) {
      return NextResponse.json(
        { error: 'Nome da instancia deve ter entre 3 e 50 caracteres' },
        { status: 400 }
      )
    }

    // Get user's organization
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_sistema')
      .select('id_organizacao, id')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      console.error('Error getting user organization:', usuarioError)
      return NextResponse.json(
        { error: 'Usuario nao encontrado no sistema' },
        { status: 404 }
      )
    }

    // Check instance limit from organization's plan_limits
    const { data: org, error: orgError } = await supabase
      .from('organizacoes')
      .select('plan_limits')
      .eq('id', usuario.id_organizacao)
      .single()

    if (orgError) {
      console.error('Error getting organization:', orgError)
    }

    // Count current instances
    const { count, error: countError } = await supabase
      .from('instancias_whatsapp')
      .select('*', { count: 'exact', head: true })
      .eq('id_organizacao', usuario.id_organizacao)
      .eq('ativo', true)

    if (countError) {
      console.error('Error counting instances:', countError)
    }

    // Check limit (default to 1 if not set)
    const planLimits = org?.plan_limits as { instances?: number } | null
    const maxInstances = planLimits?.instances ?? 1
    const currentCount = count ?? 0

    if (currentCount >= maxInstances) {
      return NextResponse.json(
        {
          error: 'Limite de instancias atingido',
          limit: maxInstances,
          current: currentCount
        },
        { status: 403 }
      )
    }

    // Generate unique name for UAZAPI (org_id + sanitized name)
    const sanitizedName = nome_instancia
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
    const uazapiName = `org${usuario.id_organizacao}-${sanitizedName}-${Date.now()}`

    // Create instance in UAZAPI first
    const uazapiResult = await createUAZAPIInstance({
      name: uazapiName,
      systemName: 'sincron-grupos',
      adminField01: String(usuario.id_organizacao),
    })

    if (!uazapiResult.success) {
      console.error('UAZAPI create error:', uazapiResult.error)
      return NextResponse.json(
        { error: 'Erro ao criar instancia na UAZAPI' },
        { status: 500 }
      )
    }

    const apiKey = uazapiResult.data.instance?.token || uazapiResult.data.instance?.apikey

    if (!apiKey) {
      console.error('No token in UAZAPI response:', uazapiResult.data)
      return NextResponse.json(
        { error: 'Token nao recebido da UAZAPI' },
        { status: 500 }
      )
    }

    // Insert into Supabase
    const { data: newInstance, error: insertError } = await supabase
      .from('instancias_whatsapp')
      .insert({
        nome_instancia,
        api_key: apiKey,
        id_organizacao: usuario.id_organizacao,
        status: 'desconectado',
        ativo: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting instance:', insertError)
      // Try to delete from UAZAPI since Supabase insert failed
      try {
        await deleteUAZAPIInstance(apiKey)
      } catch (e) {
        console.error('Failed to cleanup UAZAPI instance:', e)
      }
      return NextResponse.json(
        { error: 'Erro ao salvar instancia no banco de dados' },
        { status: 500 }
      )
    }

    // Log creation event to history
    await supabase
      .from('historico_conexoes')
      .insert({
        instancia_id: newInstance.id,
        event_type: 'created',
        details: { created_by: usuario.id, nome_instancia },
      })

    return NextResponse.json({ instance: newInstance }, { status: 201 })
  } catch (error) {
    console.error('Instance creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
