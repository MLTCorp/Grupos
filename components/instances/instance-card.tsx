'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Smartphone,
  Clock,
  QrCode,
  Power,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { InstanceHistory } from './instance-history'

// Instance type matching database schema
export interface Instance {
  id: number
  nome_instancia: string
  api_key: string | null
  status: string | null
  numero_telefone: string | null
  profile_name: string | null
  profile_pic_url: string | null
  webhook_url: string | null
  is_business: boolean | null
  platform: string | null
  last_disconnect_at: string | null
  last_disconnect_reason: string | null
  dt_update: string | null
}

interface InstanceCardProps {
  instance: Instance
  onConnect: (instance: Instance) => void
  onDisconnect: (instance: Instance) => void
  onDelete: (instance: Instance) => void
  onStatusChange?: (instance: Instance, newStatus: string) => void
}

// Status configuration
const STATUS_CONFIG = {
  conectado: {
    label: 'Conectado',
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600',
  },
  desconectado: {
    label: 'Desconectado',
    variant: 'secondary' as const,
    className: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  conectando: {
    label: 'Conectando',
    variant: 'outline' as const,
    className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
  desconectando: {
    label: 'Desconectando...',
    variant: 'outline' as const,
    className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
  erro: {
    label: 'Erro',
    variant: 'destructive' as const,
    className: 'bg-destructive hover:bg-destructive/90',
  },
}

// Format phone number for display
function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '-'
  // Format: +55 11 99999-9999
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  }
  return phone
}

// Format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins} min atras`
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`
  return date.toLocaleDateString('pt-BR')
}

export function InstanceCard({
  instance,
  onConnect,
  onDisconnect,
  onDelete,
}: InstanceCardProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const status = (instance.status || 'desconectado') as keyof typeof STATUS_CONFIG
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.desconectado
  const isConnected = status === 'conectado'
  const isConnecting = status === 'conectando'
  const isDisconnecting = status === 'desconectando'
  const isError = status === 'erro'

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await onConnect(instance)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await onDisconnect(instance)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold truncate">
            {instance.nome_instancia}
          </CardTitle>
          <Badge
            variant={statusConfig.variant}
            className={statusConfig.className}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Phone number */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {instance.profile_name || formatPhoneNumber(instance.numero_telefone)}
          </span>
        </div>

        {/* Last activity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>
            Atualizado {formatRelativeTime(instance.dt_update)}
          </span>
        </div>

        {/* Error/Disconnect reason if applicable */}
        {!isConnected && instance.last_disconnect_reason && (
          <div className="flex items-start gap-2 mt-2">
            <RefreshCw className={`h-3 w-3 mt-0.5 flex-shrink-0 ${isError ? 'text-destructive' : 'text-red-400'}`} />
            <p className={`text-xs ${isError ? 'text-destructive' : 'text-red-400'}`}>
              {instance.last_disconnect_reason}
            </p>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
        {/* Connect button - show when not connected, not connecting, not disconnecting */}
        {!isConnected && !isConnecting && !isDisconnecting && (
          <Button
            size="sm"
            variant="default"
            onClick={handleConnect}
            disabled={isLoading}
          >
            <QrCode className="h-4 w-4 mr-1" />
            {isError ? 'Reconectar' : 'Conectar'}
          </Button>
        )}

        {/* Disconnect button - show when connected or connecting */}
        {(isConnected || isConnecting) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisconnect}
            disabled={isLoading || isDisconnecting}
          >
            <Power className="h-4 w-4 mr-1" />
            Desconectar
          </Button>
        )}

        {/* Delete button - always visible */}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(instance)}
          disabled={isLoading || isDisconnecting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>

      {/* History collapsible */}
      <Collapsible
        open={historyExpanded}
        onOpenChange={setHistoryExpanded}
        className="border-t"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between rounded-none rounded-b-xl"
          >
            <span className="text-xs text-muted-foreground">
              Historico de conexao
            </span>
            {historyExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          <InstanceHistory instanceId={instance.id} expanded={historyExpanded} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
