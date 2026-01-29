import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyFromHeaders, isValidApiKey } from '@/lib/mcp/auth'
import { getAvailableTools } from '@/lib/mcp/tools'

/**
 * GET /api/mcp - MCP Discovery Endpoint
 *
 * Returns list of available MCP tools.
 * Requires x-api-key header for authentication (MCP-13).
 *
 * Response format follows MCP protocol:
 * {
 *   tools: MCPTool[]
 * }
 */
export async function GET(request: NextRequest) {
  // Extract and validate API key
  const apiKey = getApiKeyFromHeaders(request.headers)

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required', code: 'MISSING_API_KEY' },
      { status: 401 }
    )
  }

  const isValid = await isValidApiKey(apiKey)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid API key', code: 'INVALID_API_KEY' },
      { status: 401 }
    )
  }

  // Return available tools
  const tools = getAvailableTools()

  return NextResponse.json({
    tools,
    _meta: {
      version: '1.0',
      protocol: 'mcp',
      toolCount: tools.length
    }
  })
}
