"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedHandler() {
  const router = useRouter();

  useEffect(() => {
    function onUnauthorized(e: Event) {
      // Prefer client-side navigation so app providers stay mounted
      // and toasts remain visible.
      try {
        router.push("/login");
      } catch (err) {
        // If router isn't available for some reason, fallback to a full reload
        window.location.href = "/login";
      }
    }

    window.addEventListener(
      "api:unauthorized",
      onUnauthorized as EventListener
    );
    return () => {
      window.removeEventListener(
        "api:unauthorized",
        onUnauthorized as EventListener
      );
    };
  }, [router]);

  return null;
}
