// ============================================================
// File: src/lib/auth.ts
// Versi: v0.4.0
// Deskripsi: Helper fungsi autentikasi — ambil session, cek permission, ambil role
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { User, Role } from '@/types'

/**
 * Ambil data user yang sedang login beserta role-nya.
 * Dipanggil dari Server Component atau Server Action.
 * Return null jika belum login.
 */
export async function getCurrentUser(): Promise<(User & { role: Role | null }) | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  return user
}

/**
 * Cek apakah user punya akses ke modul tertentu.
 * Digunakan untuk proteksi halaman dan navigasi.
 */
export async function hasPermission(module: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user || !user.role) return false

  const permissions = user.role.permissions as Record<string, boolean>
  return permissions[module] === true
}

/**
 * Ambil semua roles dari database.
 * Digunakan di halaman Settings > Role Management.
 */
export async function getAllRoles(): Promise<Role[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('*')
    .order('is_system', { ascending: false })
    .order('name')

  return data || []
}

/**
 * Ambil semua users dengan role-nya.
 * Digunakan di halaman Settings > User Management.
 */
export async function getAllUsers(): Promise<User[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*, role:roles(id, name, name_en)')
    .order('created_at', { ascending: false })

  return data || []
}
