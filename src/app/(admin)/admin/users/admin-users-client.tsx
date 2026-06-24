"use client";

import { useState } from "react";
import { createUserByAdminAction, toggleUserActiveAction } from "@/features/admin/users/admin-user.actions";
import type { AdminUserView } from "@/features/admin/users/admin-user.types";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

export default function AdminUsersClient({ users }: { users: AdminUserView[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const result = await createUserByAdminAction(fd);
    setLoading(false);

    if (result.ok) {
      setModalOpen(false);
      setMessage(result.message);
      setMessageType("success");
    } else {
      setMessage(result.message);
      setMessageType("error");
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleToggle(userId: string, isActive: boolean) {
    const action = isActive ? "desactivar" : "activar";
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} este usuario?`)) return;

    const result = await toggleUserActiveAction(userId);
    if (result.ok) {
      setMessage(result.message);
      setMessageType("success");
    } else {
      alert(result.message);
    }
  }

  return (
    <>
      {message && !modalOpen && (
        <div className={cn(
          "text-sm px-4 py-2 rounded-lg",
          messageType === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-600"
        )}>
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => { setModalOpen(true); setErrors({}); setMessage(""); }}
          className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors"
        >
          + Crear usuario
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">Creado</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">Último login</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((u) => (
              <tr key={u.id} className={cn(!u.isActive && "opacity-60")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    u.role === "SUPER_ADMIN" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:text-navy-400"
                  )}>
                    {u.role === "SUPER_ADMIN" ? "Admin" : "Usuario"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u.createdAt}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u.lastLoginAt ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    u.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggle(u.id, u.isActive)}
                    className={cn(
                      "text-xs px-3 py-1 rounded-lg border transition-colors",
                      u.isActive
                        ? "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    )}
                  >
                    {u.isActive ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Crear usuario">
        <form onSubmit={handleCreate} className="space-y-4">
          {message && messageType === "error" && (
            <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-lg">{message}</div>
          )}

          <div>
            <Label htmlFor="au-name" required>Nombre</Label>
            <Input id="au-name" name="name" placeholder="Nombre completo" error={errors.name?.[0]} />
            <FormError message={errors.name?.[0]} />
          </div>

          <div>
            <Label htmlFor="au-email" required>Email</Label>
            <Input id="au-email" name="email" type="email" placeholder="usuario@ejemplo.com" error={errors.email?.[0]} />
            <FormError message={errors.email?.[0]} />
          </div>

          <div>
            <Label htmlFor="au-pass" required>Contraseña</Label>
            <Input id="au-pass" name="password" type="password" placeholder="Mínimo 8 caracteres" error={errors.password?.[0]} />
            <FormError message={errors.password?.[0]} />
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            El usuario se creará con rol USER y estado activo.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors">
              {loading ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
