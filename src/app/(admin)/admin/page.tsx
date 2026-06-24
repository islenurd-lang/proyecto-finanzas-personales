import { requireSuperAdmin } from "@/lib/current-user";
import LogoutButton from "@/components/layout/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-600 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              SUPER_ADMIN
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            La gestión completa de usuarios (crear, activar, desactivar) se implementará en Fase 9.3.
          </p>
          <div className="bg-navy-50 dark:bg-navy-900/30 rounded-lg p-4 text-sm text-navy-700 dark:text-navy-300">
            <p className="font-medium mb-1">Usuarios actuales del sistema:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>admin@finanzas.local — SUPER_ADMIN</li>
              <li>demo@finanzas.local — USER</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Seguridad</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Este panel no tiene acceso a datos financieros privados</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Cada usuario solo ve sus propias finanzas</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Sesiones JWT con cookies HTTP-only</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
