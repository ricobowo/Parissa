// ============================================================
// File: src/app/[locale]/layout.tsx
// Versi: v0.4.0
// Deskripsi: Layout per locale — provider i18n + query client
//            AppShell diatur di masing-masing route group
// ============================================================

import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'

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
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
