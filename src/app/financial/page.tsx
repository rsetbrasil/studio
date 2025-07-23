
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, PlusCircle } from "lucide-react";

const transactions = [
  { id: 1, date: "2024-07-28", description: "Venda - Pedido SALE001", type: "Receita", status: "Pago", amount: 7.00 },
  { id: 2, date: "2024-07-28", description: "Venda - Pedido SALE002", type: "Receita", status: "Pago", amount: 3.50 },
  { id: 3, date: "2024-07-29", description: "Compra de estoque - Fornecedor A", type: "Despesa", status: "Pago", amount: 500.00 },
  { id: 4, date: "2024-07-30", description: "Pagamento de Aluguel", type: "Despesa", status: "Pendente", amount: 1200.00 },
  { id: 5, date: "2024-08-01", description: "Venda - Cliente B", type: "Receita", status: "Pendente", amount: 350.00 },
  { id: 6, date: "2024-08-02", description: "Pagamento de Salários", type: "Despesa", status: "Pago", amount: 2500.00 },
];

export default function FinancialPage() {

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pago":
        return "default";
      case "Pendente":
        return "secondary";
      default:
        return "outline";
    }
  };

  const contasAReceber = transactions.filter(t => t.type === 'Receita' && t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
  const contasAPagar = transactions.filter(t => t.type === 'Despesa' && t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
  const saldoAtual = transactions.filter(t => t.status === 'Pago').reduce((acc, t) => t.type === 'Receita' ? acc + t.amount : acc - t.amount, 0);

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(contasAReceber)}</div>
              <p className="text-xs text-muted-foreground">Total de valores pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(contasAPagar)}</div>
              <p className="text-xs text-muted-foreground">Total de despesas pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(saldoAtual)}</div>
              <p className="text-xs text-muted-foreground">Receitas e despesas pagas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Movimentações Recentes</CardTitle>
                <CardDescription>
                Acompanhe as últimas transações financeiras.
                </CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Transação
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${transaction.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'Receita' ? <ArrowUpCircle className="mr-2 h-4 w-4" /> : <ArrowDownCircle className="mr-2 h-4 w-4" />}
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(transaction.status) as any}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'Despesa' && '- '}{formatBRL(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação registrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
