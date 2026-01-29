/**
 * MCP API Key Authentication
 * Provides authentication utilities for MCP endpoints
 */

/**
 * Extract API key from request headers
 * Supports: x-api-key header (MCP-13 requirement)
 */
export function getApiKeyFromHeaders(headers: Headers): string | null {
  return headers.get('x-api-key')
}

/**
 * Validate API key against stored keys
 * For now: Check against MCP_API_KEY environment variable
 * Future: Could validate against per-organization keys in database
 */
export async function isValidApiKey(apiKey: string): Promise<boolean> {
  const validKey = process.env.MCP_API_KEY
  if (!validKey) {
    console.warn('MCP_API_KEY not configured')
    return false
  }
  return apiKey === validKey
}

/**
 * Get organization ID from API key (future use)
 * For now returns null - all valid keys have same access
 */
export async function getOrgIdFromApiKey(apiKey: string): Promise<number | null> {
  // Future: Query database for org associated with this key
  return null
}
