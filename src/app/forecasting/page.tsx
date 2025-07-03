"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { orderingForecasts } from "@/ai/flows/ordering-forecasts";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  inventoryData: z.string().min(10, {
    message: "Inventory data must be at least 10 characters.",
  }),
  salesData: z.string().min(10, {
    message: "Sales data must be at least 10 characters.",
  }),
  forecastDays: z.coerce.number().int().positive(),
});

type Forecast = {
  productName: string;
  quantityToOrder: string;
  estimatedOrderDate: string;
};

export default function ForecastingPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [forecast, setForecast] = useState<Forecast[] | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inventoryData: `Product Name,Code,Category,Unit,Purchase Price,Sale Price,Stock
Coca-Cola 2L,CC2L,Soda,UN,4.50,7.00,150
Guaraná Antarctica 2L,GA2L,Soda,UN,4.20,6.50,120
Skol 350ml Can,SK350,Beer,UN,2.20,3.50,300
Brahma 350ml Can,BR350,Beer,UN,2.10,3.40,280
Heineken 330ml Long Neck,HN330,Beer,UN,3.50,5.50,80
Red Bull Energy Drink,RB250,Energy Drink,UN,5.50,9.00,45`,
      salesData: `Product Name,Date,Quantity
Coca-Cola 2L,2024-07-20,30
Guaraná Antarctica 2L,2024-07-20,25
Skol 350ml Can,2024-07-20,72
Heineken 330ml Long Neck,2024-07-20,48
Red Bull Energy Drink,2024-07-21,20
Coca-Cola 2L,2024-07-21,25`,
      forecastDays: 30,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setForecast(null);
    startTransition(async () => {
      const result = await orderingForecasts(data);
      if (result.forecast) {
        const parsedForecast = result.forecast.split("\n").map(line => {
          const [productName, quantityToOrder, estimatedOrderDate] = line.split(',');
          return { productName, quantityToOrder, estimatedOrderDate };
        });
        setForecast(parsedForecast);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate forecast.",
        });
      }
    });
  }

  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Ordering Forecast</CardTitle>
                <CardDescription>
                  Use AI to forecast ordering needs based on your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="inventoryData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your inventory data here (CSV format)."
                          className="resize-none"
                          rows={7}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of your current inventory.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Sales Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your sales data here (CSV format)."
                          className="resize-none"
                          rows={7}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of your recent sales.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forecastDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Period (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Forecast Results</CardTitle>
            <CardDescription>
              Products that should be re-ordered soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isPending && forecast && (
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity to Order</TableHead>
                    <TableHead>Estimated Order Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.quantityToOrder}</TableCell>
                      <TableCell>{item.estimatedOrderDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isPending && !forecast && (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <BrainCircuit className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Your forecast will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
