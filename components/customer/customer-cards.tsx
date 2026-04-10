"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Customer, formatRupiah, formatDate } from "@/lib/customer-data";
import { Crown, ChevronRight } from "lucide-react";

interface CustomerCardsProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerCards({
  customers,
  onSelectCustomer,
}: CustomerCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className="cursor-pointer hover:bg-secondary/30 transition-colors"
          onClick={() => onSelectCustomer(customer)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{customer.name}</p>
                    {customer.label === "VIP" ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] px-1.5 py-0">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        VIP
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Regular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {customer.favoriteProduct}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Transaksi
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {customer.totalTransactions}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Total Spent
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatRupiah(customer.totalSpending)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Terakhir
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatDate(customer.lastPurchase)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
