import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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

const salesData = [
  { id: "SALE001", customer: "João Silva", product: "Coca-Cola 2L", date: "2024-07-28", status: "Finalizada", amount: 7.00 },
  { id: "SALE002", customer: "Maria Oliveira", product: "Skol 350ml Lata", date: "2024-07-28", status: "Finalizada", amount: 3.50 },
  { id: "SALE003", customer: "Carlos Pereira", product: "Heineken 330ml", date: "2024-07-27", status: "Finalizada", amount: 5.50 },
  { id: "SALE004", customer: "Ana Costa", product: "Red Bull", date: "2024-07-27", status: "Finalizada", amount: 9.00 },
  { id: "SALE005", customer: "Pedro Martins", product: "Guaraná 2L", date: "2024-07-26", status: "Finalizada", amount: 6.50 },
];

export default function SalesPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Vendas Finalizadas</CardTitle>
          <CardDescription>
            Consulte o histórico de todas as vendas finalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Venda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto Principal</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <Badge variant="default">{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {sale.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
