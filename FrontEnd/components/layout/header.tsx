"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimpleHeader({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </Button>
      <h1 className="text-lg font-semibold text-gray-800">{title ?? "Back"}</h1>
    </header>
  );
}
