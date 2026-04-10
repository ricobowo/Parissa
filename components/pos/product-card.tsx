"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: number;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({
  name,
  price,
  quantity,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const isActive = quantity > 0;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-lg border bg-card p-4 transition-all",
        isActive && "border-success ring-1 ring-success"
      )}
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-sm leading-tight text-balance">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm">
          Rp{price.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full",
            quantity > 0 && "border-destructive text-destructive hover:bg-destructive/10"
          )}
          onClick={onDecrement}
          disabled={quantity === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span
          className={cn(
            "text-lg font-semibold tabular-nums min-w-[2rem] text-center",
            isActive && "text-success"
          )}
        >
          {quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
