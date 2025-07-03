import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>User & Permission Management</CardTitle>
          <CardDescription>
            Gerenciamento de usuários e perfis de acesso (Administrador, Gerente, Vendedor).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">User management feature is under development.</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
