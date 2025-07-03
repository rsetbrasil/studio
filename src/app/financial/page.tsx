import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function FinancialPage() {
  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestão Financeira</CardTitle>
            <CardDescription>
              Contas a pagar e a receber, fluxo de caixa e controle de movimentações financeiras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">O recurso de gestão financeira está em desenvolvimento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
