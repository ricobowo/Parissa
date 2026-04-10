export type CustomerLabel = "VIP" | "Regular";

export interface Purchase {
  id: string;
  date: string;
  products: { name: string; qty: number; price: number }[];
  total: number;
  status: "Sudah" | "Belum";
}

export interface Customer {
  id: string;
  name: string;
  totalTransactions: number;
  totalSpending: number;
  favoriteProduct: string;
  lastPurchase: string;
  label: CustomerLabel;
  purchases: Purchase[];
}

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Anisa Rahma",
    totalTransactions: 24,
    totalSpending: 1250000,
    favoriteProduct: "Earl Grey Pannacotta",
    lastPurchase: "2026-04-08",
    label: "VIP",
    purchases: [
      {
        id: "p1",
        date: "2026-04-08",
        products: [
          { name: "Earl Grey Pannacotta", qty: 3, price: 20000 },
          { name: "Fresh Creamy Matcha", qty: 2, price: 28000 },
        ],
        total: 116000,
        status: "Sudah",
      },
      {
        id: "p2",
        date: "2026-04-02",
        products: [{ name: "Bundling 3pcs", qty: 2, price: 50000 }],
        total: 100000,
        status: "Sudah",
      },
      {
        id: "p3",
        date: "2026-03-28",
        products: [
          { name: "Vanilla Pannacotta", qty: 5, price: 20000 },
          { name: "Earl Grey Pannacotta", qty: 5, price: 20000 },
        ],
        total: 200000,
        status: "Sudah",
      },
      {
        id: "p4",
        date: "2026-03-15",
        products: [{ name: "Fresh Creamy Earl Grey", qty: 4, price: 28000 }],
        total: 112000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c2",
    name: "Budi Santoso",
    totalTransactions: 18,
    totalSpending: 980000,
    favoriteProduct: "Bundling 3pcs",
    lastPurchase: "2026-04-07",
    label: "VIP",
    purchases: [
      {
        id: "p5",
        date: "2026-04-07",
        products: [{ name: "Bundling 3pcs", qty: 3, price: 50000 }],
        total: 150000,
        status: "Sudah",
      },
      {
        id: "p6",
        date: "2026-03-30",
        products: [
          { name: "Fresh Creamy Lotus", qty: 2, price: 28000 },
          { name: "Vanilla Pannacotta", qty: 2, price: 20000 },
        ],
        total: 96000,
        status: "Sudah",
      },
      {
        id: "p7",
        date: "2026-03-20",
        products: [{ name: "Earl Grey Pannacotta", qty: 6, price: 20000 }],
        total: 120000,
        status: "Belum",
      },
    ],
  },
  {
    id: "c3",
    name: "Clara Wijaya",
    totalTransactions: 12,
    totalSpending: 650000,
    favoriteProduct: "Fresh Creamy Matcha",
    lastPurchase: "2026-04-05",
    label: "VIP",
    purchases: [
      {
        id: "p8",
        date: "2026-04-05",
        products: [{ name: "Fresh Creamy Matcha", qty: 4, price: 28000 }],
        total: 112000,
        status: "Sudah",
      },
      {
        id: "p9",
        date: "2026-03-25",
        products: [
          { name: "Fresh Creamy Matcha", qty: 2, price: 28000 },
          { name: "Bundling 3pcs", qty: 1, price: 50000 },
        ],
        total: 106000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c4",
    name: "Dewi Lestari",
    totalTransactions: 6,
    totalSpending: 320000,
    favoriteProduct: "Vanilla Pannacotta",
    lastPurchase: "2026-04-03",
    label: "Regular",
    purchases: [
      {
        id: "p10",
        date: "2026-04-03",
        products: [{ name: "Vanilla Pannacotta", qty: 4, price: 20000 }],
        total: 80000,
        status: "Sudah",
      },
      {
        id: "p11",
        date: "2026-03-18",
        products: [
          { name: "Vanilla Pannacotta", qty: 3, price: 20000 },
          { name: "Fresh Creamy Earl Grey", qty: 2, price: 28000 },
        ],
        total: 116000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c5",
    name: "Eko Prasetyo",
    totalTransactions: 4,
    totalSpending: 200000,
    favoriteProduct: "Fresh Creamy Lotus",
    lastPurchase: "2026-03-28",
    label: "Regular",
    purchases: [
      {
        id: "p12",
        date: "2026-03-28",
        products: [{ name: "Fresh Creamy Lotus", qty: 3, price: 28000 }],
        total: 84000,
        status: "Sudah",
      },
      {
        id: "p13",
        date: "2026-03-10",
        products: [{ name: "Bundling 3pcs", qty: 1, price: 50000 }],
        total: 50000,
        status: "Belum",
      },
    ],
  },
  {
    id: "c6",
    name: "Fitri Handayani",
    totalTransactions: 3,
    totalSpending: 150000,
    favoriteProduct: "Earl Grey Pannacotta",
    lastPurchase: "2026-03-22",
    label: "Regular",
    purchases: [
      {
        id: "p14",
        date: "2026-03-22",
        products: [{ name: "Earl Grey Pannacotta", qty: 5, price: 20000 }],
        total: 100000,
        status: "Sudah",
      },
      {
        id: "p15",
        date: "2026-03-05",
        products: [{ name: "Bundling 3pcs", qty: 1, price: 50000 }],
        total: 50000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c7",
    name: "Gilang Permana",
    totalTransactions: 8,
    totalSpending: 420000,
    favoriteProduct: "Bundling 3pcs",
    lastPurchase: "2026-04-06",
    label: "Regular",
    purchases: [
      {
        id: "p16",
        date: "2026-04-06",
        products: [
          { name: "Bundling 3pcs", qty: 2, price: 50000 },
          { name: "Fresh Creamy Matcha", qty: 1, price: 28000 },
        ],
        total: 128000,
        status: "Sudah",
      },
      {
        id: "p17",
        date: "2026-03-29",
        products: [{ name: "Vanilla Pannacotta", qty: 6, price: 20000 }],
        total: 120000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c8",
    name: "Hana Safitri",
    totalTransactions: 15,
    totalSpending: 850000,
    favoriteProduct: "Fresh Creamy Earl Grey",
    lastPurchase: "2026-04-09",
    label: "VIP",
    purchases: [
      {
        id: "p18",
        date: "2026-04-09",
        products: [
          { name: "Fresh Creamy Earl Grey", qty: 5, price: 28000 },
          { name: "Earl Grey Pannacotta", qty: 3, price: 20000 },
        ],
        total: 200000,
        status: "Belum",
      },
      {
        id: "p19",
        date: "2026-04-01",
        products: [{ name: "Bundling 3pcs", qty: 3, price: 50000 }],
        total: 150000,
        status: "Sudah",
      },
      {
        id: "p20",
        date: "2026-03-24",
        products: [{ name: "Fresh Creamy Earl Grey", qty: 4, price: 28000 }],
        total: 112000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c9",
    name: "Irfan Maulana",
    totalTransactions: 2,
    totalSpending: 100000,
    favoriteProduct: "Bundling 3pcs",
    lastPurchase: "2026-03-15",
    label: "Regular",
    purchases: [
      {
        id: "p21",
        date: "2026-03-15",
        products: [{ name: "Bundling 3pcs", qty: 2, price: 50000 }],
        total: 100000,
        status: "Sudah",
      },
    ],
  },
  {
    id: "c10",
    name: "Jessica Tanoto",
    totalTransactions: 20,
    totalSpending: 1100000,
    favoriteProduct: "Fresh Creamy Matcha",
    lastPurchase: "2026-04-10",
    label: "VIP",
    purchases: [
      {
        id: "p22",
        date: "2026-04-10",
        products: [
          { name: "Fresh Creamy Matcha", qty: 6, price: 28000 },
          { name: "Vanilla Pannacotta", qty: 4, price: 20000 },
        ],
        total: 248000,
        status: "Sudah",
      },
      {
        id: "p23",
        date: "2026-04-04",
        products: [{ name: "Bundling 3pcs", qty: 4, price: 50000 }],
        total: 200000,
        status: "Sudah",
      },
      {
        id: "p24",
        date: "2026-03-27",
        products: [
          { name: "Fresh Creamy Matcha", qty: 3, price: 28000 },
          { name: "Fresh Creamy Lotus", qty: 2, price: 28000 },
        ],
        total: 140000,
        status: "Sudah",
      },
    ],
  },
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
