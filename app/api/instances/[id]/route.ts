import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteUAZAPIInstance } from '@/lib/uazapi/server'

/**
 * GET - Get single instance details
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

    // Get instance (verify it belongs to user's organization)
    const { data: instance, error: instanceError } = await supabase
      .from('instancias_whatsapp')
      .select('*')
      .eq('id', instanceId)
      .eq('id_organizacao', usuario.id_organizacao)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instancia nao encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ instance })
  } catch (error) {
    console.error('Instance get error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete instance
 * First deletes from UAZAPI, then from Supabase
 */
export async function DELETE(
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
      .select('id_organizacao, id')
      .eq('auth_user_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado no sistema' },
        { status: 404 }
      )
    }

    // Get instance (verify it belongs to user's organization)
    const { data: instance, error: instanceError } = await supabase
      .from('instancias_whatsapp')
      .select('*')
      .eq('id', instanceId)
      .eq('id_organizacao', usuario.id_organizacao)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instancia nao encontrada' },
        { status: 404 }
      )
    }

    // Log deletion event to history BEFORE delete (so it's captured)
    await supabase
      .from('historico_conexoes')
      .insert({
        instancia_id: instanceId,
        event_type: 'deleted',
        details: {
          deleted_by: usuario.id,
          nome_instancia: instance.nome_instancia,
        },
      })

    // Delete from UAZAPI if api_key exists
    if (instance.api_key) {
      try {
        const result = await deleteUAZAPIInstance(instance.api_key)

        if (!result.success) {
          console.warn('UAZAPI delete warning:', result.error)
          // Continue with deletion even if UAZAPI fails
        }
      } catch (e) {
        console.error('UAZAPI delete error:', e)
        // Continue with deletion even if UAZAPI fails
      }
    }

    // Soft delete from Supabase (set ativo = false)
    const { error: deleteError } = await supabase
      .from('instancias_whatsapp')
      .update({
        ativo: false,
        dt_update: new Date().toISOString(),
      })
      .eq('id', instanceId)

    if (deleteError) {
      console.error('Error deleting instance:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar instancia' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instance delete error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
