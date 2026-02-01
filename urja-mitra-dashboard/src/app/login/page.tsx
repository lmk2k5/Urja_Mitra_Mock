import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getThingsBoardLoginUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_THINGSBOARD_URL ?? process.env.THINGSBOARD_URL;
  if (!base) return null;
  const url = base.replace(/\/$/, "");
  return `${url}/login`;
}

export default function LoginPage() {
  const loginUrl = getThingsBoardLoginUrl();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">UrjaMitra</h1>
        <p className="text-sm text-muted-foreground">
          IoT energy monitoring dashboard
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your ThingsBoard account to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loginUrl ? (
            <Button asChild size="lg" className="w-full">
              <a href={loginUrl}>
                <LogIn className="h-4 w-4" />
                Sign in with ThingsBoard
              </a>
            </Button>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">ThingsBoard not configured</p>
              <p className="mt-1">
                Add <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_THINGSBOARD_URL</code> or{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">THINGSBOARD_URL</code> to{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/settings">Go to Settings</Link>
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            You&apos;ll be redirected to your ThingsBoard instance to sign in.
          </p>
        </CardContent>
      </Card>

      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Continue to dashboard →
      </Link>
    </div>
  );
}
