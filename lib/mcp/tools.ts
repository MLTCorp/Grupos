/**
 * MCP Tool Definitions
 * Following the Model Context Protocol specification (modelcontextprotocol.io)
 */

/**
 * MCP Tool Definition following modelcontextprotocol.io spec
 */
export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required?: string[]
  }
}

/**
 * Phase 4 MCP Tools (MCP-01, MCP-07)
 * Additional tools will be added in later phases
 */
export const mcpTools: MCPTool[] = [
  {
    name: 'get_instance_status',
    description: 'Obtem status atual da instancia WhatsApp incluindo conexao, numero de telefone e informacoes do perfil',
    inputSchema: {
      type: 'object',
      properties: {
        instance_id: {
          type: 'string',
          description: 'ID da instancia WhatsApp (numero do ID na tabela instancias_whatsapp)'
        }
      },
      required: ['instance_id']
    }
  },
  {
    name: 'configure_webhook',
    description: 'Configura webhook N8N para uma instancia WhatsApp. Usado para habilitar o recebimento de mensagens e eventos.',
    inputSchema: {
      type: 'object',
      properties: {
        instance_id: {
          type: 'string',
          description: 'ID da instancia WhatsApp'
        }
      },
      required: ['instance_id']
    }
  }
]

/**
 * Get all available tools
 * Future: Could filter by organization permissions
 */
export function getAvailableTools(): MCPTool[] {
  return mcpTools
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): MCPTool | undefined {
  return mcpTools.find(t => t.name === name)
}
