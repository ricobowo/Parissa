"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/pos/product-card";
import { QuickSaleForm } from "@/components/pos/quick-sale-form";
import Link from "next/link";

const products = [
  { id: 1, name: "Vanilla Pannacotta", price: 20000 },
  { id: 2, name: "Earl Grey Pannacotta", price: 20000 },
  { id: 3, name: "Bundling 3pcs", price: 50000 },
  { id: 4, name: "Fresh Creamy Earl Grey", price: 28000 },
  { id: 5, name: "Fresh Creamy Matcha", price: 28000 },
  { id: 6, name: "Fresh Creamy Lotus", price: 28000 },
];

export default function POSPage() {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 0]))
  );

  // Form state
  const [namaPembeli, setNamaPembeli] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isBundling, setIsBundling] = useState(false);
  const [statusBayar, setStatusBayar] = useState<"sudah" | "belum">("sudah");
  const [menuDetail, setMenuDetail] = useState("");
  const [topping, setTopping] = useState("");
  const [tipePenjualan, setTipePenjualan] = useState<"direct" | "preorder">(
    "direct"
  );
  const [catatan, setCatatan] = useState("");

  const handleIncrement = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDecrement = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const totalPrice = products.reduce((sum, product) => {
    return sum + product.price * quantities[product.id];
  }, 0);

  const totalItems = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const handleSubmit = () => {
    if (!namaPembeli.trim()) {
      alert("Nama pembeli wajib diisi");
      return;
    }
    if (totalItems === 0) {
      alert("Pilih minimal 1 produk");
      return;
    }

    const selectedProducts = products
      .filter((p) => quantities[p.id] > 0)
      .map((p) => ({
        name: p.name,
        price: p.price,
        quantity: quantities[p.id],
        subtotal: p.price * quantities[p.id],
      }));

    const transaction = {
      namaPembeli,
      tanggal,
      isBundling,
      statusBayar,
      menuDetail,
      topping,
      tipePenjualan,
      catatan,
      products: selectedProducts,
      total: totalPrice,
    };

    console.log("Transaction saved:", transaction);
    alert(`Transaksi berhasil disimpan!\nTotal: Rp${totalPrice.toLocaleString("id-ID")}`);

    // Reset form
    setQuantities(Object.fromEntries(products.map((p) => [p.id, 0])));
    setNamaPembeli("");
    setTanggal(new Date().toISOString().split("T")[0]);
    setIsBundling(false);
    setStatusBayar("sudah");
    setMenuDetail("");
    setTopping("");
    setTipePenjualan("direct");
    setCatatan("");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg">Quick Sale</h1>
            <p className="text-xs text-muted-foreground">Parissa POS</p>
          </div>
        </div>
      </header>

      <main className="pb-32">
        {/* Product Grid */}
        <section className="p-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pilih Produk
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                quantity={quantities[product.id]}
                onIncrement={() => handleIncrement(product.id)}
                onDecrement={() => handleDecrement(product.id)}
              />
            ))}
          </div>
        </section>

        {/* Form Section */}
        <section className="px-4 pb-4">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Detail Transaksi
            </h2>
            <QuickSaleForm
              namaPembeli={namaPembeli}
              setNamaPembeli={setNamaPembeli}
              tanggal={tanggal}
              setTanggal={setTanggal}
              isBundling={isBundling}
              setIsBundling={setIsBundling}
              statusBayar={statusBayar}
              setStatusBayar={setStatusBayar}
              menuDetail={menuDetail}
              setMenuDetail={setMenuDetail}
              topping={topping}
              setTopping={setTopping}
              tipePenjualan={tipePenjualan}
              setTipePenjualan={setTipePenjualan}
              catatan={catatan}
              setCatatan={setCatatan}
            />
          </div>
        </section>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold tabular-nums">
              Rp{totalPrice.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Item</p>
            <p className="text-lg font-semibold tabular-nums">{totalItems}</p>
          </div>
        </div>
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={totalItems === 0 || !namaPembeli.trim()}
        >
          Simpan Transaksi
        </Button>
      </div>
    </div>
  );
}
