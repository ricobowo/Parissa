"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Menu,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, current: true },
  { name: "POS", icon: ShoppingCart, current: false },
  { name: "Produk", icon: Package, current: false },
  { name: "Laporan", icon: BarChart3, current: false },
  { name: "Menu", icon: Menu, current: false },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[64px]",
              item.current
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", item.current && "stroke-[2.5]")} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
