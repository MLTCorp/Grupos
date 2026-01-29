'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  InstanceList,
  QRCodeModal,
  AddInstanceDialog,
  DeleteInstanceDialog,
  DisconnectBanner,
  type Instance,
} from '@/components/instances'
import { usePolling } from '@/lib/hooks/use-polling'
import { showSuccess, showError } from '@/lib/toast'

const POLLING_INTERVAL = 30000 // 30 seconds
const MAX_RETRIES = 3

// Track retry attempts per instance
type RetryMap = Map<number, number>

export default function InstancesPage() {
  // Instance state
  const [instances, setInstances] = useState<Instance[]>([])
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)

  // Dialog states
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Tracking state
  const [previousStatuses, setPreviousStatuses] = useState<Map<number, string>>(new Map())
  const [disconnectedInstances, setDisconnectedInstances] = useState<Instance[]>([])
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // Retry tracking
  const retryMapRef = useRef<RetryMap>(new Map())

  // Fetch instances list from internal API
  const fetchInstances = useCallback(async () => {
    const response = await fetch('/api/instances')
    if (!response.ok) {
      throw new Error('Falha ao carregar instancias')
    }
    const data = await response.json()
    return data.instances as Instance[]
  }, [])

  // Initial load
  useEffect(() => {
    const loadInstances = async () => {
      try {
        const data = await fetchInstances()
        setInstances(data)
        // Initialize previous statuses
        const statusMap = new Map<number, string>()
        data.forEach((inst: Instance) => {
          statusMap.set(inst.id, inst.status || 'desconectado')
        })
        setPreviousStatuses(statusMap)
        setPageError(null)
      } catch (err) {
        console.error('Failed to load instances:', err)
        setPageError('Nao foi possivel carregar as instancias. Tente novamente.')
      } finally {
        setPageLoading(false)
      }
    }

    loadInstances()
  }, [fetchInstances])

  // Fetch status for a single instance with retry logic
  const fetchInstanceStatus = useCallback(async (instance: Instance): Promise<Instance | null> => {
    if (!instance.api_key) return instance

    const retries = retryMapRef.current.get(instance.id) || 0

    try {
      const response = await fetch(`/api/uazapi/instances/${instance.api_key}/status`)
      if (!response.ok) {
        throw new Error('Status check failed')
      }

      const data = await response.json()
      const extractedStatus = data.extractedStatus || {}

      // Reset retry count on success
      retryMapRef.current.set(instance.id, 0)

      // Build updated instance
      const updatedInstance: Instance = {
        ...instance,
        status: extractedStatus.connected ? 'conectado' : 'desconectado',
        numero_telefone: extractedStatus.number || instance.numero_telefone,
        profile_name: extractedStatus.pushName || instance.profile_name,
        profile_pic_url: extractedStatus.profilePicUrl || instance.profile_pic_url,
        is_business: extractedStatus.isBusiness ?? instance.is_business,
        platform: extractedStatus.platform || instance.platform,
        dt_update: new Date().toISOString(),
      }

      return updatedInstance
    } catch (err) {
      console.error(`Status check failed for ${instance.nome_instancia}:`, err)

      // Increment retry count
      const newRetries = retries + 1
      retryMapRef.current.set(instance.id, newRetries)

      // After MAX_RETRIES, mark as error state
      if (newRetries >= MAX_RETRIES) {
        return {
          ...instance,
          status: 'erro',
          last_disconnect_reason: 'Erro ao verificar status',
          dt_update: new Date().toISOString(),
        }
      }

      // Return unchanged for retry
      return instance
    }
  }, [])

  // Auto-configure webhook when connected for the first time
  const configureWebhook = useCallback(async (instance: Instance) => {
    if (!instance.api_key || instance.webhook_url) return

    try {
      const response = await fetch(`/api/uazapi/instances/${instance.api_key}/webhook`, {
        method: 'POST',
      })

      if (response.ok) {
        console.log(`Webhook configured for ${instance.nome_instancia}`)
        // Update local state to reflect webhook is now set
        setInstances(prev => prev.map(inst =>
          inst.id === instance.id
            ? { ...inst, webhook_url: 'configured' }
            : inst
        ))
      }
    } catch (err) {
      // Non-blocking - don't fail the connection flow
      console.error(`Webhook config failed for ${instance.nome_instancia}:`, err)
    }
  }, [])

  // Status polling function
  const pollStatuses = useCallback(async () => {
    if (instances.length === 0) return instances

    const updatedInstances = await Promise.all(
      instances.map(async (instance) => {
        const updated = await fetchInstanceStatus(instance)
        return updated || instance
      })
    )

    // Detect status changes
    const newDisconnected: Instance[] = []

    updatedInstances.forEach((instance) => {
      const prevStatus = previousStatuses.get(instance.id)
      const newStatus = instance.status || 'desconectado'

      // Check for unexpected disconnection
      if (prevStatus === 'conectado' && newStatus === 'desconectado') {
        newDisconnected.push(instance)
        showError(`${instance.nome_instancia} foi desconectada`)
      }

      // Auto-configure webhook on first connection
      if (prevStatus !== 'conectado' && newStatus === 'conectado' && !instance.webhook_url) {
        configureWebhook(instance)
      }
    })

    // Update previous statuses
    const newStatusMap = new Map<number, string>()
    updatedInstances.forEach((inst) => {
      newStatusMap.set(inst.id, inst.status || 'desconectado')
    })
    setPreviousStatuses(newStatusMap)

    // Add new disconnected instances to banner (if not dismissed)
    if (newDisconnected.length > 0 && !bannerDismissed) {
      setDisconnectedInstances(prev => {
        const existing = new Set(prev.map(i => i.id))
        const toAdd = newDisconnected.filter(i => !existing.has(i.id))
        return [...prev, ...toAdd]
      })
    }

    setInstances(updatedInstances)
    return updatedInstances
  }, [instances, previousStatuses, bannerDismissed, fetchInstanceStatus, configureWebhook])

  // Use polling hook for status updates
  usePolling(pollStatuses, {
    interval: POLLING_INTERVAL,
    enabled: instances.length > 0 && !pageLoading,
    onError: (err) => {
      console.error('Polling error:', err)
    },
  })

  // Event handlers
  const handleConnect = useCallback((instance: Instance) => {
    setSelectedInstance(instance)
    setQrModalOpen(true)
  }, [])

  const handleDisconnect = useCallback(async (instance: Instance) => {
    if (!instance.api_key) return

    // Optimistic update
    setInstances(prev => prev.map(inst =>
      inst.id === instance.id
        ? { ...inst, status: 'desconectando' }
        : inst
    ))

    try {
      const response = await fetch(`/api/uazapi/instances/${instance.api_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      })

      if (!response.ok) {
        throw new Error('Disconnect failed')
      }

      // Log disconnection event
      await fetch(`/api/instances/${instance.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'disconnected' }),
      }).catch(console.error)

      // Update state
      setInstances(prev => prev.map(inst =>
        inst.id === instance.id
          ? { ...inst, status: 'desconectado', dt_update: new Date().toISOString() }
          : inst
      ))

      showSuccess(`${instance.nome_instancia} desconectada`)
    } catch (err) {
      console.error('Disconnect error:', err)
      showError('Erro ao desconectar instancia')

      // Revert optimistic update
      setInstances(prev => prev.map(inst =>
        inst.id === instance.id
          ? { ...inst, status: instance.status }
          : inst
      ))
    }
  }, [])

  const handleDelete = useCallback((instance: Instance) => {
    setSelectedInstance(instance)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedInstance) return

    // Remove from list
    setInstances(prev => prev.filter(inst => inst.id !== selectedInstance.id))
    showSuccess(`${selectedInstance.nome_instancia} excluida`)

    // Clean up tracking
    setPreviousStatuses(prev => {
      const newMap = new Map(prev)
      newMap.delete(selectedInstance.id)
      return newMap
    })

    setSelectedInstance(null)
  }, [selectedInstance])

  const handleAddSuccess = useCallback((newInstance: Instance) => {
    setInstances(prev => [...prev, newInstance])
    setPreviousStatuses(prev => {
      const newMap = new Map(prev)
      newMap.set(newInstance.id, 'desconectado')
      return newMap
    })
    showSuccess(`${newInstance.nome_instancia} criada com sucesso`)
  }, [])

  const handleConnected = useCallback(async () => {
    // Refresh instances to get updated status
    try {
      const data = await fetchInstances()
      setInstances(data)

      // Update previous statuses
      const statusMap = new Map<number, string>()
      data.forEach((inst: Instance) => {
        statusMap.set(inst.id, inst.status || 'desconectado')
      })
      setPreviousStatuses(statusMap)

      // Remove from disconnected list if reconnected
      if (selectedInstance) {
        setDisconnectedInstances(prev =>
          prev.filter(inst => inst.id !== selectedInstance.id)
        )
      }

      showSuccess('Conectado com sucesso!')
    } catch (err) {
      console.error('Failed to refresh after connect:', err)
    }
  }, [fetchInstances, selectedInstance])

  const handleReconnect = useCallback((instance: Instance) => {
    // Remove from disconnected list
    setDisconnectedInstances(prev =>
      prev.filter(inst => inst.id !== instance.id)
    )
    // Open QR modal
    handleConnect(instance)
  }, [handleConnect])

  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true)
    setDisconnectedInstances([])
  }, [])

  const handleRetryLoad = useCallback(async () => {
    setPageLoading(true)
    setPageError(null)
    try {
      const data = await fetchInstances()
      setInstances(data)
      const statusMap = new Map<number, string>()
      data.forEach((inst: Instance) => {
        statusMap.set(inst.id, inst.status || 'desconectado')
      })
      setPreviousStatuses(statusMap)
    } catch (err) {
      console.error('Retry failed:', err)
      setPageError('Nao foi possivel carregar as instancias. Tente novamente.')
    } finally {
      setPageLoading(false)
    }
  }, [fetchInstances])

  // Reset banner dismissed when new disconnects happen
  useEffect(() => {
    if (disconnectedInstances.length > 0) {
      setBannerDismissed(false)
    }
  }, [disconnectedInstances.length])

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Instancias WhatsApp
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas conexoes WhatsApp
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Disconnect Banner */}
      {!bannerDismissed && (
        <DisconnectBanner
          disconnectedInstances={disconnectedInstances}
          onReconnect={handleReconnect}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Page Loading State */}
      {pageLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Error State */}
      {!pageLoading && pageError && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-sm text-destructive mb-4">{pageError}</p>
          <Button onClick={handleRetryLoad} variant="outline">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Instance List */}
      {!pageLoading && !pageError && (
        <InstanceList
          instances={instances}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onDelete={handleDelete}
          onAddClick={() => setAddDialogOpen(true)}
        />
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        instance={selectedInstance}
        onConnected={handleConnected}
      />

      {/* Add Instance Dialog */}
      <AddInstanceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Instance Dialog */}
      <DeleteInstanceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        instance={selectedInstance}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
