"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import { forgotPassword } from "@/services/Auth/authService";
import Image from "next/image";

export default function ForgotPasswordIndex() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.", {
        toastId: "forgot-empty",
      });
      return;
    }

    setLoading(true);
    const payload = { email };

    try {
      const res = await forgotPassword(payload);

      if (res.success) {
        toast.success(
          res.message || "Reset link sent! Please check your email.",
          { toastId: "forgot-success" }
        );
        setIsSent(true);
      } else {
        toast.error(res.message || "Failed to send reset link.", {
          toastId: "forgot-error",
        });
      }
    } catch {
      toast.error("An error occurred. Please try again later.", {
        toastId: "forgot-error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center p-6 gap-8">
        {/* LEFT SIDE – IMAGE / LOGO */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="text-center space-y-4">
            <Image
              src="https://ik.imagekit.io/i0aiv29ol/Delphinapterus_leucas_Steve-snodgrass-CC2-Att-Gen.png?updatedAt=1760128291941"
              alt="Forgot Password Logo"
              width={260}
              height={260}
              className="mx-auto drop-shadow-lg"
            />
            <h2 className="text-3xl font-bold text-blue-700 tracking-tight">
              EMC Library
            </h2>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Forgot your password? No worries — let’s get you back in.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="flex w-full md:w-1/2 items-center justify-center">
          <Card className="w-full max-w-md p-8 shadow-xl border border-gray-100 rounded-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold text-gray-900">
                Forgot Password
              </CardTitle>
              <p className="text-gray-500 text-sm mt-1">
                Enter your registered email to receive a reset link.
              </p>
            </CardHeader>

            {!isSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </CardContent>
              </form>
            ) : (
              <CardContent className="text-center py-8">
                <p className="text-green-600 font-medium mb-2">
                  Reset link has been sent successfully!
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  We’ve sent a password reset link to{" "}
                  <span className="font-semibold text-gray-800">{email}</span>.
                  Please check your inbox and follow the instructions.
                </p>
                <Button
                  onClick={() => setIsSent(false)}
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                >
                  Send another email
                </Button>
              </CardContent>
            )}

            <CardFooter className="text-center flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </a>
              </p>
              <p className="text-xs text-gray-400">
                If you need assistance, please contact{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  support
                </a>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
