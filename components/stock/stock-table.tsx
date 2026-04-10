"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Ingredient, getStatusLabel } from "@/lib/stock-data";

interface StockTableProps {
  ingredients: Ingredient[];
}

export function StockTable({ ingredients }: StockTableProps) {
  return (
    <div className="hidden md:block border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold text-foreground">
              Nama Bahan
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Qty
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Satuan
            </TableHead>
            <TableHead className="font-semibold text-foreground text-right">
              Min Level
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {item.qty}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.unit}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {item.minLevel}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: Ingredient["status"] }) {
  const label = getStatusLabel(status);

  if (status === "aman") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500 bg-emerald-50 text-emerald-700"
      >
        {label}
      </Badge>
    );
  }

  if (status === "menipis") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 bg-amber-50 text-amber-700"
      >
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-red-500 bg-red-50 text-red-700"
    >
      {label}
    </Badge>
  );
}
