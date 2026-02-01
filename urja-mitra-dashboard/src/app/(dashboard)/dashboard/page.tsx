import Link from "next/link";

import { DeviceControlSwitch } from "@/components/app/device-control-switch";
import { EnergyChart, PowerVoltageChart } from "@/components/app/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiGet } from "@/lib/api";
import type { TbAlarm, TbDevice, TbLatestTelemetry } from "@/lib/thingsboard/types";
import type { TbSeriesPoint } from "@/lib/thingsboard/series";

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString();
}

function fmtTimeShort(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function DashboardPage() {
  const [devices, alarms, series] = await Promise.all([
    apiGet<TbDevice[]>("/api/devices"),
    apiGet<TbAlarm[]>("/api/alarms"),
    apiGet<TbSeriesPoint[]>("/api/telemetry?type=series"),
  ]);

  const online = devices.filter((d) => d.status === "ONLINE").length;
  const offline = devices.length - online;

  const latestEnergy = await Promise.all(
    devices.map(async (d) => {
      const t = await apiGet<TbLatestTelemetry | null>(
        `/api/telemetry?deviceId=${encodeURIComponent(d.id.id)}`
      );
      return t?.energyKwhToday ?? 0;
    }),
  );
  const energyKwhToday = Math.round(latestEnergy.reduce((a, b) => a + b, 0) * 10) / 10;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Connect your ThingsBoard instance in Settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-semibold">{devices.length}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{online} online</Badge>
              <Badge variant="outline">{offline} offline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">
              Active alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-semibold">{alarms.length}</div>
            <div className="mt-2 text-xs text-muted-foreground break-words">
              Most recent: {alarms[0] ? fmtTimeShort(alarms[0].createdTimeTs) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">
              Energy today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-semibold">{energyKwhToday} kWh</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Sum of all devices
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">
              Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-semibold">API</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Connect ThingsBoard in Settings
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Power & Voltage (last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-1 px-1">
            <PowerVoltageChart data={series} />
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Cumulative energy (last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-1 px-1">
            <EnergyChart data={series} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Devices</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:gap-3">
            {devices.map((d) => (
              <div
                key={d.id.id}
                className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between sm:gap-3 min-h-[44px] sm:min-h-0"
              >
                <Link
                  href={`/devices/${d.id.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="truncate font-medium">{d.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d.label ?? d.id.id}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0 sm:flex-shrink-0">
                  <DeviceControlSwitch
                    deviceId={d.id.id}
                    deviceName={d.name}
                    compact
                  />
                  <Badge
                    variant={d.status === "ONLINE" ? "secondary" : "outline"}
                  >
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Alarms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:gap-3">
            {alarms.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No alarms.
              </div>
            ) : (
              alarms.slice(0, 6).map((a) => (
                <div key={a.id} className="rounded-lg border p-2.5 sm:p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm sm:text-base">{a.type}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {a.details ?? a.deviceId}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {a.severity}
                    </Badge>
                  </div>
                  <Separator className="my-1.5 sm:my-2" />
                  <div className="text-xs text-muted-foreground break-words">
                    {fmtTimeShort(a.createdTimeTs)} · {a.status}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

