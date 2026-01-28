'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'
import type { SubscriptionStatus } from '@/lib/subscription'

interface TrialBadgeProps {
  status: SubscriptionStatus
  daysRemaining: number | null
}

export function TrialBadge({ status, daysRemaining }: TrialBadgeProps) {
  if (status === 'active' || status === 'none' || status === 'blocked') {
    return null
  }

  const isUrgent = daysRemaining !== null && daysRemaining <= 3
  const isGrace = status === 'grace_period'

  const label = isGrace
    ? `Renove em ${daysRemaining}d`
    : `Trial: ${daysRemaining}d`

  const Icon = isGrace ? AlertTriangle : Clock

  return (
    <Badge
      variant={isUrgent || isGrace ? 'destructive' : 'secondary'}
      className="gap-1 text-xs"
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
