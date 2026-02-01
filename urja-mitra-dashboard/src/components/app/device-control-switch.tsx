"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DeviceControlSwitchProps {
  deviceId: string;
  deviceName?: string;
  /** Initial power state. Defaults to true (on) for demo. */
  defaultOn?: boolean;
  /** Compact mode for dashboard cards (smaller label) */
  compact?: boolean;
  className?: string;
}

export function DeviceControlSwitch({
  deviceId,
  deviceName,
  defaultOn = true,
  compact = false,
  className,
}: DeviceControlSwitchProps) {
  const [on, setOn] = useState(defaultOn);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsUpdating(true);
    setOn(checked);
    // Simulate API call - replace with real ThingsBoard RPC when connected
    setTimeout(() => setIsUpdating(false), 300);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 touch-manipulation",
        compact ? "gap-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" : "min-h-[44px]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Switch
        checked={on}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        aria-label={`Toggle ${deviceName ?? deviceId}`}
      />
      <span
        className={cn(
          "text-muted-foreground whitespace-nowrap",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {on ? "On" : "Off"}
      </span>
    </div>
  );
}
