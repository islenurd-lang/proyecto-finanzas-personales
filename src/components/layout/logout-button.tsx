"use client";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className={className ?? "px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"}
    >
      Cerrar sesión
    </button>
  );
}
