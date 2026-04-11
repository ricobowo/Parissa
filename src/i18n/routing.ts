// ============================================================
// File: src/i18n/routing.ts
// Versi: v0.1.0
// Deskripsi: Konfigurasi routing untuk next-intl (locale ID/EN)
// ============================================================

import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
})
