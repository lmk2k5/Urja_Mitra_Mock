/**
 * ThingsBoard time-series helpers.
 */

export type TbSeriesPoint = {
  ts: number;
  label: string;
  powerW: number;
  voltageV: number;
  currentA: number;
  energyKwh: number;
};

export type TbGetTimeSeriesParams = {
  deviceId: string;
  keys?: string[];
  startTs?: number;
  endTs?: number;
  limit?: number;
};

const TB_URL = process.env.THINGSBOARD_URL;
const TB_USER = process.env.THINGSBOARD_USERNAME;
const TB_PASS = process.env.THINGSBOARD_PASSWORD;
const TB_TOKEN = process.env.THINGSBOARD_TOKEN; // optional pre-issued JWT

let tbToken: string | null = null;
let tbTokenExpiresAt = 0;

function getBaseUrl(): string {
  if (!TB_URL) {
    throw new Error("THINGSBOARD_URL is not configured");
  }
  return TB_URL.replace(/\/$/, "");
}

async function ensureTbToken(): Promise<string> {
  const now = Date.now();

  if (tbToken && now < tbTokenExpiresAt - 60_000) {
    return tbToken;
  }

  if (TB_TOKEN) {
    tbToken = TB_TOKEN;
    tbTokenExpiresAt = now + 2 * 60 * 60 * 1000;
    return tbToken;
  }

  if (!TB_USER || !TB_PASS) {
    throw new Error("THINGSBOARD_USERNAME / THINGSBOARD_PASSWORD not configured");
  }

  const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username: TB_USER, password: TB_PASS }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ThingsBoard login failed (${res.status}): ${text || res.statusText}`);
  }

  const body = (await res.json()) as { token?: string };
  if (!body.token) {
    throw new Error("ThingsBoard login did not return a token");
  }

  tbToken = body.token;
  tbTokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000;
  return tbToken;
}

async function tbFetch(path: string, init?: RequestInit) {
  const token = await ensureTbToken();
  const url = path.startsWith("/") ? `${getBaseUrl()}${path}` : `${getBaseUrl()}/${path}`;

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Authorization", `Bearer ${token}`);

  return fetch(url, { ...init, headers });
}

export async function tbGetTimeSeries({
  deviceId,
  keys = ["power", "voltage", "current", "energy", "energyKwhToday"],
  startTs,
  endTs,
  limit = 200,
}: TbGetTimeSeriesParams): Promise<TbSeriesPoint[]> {
  if (!deviceId) {
    throw new Error("deviceId is required for time-series fetch");
  }

  const params = new URLSearchParams();
  params.set("keys", keys.join(","));
  if (startTs) params.set("startTs", String(startTs));
  if (endTs) params.set("endTs", String(endTs));
  if (limit) params.set("limit", String(limit));

  try {
    const res = await tbFetch(
      `/api/plugins/telemetry/DEVICE/${encodeURIComponent(deviceId)}/values/timeseries?${params.toString()}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Timeseries request failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as Record<string, { ts: number; value: string }[]>;
    if (!data || Object.keys(data).length === 0) return [];

    const series = keys.find((k) => data[k]?.length) ? keys : Object.keys(data);

    const baseKey = series.find((k) => data[k]?.length);
    if (!baseKey) return [];

    const base = data[baseKey] ?? [];
    const toNum = (v: string | undefined) => {
      const n = v !== undefined ? Number(v) : NaN;
      return Number.isFinite(n) ? n : null;
    };

    return base.map((row, idx) => {
      const ts = typeof row.ts === "number" ? row.ts : Date.now();
      const pick = (key: string) => toNum(data[key]?.[idx]?.value) ?? 0;
      const label = new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        ts,
        label,
        powerW: pick("power"),
        voltageV: pick("voltage"),
        currentA: pick("current"),
        energyKwh: pick("energyKwhToday") ?? pick("energy"),
      } satisfies TbSeriesPoint;
    });
  } catch (error) {
    console.error("[tbGetTimeSeries] fallback to empty", error);
    return [];
  }
}

export async function tbGetLatestTimeSeries(
  deviceId: string,
  keys: string[] = ["power", "voltage", "current", "energy", "energyKwhToday", "temperature", "humidity"]
): Promise<Record<string, { ts: number; value: string }[]>> {
  const params = new URLSearchParams();
  params.set("keys", keys.join(","));
  params.set("limit", "1");

  const res = await tbFetch(
    `/api/plugins/telemetry/DEVICE/${encodeURIComponent(deviceId)}/values/timeseries?${params.toString()}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Latest timeseries request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as Record<string, { ts: number; value: string }[]>;
}
