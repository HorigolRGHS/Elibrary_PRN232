"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <div className={`fixed inset-0 z-40 ${open ? "block" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => onClose(false)}
        />
      </div>

      <aside
        className={`fixed left-0 top-0 z-50 h-full bg-white w-64 transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-700">Admin</div>
            <div className="text-xs text-gray-500">Management</div>
          </div>
          <button className="text-gray-600" onClick={() => onClose(false)}>
            Close
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          <Link href="/dashboard/users">
            <Button variant="ghost" className="justify-start w-full">
              Users
            </Button>
          </Link>
          <Link href="#">
            <Button variant="ghost" className="justify-start w-full">
              A
            </Button>
          </Link>
          <Link href="#">
            <Button variant="ghost" className="justify-start w-full">
              S
            </Button>
          </Link>
        </nav>
      </aside>
    </>
  );
}
