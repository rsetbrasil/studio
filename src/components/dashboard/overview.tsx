
"use client"

import { useSales } from "@/context/SalesContext";
import { formatBRL } from "@/lib/utils";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function OverviewChart() {
  const { sales } = useSales();

  const data = useMemo(() => {
    const monthlySales: { [key: string]: number } = {
      "Jan": 0, "Fev": 0, "Mar": 0, "Abr": 0, "Mai": 0, "Jun": 0, 
      "Jul": 0, "Ago": 0, "Set": 0, "Out": 0, "Nov": 0, "Dez": 0
    };

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    sales.forEach(sale => {
      const monthIndex = new Date(sale.date).getUTCMonth();
      const monthName = monthNames[monthIndex];
      monthlySales[monthName] += sale.amount;
    });

    return Object.keys(monthlySales).map(name => ({
      name,
      total: monthlySales[name]
    }));

  }, [sales]);


  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatBRL(value as number)}
        />
        <Bar dataKey="total" fill="var(--color-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
