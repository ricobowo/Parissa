"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, cn } from "@/lib/utils";
import type { ProductProfit } from "@/lib/profit-data";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ProfitCardsProps {
  data: ProductProfit[];
}

export function ProfitCards({ data }: ProfitCardsProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tidak ada data untuk filter yang dipilih
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((product) => (
        <Card key={product.id} className="border shadow-none">
          <CardContent className="p-4">
            {/* Product name */}
            <h3 className="font-semibold text-foreground mb-3">
              {product.name}
            </h3>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Qty */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  Qty Terjual
                </p>
                <p className="font-medium tabular-nums text-muted-foreground">
                  {product.qtySold.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Revenue */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  Revenue
                </p>
                <p className="font-medium tabular-nums">
                  {formatRupiah(product.revenue)}
                </p>
              </div>

              {/* Cost */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  Cost
                </p>
                <p className="font-medium tabular-nums text-[hsl(0,84%,60%)]">
                  {formatRupiah(product.cost)}
                </p>
              </div>

              {/* Profit */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                  Profit
                </p>
                <p
                  className={cn(
                    "font-semibold tabular-nums flex items-center gap-1",
                    product.profit > 0
                      ? "text-[hsl(142,76%,36%)]"
                      : product.profit < 0
                        ? "text-[hsl(0,84%,60%)]"
                        : "text-muted-foreground"
                  )}
                >
                  {product.profit > 0 && <TrendingUp className="h-3.5 w-3.5" />}
                  {product.profit < 0 && (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {formatRupiah(product.profit)}
                </p>
              </div>
            </div>

            {/* Margin bar */}
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Margin
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    product.margin >= 50
                      ? "text-[hsl(142,76%,36%)]"
                      : product.margin >= 30
                        ? "text-foreground"
                        : product.margin > 0
                          ? "text-[hsl(38,92%,50%)]"
                          : "text-muted-foreground"
                  )}
                >
                  {product.margin.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    product.margin >= 50
                      ? "bg-[hsl(142,76%,36%)]"
                      : product.margin >= 30
                        ? "bg-foreground"
                        : product.margin > 0
                          ? "bg-[hsl(38,92%,50%)]"
                          : "bg-muted-foreground"
                  )}
                  style={{ width: `${Math.min(product.margin, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
