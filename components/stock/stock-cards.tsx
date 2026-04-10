"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Ingredient, getStatusLabel } from "@/lib/stock-data";

interface StockCardsProps {
  ingredients: Ingredient[];
}

export function StockCards({ ingredients }: StockCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {ingredients.map((item) => (
        <Card key={item.id} className="border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {item.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums">
                    {item.qty}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {item.minLevel} {item.unit}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Ingredient["status"] }) {
  const label = getStatusLabel(status);

  if (status === "aman") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500 bg-emerald-50 text-emerald-700 shrink-0"
      >
        {label}
      </Badge>
    );
  }

  if (status === "menipis") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 bg-amber-50 text-amber-700 shrink-0"
      >
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-red-500 bg-red-50 text-red-700 shrink-0"
    >
      {label}
    </Badge>
  );
}
