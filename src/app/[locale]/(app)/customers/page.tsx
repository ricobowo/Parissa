'use client'

// ============================================================
// File: src/app/[locale]/(app)/customers/page.tsx
// Versi: v0.14.0
// Deskripsi: Task 18.0 — Customer Database & CRM.
//            Dua tab:
//              (1) Daftar Pelanggan — dari view customer_stats.
//              (2) Piutang Overdue   — dari view overdue_payments.
//            Edit label via dialog (label master dari customer_labels).
//            Aksi CRM dicatat ke sales_followups (trigger update followup_status).
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type {
  CustomerStats,
  CustomerLabel,
  OverduePayment,
  FollowupAction,
} from '@/types'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/lib/hooks/use-toast'
import { CustomerTable } from '@/components/customers/CustomerTable'
import { LabelDialog } from '@/components/customers/LabelDialog'
import { OverdueList } from '@/components/customers/OverdueList'

type TabKey = 'list' | 'overdue'

export default function CustomersPage() {
  const t = useTranslations('customers')
  const tFollow = useTranslations('customers.followup')
  const { toast } = useToast()

  const [tab, setTab] = useState<TabKey>('list')
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<CustomerStats[]>([])
  const [overdue, setOverdue] = useState<OverduePayment[]>([])
  const [labels, setLabels] = useState<CustomerLabel[]>([])
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<CustomerStats | null>(null)
  const [busyOverdueId, setBusyOverdueId] = useState<string | null>(null)

  // -------------------------------------------------------
  // Fetch data — 3 sumber: customer_stats, overdue_payments, customer_labels
  // -------------------------------------------------------
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const [custRes, overdueRes, labelRes] = await Promise.all([
        supabase.from('customer_stats').select('*').order('last_purchase_date', { ascending: false, nullsFirst: false }),
        supabase.from('overdue_payments').select('*'),
        supabase.from('customer_labels').select('*').order('name'),
      ])
      if (custRes.error) throw custRes.error
      if (overdueRes.error) throw overdueRes.error
      if (labelRes.error) throw labelRes.error

      setCustomers((custRes.data ?? []) as CustomerStats[])
      setOverdue((overdueRes.data ?? []) as OverduePayment[])
      setLabels((labelRes.data ?? []) as CustomerLabel[])
    } catch (err) {
      console.error('Gagal memuat data CRM:', err)
      toast({ title: t('loadFailed'), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [toast, t])

  useEffect(() => { fetchAll() }, [fetchAll])

  // -------------------------------------------------------
  // Filter pelanggan — client-side (ukuran data kecil)
  // -------------------------------------------------------
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filterLabel !== 'all' && c.label !== filterLabel) return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [customers, filterLabel, search])

  const stats = useMemo(() => ({
    total: customers.length,
    vip: customers.filter((c) => c.label === 'VIP').length,
    overdue: overdue.length,
  }), [customers, overdue])

  // -------------------------------------------------------
  // Simpan label & notes pelanggan
  // -------------------------------------------------------
  async function handleSaveLabel(
    customerId: string,
    label: string | null,
    notes: string | null
  ) {
    const supabase = createClient()
    const { error } = await supabase
      .from('customers')
      .update({ label, notes })
      .eq('id', customerId)
    if (error) throw new Error(error.message || t('labelDialog.saveFailed'))
    toast({ title: t('labelDialog.saved'), variant: 'success' })
    await fetchAll()
  }

  // -------------------------------------------------------
  // Aksi CRM overdue — insert sales_followups.
  // Trigger trg_sync_sale_followup_status menyinkron sales.followup_status.
  // Jika action = 'payment_received', juga update payment_status -> 'Sudah'.
  // -------------------------------------------------------
  async function handleFollowupAction(saleId: string, action: FollowupAction) {
    setBusyOverdueId(saleId)
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('sales_followups').insert({
        sale_id: saleId,
        action,
        created_by: user?.id ?? null,
      })
      if (error) throw error

      if (action === 'payment_received') {
        const { error: payErr } = await supabase
          .from('sales')
          .update({ payment_status: 'Sudah' })
          .eq('id', saleId)
        if (payErr) throw payErr
      }

      toast({ title: tFollow('success'), variant: 'success' })
      await fetchAll()
    } catch (err) {
      console.error('Gagal mencatat follow-up:', err)
      toast({ title: tFollow('failed'), variant: 'error' })
    } finally {
      setBusyOverdueId(null)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <main className="flex-1 p-4 md:p-8 max-w-[1040px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
          style={{ color: 'var(--color-accent)' }}>
          {t('eyebrow')}
        </p>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
          {t('title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <StatChip label={t('totalCustomers')} value={stats.total} />
        <StatChip label={t('vipCount')} value={stats.vip} color="warning" />
        <StatChip label={t('overdueCount')} value={stats.overdue} color="danger" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <TabButton
          active={tab === 'list'}
          onClick={() => setTab('list')}
          label={t('tabList')}
        />
        <TabButton
          active={tab === 'overdue'}
          onClick={() => setTab('overdue')}
          label={`${t('tabOverdue')}${stats.overdue > 0 ? ` (${stats.overdue})` : ''}`}
        />
      </div>

      {tab === 'list' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-3 py-2 rounded-md border text-sm"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="all">{t('filterAllLabels')}</option>
              {labels.map((l) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>

          <CustomerTable
            customers={filteredCustomers}
            onEditLabel={(c) => { setSelected(c); setDialogOpen(true) }}
          />
        </>
      )}

      {tab === 'overdue' && (
        <OverdueList
          items={overdue}
          busyId={busyOverdueId}
          onAction={handleFollowupAction}
        />
      )}

      <LabelDialog
        customer={selected}
        labels={labels}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveLabel}
      />
    </main>
  )
}

// -------------------------------------------------------------------
// Sub-komponen lokal — ChipStat & TabButton
// -------------------------------------------------------------------
function StatChip({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: number
  color?: 'default' | 'warning' | 'danger' | 'success'
}) {
  const colorMap: Record<string, string> = {
    default: 'var(--color-text)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger:  'var(--color-danger)',
  }
  return (
    <div
      className="px-4 py-2 rounded-md border flex flex-col gap-0.5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: colorMap[color] }}>
        {value}
      </span>
    </div>
  )
}

function TabButton({
  active, onClick, label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm relative"
      style={{
        color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
        fontWeight: active ? 600 : 400,
        borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
        marginBottom: '-1px',
      }}
    >
      {label}
    </button>
  )
}
