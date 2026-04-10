"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Customer, formatRupiah, formatDate } from "@/lib/customer-data";
import { Crown } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  onSelectCustomer,
}: CustomerTableProps) {
  return (
    <div className="hidden md:block border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Nama</TableHead>
            <TableHead className="font-semibold text-center">
              Total Transaksi
            </TableHead>
            <TableHead className="font-semibold text-right">
              Total Spending
            </TableHead>
            <TableHead className="font-semibold">Produk Favorit</TableHead>
            <TableHead className="font-semibold">Terakhir Beli</TableHead>
            <TableHead className="font-semibold text-center">Label</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-secondary/50"
              onClick={() => onSelectCustomer(customer)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{customer.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {customer.totalTransactions}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatRupiah(customer.totalSpending)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {customer.favoriteProduct}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(customer.lastPurchase)}
              </TableCell>
              <TableCell className="text-center">
                {customer.label === "VIP" ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                    <Crown className="h-3 w-3 mr-1" />
                    VIP
                  </Badge>
                ) : (
                  <Badge variant="secondary">Regular</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
