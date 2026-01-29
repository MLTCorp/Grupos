'use client'

import { X, AlertTriangle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { Instance } from './instance-card'

interface DisconnectBannerProps {
  disconnectedInstances: Instance[]
  onReconnect: (instance: Instance) => void
  onDismiss: () => void
}

/**
 * Persistent banner that appears when instances are unexpectedly disconnected.
 *
 * Per CONTEXT.md: "Desconexao inesperada: toast + card atualiza + banner persistente"
 *
 * Only shows if there are disconnected instances that were previously connected.
 * Banner stays visible until user reconnects or dismisses.
 */
export function DisconnectBanner({
  disconnectedInstances,
  onReconnect,
  onDismiss,
}: DisconnectBannerProps) {
  // Don't render if no disconnected instances
  if (disconnectedInstances.length === 0) {
    return null
  }

  const count = disconnectedInstances.length
  const isSingle = count === 1

  return (
    <Alert
      variant="default"
      className="relative mb-4 bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-yellow-500">
        {count} instancia{isSingle ? '' : 's'} desconectada{isSingle ? '' : 's'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          {/* List of disconnected instances */}
          <ul className="list-none space-y-1">
            {disconnectedInstances.map((instance) => (
              <li
                key={instance.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {instance.nome_instancia}
                  {instance.last_disconnect_reason && (
                    <span className="text-xs ml-2 opacity-70">
                      ({instance.last_disconnect_reason})
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReconnect(instance)}
                  className="h-7 text-xs border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-500"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconectar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>

      {/* Dismiss button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-yellow-500/10"
        onClick={onDismiss}
        aria-label="Fechar alerta"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
