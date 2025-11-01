"use client";
import { ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar open={open} onClose={setOpen} />
      
      {/* Fixed Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">E-Library Management</p>
          </div>
        </div>
      </header>

      {/* Main Content with top padding for fixed header */}
      <main className="pt-[73px] p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
