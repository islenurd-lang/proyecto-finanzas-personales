import { getAdminUsers, getUserAdminStats } from "@/features/admin/users/admin-user.service";
import AdminUsersClient from "./admin-users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, stats] = await Promise.all([getAdminUsers(), getUserAdminStats()]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-navy-600 hover:underline">← Panel Admin</a>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Usuarios</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500">Activos</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500">Inactivos</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.inactive}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500">Usuarios</p>
            <p className="text-2xl font-bold text-navy-700 mt-1">{stats.users}</p>
          </div>
        </div>

        <AdminUsersClient users={users} />
      </main>
    </div>
  );
}
