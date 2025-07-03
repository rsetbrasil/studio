import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";

export default function OrdersPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Registro, consulta e gerenciamento de pedidos realizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <ListOrdered className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Order management feature is under development.</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
