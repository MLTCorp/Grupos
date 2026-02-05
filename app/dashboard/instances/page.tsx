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

// UAZAPI instance status from /instance/all endpoint
interface UazapiInstance {
  id: string
  name: string
  token: string
  status: 'connected' | 'disconnected' | 'connecting'
  profileName?: string
  profilePicUrl?: string
  isBusiness?: boolean
  plataform?: string
  lastDisconnect?: string
  lastDisconnectReason?: string
}

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

  // Track consecutive polling failures
  const pollFailuresRef = useRef(0)
  const MAX_POLL_FAILURES = 3

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

  // Fetch all instance statuses from UAZAPI in a single request
  const fetchAllStatuses = useCallback(async (): Promise<Map<string, UazapiInstance>> => {
    const response = await fetch('/api/uazapi/instances')
    if (!response.ok) {
      throw new Error('Failed to fetch statuses')
    }
    const data = await response.json()
    const uazapiInstances: UazapiInstance[] = data.instances || []

    // Create map by token for quick lookup
    const statusMap = new Map<string, UazapiInstance>()
    uazapiInstances.forEach(inst => {
      statusMap.set(inst.token, inst)
    })
    return statusMap
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

  // Memoize polling error handler to prevent infinite re-renders
  const handlePollingError = useCallback((err: Error) => {
    console.error('Polling error:', err)
  }, [])

  // Status polling function - single request for all instances
  const pollStatuses = useCallback(async () => {
    if (instances.length === 0) return instances

    try {
      // Single request to get all statuses
      const statusMap = await fetchAllStatuses()
      pollFailuresRef.current = 0

      // Merge UAZAPI status with our instances
      const updatedInstances = instances.map((instance): Instance => {
        if (!instance.api_key) return instance

        const uazapiStatus = statusMap.get(instance.api_key)
        if (!uazapiStatus) return instance

        const isConnected = uazapiStatus.status === 'connected'
        return {
          ...instance,
          status: isConnected ? 'conectado' : 'desconectado',
          profile_name: uazapiStatus.profileName || instance.profile_name,
          profile_pic_url: uazapiStatus.profilePicUrl || instance.profile_pic_url,
          is_business: uazapiStatus.isBusiness ?? instance.is_business,
          platform: uazapiStatus.plataform || instance.platform,
          last_disconnect_reason: uazapiStatus.lastDisconnectReason || instance.last_disconnect_reason,
          dt_update: new Date().toISOString(),
        }
      })

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
    } catch (err) {
      console.error('Polling error:', err)
      pollFailuresRef.current++

      // After MAX failures, mark all as error
      if (pollFailuresRef.current >= MAX_POLL_FAILURES) {
        const errorInstances = instances.map(inst => ({
          ...inst,
          status: 'erro' as const,
          last_disconnect_reason: 'Erro ao verificar status',
        }))
        setInstances(errorInstances)
      }

      return instances
    }
  }, [instances, previousStatuses, bannerDismissed, fetchAllStatuses, configureWebhook])

  // Use polling hook for status updates
  usePolling(pollStatuses, {
    interval: POLLING_INTERVAL,
    enabled: instances.length > 0 && !pageLoading,
    onError: handlePollingError,
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
