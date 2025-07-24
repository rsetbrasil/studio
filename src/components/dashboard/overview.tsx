
"use client"

import { useSales } from "@/context/SalesContext";
import { formatBRL } from "@/lib/utils";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function OverviewChart() {
  const { sales } = useSales();

  const data = useMemo(() => {
    // Initialize hourly sales for a 24-hour period
    const hourlySales: { [key: string]: number } = {};
    for (let i = 0; i < 24; i++) {
        hourlySales[`${String(i).padStart(2, '0')}:00`] = 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter sales for the current day
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= today;
    });

    // Aggregate sales by hour
    todaySales.forEach(sale => {
      const saleHour = new Date(sale.date).getHours();
      const hourKey = `${String(saleHour).padStart(2, '0')}:00`;
      if (hourKey in hourlySales) {
        hourlySales[hourKey] += sale.amount;
      }
    });

    return Object.keys(hourlySales).map(name => ({
      name,
      total: hourlySales[name]
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
