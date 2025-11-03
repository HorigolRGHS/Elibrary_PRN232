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
import { useMemo, useState, useEffect } from "react";
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

import { api } from "@/api/apiClient";

function NotificationMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const unreadCount = items.filter((i) => !i.isViewed).length;

  // Helper: format time since scheduledDate (fallback to createdDate)
  const timeAgo = (item: any) => {
    const dt = item?.scheduledDate || item?.createdDate;
    if (!dt) return "";
    const then = new Date(dt).getTime();
    const now = Date.now();
    const sec = Math.floor((now - then) / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    return `${days}d`;
  };

  const badgeForType = (type: string | undefined) => {
    switch ((type || "").toLowerCase()) {
      case "system":
        return "bg-red-100 text-red-800";
      case "customer":
        return "bg-blue-100 text-blue-800";
      case "custom":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const accentForType = (type: string | undefined) => {
    switch ((type || "").toLowerCase()) {
      case "system":
        return "bg-red-500";
      case "customer":
        return "bg-blue-500";
      case "custom":
        return "bg-emerald-500";
      default:
        return "bg-gray-400";
    }
  };

  useEffect(() => {
    // don't fetch if dropdown closed or user is not authenticated
    if (!open || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    console.log("[NotificationMenu] fetching /activity/api/Notifications/me");
    api
      .get<any>("/activity/api/Notifications/me")
      .then((res) => {
        const data: any = res;
        const list = Array.isArray(data) ? data : data?.value || [];
        if (!cancelled) setItems(list);
        console.log("[NotificationMenu] fetched", list);
      })
      .catch((err: any) => {
        console.error("[NotificationMenu] fetch error", err);
        if (!cancelled) {
          setItems([]);
          setError(
            (err && (err.message || err.toString())) || "Failed to load"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated]);

  const markAsViewed = async (id: number) => {
    try {
      await api.post(`/activity/api/Notifications/${id}/view`);
      setItems((prev) =>
        prev.map((n) =>
          n.notificationId === id
            ? { ...n, isViewed: true, viewedDate: new Date().toISOString() }
            : n
        )
      );
    } catch (e) {
      toast.error("Could not mark notification as viewed");
    }
  };

  if (!mounted) return null; // avoid SSR/client mismatch

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 p-1 shadow-lg border bg-white"
      >
        <div className="max-h-64 overflow-auto">
          {loading ? (
            <div className="p-4 text-sm">Loading...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">Error: {error}</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-center">No notifications</div>
          ) : (
            items.map((n) => (
              <div
                key={n.notificationId}
                onClick={async () => {
                  if (!n.isViewed) await markAsViewed(n.notificationId);
                  setActiveId((prev) =>
                    prev === n.notificationId ? null : n.notificationId
                  );
                }}
                className={`relative flex gap-3 items-start p-3 cursor-pointer rounded-md transition-shadow ${
                  n.isViewed ? "bg-white opacity-90" : "bg-white shadow-sm"
                } hover:shadow-md`}
              >
                {/* left accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${accentForType(
                    n.type
                  )}`}
                />

                {/* content */}
                <div className="flex-1 pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeForType(
                          n.type
                        )}`}
                      >
                        {n.type || "Unknown"}
                      </div>
                      <div className="text-sm font-medium text-gray-800 leading-tight">
                        {n.title}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(n)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {n.content}
                  </div>

                  {activeId === n.notificationId && (
                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                      <div className="whitespace-pre-wrap">{n.content}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        Sent:{" "}
                        {new Date(
                          n.scheduledDate || n.createdDate
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* unread dot */}
                {!n.isViewed && (
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-right">
          <button
            onClick={() => router.push("/notifications")}
            className="text-sm text-indigo-600 hover:underline"
          >
            See all
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
            src="/image/BeluLibrary.png"
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
            <NotificationMenu isAuthenticated={isAuthenticated} />
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
