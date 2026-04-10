"use client";

import { Select } from "@/components/ui/select";
import { PRODUCTS } from "@/lib/data";

interface FilterBarProps {
  paymentStatus: string;
  product: string;
  onPaymentStatusChange: (value: string) => void;
  onProductChange: (value: string) => void;
}

export function FilterBar({
  paymentStatus,
  product,
  onPaymentStatusChange,
  onProductChange,
}: FilterBarProps) {
  const paymentOptions = [
    { value: "all", label: "Semua Status" },
    { value: "Sudah", label: "Sudah Bayar" },
    { value: "Belum", label: "Belum Bayar" },
  ];

  const productOptions = [
    { value: "all", label: "Semua Produk" },
    ...PRODUCTS.map((p) => ({ value: p.name, label: p.name })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-lg border">
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Status Pembayaran
        </label>
        <Select
          options={paymentOptions}
          value={paymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Produk
        </label>
        <Select
          options={productOptions}
          value={product}
          onChange={(e) => onProductChange(e.target.value)}
        />
      </div>
    </div>
  );
}
