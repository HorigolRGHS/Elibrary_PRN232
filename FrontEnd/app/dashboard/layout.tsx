"use client";
import { ReactNode, useState } from "react";
import { UserHeader } from "@/components/layout/header";
import { AdminSidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="max-w-7xl mx-auto flex">
        <AdminSidebar open={open} onClose={setOpen} />
        <main className="flex-1 p-6">
          <button
            className="mb-4 px-3 py-1 border rounded"
            onClick={() => setOpen(true)}
          >
            Open menu
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
