"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ProfitTable } from "@/components/report/profit-table";
import { ProfitCards } from "@/components/report/profit-cards";
import {
  calculateProductProfits,
  calculateTotals,
  getDateRange,
  exportToExcel,
} from "@/lib/profit-data";
import { PRODUCTS, TRANSACTIONS } from "@/lib/data";
import { formatRupiah, cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportPage() {
  const dateRange = getDateRange();

  // Filter states
  const [dateFrom, setDateFrom] = useState(dateRange.minDate);
  const [dateTo, setDateTo] = useState(dateRange.maxDate);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("Sudah");

  // Calculate data based on filters
  const productProfits = useMemo(() => {
    let data = calculateProductProfits(
      TRANSACTIONS,
      dateFrom,
      dateTo,
      paymentStatus
    );

    // Filter by product if selected
    if (selectedProduct !== "all") {
      data = data.filter((p) => p.id === selectedProduct);
    }

    return data;
  }, [dateFrom, dateTo, selectedProduct, paymentStatus]);

  const totals = useMemo(() => {
    return calculateTotals(TRANSACTIONS, dateFrom, dateTo, paymentStatus);
  }, [dateFrom, dateTo, paymentStatus]);

  const handleExport = () => {
    exportToExcel(productProfits, totals);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
            <div>
              <h1 className="text-lg md:text-xl font-semibold tracking-tight">
                Laporan Profit
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Analisis keuntungan per produk
              </p>
            </div>

            <Button
              onClick={handleExport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Revenue */}
            <Card className="border shadow-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Revenue
                    </p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-semibold tabular-nums tracking-tight">
                      {formatRupiah(totals.totalRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hanya transaksi lunas
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Cost */}
            <Card className="border shadow-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Cost
                    </p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-semibold tabular-nums tracking-tight text-[hsl(0,84%,60%)]">
                      {formatRupiah(totals.totalCost)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Biaya bahan baku
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary">
                    <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-[hsl(0,84%,60%)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Profit */}
            <Card className="border shadow-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Total Profit
                    </p>
                    <p
                      className={cn(
                        "text-xl md:text-2xl lg:text-3xl font-semibold tabular-nums tracking-tight",
                        totals.totalProfit >= 0
                          ? "text-[hsl(142,76%,36%)]"
                          : "text-[hsl(0,84%,60%)]"
                      )}
                    >
                      {formatRupiah(totals.totalProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Margin:{" "}
                      {totals.totalRevenue > 0
                        ? (
                            (totals.totalProfit / totals.totalRevenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-secondary">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-[hsl(142,76%,36%)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="border shadow-none mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date From */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dateFrom"
                    className="text-xs text-muted-foreground"
                  >
                    Dari Tanggal
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dateTo"
                    className="text-xs text-muted-foreground"
                  >
                    Sampai Tanggal
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Product Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Produk
                  </Label>
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Semua Produk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Produk</SelectItem>
                      {PRODUCTS.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status Toggle */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Status Bayar
                  </Label>
                  <div className="flex gap-1 p-1 bg-secondary rounded-md h-9">
                    <button
                      onClick={() => setPaymentStatus("Sudah")}
                      className={cn(
                        "flex-1 text-xs font-medium rounded transition-colors",
                        paymentStatus === "Sudah"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Lunas
                    </button>
                    <button
                      onClick={() => setPaymentStatus("all")}
                      className={cn(
                        "flex-1 text-xs font-medium rounded transition-colors",
                        paymentStatus === "all"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Semua
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold">
              Detail Per Produk
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {productProfits.length} produk
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <ProfitTable data={productProfits} />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            <ProfitCards data={productProfits} />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
