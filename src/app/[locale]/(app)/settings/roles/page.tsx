// ============================================================
// File: src/app/[locale]/settings/roles/page.tsx
// Versi: v0.4.0
// Deskripsi: Halaman CRUD Role + Permission Matrix per modul
// ============================================================

import { getAllRoles } from '@/lib/auth'
import { RoleManager } from '@/components/settings/RoleManager'

export default async function RolesPage() {
  // Ambil semua role dari database (server-side)
  const roles = await getAllRoles()

  return (
    <main className="flex-1 p-4 md:p-6 max-w-[960px] mx-auto w-full">
      <RoleManager initialRoles={roles} />
    </main>
  )
}
