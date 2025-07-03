// Ordering Forecasts
'use server';

/**
 * @fileOverview Ferramenta com IA para analisar tendências de estoque e vendas para prever necessidades de pedidos.
 *
 * - orderingForecasts - Uma função que lida com o processo de previsão de pedidos.
 * - OrderingForecastsInput - O tipo de entrada para a função orderingForecasts.
 * - OrderingForecastsOutput - O tipo de retorno para a função orderingForecasts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderingForecastsInputSchema = z.object({
  inventoryData: z
    .string()
    .describe(
      'Uma lista de todos os produtos, incluindo nome do produto, código, categoria, unidade de medida, preço de compra e venda, e quantidade em estoque. Deve ser uma lista separada por vírgulas.'
    ),
  salesData: z
    .string()
    .describe(
      'Dados históricos de vendas, incluindo nome do produto, data da venda e quantidade vendida. Deve ser uma lista separada por vírgulas.'
    ),
  forecastDays: z
    .number()
    .describe('O número de dias no futuro para prever as necessidades de pedidos.'),
});
export type OrderingForecastsInput = z.infer<typeof OrderingForecastsInputSchema>;

const OrderingForecastsOutputSchema = z.object({
  forecast: z
    .string()
    .describe(
      'Uma previsão das necessidades de pedidos, incluindo nome do produto, quantidade a pedir e data estimada do pedido. Deve ser uma lista separada por vírgulas.'
    ),
});
export type OrderingForecastsOutput = z.infer<typeof OrderingForecastsOutputSchema>;

export async function orderingForecasts(input: OrderingForecastsInput): Promise<OrderingForecastsOutput> {
  return orderingForecastsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'orderingForecastsPrompt',
  input: {schema: OrderingForecastsInputSchema},
  output: {schema: OrderingForecastsOutputSchema},
  prompt: `Você é um gerente de cadeia de suprimentos especialista em prever necessidades de pedidos para distribuidores.

Você usará dados de inventário e vendas para prever as necessidades de pedidos para os próximos {{{forecastDays}}} dias.

Dados de Inventário: {{{inventoryData}}}
Dados de Vendas: {{{salesData}}}

Com base nos dados de inventário e vendas, quais produtos precisam ser pedidos e qual a quantidade de cada produto que precisa ser pedida?

Responda em uma lista separada por vírgulas de nome do produto, quantidade a pedir e data estimada do pedido.

Previsão:`,
});

const orderingForecastsFlow = ai.defineFlow(
  {
    name: 'orderingForecastsFlow',
    inputSchema: OrderingForecastsInputSchema,
    outputSchema: OrderingForecastsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
