// ============================================================
// File: src/components/providers/ThemeProvider.tsx
// Versi: v0.1.0
// Deskripsi: Wrapper next-themes — dark/light/system mode
//            class-based (.dark di <html>), default = system
// ============================================================

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: Props) {
  // attribute="class" → next-themes toggle class .dark di <html>
  // defaultTheme="system" → ikut OS preference sampai user override
  // enableSystem → izinkan nilai "system"
  // disableTransitionOnChange → cegah flicker animasi saat ganti tema
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
