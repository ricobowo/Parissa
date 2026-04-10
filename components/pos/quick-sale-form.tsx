"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickSaleFormProps {
  namaPembeli: string;
  setNamaPembeli: (value: string) => void;
  tanggal: string;
  setTanggal: (value: string) => void;
  isBundling: boolean;
  setIsBundling: (value: boolean) => void;
  statusBayar: "sudah" | "belum";
  setStatusBayar: (value: "sudah" | "belum") => void;
  menuDetail: string;
  setMenuDetail: (value: string) => void;
  topping: string;
  setTopping: (value: string) => void;
  tipePenjualan: "direct" | "preorder";
  setTipePenjualan: (value: "direct" | "preorder") => void;
  catatan: string;
  setCatatan: (value: string) => void;
}

export function QuickSaleForm({
  namaPembeli,
  setNamaPembeli,
  tanggal,
  setTanggal,
  isBundling,
  setIsBundling,
  statusBayar,
  setStatusBayar,
  menuDetail,
  setMenuDetail,
  topping,
  setTopping,
  tipePenjualan,
  setTipePenjualan,
  catatan,
  setCatatan,
}: QuickSaleFormProps) {
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Required Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="namaPembeli">
            Nama Pembeli <span className="text-destructive">*</span>
          </Label>
          <Input
            id="namaPembeli"
            placeholder="Masukkan nama pembeli"
            value={namaPembeli}
            onChange={(e) => setNamaPembeli(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggal">
            Tanggal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="bundling">Bundling</Label>
          <Switch
            id="bundling"
            checked={isBundling}
            onCheckedChange={setIsBundling}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Status Bayar <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={statusBayar === "sudah" ? "default" : "outline"}
              className={
                statusBayar === "sudah"
                  ? "flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  : "flex-1"
              }
              onClick={() => setStatusBayar("sudah")}
            >
              Sudah
            </Button>
            <Button
              type="button"
              variant={statusBayar === "belum" ? "default" : "outline"}
              className={
                statusBayar === "belum"
                  ? "flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "flex-1"
              }
              onClick={() => setStatusBayar("belum")}
            >
              Belum
            </Button>
          </div>
        </div>
      </div>

      {/* Optional Fields - Collapsible */}
      <Collapsible open={isOptionalOpen} onOpenChange={setIsOptionalOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between py-2 px-0 h-auto hover:bg-transparent"
          >
            <span className="text-sm text-muted-foreground">
              Detail Opsional
            </span>
            {isOptionalOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="menuDetail">Menu Detail</Label>
            <Input
              id="menuDetail"
              placeholder="Detail menu tambahan"
              value={menuDetail}
              onChange={(e) => setMenuDetail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topping">Topping</Label>
            <Input
              id="topping"
              placeholder="Topping tambahan"
              value={topping}
              onChange={(e) => setTopping(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipePenjualan">Tipe Penjualan</Label>
            <Select
              value={tipePenjualan}
              onValueChange={(value: "direct" | "preorder") =>
                setTipePenjualan(value)
              }
            >
              <SelectTrigger id="tipePenjualan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="preorder">Pre-order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              placeholder="Catatan tambahan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
