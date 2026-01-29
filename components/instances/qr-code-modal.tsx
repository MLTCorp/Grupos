'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import type { Instance } from './instance-card'

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: Instance | null
  onConnected: () => void
}

const QR_EXPIRY_SECONDS = 120 // 2 minutes

type ConnectionStatus = 'idle' | 'loading' | 'waiting' | 'connected' | 'error'

export function QRCodeModal({
  open,
  onOpenChange,
  instance,
  onConnected,
}: QRCodeModalProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(QR_EXPIRY_SECONDS)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup intervals
  const clearIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current)
      statusIntervalRef.current = null
    }
  }, [])

  // Fetch QR code
  const fetchQRCode = useCallback(async () => {
    if (!instance?.api_key) return

    setStatus('loading')
    setError(null)

    try {
      const response = await fetch(`/api/uazapi/instances/${instance.api_key}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Falha ao gerar QR code')
      }

      const data = await response.json()

      // Check if already connected
      if (data.instance?.status === 'conectado' || data.connected) {
        setStatus('connected')
        setTimeout(() => {
          onConnected()
          onOpenChange(false)
        }, 1500)
        return
      }

      // Extract QR code from response
      const qrCodeBase64 = data.qrcode || data.instance?.qrcode
      if (qrCodeBase64) {
        setQrCode(qrCodeBase64)
        setStatus('waiting')
        setCountdown(QR_EXPIRY_SECONDS)
      } else {
        throw new Error('QR code nao recebido')
      }
    } catch (err) {
      console.error('QR code fetch error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }, [instance?.api_key, onConnected, onOpenChange])

  // Check connection status
  const checkStatus = useCallback(async () => {
    if (!instance?.api_key || status !== 'waiting') return

    try {
      const response = await fetch(`/api/uazapi/instances/${instance.api_key}/status`)
      if (!response.ok) return

      const data = await response.json()
      const isConnected = data.extractedStatus?.connected || data.status?.connected

      if (isConnected) {
        setStatus('connected')
        clearIntervals()

        // Log connection event
        await fetch(`/api/instances/${instance.id}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'connected' }),
        }).catch(console.error)

        setTimeout(() => {
          onConnected()
          onOpenChange(false)
        }, 1500)
      }
    } catch (err) {
      console.error('Status check error:', err)
    }
  }, [instance?.api_key, instance?.id, status, clearIntervals, onConnected, onOpenChange])

  // Start connection flow when modal opens
  useEffect(() => {
    if (open && instance) {
      fetchQRCode()
    } else {
      // Reset state when modal closes
      clearIntervals()
      setStatus('idle')
      setQrCode(null)
      setCountdown(QR_EXPIRY_SECONDS)
      setError(null)
    }

    return clearIntervals
  }, [open, instance, fetchQRCode, clearIntervals])

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // QR expired, auto-regenerate
          fetchQRCode()
          return QR_EXPIRY_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status, fetchQRCode])

  // Poll for connection status
  useEffect(() => {
    if (status !== 'waiting') return

    statusIntervalRef.current = setInterval(checkStatus, 3000)

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [status, checkStatus])

  // Format countdown for display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Conectar WhatsApp</SheetTitle>
          <SheetDescription>
            {instance?.nome_instancia}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando QR code...</p>
            </div>
          )}

          {/* Waiting for scan */}
          {status === 'waiting' && qrCode && (
            <>
              <div className="relative bg-white p-4 rounded-lg">
                <Image
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code para conectar WhatsApp"
                  width={256}
                  height={256}
                  className="rounded"
                  unoptimized
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Escaneie com WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  Abra o WhatsApp no seu celular, va em Dispositivos conectados
                  e escaneie o QR code
                </p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>
                  Expira em {formatCountdown(countdown)}
                </span>
              </div>

              {/* Scanning indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aguardando escaneamento...</span>
              </div>
            </>
          )}

          {/* Connected */}
          {status === 'connected' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-green-500">
                Conectado com sucesso!
              </p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={fetchQRCode} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
