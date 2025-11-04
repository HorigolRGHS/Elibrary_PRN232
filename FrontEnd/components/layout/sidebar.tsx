"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { 
  Users, 
  BookOpen, 
  FolderOpen, 
  LayoutDashboard, 
  Settings,
  X,
  ChevronRight,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SidebarItemConfig {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  description?: string;
}

export interface SidebarGroupConfig {
  label: string;
  items: SidebarItemConfig[];
}

const sidebarConfig: SidebarGroupConfig[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview and statistics",
      },
      {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
        description: "Manage users",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "Documents",
        href: "/dashboard/documents",
        icon: BookOpen,
        description: "Manage documents",
      },
      {
        title: "Subjects",
        href: "/dashboard/subjects",
        icon: FolderOpen,
        description: "Manage subjects",
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
        icon: FolderOpen,
        description: "Manage categories",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Configuration",
        href: "/dashboard/settings",
        icon: Settings,
        description: "System settings",
      },
    ],
  },
];

// Sidebar Item Component
function SidebarItemComponent({ item }: { item: SidebarItemConfig }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "group relative",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <item.icon className="size-5 shrink-0" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm truncate">{item.title}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground truncate">
            {item.description}
          </span>
        )}
      </div>
      {item.badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
          {item.badge}
        </span>
      )}
      <ChevronRight
        className={cn(
          "size-4 opacity-0 group-hover:opacity-50 transition-opacity",
          isActive && "opacity-50"
        )}
      />
    </Link>
  );
}

// Sidebar Group Component
function SidebarGroupComponent({ group }: { group: SidebarGroupConfig }) {
  return (
    <div className="space-y-1">
      <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {group.label}
      </h3>
      <nav className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarItemComponent key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );
}

// Main Admin Sidebar Component
export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onClose(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-background border-r transform transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="border-b p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">
                Management Dashboard
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onClose(false)}
              className="size-8"
            >
              <X className="size-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {sidebarConfig.map((group, index) => (
            <div key={group.label}>
              <SidebarGroupComponent group={group} />
              {index < sidebarConfig.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4 shrink-0">
          <div className="text-xs text-muted-foreground text-center">
            <p>E-Library Admin v1.0</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </aside>
    </>
  );
}
