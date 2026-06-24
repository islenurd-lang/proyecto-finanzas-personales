"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileNav from "./mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-full">
      <Sidebar />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64 flex flex-col h-full">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
