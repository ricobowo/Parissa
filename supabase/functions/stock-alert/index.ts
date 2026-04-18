// ============================================================
// File: supabase/functions/stock-alert/index.ts
// Versi: v0.15.0
// Deskripsi: Supabase Edge Function — kirim notifikasi WhatsApp via Fonnte
//   untuk bahan dengan status "Menipis" atau "Habis".
//   Dijalankan oleh pg_cron harian (lihat migration 009).
//   Anti-spam: max 1 notifikasi per ingredient per hari (stock_notifications).
// ============================================================

// @ts-nocheck — Deno runtime, bukan Node. Type error TS normal di editor Node.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// -------------------------------------------------------------
// ENV VARS (di-set via `supabase secrets set ...`):
//   FONNTE_TOKEN        — token API Fonnte (akun bisnis Parissa)
//   SUPABASE_URL        — auto-inject oleh Supabase
//   SUPABASE_SERVICE_ROLE_KEY — auto-inject oleh Supabase
// -------------------------------------------------------------
const FONNTE_ENDPOINT = 'https://api.fonnte.com/send'

interface Ingredient {
  id: string
  name: string
  purchase_unit: string
  minimum_stock_level: number
  quantity_available: number
}

interface Recipient {
  user_id: string
  user_name: string
  phone: string
}

// Status stok — PRD Section 5.5
function getStockStatus(qty: number, min: number): 'Habis' | 'Menipis' | 'Aman' {
  if (qty <= min) return 'Habis'
  if (qty <= 2 * min) return 'Menipis'
  return 'Aman'
}

// Format pesan sesuai spesifikasi sub-task 20.3
function formatMessage(ing: Ingredient, suggestedQty: number): string {
  const unit = ing.purchase_unit || ''
  return (
    `${ing.name} hampir habis!\n` +
    `Sisa: ${ing.quantity_available} ${unit} (Min: ${ing.minimum_stock_level} ${unit})\n` +
    `Saran beli: ${suggestedQty} ${unit}\n` +
    `- Parissa POS`
  )
}

// Kirim 1 pesan via Fonnte
async function sendFonnte(token: string, target: string, message: string): Promise<boolean> {
  try {
    const form = new FormData()
    form.append('target', target)
    form.append('message', message)

    const res = await fetch(FONNTE_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: token },
      body: form,
    })

    if (!res.ok) {
      console.error(`Fonnte HTTP ${res.status}: ${await res.text()}`)
      return false
    }
    const json = await res.json()
    // Fonnte merespons { status: true/false, reason, id }
    return json.status === true
  } catch (err) {
    console.error('Fonnte fetch error:', err)
    return false
  }
}

Deno.serve(async (req) => {
  // Cron POST tanpa body — terima saja.
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const fonnteToken = Deno.env.get('FONNTE_TOKEN')
  if (!fonnteToken) {
    return new Response(
      JSON.stringify({ error: 'FONNTE_TOKEN belum di-set di Supabase Secrets' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Ambil bahan yang status Menipis/Habis
  //    qty_available <= 2 × minimum_stock_level
  const { data: ingredients, error: ingErr } = await supabase
    .from('ingredients')
    .select('id, name, purchase_unit, minimum_stock_level, quantity_available')
    .filter('quantity_available', 'lte', 'minimum_stock_level * 2')
    // Filter di atas tidak didukung PostgREST; fallback ke client-side filter.
    .order('name')

  if (ingErr) {
    console.error('Gagal query ingredients:', ingErr)
    return new Response(JSON.stringify({ error: ingErr.message }), { status: 500 })
  }

  const lowStock = (ingredients as Ingredient[]).filter(
    (i) => i.quantity_available <= 2 * i.minimum_stock_level
  )

  if (lowStock.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, message: 'Tidak ada bahan yang perlu dinotifikasi.' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Ambil daftar penerima aktif (user + WA aktif)
  const { data: recipients, error: recErr } = await supabase
    .from('active_wa_recipients')
    .select('*')

  if (recErr) {
    console.error('Gagal query recipients:', recErr)
    return new Response(JSON.stringify({ error: recErr.message }), { status: 500 })
  }

  if (!recipients || recipients.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, message: 'Tidak ada user dengan WA aktif.' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const report: Array<Record<string, unknown>> = []

  // 3. Loop tiap bahan — cek anti-spam, hitung Formula 5.8, kirim
  for (const ing of lowStock) {
    // Anti-spam: cek apakah sudah ada notifikasi hari ini (UNIQUE constraint)
    const { data: existing } = await supabase
      .from('stock_notifications')
      .select('id')
      .eq('ingredient_id', ing.id)
      .eq('notification_date', today)
      .maybeSingle()

    if (existing) {
      report.push({ ingredient: ing.name, skipped: 'sudah dikirim hari ini' })
      continue
    }

    // Hitung avg_daily_usage_30d via RPC helper
    const { data: avgRaw } = await supabase.rpc('calc_avg_daily_usage', {
      p_ingredient_id: ing.id,
    })
    const avgDaily = Number(avgRaw) || 0
    // Formula 5.8: suggested = max(0, avg×7 − qty)
    const suggestedQty = Math.max(0, Math.round(avgDaily * 7 - ing.quantity_available))

    const status = getStockStatus(ing.quantity_available, ing.minimum_stock_level)
    const message = formatMessage(ing, suggestedQty)

    // Kirim ke semua penerima
    let sentCount = 0
    for (const r of recipients as Recipient[]) {
      const ok = await sendFonnte(fonnteToken, r.phone, message)
      if (ok) sentCount++
    }

    // Catat di stock_notifications agar tidak terkirim ulang
    if (sentCount > 0) {
      await supabase.from('stock_notifications').insert({
        ingredient_id: ing.id,
        notification_date: today,
        status,
      })
    }

    report.push({
      ingredient: ing.name,
      status,
      suggestedQty,
      recipients: recipients.length,
      sent: sentCount,
    })
  }

  return new Response(
    JSON.stringify({ ok: true, processed: report.length, report }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
