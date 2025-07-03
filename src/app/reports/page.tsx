"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
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
  { invoice: "INV001", customer: "Liam Johnson", status: "Paid", date: "2023-06-23", amount: 250.00, product: "Coca-Cola 2L" },
  { invoice: "INV002", customer: "Olivia Smith", status: "Paid", date: "2023-06-24", amount: 150.00, product: "Skol 350ml Can" },
  { invoice: "INV003", customer: "Noah Williams", status: "Unpaid", date: "2023-06-25", amount: 350.00, product: "Heineken 330ml" },
  { invoice: "INV004", customer: "Emma Brown", status: "Paid", date: "2023-06-26", amount: 450.00, product: "Red Bull" },
  { invoice: "INV005", customer: "Ava Jones", status: "Pending", date: "2023-06-27", amount: 550.00, product: "Guaraná 2L" },
]

export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  })

  return (
    <AppShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Sales Reports</CardTitle>
                <CardDescription>
                View and export sales reports for a selected period.
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
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
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
                    />
                    </PopoverContent>
                </Popover>
                <Button>
                    <File className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.invoice}>
                  <TableCell className="font-medium">{sale.invoice}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'Paid' ? 'default' : sale.status === 'Unpaid' ? 'destructive' : 'secondary'}>
                        {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  )
}
