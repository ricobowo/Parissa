"use client";

import { Bell } from "lucide-react";

export function Header() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Parissa</span>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-md hover:bg-secondary transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[hsl(0,84%,60%)]" />
          </button>
          <div className="hidden md:flex items-center gap-2 pl-3 border-l">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium">R</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
