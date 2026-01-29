'use client'

import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle } from 'lucide-react'
import type { Instance } from './instance-card'

interface DeleteInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: Instance | null
  onConfirm: () => void
}

export function DeleteInstanceDialog({
  open,
  onOpenChange,
  instance,
  onConfirm,
}: DeleteInstanceDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when dialog closes or instance changes
  useEffect(() => {
    if (!open) {
      setConfirmText('')
      setError(null)
    }
  }, [open])

  // Check if name matches exactly
  const nameMatches = confirmText === instance?.nome_instancia
  const canDelete = nameMatches && !loading

  const handleDelete = async () => {
    if (!canDelete || !instance) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/instances/${instance.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar instancia')
      }

      onConfirm()
      onOpenChange(false)
    } catch (err) {
      console.error('Delete instance error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (!instance) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Deletar instancia</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Esta acao nao pode ser desfeita. A instancia{' '}
            <strong className="text-foreground">{instance.nome_instancia}</strong>{' '}
            sera permanentemente removida, incluindo todas as conexoes e configuracoes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          <Label htmlFor="confirm-delete">
            Digite <strong>{instance.nome_instancia}</strong> para confirmar
          </Label>
          <Input
            id="confirm-delete"
            placeholder={instance.nome_instancia}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete}
            variant="destructive"
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              'Deletar instancia'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
