
"use client"

import { useSales } from "@/context/SalesContext";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function OverviewChart() {
  const { sales } = useSales();

  const data = useMemo(() => {
    const monthlySales: { [key: string]: number } = {
      "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, 
      "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sales.forEach(sale => {
      const monthIndex = new Date(sale.date).getMonth();
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
          tickFormatter={(value) => `R$${value}`}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
