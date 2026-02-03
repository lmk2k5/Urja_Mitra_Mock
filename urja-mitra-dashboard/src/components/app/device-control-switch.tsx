"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DeviceControlSwitchProps {
  deviceId: string;
  deviceName?: string;
  /** Initial power state. Defaults to true (on) for demo. */
  defaultOn?: boolean;
  /** Compact mode for dashboard cards (smaller label) */
  compact?: boolean;
  /** RPC method name to invoke (default: setPower). */
  method?: string;
  /** Optional label to show next to the switch. Defaults to method name. */
  label?: string;
  className?: string;
}

export function DeviceControlSwitch({
  deviceId,
  deviceName,
  defaultOn = true,
  compact = false,
  method = "setPower",
  label,
  className,
}: DeviceControlSwitchProps) {
  const router = useRouter();
  const [on, setOn] = useState(defaultOn);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login requirement: control actions require a frontend login flag.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const readFlag = () =>
      window.localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(readFlag());

    const handler = () => setIsLoggedIn(readFlag());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleToggle = async (checked: boolean) => {
    if (!isLoggedIn) {
      // Redirect unauthenticated users to login for control actions.
      router.push("/login");
      return;
    }

    setIsUpdating(true);
    setOn(checked);

    try {
      const res = await fetch("/api/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          method,
          params: { on: checked },
        }),
      });

      if (!res.ok) {
        setOn((prev) => !prev); // revert optimistic update
        const bodyText = await res.text();
        let body: unknown = bodyText;
        try {
          body = JSON.parse(bodyText);
        } catch {
          /* ignore */
        }

        if (res.status === 401) {
          router.push("/login");
        }

        console.error("Control RPC failed", {
          status: res.status,
          statusText: res.statusText,
          body,
        });
      }
    } catch (error) {
      console.error("Control RPC error", error);
      setOn((prev) => !prev);
    } finally {
      setIsUpdating(false);
    }
  };

  const disabled = isUpdating;

  return (
    <div
      className={cn(
        "flex items-center gap-2 touch-manipulation",
        compact
          ? "gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          : "min-h-[44px]",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
          router.push("/login");
        }
      }}
    >
      <Switch
        checked={on}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={
          isLoggedIn
            ? `Toggle ${label ?? method} on ${deviceName ?? deviceId}`
            : `Login required to control ${label ?? method} on ${deviceName ?? deviceId}`
        }
      />
      <span
        className={cn(
          "text-muted-foreground whitespace-nowrap",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {label ?? method} {isLoggedIn ? (on ? "On" : "Off") : "(login)"}
      </span>
    </div>
  );
}
