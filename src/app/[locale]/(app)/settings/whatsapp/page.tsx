// ============================================================
// File: src/app/[locale]/(app)/settings/whatsapp/page.tsx
// Versi: v0.15.0
// Deskripsi: Halaman Settings > WhatsApp — atur nomor HP + toggle aktif
// ============================================================

import { getMyWaConfig } from '@/lib/wa'
import { WhatsappConfig } from '@/components/settings/WhatsappConfig'

export default async function WhatsappSettingsPage() {
  // Ambil konfigurasi WA user saat ini (server-side)
  const config = await getMyWaConfig()

  return (
    <main className="flex-1 p-4 md:p-6 max-w-[960px] mx-auto w-full">
      <WhatsappConfig initialConfig={config} />
    </main>
  )
}
