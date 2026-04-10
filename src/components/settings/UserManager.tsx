// ============================================================
// File: src/components/settings/UserManager.tsx
// Versi: v0.4.0
// Deskripsi: Komponen manajemen user — tabel user, assign role, aktif/nonaktif
// ============================================================

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { User, Role } from '@/types'

interface Props {
  initialUsers: User[]
  roles: Role[]
}

export function UserManager({ initialUsers, roles }: Props) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [users, setUsers] = useState<User[]>(initialUsers)

  const supabase = createClient()

  // Ubah role user
  async function handleRoleChange(userId: string, roleId: string) {
    const { error } = await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', userId)

    if (!error) {
      const selectedRole = roles.find((r) => r.id === roleId)
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, role_id: roleId, role: selectedRole } : u
      ))
    }
  }

  // Toggle status aktif/nonaktif user
  async function handleToggleActive(userId: string, currentActive: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentActive })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, is_active: !currentActive } : u
      ))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('users')}</h1>

      {/* Tabel daftar user */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th className="text-left py-2 pr-4 font-medium text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Nama
              </th>
              <th className="text-left py-2 pr-4 font-medium text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </th>
              <th className="text-left py-2 pr-4 font-medium text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Role
              </th>
              <th className="text-center py-2 font-medium text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                {tCommon('status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* Nama */}
                <td className="py-3 pr-4 font-medium">{user.name}</td>

                {/* Email */}
                <td className="py-3 pr-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {user.email}
                </td>

                {/* Dropdown role */}
                <td className="py-3 pr-4">
                  <select
                    value={user.role_id || ''}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 text-sm rounded border"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                  >
                    <option value="">— Pilih Role —</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Toggle aktif/nonaktif */}
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      user.is_active ? 'badge-status badge-success' : 'badge-status badge-danger'
                    }`}
                  >
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
              </tr>
            ))}

            {/* Pesan jika belum ada user */}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                  {tCommon('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
