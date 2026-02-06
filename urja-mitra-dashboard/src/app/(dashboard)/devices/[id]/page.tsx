import Link from "next/link";
import { notFound } from "next/navigation";

import { DeviceControlSwitch } from "@/components/app/device-control-switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiGet } from "@/lib/api";
import type {
  TbAlarm,
  TbDevice,
  TbLatestTelemetry,
} from "@/lib/thingsboard/types";

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString();
}

export default async function DeviceDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [device, telemetry, alarms] = await Promise.all([
    apiGet<TbDevice | null>(`/api/devices/${id}`),
    apiGet<TbLatestTelemetry | null>(
      `/api/telemetry?deviceId=${encodeURIComponent(id)}`
    ),
    apiGet<TbAlarm[]>(`/api/alarms?deviceId=${encodeURIComponent(id)}`),
  ]);

  if (!device) notFound();

  const deviceStatus = device.status ?? "INACTIVE";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">
            <Link className="underline underline-offset-4" href="/devices">
              Devices
            </Link>{" "}
            / {device.id.id}
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {device.name}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {device.label ?? "—"}
          </div>
        </div>
        <Badge variant={deviceStatus === "ONLINE" ? "secondary" : "outline"}>
          {deviceStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Switch 1</div>
                <div className="text-sm text-muted-foreground">
                  RPC method: Switch_1
                </div>
              </div>
              <DeviceControlSwitch
                deviceId={device.id.id}
                deviceName={device.name}
                method="Switch_1"
                label="Switch 1"
                defaultOn={deviceStatus === "ONLINE"}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Switch 2</div>
                <div className="text-sm text-muted-foreground">
                  RPC method: Switch_2
                </div>
              </div>
              <DeviceControlSwitch
                deviceId={device.id.id}
                deviceName={device.name}
                method="Switch_2"
                label="Switch 2"
                defaultOn={deviceStatus === "ONLINE"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest telemetry</CardTitle>
          </CardHeader>
          <CardContent>
            {!telemetry ? (
              <div className="text-sm text-muted-foreground">
                No telemetry available.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Voltage</div>
                  <div className="text-2xl font-semibold">
                    {telemetry.voltageV} V
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="text-2xl font-semibold">
                    {telemetry.currentA} A
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Power</div>
                  <div className="text-2xl font-semibold">
                    {telemetry.powerW} W
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Energy</div>
                  <div className="text-2xl font-semibold">
                    {telemetry.energyKwh} kWh
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="text-xs text-muted-foreground">
              Updated: {telemetry ? fmtTime(telemetry.updatedAtTs) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Type</div>
              <div className="font-medium">{device.type ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Customer</div>
              <div className="font-medium">{device.customerTitle ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Last activity</div>
              <div className="font-medium">{fmtTime(device.lastActivityTs)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alarms</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {alarms.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No alarms for this device.
            </div>
          ) : (
            alarms.map((a) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.type}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.details ?? "—"}
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
  );
}

