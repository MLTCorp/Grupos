'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/lib/actions/stripe'

// Price IDs from environment variables
// TODO: Configure NEXT_PUBLIC_STRIPE_PRICE_INICIAL and NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL in .env.local
const PRICE_IDS = {
  inicial: process.env.NEXT_PUBLIC_STRIPE_PRICE_INICIAL!,
  profissional: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL!,
}

interface Plan {
  id: 'inicial' | 'profissional'
  name: string
  price: string
  priceValue: number
  description: string
  instances: string
  groups: string
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'inicial',
    name: 'Inicial',
    price: 'R$ 147',
    priceValue: 147,
    description: 'Para quem esta comecando',
    instances: '1 instancia WhatsApp',
    groups: 'Ate 10 grupos',
    features: [
      'Agendamento de mensagens',
      'Categorias de grupos',
      'Historico completo',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$ 347',
    priceValue: 347,
    description: 'Para quem precisa de mais',
    instances: '3 instancias WhatsApp',
    groups: 'Ate 30 grupos',
    features: [
      'Tudo do plano Inicial',
      'Agente IA incluso',
      'Suporte prioritario',
    ],
  },
]

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.error('Checkout cancelado. Escolha um plano para continuar.')
    }
  }, [searchParams])

  async function handleSelectPlan(planId: 'inicial' | 'profissional') {
    const priceId = PRICE_IDS[planId]

    if (!priceId) {
      toast.error('Plano nao configurado. Entre em contato com o suporte.')
      return
    }

    setLoadingPlan(planId)

    try {
      await createCheckoutSession(priceId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar checkout')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
          <span className="text-primary-foreground font-bold text-lg">SG</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          Comece com 7 dias de trial gratuito
        </p>
        <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <Clock className="h-3 w-3 mr-1" />
          7 dias gratis
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.instances}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.groups}</span>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Escolher ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Ao continuar, voce sera redirecionado para o checkout seguro do Stripe.
        <br />
        Voce so sera cobrado apos o periodo de trial.
      </p>
    </div>
  )
}
