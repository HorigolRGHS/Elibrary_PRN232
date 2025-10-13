"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Clock,
  LogIn,
  LogOut,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import Image from "next/image";
import { decodeJwt, normalizeJwt } from "@/lib/utils";
import { getAuthToken } from "@/api/apiClient";
import { JwtPayload } from "@/models/types/auth";
import { logout } from "@/services/Auth/authService";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export function SimpleHeader({ title }: { title?: string }) {
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

export function UserHeader() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? getAuthToken() : null;

  const payload = useMemo(
    () => (token ? decodeJwt(token) : null),
    [token]
  ) as JwtPayload | null;

  const normalized = useMemo(
    () => normalizeJwt(payload),
    [payload]
  ) as JwtPayload | null;

  const isAuthenticated = !!normalized;
  const name = normalized?.name ?? "Guest";
  const role = normalized?.role ?? "";
  const imageUrl = normalized?.image_url ?? null;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Error while logging out");
    }
  };

  return (
    <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* --- Left: Logo --- */}
        <div className="flex items-center gap-3">
          <Image
            onClick={() => router.push("/")}
            src="https://ik.imagekit.io/i0aiv29ol/EMC%20Library.png?updatedAt=1760115301250"
            alt="logo"
            width={62}
            height={62}
          />
          <div>
            <div className="text-lg font-semibold text-gray-800">
              EMC Library
            </div>
            <div className="text-xs">
              {" "}
              <p className="max-w-sm mx-auto from-emerald-400 to-blue-600 bg-gradient-to-r bg-clip-text text-transparent">
                Share your knowledge, let it flow.
              </p>
              <p className="max-w-sm mx-auto from-red-600 to-indigo-700 bg-gradient-to-r bg-clip-text text-transparent">
                Share your passion, let it grow.
              </p>
            </div>
          </div>
        </div>

        {/* --- Right: Notification + User Menu --- */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100"
              onClick={() => router.push("/notifications")}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-3 h-3 rounded-full flex items-center justify-center"></span>
            </Button>
          )}

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {isAuthenticated ? name.charAt(0).toUpperCase() : "G"}
                    </div>
                  )}
                </div>

                {/* Name + Role */}
                <div className="text-left hidden sm:flex flex-col leading-tight">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {role || "Guest"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 shadow-lg border bg-white"
              collisionPadding={12}
            >
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem
                    className="flex items-center py-2 pl-1"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center py-2 pl-1"
                    onClick={() => router.push("/download-history")}
                  >
                    <Clock className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                    <span>Download History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-700 font-medium flex items-center py-2 pl-1"
                  >
                    <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    className="flex items-center py-2 pl-1"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center py-2 pl-1"
                    onClick={() => router.push("/register")}
                  >
                    <UserPlus className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
