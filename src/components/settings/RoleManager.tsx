// ============================================================
// File: src/components/settings/RoleManager.tsx
// Versi: v0.4.0
// Deskripsi: Komponen manajemen role — tabel role + permission matrix
//            Owner bisa CRUD role dan edit permission per modul
// ============================================================

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Role, ModulePermission } from '@/types'

// Daftar modul yang bisa diatur permission-nya
const MODULES: ModulePermission[] = [
  'dashboard', 'pos', 'products', 'recipes', 'stock',
  'batching', 'purchases', 'reports', 'customers', 'settings',
]

interface Props {
  initialRoles: Role[]
}

export function RoleManager({ initialRoles }: Props) {
  const t = useTranslations('settings')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [newRoleName, setNewRoleName] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Tambah role baru dengan permission default semua false
  async function handleAddRole() {
    if (!newRoleName.trim()) return
    setLoading(true)

    const defaultPermissions: Record<string, boolean> = {}
    MODULES.forEach((m) => (defaultPermissions[m] = false))

    const { data, error } = await supabase
      .from('roles')
      .insert({ name: newRoleName.trim(), permissions: defaultPermissions })
      .select()
      .single()

    if (!error && data) {
      setRoles([...roles, data])
      setNewRoleName('')
    }
    setLoading(false)
  }

  // Toggle permission satu modul untuk satu role
  async function togglePermission(roleId: string, module: string) {
    const role = roles.find((r) => r.id === roleId)
    if (!role) return

    const current = (role.permissions as Record<string, boolean>)[module] || false
    const updated = { ...role.permissions, [module]: !current }

    const { error } = await supabase
      .from('roles')
      .update({ permissions: updated })
      .eq('id', roleId)

    if (!error) {
      setRoles(roles.map((r) => (r.id === roleId ? { ...r, permissions: updated } : r)))
    }
  }

  // Hapus role (hanya role non-system)
  async function handleDeleteRole(roleId: string) {
    const { error } = await supabase.from('roles').delete().eq('id', roleId)
    if (!error) {
      setRoles(roles.filter((r) => r.id !== roleId))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('roles')}</h1>

      {/* Form tambah role baru */}
      <div className="flex gap-2 mb-6">
        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="Nama role baru..."
          className="flex-1 px-3 py-2 text-sm rounded-md border"
          style={{ borderColor: 'var(--color-border)' }}
        />
        <Button onClick={handleAddRole} disabled={loading}>
          {tCommon('add')}
        </Button>
      </div>

      {/* Tabel permission matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Role
              </th>
              {MODULES.map((mod) => (
                <th
                  key={mod}
                  className="text-center py-2 px-2 font-medium text-xs uppercase"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {tNav(mod)}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-medium text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {tCommon('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* Nama role */}
                <td className="py-3 pr-4 font-medium">
                  {role.name}
                  {role.is_system && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}>
                      system
                    </span>
                  )}
                </td>

                {/* Checkbox permission per modul */}
                {MODULES.map((mod) => (
                  <td key={mod} className="text-center py-3 px-2">
                    <input
                      type="checkbox"
                      checked={(role.permissions as Record<string, boolean>)[mod] || false}
                      onChange={() => togglePermission(role.id, mod)}
                      className="w-4 h-4 cursor-pointer accent-current"
                    />
                  </td>
                ))}

                {/* Tombol hapus (hanya untuk role non-system) */}
                <td className="text-center py-3 px-2">
                  {!role.is_system && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-xs px-2 py-1 rounded border transition-colors hover:bg-red-50"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)' }}
                    >
                      {tCommon('delete')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
