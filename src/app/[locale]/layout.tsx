// ============================================================
// File: src/app/[locale]/layout.tsx
// Versi: v0.5.1
// Deskripsi: Layout per locale — provider i18n + query client + toaster
//            AppShell diatur di masing-masing route group
// ============================================================

import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validasi locale — redirect ke 404 jika tidak valid
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Muat file terjemahan sesuai locale
  const messages = (await import(`@/lib/i18n/${locale}.json`)).default

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
