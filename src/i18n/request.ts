// ============================================================
// File: src/i18n/request.ts
// Versi: v0.1.0
// Deskripsi: Konfigurasi request handler untuk next-intl
// ============================================================

import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Pastikan locale valid, fallback ke default
  if (!locale || !routing.locales.includes(locale as 'id' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`@/lib/i18n/${locale}.json`)).default,
  }
})
