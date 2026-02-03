"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Login:
// - POSTs to /api/login to obtain a server-side ThingsBoard JWT (HttpOnly cookie).
// - Sets a frontend flag to enable control UI, then redirects to /dashboard.
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("loggedIn") === "true";
    if (loggedIn) {
      setError("You are already marked as logged in. Use the button below to re-login or clear the flag.");
    }
  }, []);

  const clearLoginFlag = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("loggedIn");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Login failed");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("loggedIn", "true");
      }
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">UrjaMitra</h1>
        <p className="text-sm text-muted-foreground">
          Login is required only for device control. Viewing data is public.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your demo credentials to enable ON/OFF control. Data access is
            always server-side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "You are already marked as logged in. Use the button below to re-login or clear the flag." && (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              Login flag detected from a prior session. You can re-submit credentials, or
              <button
                type="button"
                className="ml-1 underline"
                onClick={clearLoginFlag}
              >
                clear the flag
              </button>
              .
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-xs font-medium text-muted-foreground">
                Username
              </label>
              <input
                type="email"
                autoComplete="username"
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-xs text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              <LogIn className="h-4 w-4" />
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
