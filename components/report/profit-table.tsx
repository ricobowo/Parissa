"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, cn } from "@/lib/utils";
import type { ProductProfit } from "@/lib/profit-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProfitTableProps {
  data: ProductProfit[];
}

export function ProfitTable({ data }: ProfitTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
            <TableHead className="font-semibold text-foreground">
              Produk
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Qty Terjual
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Revenue
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Cost
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Profit
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Margin
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {product.qtySold.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatRupiah(product.revenue)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-[hsl(0,84%,60%)]">
                {formatRupiah(product.cost)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums font-medium",
                  product.profit > 0
                    ? "text-[hsl(142,76%,36%)]"
                    : product.profit < 0
                      ? "text-[hsl(0,84%,60%)]"
                      : "text-muted-foreground"
                )}
              >
                <span className="flex items-center justify-end gap-1">
                  {product.profit > 0 && (
                    <TrendingUp className="h-3.5 w-3.5" />
                  )}
                  {product.profit < 0 && (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {formatRupiah(product.profit)}
                </span>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums font-medium",
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
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                Tidak ada data untuk filter yang dipilih
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
