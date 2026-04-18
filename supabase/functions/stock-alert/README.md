# stock-alert — Edge Function

> Notifikasi WhatsApp bahan Menipis/Habis via Fonnte. Dijalankan oleh pg_cron harian.

## 1. Siapkan token Fonnte

1. Daftar di https://fonnte.com dan hubungkan nomor WhatsApp bisnis Parissa.
2. Ambil Device Token dari dashboard Fonnte.
3. Set sebagai Supabase secret (BUKAN commit ke `.env`):

```bash
supabase secrets set FONNTE_TOKEN=<token_dari_fonnte>
```

Verifikasi:
```bash
supabase secrets list
```

## 2. Deploy function

```bash
# Pastikan sudah login & linked ke project
supabase login
supabase link --project-ref <project-ref>

# Deploy
supabase functions deploy stock-alert
```

## 3. Test manual

```bash
curl -X POST \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  https://<project-ref>.supabase.co/functions/v1/stock-alert
```

Respons sukses:
```json
{ "ok": true, "processed": 2, "report": [ ... ] }
```

## 4. Jadwalkan cron harian

Jalankan SEKALI di Supabase SQL Editor (pastikan extension `pg_cron` & `pg_net` sudah enabled di dashboard → Database → Extensions):

```sql
SELECT cron.schedule(
  'stock-alert-daily',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/stock-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <service_role_key>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Cek jadwal aktif:
```sql
SELECT * FROM cron.job;
```

Nonaktifkan:
```sql
SELECT cron.unschedule('stock-alert-daily');
```

## 5. Rekomendasi penyimpanan token — Supabase Secrets vs Tabel DB

**Pilihan kami: Supabase Secrets** ✅

| Aspek | Supabase Secrets (dipakai) | Kolom `wa_config.token` per user |
|---|---|---|
| Security | Terisolasi di vault Supabase, tidak pernah di-commit | Tersimpan di DB — perlu RLS ketat + enkripsi kolom |
| Rotate | 1 perintah (`supabase secrets set`) | Harus update per user via UI |
| Biaya Fonnte | 1 akun bisnis (hemat) | Tiap user perlu akun Fonnte sendiri |
| Kompleksitas | Rendah | Tinggi (RLS, enkripsi) |

Cukup 1 token Fonnte untuk seluruh sistem; tiap user hanya menyimpan nomor HP tujuan + toggle di tabel `wa_config`.

## 6. Anti-spam

Tabel `stock_notifications` memiliki `UNIQUE(ingredient_id, notification_date)`. Edge Function cek entry sebelum kirim → max 1 notifikasi per bahan per hari meskipun cron dipanggil berkali-kali.

## 7. Format pesan

```
[Nama Bahan] hampir habis!
Sisa: [qty] [unit] (Min: [min] [unit])
Saran beli: [Formula 5.8] [unit]
- Parissa POS
```

Formula 5.8: `suggested = max(0, avg_daily_usage_30d × 7 − qty_available)` — dihitung via RPC `calc_avg_daily_usage`.
