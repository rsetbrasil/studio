// Ordering Forecasts
'use server';

/**
 * @fileOverview AI-powered tool for analyzing inventory and sales trends to forecast ordering needs.
 *
 * - orderingForecasts - A function that handles the ordering forecasts process.
 * - OrderingForecastsInput - The input type for the orderingForecasts function.
 * - OrderingForecastsOutput - The return type for the orderingForecasts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderingForecastsInputSchema = z.object({
  inventoryData: z
    .string()
    .describe(
      'A list of all products, including product name, code, category, unit of measure, price of purchase and sales, and quantity in stock.  Must be a comma-separated list.'
    ),
  salesData: z
    .string()
    .describe(
      'Historical sales data, including product name, date of sale, and quantity sold. Must be a comma-separated list.'
    ),
  forecastDays: z
    .number()
    .describe('The number of days into the future to forecast ordering needs.'),
});
export type OrderingForecastsInput = z.infer<typeof OrderingForecastsInputSchema>;

const OrderingForecastsOutputSchema = z.object({
  forecast: z
    .string()
    .describe(
      'A forecast of ordering needs, including product name, quantity to order, and estimated order date.  Must be a comma-separated list.'
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
  prompt: `You are an expert supply chain manager specializing in forecasting ordering needs for distributors.

You will use inventory and sales data to forecast ordering needs for the next {{{forecastDays}}} days.

Inventory Data: {{{inventoryData}}}
Sales Data: {{{salesData}}}

Based on the inventory data and sales data, what products need to be ordered, and what quantity of each product needs to be ordered?

Respond in a comma separated list of product name, quantity to order, and estimated order date.

Forecast:`,
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
