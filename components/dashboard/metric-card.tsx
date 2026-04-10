import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  type?: "default" | "success" | "warning" | "danger";
  isCurrency?: boolean;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  type = "default",
  isCurrency = true,
}: MetricCardProps) {
  // Functional colors only for specific states
  const valueColorClass = {
    default: "text-foreground",
    success: "text-[hsl(142,76%,36%)]",
    warning: "text-[hsl(38,92%,50%)]",
    danger: "text-[hsl(0,84%,60%)]",
  }[type];

  return (
    <Card className="border shadow-none bg-card">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p
              className={cn(
                "text-xl md:text-2xl lg:text-3xl font-semibold tabular-nums tracking-tight",
                valueColorClass
              )}
            >
              {isCurrency ? formatRupiah(value) : value.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="p-2 rounded-md bg-secondary">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
