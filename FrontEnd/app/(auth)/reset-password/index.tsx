"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  ResetPasswordRequestDTO,
  resetPasswordSchema,
} from "@/models/dtos/authDTO";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/services/Auth/authService";

export default function ResetPasswordIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordRequestDTO>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      token: token || "",
    },
  });

  useEffect(() => {
    if (email) setValue("email", email);
    if (token) setValue("token", token);
  }, [email, token, setValue]);

  const onSubmit = async (data: ResetPasswordRequestDTO) => {
    if (!token || !email) {
      toast.error("Invalid or expired reset link.", {
        toastId: "reset-invalid",
      });
      router.replace("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ ...data, email, token });

      if (!res.success) {
        const msg = res.message || "Failed to reset password.";
        toast.error(msg, { toastId: "reset-error" });
        return;
      }

      toast.success("Password reset successful! You can now log in.", {
        toastId: "reset-success",
      });
      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password.";
      toast.error(msg, { toastId: "reset-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center p-6 gap-8">
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="text-center space-y-4">
            <Image
              src="https://ik.imagekit.io/i0aiv29ol/unnamed%20(1).png?updatedAt=1760128944505"
              alt="Reset Password Logo"
              width={260}
              height={260}
              className="mx-auto drop-shadow-lg"
            />
            <h2 className="text-3xl font-bold text-blue-700 tracking-tight">
              EMC Library
            </h2>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Securely update your password and regain access to your account.
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-1/2 items-center justify-center">
          <Card className="w-full max-w-md p-8 shadow-xl border border-gray-100 rounded-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                Reset Password
              </CardTitle>
              <p className="text-gray-500 text-sm mt-1">
                Enter your new password for{" "}
                <span className="font-medium text-gray-800">{email}</span>.
              </p>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-5 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("newPassword")}
                    disabled={loading}
                    className="focus-visible:ring-blue-500"
                    required
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your new password"
                    {...register("confirmNewPassword")}
                    disabled={loading}
                    className="focus-visible:ring-blue-500"
                    required
                  />
                  {errors.confirmNewPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
                {errors.token && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.token.message}
                  </p>
                )}
              </CardContent>
            </form>

            <CardFooter className="text-center flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Back to{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </a>
              </p>
              <p className="text-xs text-gray-400">
                If you didn’t request this, you can ignore this page.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
