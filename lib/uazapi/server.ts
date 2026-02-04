/**
 * UAZAPI Server-side Functions
 *
 * These functions make direct calls to UAZAPI from server-side code.
 * Use these instead of making HTTP requests to /api/uazapi/* routes.
 */

import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'
const ADMIN_TOKEN = process.env.UAZAPI_API_KEY

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

interface UAZAPICreateInstanceRequest {
  name: string
  systemName: string
  adminField01?: string
}

interface UAZAPICreateInstanceResponse {
  instance: {
    token: string
    apikey: string
    name: string
    status: string
  }
}

interface UAZAPIDeleteInstanceResponse {
  success: boolean
  message?: string
}

/**
 * Create a new WhatsApp instance in UAZAPI
 */
export async function createUAZAPIInstance(
  data: UAZAPICreateInstanceRequest
): Promise<{ success: true; data: UAZAPICreateInstanceResponse } | { success: false; error: string }> {
  try {
    if (!ADMIN_TOKEN) {
      console.error('UAZAPI_API_KEY not configured')
      return { success: false, error: 'UAZAPI_API_KEY nao configurado' }
    }

    const response = await fetch(`${BASE_URL}/instance/init`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      body: JSON.stringify(data),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Error:', response.status, errorText)
      return { success: false, error: `Erro UAZAPI: ${response.status}` }
    }

    const responseData = await response.json()
    return { success: true, data: responseData }
  } catch (error) {
    console.error('createUAZAPIInstance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar instancia',
    }
  }
}

/**
 * Delete a WhatsApp instance from UAZAPI
 */
export async function deleteUAZAPIInstance(
  token: string
): Promise<{ success: true; data: UAZAPIDeleteInstanceResponse } | { success: false; error: string }> {
  try {
    if (!ADMIN_TOKEN) {
      console.error('UAZAPI_API_KEY not configured')
      return { success: false, error: 'UAZAPI_API_KEY nao configurado' }
    }

    const response = await fetch(`${BASE_URL}/instance/delete/${token}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Delete Error:', response.status, errorText)
      return { success: false, error: `Erro UAZAPI: ${response.status}` }
    }

    const responseData = await response.json()
    return { success: true, data: responseData }
  } catch (error) {
    console.error('deleteUAZAPIInstance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar instancia',
    }
  }
}
