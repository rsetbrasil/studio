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

const salesData = [
  { invoice: "FAT001", customer: "Liam Johnson", status: "Pago", date: "2023-06-23", amount: 250.00, product: "Coca-Cola 2L" },
  { invoice: "FAT002", customer: "Olivia Smith", status: "Pago", date: "2023-06-24", amount: 150.00, product: "Skol 350ml Lata" },
  { invoice: "FAT003", customer: "Noah Williams", status: "Não Pago", date: "2023-06-25", amount: 350.00, product: "Heineken 330ml" },
  { invoice: "FAT004", customer: "Emma Brown", status: "Pago", date: "2023-06-26", amount: 450.00, product: "Red Bull" },
  { invoice: "FAT005", customer: "Ava Jones", status: "Pendente", date: "2023-06-27", amount: 550.00, product: "Guaraná 2L" },
]

export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
        case "Pago":
            return "default";
        case "Não Pago":
            return "destructive";
        case "Pendente":
            return "secondary";
        default:
            return "outline";
    }
  }

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
                  <TableHead>Produto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.invoice}>
                    <TableCell className="font-medium">{sale.invoice}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.product}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sale.status) as any}>
                          {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell className="text-right">{`R$${sale.amount.toFixed(2)}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
