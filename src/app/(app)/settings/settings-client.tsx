"use client";

import { useState, useEffect } from "react";
import { CURRENCIES, DATE_FORMATS, THEMES } from "@/features/settings/setting.types";
import { updateAppSettingsAction } from "@/features/settings/setting.actions";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

interface SettingsData {
  primaryCurrency: string;
  dateFormat: string;
  theme: string;
  userName: string;
  userEmail: string;
}

export default function SettingsClient({ settings }: { settings: SettingsData }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "DARK") {
      root.classList.add("dark");
    } else if (theme === "LIGHT") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await updateAppSettingsAction(formData);
    setLoading(false);

    if (result.ok) {
      setMessage(result.message);
      setMessageType("success");
    } else {
      setMessage(result.message);
      setMessageType("error");
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Perfil</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy-600 flex items-center justify-center text-white text-xl font-bold">
            {settings.userName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{settings.userName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{settings.userEmail}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
          Autenticación real pendiente para versión futura. Actualmente se usa un usuario demo.
        </p>
      </div>

      {/* Preferences */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preferencias</h3>

        {message && (
          <div className={cn(
            "text-sm px-3 py-2 rounded-lg",
            messageType === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          )}>
            {message}
          </div>
        )}

        <div>
          <Label htmlFor="st-currency">Moneda principal</Label>
          <Select id="st-currency" name="primaryCurrency" defaultValue={settings.primaryCurrency} error={errors.primaryCurrency?.[0]}>
            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <FormError message={errors.primaryCurrency?.[0]} />
        </div>

        <div>
          <Label htmlFor="st-date">Formato de fecha</Label>
          <Select id="st-date" name="dateFormat" defaultValue={settings.dateFormat} error={errors.dateFormat?.[0]}>
            {DATE_FORMATS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
          <FormError message={errors.dateFormat?.[0]} />
        </div>

        <div>
          <Label>Tema</Label>
          <div className="flex gap-2 mt-1">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  theme === t.value
                    ? "bg-navy-600 text-white border-navy-600"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="theme" value={theme} />
          <FormError message={errors.theme?.[0]} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>

      {/* Data Export */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Datos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Exporta todas tus transacciones en formato CSV para usar en Excel u otras herramientas.
        </p>
        <a
          href="/api/export/transactions"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar transacciones CSV
        </a>
      </div>

      {/* Project Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Proyecto</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400 dark:text-slate-500">Estado</p>
            <p className="font-medium text-slate-900 dark:text-white">MVP v0.1.0</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Stack</p>
            <p className="font-medium text-slate-900 dark:text-white">Next.js 16 · Prisma · SQLite</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">UI</p>
            <p className="font-medium text-slate-900 dark:text-white">Tailwind CSS v4 · Recharts</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Lenguaje</p>
            <p className="font-medium text-slate-900 dark:text-white">TypeScript</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Seguridad</h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No se conectan bancos ni APIs financieras reales</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No se guardan credenciales bancarias</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Datos almacenados localmente en SQLite</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Variables sensibles excluidas del repositorio</li>
          <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Validación server-side en todas las operaciones</li>
        </ul>
      </div>

      {/* Reset */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Resetear datos demo</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Para restaurar los datos de demostración al estado inicial, ejecuta en la terminal:
        </p>
        <code className="block bg-slate-900 dark:bg-slate-950 text-emerald-400 text-sm px-4 py-2.5 rounded-lg font-mono">
          npx prisma db seed
        </code>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Esto eliminará todos los datos actuales y creará los datos demo nuevamente.
        </p>
      </div>
    </div>
  );
}
