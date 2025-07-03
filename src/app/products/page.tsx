import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Produtos</CardTitle>
          <CardDescription>
            Cadastro de produtos, controle de estoque, categorias e unidades de medida.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">O recurso de gestão de produtos está em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
