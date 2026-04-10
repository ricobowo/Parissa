"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { StockTable } from "@/components/stock/stock-table";
import { StockCards } from "@/components/stock/stock-cards";
import { RestockModal, type RestockData } from "@/components/stock/restock-modal";
import {
  ingredients as initialIngredients,
  type Ingredient,
  calculateStatus,
} from "@/lib/stock-data";

export default function StockPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return ingredients;
    const query = searchQuery.toLowerCase();
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [ingredients, searchQuery]);

  const handleRestock = (data: RestockData) => {
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === data.ingredientId) {
          const newQty = item.qty + data.qty;
          return {
            ...item,
            qty: newQty,
            status: calculateStatus(newQty, item.minLevel),
          };
        }
        return item;
      })
    );
  };

  // Summary counts
  const summary = useMemo(() => {
    return ingredients.reduce(
      (acc, item) => {
        acc[item.status]++;
        return acc;
      },
      { aman: 0, menipis: 0, habis: 0 }
    );
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Stok Bahan
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Kelola inventaris bahan baku
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground hidden md:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Aman
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {summary.aman}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Menipis
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {summary.menipis}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Habis
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {summary.habis}
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari bahan..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Restock
            </Button>
          </div>

          {/* Table (Desktop) / Cards (Mobile) */}
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tidak ada bahan yang cocok dengan pencarian"
                  : "Belum ada data bahan"}
              </p>
            </div>
          ) : (
            <>
              <StockTable ingredients={filteredIngredients} />
              <StockCards ingredients={filteredIngredients} />
            </>
          )}
        </main>
      </div>

      <MobileNav />

      <RestockModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ingredients={ingredients}
        onSubmit={handleRestock}
      />
    </div>
  );
}
