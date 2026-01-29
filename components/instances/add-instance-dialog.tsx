'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle, ArrowUpRight } from 'lucide-react'
import type { Instance } from './instance-card'

interface AddInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (instance: Instance) => void
}

interface LimitInfo {
  atLimit: boolean
  current: number
  max: number
}

export function AddInstanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddInstanceDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null)
  const [checkingLimit, setCheckingLimit] = useState(false)

  // Check instance limit when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setName('')
      setError(null)
      return
    }

    async function checkLimit() {
      setCheckingLimit(true)
      try {
        const response = await fetch('/api/instances')
        if (!response.ok) return

        const data = await response.json()
        const instances = data.instances || []

        // Get organization limits from the response or a separate call
        // For now, we'll get the limit info from the billing/subscription
        const billingResponse = await fetch('/api/billing/subscription')
        if (billingResponse.ok) {
          const billingData = await billingResponse.json()
          const maxInstances = billingData.subscription?.planLimits?.instances ?? 1
          setLimitInfo({
            atLimit: instances.length >= maxInstances,
            current: instances.length,
            max: maxInstances,
          })
        } else {
          // Default limit if billing info not available
          setLimitInfo({
            atLimit: instances.length >= 1,
            current: instances.length,
            max: 1,
          })
        }
      } catch (err) {
        console.error('Error checking limit:', err)
      } finally {
        setCheckingLimit(false)
      }
    }

    checkLimit()
  }, [open])

  // Validation
  const isValidName = name.length >= 3 && name.length <= 50
  const canSubmit = isValidName && !loading && !limitInfo?.atLimit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_instancia: name }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.limit) {
          setLimitInfo({
            atLimit: true,
            current: data.current,
            max: data.limit,
          })
          setError('Limite de instancias atingido')
        } else {
          throw new Error(data.error || 'Erro ao criar instancia')
        }
        return
      }

      onSuccess(data.instance)
      onOpenChange(false)
    } catch (err) {
      console.error('Create instance error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar instancia</DialogTitle>
          <DialogDescription>
            Crie uma nova instancia WhatsApp para conectar seu numero.
          </DialogDescription>
        </DialogHeader>

        {/* Loading limit check */}
        {checkingLimit && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* At limit - show upgrade message */}
        {!checkingLimit && limitInfo?.atLimit && (
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Limite de instancias atingido
                </p>
                <p className="text-xs text-muted-foreground">
                  Seu plano permite {limitInfo.max} instancia{limitInfo.max > 1 ? 's' : ''}.
                  Voce ja possui {limitInfo.current}.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onOpenChange(false)
                    // Navigate to billing page
                    window.location.href = '/dashboard/settings/billing'
                  }}
                >
                  Fazer upgrade
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Form - show when not at limit */}
        {!checkingLimit && !limitInfo?.atLimit && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="instance-name">Nome da instancia</Label>
                <Input
                  id="instance-name"
                  placeholder="Ex: WhatsApp Vendas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Entre 3 e 50 caracteres. {name.length}/50
                </p>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar instancia'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Close button for limit reached state */}
        {!checkingLimit && limitInfo?.atLimit && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
