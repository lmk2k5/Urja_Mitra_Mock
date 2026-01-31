import Link from "next/link";

import { DeviceControlSwitch } from "@/components/app/device-control-switch";
import { EnergyChart, PowerVoltageChart } from "@/components/app/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  tbGetLatestTelemetry,
  tbListAlarms,
  tbListDevices,
} from "@/lib/thingsboard/mock";
import { makeMockSeries } from "@/lib/thingsboard/series";

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString();
}

export default async function DashboardPage() {
  const devices = await tbListDevices();
  const alarms = await tbListAlarms();
  const series = makeMockSeries({ points: 24, minutesStep: 60, seed: 7, basePowerW: 2200 });

  const online = devices.filter((d) => d.status === "ONLINE").length;
  const offline = devices.length - online;

  const latestEnergy = await Promise.all(
    devices.map(async (d) => {
      const t = await tbGetLatestTelemetry(d.id.id);
      return t?.energyKwhToday ?? 0;
    }),
  );
  const energyKwhToday = Math.round(latestEnergy.reduce((a, b) => a + b, 0) * 10) / 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Dummy ThingsBoard data wired through a mock client.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{devices.length}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{online} online</Badge>
              <Badge variant="outline">{offline} offline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active alarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{alarms.length}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Most recent: {alarms[0] ? fmtTime(alarms[0].createdTimeTs) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Energy today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{energyKwhToday} kWh</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Sum of all devices (mock)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Demo</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Replace mock client with API
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Power & Voltage (last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <PowerVoltageChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cumulative energy (last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <EnergyChart data={series} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {devices.map((d) => (
              <div
                key={d.id.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
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
                <div className="flex items-center gap-2 shrink-0">
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
          <CardHeader>
            <CardTitle>Alarms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {alarms.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No alarms (mock).
              </div>
            ) : (
              alarms.slice(0, 6).map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.type}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {a.details ?? a.deviceId}
                      </div>
                    </div>
                    <Badge variant="outline">{a.severity}</Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-xs text-muted-foreground">
                    {fmtTime(a.createdTimeTs)} · {a.status}
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

