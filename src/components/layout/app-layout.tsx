"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileNav from "./mobile-nav";

interface AppLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export default function AppLayout({ children, userName, userEmail, userRole }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-full">
      <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64 flex flex-col h-full">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
