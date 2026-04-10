"use client";

import { Badge } from "@/components/ui/badge";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { type Customer, formatRupiah, formatDate } from "@/lib/customer-data";
import { Crown, ShoppingBag, Calendar, TrendingUp } from "lucide-react";

interface CustomerDetailPanelProps {
  customer: Customer | null;
}

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  if (!customer) return null;

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader className="pb-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-lg font-semibold">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl">{customer.name}</SheetTitle>
              {customer.label === "VIP" ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              ) : (
                <Badge variant="secondary">Regular</Badge>
              )}
            </div>
            <SheetDescription className="mt-1">
              Pelanggan sejak Januari 2026
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 py-6 border-b">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Transaksi
          </p>
          <p className="text-2xl font-semibold">{customer.totalTransactions}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Spending
          </p>
          <p className="text-2xl font-semibold">
            {formatRupiah(customer.totalSpending)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Produk Favorit
          </p>
          <p className="text-sm font-medium">{customer.favoriteProduct}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Terakhir Beli
          </p>
          <p className="text-sm font-medium">
            {formatDate(customer.lastPurchase)}
          </p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="py-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Riwayat Pembelian
        </h3>
        <div className="space-y-4">
          {customer.purchases.map((purchase) => (
            <div key={purchase.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(purchase.date)}
                </div>
                <Badge
                  variant={
                    purchase.status === "Sudah" ? "success" : "destructive"
                  }
                  className={
                    purchase.status === "Sudah"
                      ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                      : "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
                  }
                >
                  {purchase.status === "Sudah" ? "Lunas" : "Belum Bayar"}
                </Badge>
              </div>
              <div className="space-y-2">
                {purchase.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        x{product.qty}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatRupiah(product.price * product.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Total
                </div>
                <span className="font-semibold">
                  {formatRupiah(purchase.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SheetContent>
  );
}
