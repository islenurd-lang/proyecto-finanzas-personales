"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-navy-950 text-white">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-navy-800">
        <div className="w-8 h-8 rounded-lg bg-navy-500 flex items-center justify-center font-bold text-sm">
          F
        </div>
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-navy-700 text-white"
                  : "text-slate-300 hover:bg-navy-800 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-xs font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Usuario Demo</p>
            <p className="text-xs text-slate-400 truncate">demo@finanzapp.local</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
