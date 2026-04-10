"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-lg border">
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Status Pembayaran
        </label>
        <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Sudah">Sudah Bayar</SelectItem>
            <SelectItem value="Belum">Belum Bayar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Produk
        </label>
        <Select value={product} onValueChange={onProductChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Produk</SelectItem>
            {PRODUCTS.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
