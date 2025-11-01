"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/Auth/authService";
import type { LoginRequestDTO } from "@/models/dtos/authDTO";
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

export default function LoginIndex() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const payload: LoginRequestDTO = { email, password, rememberMe };
    try {
      const result = await login(payload);

      if (!result.success) {
        const msg = result.message || "Login failed";
        setError(msg);
        toast.error(msg, { toastId: "login-error" });
        return;
      }

      toast.success("Login successful 🎉", { toastId: "login-success" });
      // if user is admin, redirect to dashboard
      try {
        const role = result?.data?.user?.role?.toString().toLowerCase();
        if (role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } catch (e) {
        router.push("/");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
      toast.error(msg, { toastId: "login-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]  items-center justify-center bg-gray-50 ">
      <div className="w-full max-w-6xl mx-auto flex items-center">
        {/* LEFT SIDE – LOGO */}
        <div className="hidden md:flex md:w-1/3 items-center justify-center bg-gradient-to-br">
          <div className="text-center space-y-4">
            <Image
              onClick={() => router.push("/")}
              src="https://ik.imagekit.io/i0aiv29ol/EMC%20Library.png?updatedAt=1760115301250"
              alt="E-Library Logo"
              width={240}
              height={240}
              className="mx-auto drop-shadow-lg"
            />
            <h2 className="text-3xl font-bold text-blue-700 tracking-tight">
              EMC Library
            </h2>
            <p className="text-sm max-w-sm mx-auto from-emerald-400 to-blue-600 bg-gradient-to-r bg-clip-text text-transparent">
              Share your knowledge, let it flow.
            </p>
            <p className="text-sm max-w-sm mx-auto from-red-600 to-indigo-700 bg-gradient-to-r bg-clip-text text-transparent">
              Share your passion, let it grow.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="flex w-full md:w-2/3 items-center justify-center p-6">
          <Card className="w-full p-8 py-16 shadow-xl border border-gray-100 rounded-2xlbackdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                Sign in
              </CardTitle>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back! Please enter your details.
              </p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-visible:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(!!v)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal text-gray-600"
                    >
                      Remember me
                    </Label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </a>
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
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold shadow-md"
                >
                  {loading ? "Signing in..." : "Log in"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign up
                  </a>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
