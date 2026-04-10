"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { CustomerTable } from "@/components/customer/customer-table";
import { CustomerCards } from "@/components/customer/customer-cards";
import { CustomerDetailPanel } from "@/components/customer/customer-detail-panel";
import { customers as allCustomers, type Customer } from "@/lib/customer-data";
import { Search, Users, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return allCustomers;
    const query = searchQuery.toLowerCase();
    return allCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.favoriteProduct.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const stats = useMemo(() => {
    const totalCustomers = allCustomers.length;
    const vipCustomers = allCustomers.filter((c) => c.label === "VIP").length;
    const totalRevenue = allCustomers.reduce(
      (sum, c) => sum + c.totalSpending,
      0
    );
    return { totalCustomers, vipCustomers, totalRevenue };
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b">
          <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
            <div>
              <h1 className="text-xl font-semibold">Pelanggan</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Database pelanggan Parissa
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-xl font-bold">{stats.totalCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      VIP
                    </p>
                    <p className="text-xl font-bold">{stats.vipCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Revenue
                    </p>
                    <p className="text-lg font-bold">
                      {formatRupiah(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelanggan atau produk favorit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredCustomers.length} dari {allCustomers.length}{" "}
              pelanggan
            </p>
          </div>

          {/* Customer Table (Desktop) */}
          <CustomerTable
            customers={filteredCustomers}
            onSelectCustomer={handleSelectCustomer}
          />

          {/* Customer Cards (Mobile) */}
          <CustomerCards
            customers={filteredCustomers}
            onSelectCustomer={handleSelectCustomer}
          />

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                Tidak ada pelanggan ditemukan
              </h3>
              <p className="text-muted-foreground">
                Coba kata kunci pencarian yang berbeda
              </p>
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      {/* Customer Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <CustomerDetailPanel customer={selectedCustomer} />
      </Sheet>
    </div>
  );
}
