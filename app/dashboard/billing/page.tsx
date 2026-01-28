import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getSubscriptionStatus } from "@/lib/subscription"
import { redirectToCustomerPortal } from "@/lib/actions/stripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink } from "lucide-react"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const subscriptionInfo = await getSubscriptionStatus(user.id)

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    active: { label: "Ativo", variant: "default" },
    trialing: { label: "Trial", variant: "secondary" },
    grace_period: { label: "Carencia", variant: "destructive" },
    blocked: { label: "Bloqueado", variant: "destructive" },
    none: { label: "Sem assinatura", variant: "secondary" },
  }

  const currentStatus = statusLabels[subscriptionInfo.status]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e forma de pagamento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
          <CardDescription>
            Informacoes sobre sua assinatura atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
          </div>

          {subscriptionInfo.daysRemaining !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {subscriptionInfo.status === 'trialing' ? 'Dias restantes do trial' : 'Dias para renovar'}
              </span>
              <span className="font-medium">{subscriptionInfo.daysRemaining} dias</span>
            </div>
          )}

          <div className="pt-4 border-t">
            <form action={redirectToCustomerPortal}>
              <Button type="submit" variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Atualizar cartao, ver faturas ou cancelar assinatura
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
