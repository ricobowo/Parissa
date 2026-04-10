"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import type { Transaction } from "@/lib/data";

interface TransactionsTableProps {
  transactions: Transaction[];
  title: string;
  type: "paid" | "unpaid";
}

export function TransactionsTable({
  transactions,
  title,
  type,
}: TransactionsTableProps) {
  const filteredTransactions = transactions.filter((t) =>
    type === "paid" ? t.paymentStatus === "Sudah" : t.paymentStatus === "Belum"
  );

  const isEmpty = filteredTransactions.length === 0;

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge
            variant={type === "paid" ? "success" : "warning"}
            className="text-[10px]"
          >
            {filteredTransactions.length} transaksi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Tidak ada transaksi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Tanggal</TableHead>
                  <TableHead className="text-xs font-medium">
                    Pelanggan
                  </TableHead>
                  <TableHead className="text-xs font-medium hidden sm:table-cell">
                    Produk
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Jumlah
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 8).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-xs py-3">
                      {new Date(transaction.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-xs py-3 font-medium">
                      <div className="truncate max-w-[120px]">
                        {transaction.customerName}
                      </div>
                      <div className="text-[10px] text-muted-foreground sm:hidden truncate max-w-[120px]">
                        {transaction.product}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[140px]">
                          {transaction.product}
                        </span>
                        {transaction.isBundling && (
                          <Badge variant="secondary" className="text-[9px] px-1.5">
                            Bundle
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-3 text-right tabular-nums">
                      {transaction.amount}
                    </TableCell>
                    <TableCell className="text-xs py-3 text-right font-medium tabular-nums">
                      {formatRupiah(transaction.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTransactions.length > 8 && (
              <div className="p-3 text-center border-t">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Lihat semua {filteredTransactions.length} transaksi
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
