// ============================================================
// File: src/middleware.ts
// Versi: v0.1.0
// Deskripsi: Root middleware — menggabungkan next-intl routing dan Supabase auth
// ============================================================

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Middleware next-intl untuk locale routing
export default createMiddleware(routing)

export const config = {
  // Cocokkan semua path kecuali file statis dan API internal Next.js
  matcher: ['/', '/(id|en)/:path*'],
}
