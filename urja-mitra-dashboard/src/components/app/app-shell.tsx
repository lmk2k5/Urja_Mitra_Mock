import { AppSidebar } from "@/components/app/app-sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Separator } from "@/components/ui/separator";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl">
        <AppSidebar />
        <Separator orientation="vertical" className="hidden md:block" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <MobileNav />
              <div className="min-w-0">
                <div className="hidden text-sm text-muted-foreground sm:block">
                  ThingsBoard
                </div>
                <div className="truncate text-base font-semibold">
                  UrjaMitra
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <Separator />
          <main className="min-w-0 flex-1 overflow-x-auto p-3 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

