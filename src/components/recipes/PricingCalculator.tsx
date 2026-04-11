'use client'

// ============================================================
// File: src/components/recipes/PricingCalculator.tsx
// Versi: v0.6.1
// Deskripsi: Komponen Pricing Calculator — input target margin (%),
//            output harga jual minimum berdasarkan cost per unit.
//            Menggunakan Formula 5.11: min_price = cost / (1 - margin/100)
//            Desain diselaraskan dengan HTML reference (Tailwind).
// ============================================================

import { useState } from 'react'
import { calcMinSellingPrice, formatRupiah, formatMargin } from '@/lib/formulas'

interface PricingCalculatorProps {
  /** Cost per unit produk — dihitung dari BOM (Formula 5.2) */
  costPerUnit: number
  /** Harga jual saat ini untuk perbandingan */
  currentSellingPrice: number
}

export function PricingCalculator({ costPerUnit, currentSellingPrice }: PricingCalculatorProps) {
  // Target margin yang diinginkan (dalam %)
  const [targetMargin, setTargetMargin] = useState<string>('70')

  // Preset margin yang umum dipakai
  const MARGIN_PRESETS = [50, 70, 100, 150, 200, 300]

  // Hitung harga jual minimum dari formula 5.11
  const margin = parseFloat(targetMargin)
  const isValidMargin = !isNaN(margin) && margin > 0 && margin < 100
  const minSellingPrice = isValidMargin && costPerUnit > 0
    ? calcMinSellingPrice({ costPerUnit, targetMarginPct: margin })
    : null

  // Hitung margin aktual dari harga saat ini
  const actualMarginFromCost = costPerUnit > 0
    ? ((currentSellingPrice - costPerUnit) / costPerUnit) * 100
    : null

  // Perbandingan: apakah harga saat ini sudah di atas minimum?
  const priceStatus = minSellingPrice != null
    ? currentSellingPrice >= minSellingPrice ? 'above' : 'below'
    : null

  return (
    <div className="bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 overflow-hidden font-['Inter']">
      {/* Header kartu */}
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide leading-4">
            PRICING TOOLS
          </p>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider leading-5 mt-0.5">
            Pricing Calculator
          </h3>
        </div>
        <span className="px-2 py-1 bg-blue-700/10 rounded text-[10px] font-bold text-blue-700 uppercase">
          Formula 5.11
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Pesan jika belum ada data cost */}
        {costPerUnit <= 0 && (
          <div className="px-4 py-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-700">
              Tambahkan bahan ke resep terlebih dahulu untuk menggunakan kalkulator ini.
            </p>
          </div>
        )}

        {/* Grid info cost & margin saat ini */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-100/50 rounded-lg px-4 py-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">Cost/Unit</p>
            <p className={`text-sm font-bold ${costPerUnit > 0 ? 'text-gray-800' : 'text-zinc-400'}`}>
              {costPerUnit > 0 ? formatRupiah(costPerUnit) : '—'}
            </p>
          </div>
          <div className="bg-zinc-100/50 rounded-lg px-4 py-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">Harga Jual</p>
            <p className="text-sm font-bold text-blue-700">
              {formatRupiah(currentSellingPrice)}
            </p>
          </div>
          <div className="bg-zinc-100/50 rounded-lg px-4 py-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide mb-1">Margin Saat Ini</p>
            <p className={`text-sm font-bold ${
              actualMarginFromCost == null
                ? 'text-zinc-400'
                : actualMarginFromCost >= 100
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}>
              {actualMarginFromCost != null ? formatMargin(actualMarginFromCost) : '—'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-100" />

        {/* Input target margin */}
        <div>
          <label className="block text-zinc-600 text-[10px] font-normal uppercase leading-4 tracking-wide mb-3">
            Target Margin dari Cost (%)
          </label>

          {/* Preset tombol cepat — sesuai pola filter chip HTML ref */}
          <div className="flex flex-wrap gap-2 mb-3">
            {MARGIN_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetMargin(String(preset))}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  targetMargin === String(preset)
                    ? 'bg-blue-700/10 text-blue-700'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>

          {/* Input angka manual */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              min="0.1"
              max="99.9"
              step="0.1"
              placeholder="cth. 70"
              disabled={costPerUnit <= 0}
              className={`flex-1 bg-zinc-100 rounded-sm px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-700/20 ${
                costPerUnit <= 0 ? 'opacity-40' : ''
              }`}
            />
            <span className="text-sm font-semibold text-zinc-600 flex-shrink-0">%</span>
          </div>

          {/* Validasi input */}
          {!isValidMargin && targetMargin !== '' && (
            <p className="text-xs text-red-500 mt-1">
              Margin harus antara 0–99%
            </p>
          )}
        </div>

        {/* Hasil kalkulasi harga minimum */}
        {minSellingPrice != null && (
          <div className={`rounded-lg p-4 ${
            priceStatus === 'above'
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
              priceStatus === 'above' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              Harga Jual Minimum untuk {formatMargin(margin)} Margin
            </p>
            <p className="text-2xl font-extrabold text-gray-800">
              {formatRupiah(minSellingPrice)}
            </p>
            <p className={`text-xs mt-1.5 font-semibold ${
              priceStatus === 'above' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {priceStatus === 'above'
                ? `✓ Harga jual saat ini (${formatRupiah(currentSellingPrice)}) sudah di atas minimum.`
                : `⚠ Harga jual saat ini (${formatRupiah(currentSellingPrice)}) di bawah minimum!`}
            </p>
          </div>
        )}

        {/* Catatan formula */}
        <p className="text-[10px] text-zinc-400">
          Formula: min_price = cost_per_unit ÷ (1 − target_margin ÷ 100) &nbsp;|&nbsp;
          Margin PRD = (harga − cost) ÷ cost × 100
        </p>
      </div>
    </div>
  )
}
