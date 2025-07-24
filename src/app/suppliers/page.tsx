
import { Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuppliersPage() {
  return (
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Fornecedores</CardTitle>
            <CardDescription>
              Cadastro e gestão de fornecedores para controle de compras e estoque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <Truck className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">O recurso de gestão de fornecedores está em desenvolvimento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
