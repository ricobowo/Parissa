// Mock data for Parissa POS Dashboard
// Product names and pricing based on PRD

export const PRODUCTS = [
  { id: "1", name: "Vanilla Pannacotta", sellingPrice: 25000, color: "#171717" },
  { id: "2", name: "Earl Grey Pannacotta", sellingPrice: 28000, color: "#404040" },
  { id: "3", name: "Bundling 3pcs", sellingPrice: 70000, color: "#525252" },
  { id: "4", name: "Fresh Creamy Earl Grey", sellingPrice: 22000, color: "#737373" },
  { id: "5", name: "Matcha", sellingPrice: 25000, color: "#a3a3a3" },
  { id: "6", name: "Lotus", sellingPrice: 25000, color: "#3b82f6" },
] as const;

export type Product = (typeof PRODUCTS)[number];

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  product: string;
  amount: number;
  totalPrice: number;
  paymentStatus: "Sudah" | "Belum";
  isBundling: boolean;
}

// Generate realistic mock transactions
const customerNames = [
  "Budi Santoso", "Siti Rahma", "Andi Wijaya", "Dewi Kusuma", 
  "Rudi Hartono", "Maya Indah", "Fajar Pratama", "Rina Sari",
  "Agus Setiawan", "Putri Ayu", "Dimas Putra", "Wulan Sari",
  "Ahmad Fadli", "Nina Lestari", "Bayu Saputra", "Citra Dewi"
];

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split("T")[0];
}

function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < 45; i++) {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const isBundling = product.name === "Bundling 3pcs";
    const amount = isBundling ? 1 : Math.floor(Math.random() * 3) + 1;
    const isPaid = Math.random() > 0.25;
    
    transactions.push({
      id: `TXN-${String(i + 1).padStart(4, "0")}`,
      date: randomDate(14),
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      product: product.name,
      amount,
      totalPrice: product.sellingPrice * amount,
      paymentStatus: isPaid ? "Sudah" : "Belum",
      isBundling,
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const TRANSACTIONS = generateTransactions();

// Calculate metrics
export function calculateMetrics(transactions: Transaction[]) {
  const paidTransactions = transactions.filter(t => t.paymentStatus === "Sudah");
  const unpaidTransactions = transactions.filter(t => t.paymentStatus === "Belum");
  
  // Revenue only counts paid transactions
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
  
  // Cost is approximately 40% of revenue (based on typical F&B margins)
  const costPercentage = 0.4;
  const totalCost = transactions.reduce((sum, t) => sum + (t.totalPrice * costPercentage), 0);
  
  // Profit only from paid transactions
  const totalProfit = paidTransactions.reduce((sum, t) => sum + (t.totalPrice * (1 - costPercentage)), 0);
  
  // Total unpaid amount
  const totalUnpaid = unpaidTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
  
  // Total purchase amount (all transactions)
  const totalPurchaseAmount = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
  
  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalUnpaid,
    totalPurchaseAmount,
    totalTransactions: transactions.length,
  };
}

// Sales by product
export function getSalesByProduct(transactions: Transaction[]) {
  const salesMap = new Map<string, number>();
  
  PRODUCTS.forEach(p => salesMap.set(p.name, 0));
  
  transactions
    .filter(t => t.paymentStatus === "Sudah")
    .forEach(t => {
      salesMap.set(t.product, (salesMap.get(t.product) || 0) + t.totalPrice);
    });
  
  return PRODUCTS.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
    fullName: p.name,
    value: salesMap.get(p.name) || 0,
    fill: p.color,
  }));
}

// Bundling vs Non-bundling
export function getBundlingData(transactions: Transaction[]) {
  const bundling = transactions
    .filter(t => t.isBundling && t.paymentStatus === "Sudah")
    .reduce((sum, t) => sum + t.totalPrice, 0);
  
  const nonBundling = transactions
    .filter(t => !t.isBundling && t.paymentStatus === "Sudah")
    .reduce((sum, t) => sum + t.totalPrice, 0);
  
  return [
    { name: "Bundling", value: bundling, fill: "#171717" },
    { name: "Non-Bundling", value: nonBundling, fill: "#a3a3a3" },
  ];
}

// Daily revenue by product
export function getDailyRevenueData(transactions: Transaction[]) {
  const paidTransactions = transactions.filter(t => t.paymentStatus === "Sudah");
  const dateMap = new Map<string, Record<string, number>>();
  
  paidTransactions.forEach(t => {
    if (!dateMap.has(t.date)) {
      const entry: Record<string, number> = { date: 0 };
      PRODUCTS.forEach(p => entry[p.name] = 0);
      dateMap.set(t.date, entry);
    }
    const entry = dateMap.get(t.date)!;
    entry[t.product] = (entry[t.product] || 0) + t.totalPrice;
  });
  
  const data = Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      ...values,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days with data
  
  return data;
}

// Filter transactions
export function filterTransactions(
  transactions: Transaction[],
  paymentStatus: string,
  product: string
): Transaction[] {
  return transactions.filter(t => {
    const matchStatus = paymentStatus === "all" || t.paymentStatus === paymentStatus;
    const matchProduct = product === "all" || t.product === product;
    return matchStatus && matchProduct;
  });
}
