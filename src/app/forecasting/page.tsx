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
    message: "Os dados de inventário devem ter pelo menos 10 caracteres.",
  }),
  salesData: z.string().min(10, {
    message: "Os dados de vendas devem ter pelo menos 10 caracteres.",
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
      inventoryData: `Nome do Produto,Código,Categoria,Unidade,Preço de Compra,Preço de Venda,Estoque
Coca-Cola 2L,CC2L,Refrigerante,UN,4.50,7.00,150
Guaraná Antarctica 2L,GA2L,Refrigerante,UN,4.20,6.50,120
Skol 350ml Lata,SK350,Cerveja,UN,2.20,3.50,300
Brahma 350ml Lata,BR350,Cerveja,UN,2.10,3.40,280
Heineken 330ml Long Neck,HN330,Cerveja,UN,3.50,5.50,80
Red Bull Energy Drink,RB250,Energético,UN,5.50,9.00,45`,
      salesData: `Nome do Produto,Data,Quantidade
Coca-Cola 2L,2024-07-20,30
Guaraná Antarctica 2L,2024-07-20,25
Skol 350ml Lata,2024-07-20,72
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
          title: "Erro",
          description: "Falha ao gerar a previsão.",
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
                <CardTitle>Previsão de Pedidos</CardTitle>
                <CardDescription>
                  Use IA para prever as necessidades de pedidos com base nos seus dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="inventoryData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dados de Inventário</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole seus dados de inventário aqui (formato CSV)."
                          className="resize-none"
                          rows={7}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Lista separada por vírgulas do seu inventário atual.
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
                      <FormLabel>Dados Históricos de Vendas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cole seus dados de vendas aqui (formato CSV)."
                          className="resize-none"
                          rows={7}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Lista separada por vírgulas de suas vendas recentes.
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
                      <FormLabel>Período de Previsão (Dias)</FormLabel>
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
                      Gerando...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Gerar Previsão
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resultados da Previsão</CardTitle>
            <CardDescription>
              Produtos que devem ser pedidos novamente em breve.
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
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Quantidade a Pedir</TableHead>
                    <TableHead>Data Estimada do Pedido</TableHead>
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
                    <p className="mt-4 text-muted-foreground">Sua previsão aparecerá aqui.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
