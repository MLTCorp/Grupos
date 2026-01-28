import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuario"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ola, {userName}!</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Sincron Grupos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Instancias</CardTitle>
            <CardDescription>Conecte seu WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">instancias conectadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
            <CardDescription>Gerencie seus grupos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">grupos importados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
            <CardDescription>Envie e agende</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">mensagens enviadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proximo Passo</CardTitle>
          <CardDescription>Configure sua primeira instancia WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para comecar, voce precisa conectar uma instancia do UAZAPI.
            Esta funcionalidade estara disponivel em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
