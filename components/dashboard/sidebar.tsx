"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Boxes,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "POS", icon: ShoppingCart, href: "/pos" },
  { name: "Stok Bahan", icon: Boxes, href: "/stock" },
  { name: "Produk", icon: Package, href: "#" },
  { name: "Laporan", icon: BarChart3, href: "#" },
  { name: "Pengaturan", icon: Settings, href: "#" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Parissa</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center mx-auto">
            <span className="text-background font-bold text-sm">P</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md hover:bg-secondary transition-colors",
            collapsed && "absolute -right-3 top-6 bg-card border shadow-sm"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium">R</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Rico</p>
              <p className="text-xs text-muted-foreground truncate">Owner</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
