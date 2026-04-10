"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Boxes,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "POS", icon: ShoppingCart, href: "/pos" },
  { name: "Stok", icon: Boxes, href: "/stock" },
  { name: "Pelanggan", icon: Users, href: "/customers" },
  { name: "Laporan", icon: BarChart3, href: "/report" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[64px]",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
