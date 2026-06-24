"use client";

import { usePathname } from "next/navigation";
import { PAGE_TITLES, APP_NAME } from "@/lib/constants";

export default function Header({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? APP_NAME;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Abrir menú"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
    </header>
  );
}
