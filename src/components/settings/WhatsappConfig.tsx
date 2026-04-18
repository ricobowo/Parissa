// ============================================================
// File: src/components/settings/WhatsappConfig.tsx
// Versi: v0.15.0
// Deskripsi: Komponen konfigurasi WhatsApp — input nomor HP + toggle aktif.
//            Data disimpan di tabel wa_config (1 row per user, RLS enforced).
// ============================================================

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { WaConfig } from '@/lib/wa'

interface Props {
  initialConfig: WaConfig | null
}

// Validasi nomor: wajib diawali 628 diikuti 8-13 digit
function validatePhone(phone: string): boolean {
  return /^628[0-9]{8,13}$/.test(phone)
}

export function WhatsappConfig({ initialConfig }: Props) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const supabase = createClient()

  const [phone, setPhone] = useState(initialConfig?.phone || '')
  const [isEnabled, setIsEnabled] = useState(initialConfig?.is_enabled ?? true)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    // Validasi format nomor
    if (!validatePhone(phone)) {
      toast({
        title: tCommon('error'),
        description: t('waPhoneInvalid'),
        variant: 'error',
      })
      return
    }

    setSaving(true)
    try {
      // Ambil user id dari session
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upsert: insert jika belum ada, update jika sudah (UNIQUE user_id)
      const { error } = await supabase
        .from('wa_config')
        .upsert(
          {
            user_id: user.id,
            phone,
            is_enabled: isEnabled,
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error

      toast({
        title: tCommon('success'),
        description: t('waSaved'),
        variant: 'success',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      toast({
        title: tCommon('error'),
        description: message,
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{t('whatsapp')}</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {t('waSubtitle')}
      </p>

      {/* Card form */}
      <div
        className="rounded-lg border p-5 space-y-5 max-w-xl"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
      >
        {/* Nomor HP */}
        <div>
          <label
            htmlFor="wa-phone"
            className="block text-sm font-medium mb-1.5"
          >
            {t('waPhoneLabel')}
          </label>
          <input
            id="wa-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="628123456789"
            className="w-full px-3 py-2 text-sm rounded border font-mono"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg)',
            }}
          />
          <p
            className="text-xs mt-1.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {t('waPhoneHint')}
          </p>
        </div>

        {/* Toggle aktif/nonaktif */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('waEnableLabel')}</p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {t('waEnableHint')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{
              background: isEnabled
                ? 'var(--color-accent)'
                : 'var(--color-bg-hover)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              style={{ transform: isEnabled ? 'translateX(22px)' : 'translateX(4px)' }}
            />
          </button>
        </div>

        {/* Tombol simpan */}
        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </div>

      {/* Info tambahan */}
      <div
        className="mt-6 p-4 rounded-lg border text-xs max-w-xl"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
          {t('waInfoTitle')}
        </p>
        <p>{t('waInfoBody')}</p>
      </div>
    </div>
  )
}
