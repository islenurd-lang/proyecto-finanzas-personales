"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-navy-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FinanzApp</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inicia sesión para acceder a tus finanzas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@finanzas.local"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-600 dark:text-slate-300 mb-2">Credenciales demo:</p>
          <div className="space-y-1">
            <p>Usuario: <code className="bg-white dark:bg-slate-700 px-1 rounded">demo@finanzas.local</code> / <code className="bg-white dark:bg-slate-700 px-1 rounded">Demo123!</code></p>
            <p>Admin: <code className="bg-white dark:bg-slate-700 px-1 rounded">admin@finanzas.local</code> / <code className="bg-white dark:bg-slate-700 px-1 rounded">Admin123!</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
