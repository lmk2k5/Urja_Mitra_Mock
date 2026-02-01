"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Settings,
  Lightbulb,
  Info,
  LogIn,
} from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Server },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 p-4 md:flex">
      <div className="rounded-xl border bg-card p-4">
        <div className="text-sm text-muted-foreground">UrjaMitra</div>
        <div className="text-lg font-semibold leading-tight">
          ThingsBoard Dashboard
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Connect ThingsBoard in Settings
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">
        <Link
          href="/login"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/login" && "bg-accent text-accent-foreground",
          )}
        >
          <LogIn className="h-4 w-4" />
          <span className="truncate">Login</span>
        </Link>
        <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
          Implement API calls in <code className="text-foreground">src/lib/thingsboard/client.ts</code>
        </div>
      </div>
    </aside>
  );
}

