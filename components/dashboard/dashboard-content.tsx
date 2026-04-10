"use client";

import { useState, useMemo } from "react";
import {
  Banknote,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import { MetricCard } from "./metric-card";
import { FilterBar } from "./filter-bar";
import { SalesChart } from "./sales-chart";
import { BundlingChart } from "./bundling-chart";
import { DailyRevenueChart } from "./daily-revenue-chart";
import { TransactionsTable } from "./transactions-table";
import {
  TRANSACTIONS,
  calculateMetrics,
  getSalesByProduct,
  getBundlingData,
  getDailyRevenueData,
  filterTransactions,
} from "@/lib/data";

export function DashboardContent() {
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [product, setProduct] = useState("all");

  const filteredTransactions = useMemo(
    () => filterTransactions(TRANSACTIONS, paymentStatus, product),
    [paymentStatus, product]
  );

  const metrics = useMemo(
    () => calculateMetrics(filteredTransactions),
    [filteredTransactions]
  );

  const salesByProduct = useMemo(
    () => getSalesByProduct(filteredTransactions),
    [filteredTransactions]
  );

  const bundlingData = useMemo(
    () => getBundlingData(filteredTransactions),
    [filteredTransactions]
  );

  const dailyRevenueData = useMemo(
    () => getDailyRevenueData(filteredTransactions),
    [filteredTransactions]
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Title (Mobile) */}
      <div className="lg:hidden">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan bisnis Parissa
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          icon={Banknote}
          type="success"
        />
        <MetricCard
          title="Total Cost"
          value={metrics.totalCost}
          icon={TrendingDown}
          type="danger"
        />
        <MetricCard
          title="Total Profit"
          value={metrics.totalProfit}
          icon={TrendingUp}
          type="success"
        />
        <MetricCard
          title="Unpaid"
          value={metrics.totalUnpaid}
          icon={AlertCircle}
          type="warning"
        />
        <MetricCard
          title="Purchase Amount"
          value={metrics.totalPurchaseAmount}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Transaksi"
          value={metrics.totalTransactions}
          icon={Receipt}
          isCurrency={false}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        paymentStatus={paymentStatus}
        product={product}
        onPaymentStatusChange={setPaymentStatus}
        onProductChange={setProduct}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SalesChart data={salesByProduct} />
        <BundlingChart data={bundlingData} />
      </div>

      {/* Daily Revenue Chart */}
      <DailyRevenueChart data={dailyRevenueData} />

      {/* Transaction Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TransactionsTable
          transactions={filteredTransactions}
          title="Transaksi Lunas"
          type="paid"
        />
        <TransactionsTable
          transactions={filteredTransactions}
          title="Transaksi Belum Lunas"
          type="unpaid"
        />
      </div>
    </div>
  );
}
