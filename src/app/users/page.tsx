import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Usuários e Permissões</CardTitle>
            <CardDescription>
              Gerenciamento de usuários e perfis de acesso (Administrador, Gerente, Vendedor).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">O recurso de gestão de usuários está em desenvolvimento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
