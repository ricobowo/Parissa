export type StockStatus = "aman" | "menipis" | "habis";

export interface Ingredient {
  id: string;
  name: string;
  qty: number;
  unit: string;
  minLevel: number;
  status: StockStatus;
}

export interface Supplier {
  id: string;
  name: string;
}

export const suppliers: Supplier[] = [
  { id: "1", name: "Toko Bahan Kue Makmur" },
  { id: "2", name: "PT Susu Segar Indonesia" },
  { id: "3", name: "UD Teh Premium" },
  { id: "4", name: "CV Bahan Minuman Jaya" },
];

export const ingredients: Ingredient[] = [
  {
    id: "1",
    name: "Susu Full Cream",
    qty: 15,
    unit: "liter",
    minLevel: 10,
    status: "aman",
  },
  {
    id: "2",
    name: "Cream",
    qty: 8,
    unit: "liter",
    minLevel: 5,
    status: "aman",
  },
  {
    id: "3",
    name: "Gelatin",
    qty: 3,
    unit: "pack",
    minLevel: 5,
    status: "menipis",
  },
  {
    id: "4",
    name: "Gula Pasir",
    qty: 12,
    unit: "kg",
    minLevel: 8,
    status: "aman",
  },
  {
    id: "5",
    name: "Vanilla Extract",
    qty: 2,
    unit: "botol",
    minLevel: 3,
    status: "menipis",
  },
  {
    id: "6",
    name: "Earl Grey Tea",
    qty: 0,
    unit: "pack",
    minLevel: 4,
    status: "habis",
  },
  {
    id: "7",
    name: "Matcha Powder",
    qty: 1,
    unit: "pack",
    minLevel: 3,
    status: "menipis",
  },
  {
    id: "8",
    name: "Lotus Biscoff",
    qty: 6,
    unit: "pack",
    minLevel: 4,
    status: "aman",
  },
  {
    id: "9",
    name: "Cup 200ml",
    qty: 150,
    unit: "pcs",
    minLevel: 100,
    status: "aman",
  },
  {
    id: "10",
    name: "Cup 350ml",
    qty: 45,
    unit: "pcs",
    minLevel: 80,
    status: "menipis",
  },
  {
    id: "11",
    name: "Straw",
    qty: 0,
    unit: "pack",
    minLevel: 5,
    status: "habis",
  },
  {
    id: "12",
    name: "Caramel Sauce",
    qty: 4,
    unit: "botol",
    minLevel: 3,
    status: "aman",
  },
];

export function getStatusLabel(status: StockStatus): string {
  switch (status) {
    case "aman":
      return "Aman";
    case "menipis":
      return "Menipis";
    case "habis":
      return "Habis";
  }
}

export function calculateStatus(qty: number, minLevel: number): StockStatus {
  if (qty === 0) return "habis";
  if (qty <= minLevel) return "menipis";
  return "aman";
}
