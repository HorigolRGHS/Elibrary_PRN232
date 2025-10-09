"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/Auth/authService";
import type { LoginRequestDTO } from "@/models/dtos/authDTO";

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
      await login(payload);
      router.push("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Sign in
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address or user name</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>

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

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md p-2">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
            >
              {loading ? "Signing in..." : "Log in"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              By continuing, you agree to the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of use
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </div>

            <div className="text-center mt-2">
              <a
                href="#"
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                Forgot your password
              </a>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <a href="#" className="text-blue-600 font-medium hover:underline">
                Sign up
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
