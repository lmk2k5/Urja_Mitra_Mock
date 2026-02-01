"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, LayoutDashboard, Server, Settings, Lightbulb, Info, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Server },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle className="text-lg">UrjaMitra</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
                  active && "bg-accent text-accent-foreground font-medium",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t p-4">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
              pathname === "/login" && "bg-accent text-accent-foreground font-medium",
            )}
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span>Login</span>
          </Link>
          <div className="mt-3 text-xs text-muted-foreground">
            Connect ThingsBoard in Settings
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
