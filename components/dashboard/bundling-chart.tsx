"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { formatRupiah } from "@/lib/utils";

interface BundlingData {
  name: string;
  value: number;
  fill: string;
}

interface BundlingChartProps {
  data: BundlingData[];
}

export function BundlingChart({ data }: BundlingChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const chartConfig = data.reduce(
    (acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Bundling vs Non-Bundling
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Proporsi penjualan paket vs satuan
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  formatRupiah(value),
                  "Revenue",
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
                height={36}
                formatter={(value, entry) => {
                  const item = data.find((d) => d.name === value);
                  const percentage = item
                    ? ((item.value / total) * 100).toFixed(0)
                    : 0;
                  return (
                    <span className="text-xs text-muted-foreground">
                      {value} ({percentage}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
