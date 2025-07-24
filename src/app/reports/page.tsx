"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, File } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatBRL } from "@/lib/utils"
import { useSales } from "@/context/SalesContext"

export default function ReportsPage() {
  const { sales } = useSales();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
        case "Finalizada":
            return "default";
        case "Cancelada":
            return "destructive";
        case "Pendente":
            return "secondary";
        default:
            return "outline";
    }
  }

  const filteredSales = React.useMemo(() => {
    if (!date?.from) return [];
    return sales.filter(s => {
      const saleDate = new Date(s.date);
      const from = date.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
      const to = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : from;
      if (!from) return true;
      return saleDate >= from && saleDate <= (to || from);
    });
  }, [sales, date]);

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Relatórios de Vendas</CardTitle>
                  <CardDescription>
                  Visualize e exporte relatórios de vendas para um período selecionado.
                  </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <Popover>
                      <PopoverTrigger asChild>
                      <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                          date.to ? (
                              <>
                              {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                              {format(date.to, "LLL dd, y", { locale: ptBR })}
                              </>
                          ) : (
                              format(date.from, "LLL dd, y", { locale: ptBR })
                          )
                          ) : (
                          <span>Escolha uma data</span>
                          )}
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={setDate}
                          numberOfMonths={2}
                          locale={ptBR}
                      />
                      </PopoverContent>
                  </Popover>
                  <Button>
                      <File className="mr-2 h-4 w-4" />
                      Exportar
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.items.length}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status) as any}>
                            {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className="text-right">{formatBRL(sale.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhuma venda no período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
