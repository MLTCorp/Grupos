'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstanceCard, type Instance } from './instance-card'

interface InstanceListProps {
  instances: Instance[]
  onConnect: (instance: Instance) => void
  onDisconnect: (instance: Instance) => void
  onDelete: (instance: Instance) => void
  onStatusChange?: (instance: Instance, newStatus: string) => void
  onAddClick?: () => void
}

export function InstanceList({
  instances,
  onConnect,
  onDisconnect,
  onDelete,
  onStatusChange,
  onAddClick,
}: InstanceListProps) {
  // Empty state
  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhuma instancia conectada
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          Adicione sua primeira instancia WhatsApp para comecar a gerenciar seus grupos.
        </p>
        {onAddClick && (
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar instancia
          </Button>
        )}
      </div>
    )
  }

  // Grid layout: 1 col mobile, 2 cols md, 3 cols lg
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {instances.map((instance) => (
        <InstanceCard
          key={instance.id}
          instance={instance}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
