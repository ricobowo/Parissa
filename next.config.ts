// ============================================================
// File: next.config.ts
// Versi: v0.1.0
// Deskripsi: Konfigurasi Next.js — PWA dan i18n via next-intl
// ============================================================

import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
})

const nextConfig: NextConfig = {}

export default withPWA(withNextIntl(nextConfig))
