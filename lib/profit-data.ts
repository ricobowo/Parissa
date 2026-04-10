// Profit report data for Parissa POS
import { PRODUCTS, TRANSACTIONS, type Transaction } from "./data";

export interface ProductProfit {
  id: string;
  name: string;
  qtySold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

// Cost percentages per product (realistic F&B margins)
const PRODUCT_COSTS: Record<string, number> = {
  "Vanilla Pannacotta": 0.35,
  "Earl Grey Pannacotta": 0.38,
  "Bundling 3pcs": 0.32,
  "Fresh Creamy Earl Grey": 0.40,
  "Matcha": 0.42,
  "Lotus": 0.40,
};

export function calculateProductProfits(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string,
  paymentStatus?: string
): ProductProfit[] {
  // Filter transactions
  let filtered = transactions;

  if (dateFrom) {
    filtered = filtered.filter((t) => t.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((t) => t.date <= dateTo);
  }
  if (paymentStatus && paymentStatus !== "all") {
    filtered = filtered.filter((t) => t.paymentStatus === paymentStatus);
  }

  // Group by product
  const productMap = new Map<
    string,
    { qty: number; revenue: number; cost: number }
  >();

  PRODUCTS.forEach((p) => {
    productMap.set(p.name, { qty: 0, revenue: 0, cost: 0 });
  });

  filtered.forEach((t) => {
    const entry = productMap.get(t.product);
    if (entry) {
      const costPercentage = PRODUCT_COSTS[t.product] || 0.4;
      entry.qty += t.amount;
      entry.revenue += t.totalPrice;
      entry.cost += t.totalPrice * costPercentage;
    }
  });

  return PRODUCTS.map((p) => {
    const entry = productMap.get(p.name)!;
    const profit = entry.revenue - entry.cost;
    const margin = entry.revenue > 0 ? (profit / entry.revenue) * 100 : 0;

    return {
      id: p.id,
      name: p.name,
      qtySold: entry.qty,
      revenue: entry.revenue,
      cost: entry.cost,
      profit,
      margin,
    };
  });
}

export function calculateTotals(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string,
  paymentStatus?: string
) {
  // Filter for paid only revenue
  let filtered = transactions.filter((t) => t.paymentStatus === "Sudah");

  if (dateFrom) {
    filtered = filtered.filter((t) => t.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((t) => t.date <= dateTo);
  }
  if (paymentStatus && paymentStatus !== "all" && paymentStatus !== "Sudah") {
    // If filtering for unpaid, no revenue
    return { totalRevenue: 0, totalCost: 0, totalProfit: 0 };
  }

  let totalRevenue = 0;
  let totalCost = 0;

  filtered.forEach((t) => {
    const costPercentage = PRODUCT_COSTS[t.product] || 0.4;
    totalRevenue += t.totalPrice;
    totalCost += t.totalPrice * costPercentage;
  });

  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
  };
}

export function getDateRange(): { minDate: string; maxDate: string } {
  const dates = TRANSACTIONS.map((t) => t.date).sort();
  return {
    minDate: dates[0] || new Date().toISOString().split("T")[0],
    maxDate: dates[dates.length - 1] || new Date().toISOString().split("T")[0],
  };
}

export function exportToExcel(data: ProductProfit[], totals: { totalRevenue: number; totalCost: number; totalProfit: number }) {
  // Create CSV content
  const headers = ["Produk", "Qty Terjual", "Revenue", "Cost", "Profit", "Margin %"];
  const rows = data.map((p) => [
    p.name,
    p.qtySold,
    p.revenue,
    p.cost,
    p.profit,
    p.margin.toFixed(1) + "%",
  ]);
  
  // Add totals row
  rows.push([
    "TOTAL",
    data.reduce((sum, p) => sum + p.qtySold, 0),
    totals.totalRevenue,
    totals.totalCost,
    totals.totalProfit,
    totals.totalRevenue > 0 ? ((totals.totalProfit / totals.totalRevenue) * 100).toFixed(1) + "%" : "0%",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `parissa-profit-report-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
