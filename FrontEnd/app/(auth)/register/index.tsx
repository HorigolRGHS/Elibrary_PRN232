"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerService } from "@/services/Auth/authService";
import { registerSchema, type RegisterRequestDTO } from "@/models/dtos/authDTO";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function RegisterIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterRequestDTO>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterRequestDTO) => {
    setLoading(true);
    setError(null);

    try {
      const res = await registerService(data);

      if (!res.success) {
        throw new Error(res.message || "Registration failed");
      }
      toast.success(
        "Registration successful 🎉 Please check your email to confirm your account.",
        { toastId: "register-success" }
      );
      router.push("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg, { toastId: "register-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]  items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl mx-auto flex items-center">
        {/* LEFT: FORM */}
        <div className="w-full md:w-2/3 p-6">
          <Card className="w-full p-8 shadow-xl border border-gray-100 rounded-2xl backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                Create account
              </CardTitle>
              <p className="text-gray-500 text-sm mt-1">
                "Join EMC Library and access resources."
              </p>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
              <CardContent className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Your full name"
                    disabled={loading}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Re-enter your password"
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* ACCEPT TERMS */}
                <div>
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="accept"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label
                            htmlFor="accept"
                            className="text-sm text-gray-600 select-none"
                          >
                            I accept the{" "}
                            <a
                              href="#"
                              className="text-blue-600 hover:underline"
                            >
                              Terms of Use
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-blue-600 hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.acceptTerms.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
                    {error}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4 mt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign in
                  </a>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* RIGHT: IMAGE */}
        <div className="hidden md:flex md:w-1/3 items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Image
              onClick={() => router.push("/")}
              src="/image/BeluLibrary.png"
              alt="E-Library"
              width={260}
              height={260}
              className="mx-auto"
            />
            <h3 className="text-xl font-bold text-blue-700">EMC Library</h3>
            <p className="text-sm max-w-sm mx-auto from-emerald-400 to-blue-600 bg-gradient-to-r bg-clip-text text-transparent">
              Share your knowledge, let it flow.
            </p>
            <p className="text-sm max-w-sm mx-auto from-red-600 to-indigo-700 bg-gradient-to-r bg-clip-text text-transparent">
              Share your passion, let it grow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
