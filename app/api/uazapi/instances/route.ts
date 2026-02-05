import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'
const ADMIN_TOKEN = process.env.UAZAPI_API_KEY

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

/**
 * GET - List all WhatsApp instances with status
 * Uses /instance/all endpoint which returns all instances with current status
 * Much more efficient than polling each instance individually
 */
export async function GET() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('UAZAPI_API_KEY not configured')
      return NextResponse.json(
        { error: 'UAZAPI_API_KEY nao configurado' },
        { status: 500 }
      )
    }

    const response = await fetch(`${BASE_URL}/instance/all`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro UAZAPI: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ instances: data })
  } catch (error) {
    console.error('Instance list error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new WhatsApp instance
 * Requires admintoken header for UAZAPI
 * Body: { name, systemName, adminField01? }
 */
export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      console.error('UAZAPI_API_KEY not configured')
      return NextResponse.json(
        { error: 'UAZAPI_API_KEY nao configurado' },
        { status: 500 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      console.error('Failed to parse request body')
      return NextResponse.json(
        { error: 'JSON invalido no corpo da requisicao' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE_URL}/instance/init`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      body: JSON.stringify(body),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro UAZAPI: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Instance creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
