'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

interface HistoryEvent {
  id: number
  instancia_id: number
  event_type: 'connected' | 'disconnected' | 'created' | 'deleted' | 'error'
  details: Record<string, unknown> | null
  created_at: string
}

interface InstanceHistoryProps {
  instanceId: number
  expanded?: boolean
}

// Event type configuration
const EVENT_CONFIG = {
  connected: {
    label: 'Conectado',
    icon: CheckCircle,
    className: 'text-green-500',
  },
  disconnected: {
    label: 'Desconectado',
    icon: XCircle,
    className: 'text-red-500',
  },
  created: {
    label: 'Criado',
    icon: Plus,
    className: 'text-blue-500',
  },
  deleted: {
    label: 'Deletado',
    icon: Trash2,
    className: 'text-gray-500',
  },
  error: {
    label: 'Erro',
    icon: AlertTriangle,
    className: 'text-yellow-500',
  },
}

// Format relative time in Portuguese
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins} min atras`
  if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atras`
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atras`
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function InstanceHistory({ instanceId, expanded = false }: InstanceHistoryProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    // Only fetch when expanded and not yet fetched
    if (!expanded || hasFetched) return

    async function fetchHistory() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/instances/${instanceId}/history`)
        if (!response.ok) {
          throw new Error('Falha ao carregar historico')
        }

        const data = await response.json()
        setHistory(data.history || [])
        setHasFetched(true)
      } catch (err) {
        console.error('History fetch error:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [instanceId, expanded, hasFetched])

  // Reset fetch state when instanceId changes
  useEffect(() => {
    setHasFetched(false)
    setHistory([])
  }, [instanceId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-xs text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-destructive">{error}</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-muted-foreground">Nenhum evento registrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 pt-2">
      {history.map((event) => {
        const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.error
        const Icon = config.icon

        return (
          <div
            key={event.id}
            className="flex items-start gap-2 text-xs"
          >
            <Icon className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${config.className}`} />
            <div className="flex-1 min-w-0">
              <span className="font-medium">{config.label}</span>
              {event.details && typeof event.details === 'object' && (
                <span className="text-muted-foreground ml-1">
                  {(event.details as { reason?: string }).reason ||
                   (event.details as { nome_instancia?: string }).nome_instancia ||
                   ''}
                </span>
              )}
            </div>
            <span className="text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(event.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
