"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PowerVoltageChart, EnergyChart } from "@/components/app/dashboard-charts";
import { DeviceControlSwitch } from "@/components/app/device-control-switch";
import type { TbSeriesPoint } from "@/lib/thingsboard/series";

type TbPage<T> = { data?: T[] } & Record<string, unknown>;
type TbTelemetryEntry = { ts: number; value: string };
type TbTelemetryMap = Record<string, TbTelemetryEntry[]>;

type TbApiResponse = {
  devices?: TbPage<any> | null;
  alarms?: TbPage<any> | null;
  latest?: TbTelemetryMap | null;
  history?: TbTelemetryMap | null;
  history30d?: TbTelemetryMap | null;
  telemetryLatest?: TbTelemetryMap | null; // fallback: older field name
  telemetrySeries?: TbTelemetryMap | null; // fallback: older field name
};

// Dashboard:
// - Always visible without login (public view).
// - Always fetches data from /api/tb; backend auth is independent.
export default function DashboardPage() {
  const [data, setData] = useState<TbApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Public data fetch: does NOT depend on frontend login.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/tb", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        const json = (await res.json()) as TbApiResponse;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const devices = useMemo(() => {
    if (!data?.devices || !Array.isArray(data.devices.data)) return [] as any[];

    const now = Date.now();
    const isRecent = (ts: number | undefined | null) =>
      typeof ts === "number" && now - ts < 5 * 60 * 1000; // 5-minute freshness window

    return (data.devices.data as any[]).map((d) => {
      const lastActivity = d?.lastActivityTs ?? d?.lastActivityTime;
      const derivedStatus = isRecent(lastActivity) ? "ONLINE" : "OFFLINE";
      return {
        ...d,
        status: d?.status ?? derivedStatus,
      };
    });
  }, [data]);

  const alarms = useMemo(() => {
    if (!data?.alarms || !Array.isArray(data.alarms.data)) return [] as any[];
    return data.alarms.data as any[];
  }, [data]);

  const telemetryLatest = data?.latest ?? data?.telemetryLatest ?? null;
  const telemetrySeries = data?.history ?? data?.telemetrySeries ?? null;
  const telemetrySeries30d = data?.history30d ?? null;

  const latestValue = (key: string): number | null => {
    const arr = telemetryLatest?.[key];
    if (!arr || arr.length === 0) return null;
    const v = Number(arr[0]?.value);
    return Number.isFinite(v) ? v : null;
  };

  const latestTs = useMemo(() => {
    if (!telemetryLatest) return null;
    const ts = Object.values(telemetryLatest)
      .flat()
      .map((e) => e?.ts)
      .filter((v) => typeof v === "number");
    if (ts.length === 0) return null;
    return new Date(Math.max(...ts)).toLocaleString();
  }, [telemetryLatest]);

  const toSeries = useMemo(() => {
    const build = (source: TbTelemetryMap | null, labelFormatter: (ts: number) => string) => {
      if (!source) return [] as TbSeriesPoint[];

      const pickSeries = (key: string) => source?.[key] ?? [];
      const baseKey = ["power", "energy", "voltage", "current"].find(
        (key) => pickSeries(key).length > 0,
      );

      const base = baseKey ? pickSeries(baseKey) : [];
      if (base.length === 0) return [] as TbSeriesPoint[];

      const toNumber = (value: string | undefined): number | null => {
        if (value == null) return null;
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
      };

      return base.map((row, idx) => {
        const ts = typeof row.ts === "number" ? row.ts : Date.now();
        const label = labelFormatter(ts);
        const pick = (key: string) => toNumber(pickSeries(key)?.[idx]?.value);

        return {
          ts,
          label,
          powerW: pick("power") ?? 0,
          voltageV: pick("voltage") ?? 0,
          currentA: pick("current") ?? 0,
          energyKwh: pick("energy") ?? 0,
        } satisfies TbSeriesPoint;
      });
    };

    return {
      day: build(telemetrySeries, (ts) =>
        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ),
      month: build(telemetrySeries30d, (ts) =>
        new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" })
      ),
    };
  }, [telemetrySeries, telemetrySeries30d]);

  const loadingState = (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );

  const errorState = (
    <Card>
      <CardHeader>
        <CardTitle>Backend status</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-destructive">
        Failed to load data: <span className="font-mono">{error}</span>
      </CardContent>
    </Card>
  );

  const statCards = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Devices" value={devices.length} subtext="from ThingsBoard" />
      <StatCard
        label="Online"
        value={devices.filter((d) => d?.status === "ONLINE").length}
        subtext="reported status"
      />
      <StatCard label="Alarms" value={alarms.length} subtext="all severities" />
      <StatCard
        label="Last update"
        value={latestTs ?? "-"}
        subtext="latest telemetry timestamp"
      />
    </div>
  );

  const latestMetrics = (
    <Card>
      <CardHeader>
        <CardTitle>Latest telemetry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Power" value={latestValue("power")} unit="W" />
          <Metric label="Voltage" value={latestValue("voltage")} unit="V" />
          <Metric label="Current" value={latestValue("current")} unit="A" />
          <Metric label="Energy" value={latestValue("energy")} unit="kWh" />
        </div>
      </CardContent>
    </Card>
  );

  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Power & Voltage</CardTitle>
          <Badge variant="secondary">24h</Badge>
        </CardHeader>
        <CardContent>
          {toSeries.day.length === 0 ? (
            <div className="text-sm text-muted-foreground">No series data available.</div>
          ) : (
            <PowerVoltageChart data={toSeries.day} />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Energy</CardTitle>
          <Badge variant="secondary">24h</Badge>
        </CardHeader>
        <CardContent>
          {toSeries.day.length === 0 ? (
            <div className="text-sm text-muted-foreground">No series data available.</div>
          ) : (
            <EnergyChart data={toSeries.day} />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Power & Voltage · 30d</CardTitle>
          <Badge variant="secondary">30d</Badge>
        </CardHeader>
        <CardContent>
          {toSeries.month.length === 0 ? (
            <div className="text-sm text-muted-foreground">No series data available.</div>
          ) : (
            <PowerVoltageChart data={toSeries.month} />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const alarmsList = (
    <Card>
      <CardHeader>
        <CardTitle>Recent alarms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alarms.length === 0 && (
          <div className="text-sm text-muted-foreground">No alarms reported.</div>
        )}
        {alarms.slice(0, 5).map((alarm: any) => (
          <div key={alarm?.id?.id ?? alarm?.id ?? Math.random()} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{alarm?.type ?? "Alarm"}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {alarm?.details ?? "-"}
                </div>
              </div>
              <Badge variant="outline">{alarm?.severity ?? "UNKNOWN"}</Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {alarm?.status ?? "-"} · {formatTs(alarm?.createdTime ?? alarm?.createdTimeTs)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const devicesList = (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {devices.length === 0 && (
          <div className="text-muted-foreground">No devices returned.</div>
        )}
        {devices.slice(0, 5).map((device: any) => (
          <div key={device?.id?.id ?? device?.id ?? Math.random()} className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{device?.name ?? "Device"}</div>
              <div className="truncate text-xs text-muted-foreground">
                {device?.label ?? device?.type ?? "-"}
              </div>
            </div>
            <Badge variant={device?.status === "ONLINE" ? "secondary" : "outline"}>
              {device?.status ?? "UNKNOWN"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Public view: stats and telemetry are fetched from <code>/api/tb</code>.
        </p>
      </div>

      {loading && loadingState}
      {!loading && error && errorState}

      {!loading && !error && (
        <>
          {statCards}
          {latestMetrics}
          {charts}

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            {alarmsList}
            {devicesList}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick control</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {devices.slice(0, 6).map((device: any) => (
                <div key={device?.id?.id ?? device?.id ?? Math.random()} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{device?.name ?? "Device"}</div>
                    <div className="truncate text-xs text-muted-foreground">{device?.label ?? device?.type ?? "-"}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <DeviceControlSwitch
                      deviceId={device?.id?.id ?? ""}
                      deviceName={device?.name}
                      method="Switch_1"
                      label="Switch 1"
                      defaultOn={device?.status === "ONLINE"}
                      compact
                    />
                    <DeviceControlSwitch
                      deviceId={device?.id?.id ?? ""}
                      deviceName={device?.name}
                      method="Switch_2"
                      label="Switch 2"
                      defaultOn={device?.status === "ONLINE"}
                      compact
                    />
                  </div>
                </div>
              ))}
              {devices.length === 0 && (
                <div className="text-sm text-muted-foreground">No devices returned.</div>
              )}
            </CardContent>
          </Card>

          <Separator />
          <p className="text-xs text-muted-foreground">
            Note: Device control (ON/OFF) is restricted and requires login; viewing
            this data does not.
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, unit }: { label: string; value: number | null; unit?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">
        {value == null ? "-" : value}
        {value != null && unit ? <span className="text-sm text-muted-foreground"> {unit}</span> : null}
      </div>
    </div>
  );
}

function formatTs(ts?: number) {
  if (!ts || !Number.isFinite(ts)) return "-";
  return new Date(ts).toLocaleString();
}

