// ============================================================
// File: src/app/layout.tsx
// Versi: v0.1.0
// Deskripsi: Root layout — hanya meneruskan children ke locale layout
// ============================================================

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parissa POS',
  description: 'Sistem Manajemen Bisnis Dessert & Minuman Premium',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Root layout tanpa <html> — diserahkan ke locale layout
  return children
}
