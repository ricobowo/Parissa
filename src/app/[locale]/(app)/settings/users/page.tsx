// ============================================================
// File: src/app/[locale]/settings/users/page.tsx
// Versi: v0.4.0
// Deskripsi: Halaman manajemen user — tambah/edit/deaktivasi user, assign role
// ============================================================

import { getAllUsers, getAllRoles } from '@/lib/auth'
import { UserManager } from '@/components/settings/UserManager'

export default async function UsersPage() {
  // Ambil semua user dan role dari database (server-side)
  const [users, roles] = await Promise.all([getAllUsers(), getAllRoles()])

  return (
    <main className="flex-1 p-4 md:p-6 max-w-[960px] mx-auto w-full">
      <UserManager initialUsers={users} roles={roles} />
    </main>
  )
}
