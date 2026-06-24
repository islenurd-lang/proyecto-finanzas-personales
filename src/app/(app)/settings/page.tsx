import { getAppSettings } from "@/features/settings/setting.service";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Configuración</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ajusta tus preferencias y datos de la aplicación.
        </p>
      </div>

      <SettingsClient
        settings={{
          primaryCurrency: settings.primaryCurrency,
          dateFormat: settings.dateFormat,
          theme: settings.theme,
          userName: settings.userName,
          userEmail: settings.userEmail,
        }}
      />
    </div>
  );
}
