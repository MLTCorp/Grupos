import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sentimos sua falta!</CardTitle>
          <CardDescription>
            Sua assinatura expirou. Renove para continuar usando o Sincron Grupos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seus dados estao seguros e esperando por voce. Reative sua assinatura para
            retomar o controle dos seus grupos WhatsApp.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/checkout">Reativar Assinatura</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Voltar para o site</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
