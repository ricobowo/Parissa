"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PRODUCTS } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";

interface DailyRevenueChartProps {
  data: Record<string, unknown>[];
}

export function DailyRevenueChart({ data }: DailyRevenueChartProps) {
  const chartConfig = PRODUCTS.reduce(
    (acc, product) => {
      acc[product.name] = { label: product.name, color: product.color };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Pendapatan Harian
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Revenue per hari berdasarkan produk (7 hari terakhir)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatRupiah(value),
                  name,
                ]}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                wrapperStyle={{ fontSize: "10px", paddingTop: "16px" }}
              />
              {PRODUCTS.map((product) => (
                <Bar
                  key={product.id}
                  dataKey={product.name}
                  stackId="a"
                  fill={product.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
