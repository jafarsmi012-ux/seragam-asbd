import { AdminView } from '@/components/admin/AdminView';

/**
 * Halaman dashboard admin.
 *
 * Akses: Buka `/admin` di browser. Login dengan ADMIN_PASSWORD yang
 * diatur lewat env (lihat .env.example).
 *
 * Catatan keamanan: /api/admin/orders tetap melakukan cek cookie sesi
 * admin (lihat implementasi di route handler). Login hanya sukses jika
 * password cocok dan server mengeluarkan cookie sesi httpOnly.
 */
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminView />;
}
