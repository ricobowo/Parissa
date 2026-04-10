"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Ingredient, suppliers } from "@/lib/stock-data";

interface RestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: Ingredient[];
  onSubmit: (data: RestockData) => void;
}

export interface RestockData {
  ingredientId: string;
  qty: number;
  price: number;
  supplierId: string;
  date: string;
}

export function RestockModal({
  open,
  onOpenChange,
  ingredients,
  onSubmit,
}: RestockModalProps) {
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const selectedIngredient = ingredients.find((i) => i.id === ingredientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ingredientId || !qty || !price || !supplierId || !date) return;

    onSubmit({
      ingredientId,
      qty: Number(qty),
      price: Number(price),
      supplierId,
      date,
    });

    // Reset form
    setIngredientId("");
    setQty("");
    setPrice("");
    setSupplierId("");
    setDate(new Date().toISOString().split("T")[0]);
    onOpenChange(false);
  };

  const isValid = ingredientId && qty && price && supplierId && date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Restock</DialogTitle>
          <DialogDescription>
            Catat pembelian bahan baku untuk menambah stok.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient">Bahan</Label>
            <Select value={ingredientId} onValueChange={setIngredientId}>
              <SelectTrigger id="ingredient">
                <SelectValue placeholder="Pilih bahan" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIngredient && (
              <p className="text-xs text-muted-foreground">
                Stok saat ini: {selectedIngredient.qty} {selectedIngredient.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Jumlah</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                placeholder="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              {selectedIngredient && (
                <p className="text-xs text-muted-foreground">
                  {selectedIngredient.unit}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga Total (Rp)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!isValid}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
