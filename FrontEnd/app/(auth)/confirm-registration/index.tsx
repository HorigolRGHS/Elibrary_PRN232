"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmRegistration } from "@/services/Auth/authService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ConfirmRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const confirm = async () => {
      if (!token || !email) {
        toast.error("Invalid confirmation link.", {
          toastId: "confirm-invalid",
        });
        router.replace("/register");
        return;
      }

      try {
        const res = await confirmRegistration({ token, email });

        if (!res.success) {
          toast.error(res.message || "Confirmation failed.", {
            toastId: "confirm-fail",
          });
          router.replace("/register");
          return;
        }

        toast.success(
          res.message || "✅ Account confirmed! You can now log in.",
          { toastId: "confirm-success" }
        );

        setTimeout(() => router.replace("/login"), 2000);
      } catch (err: any) {
        toast.error(err.message || "Something went wrong.", {
          toastId: "confirm-error",
        });
        router.replace("/register");
      }
    };

    confirm();
  }, [token, email, router]);

  return null;
}
