/**
 * ThingsBoard API client — server-only. Uses backend credentials to fetch devices/telemetry/alarms.
 * Demo: falls back to THINGSBOARD_TOKEN if provided, otherwise username/password login.
 */

import type { TbAlarm, TbDevice, TbLatestTelemetry } from "./types";

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
    tbTokenExpiresAt = now + 2 * 60 * 60 * 1000; // best-effort cache
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
  tbTokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000; // conservative cache
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

export async function tbListDevices(): Promise<TbDevice[]> {
  try {
    const res = await tbFetch("/api/tenant/devices?pageSize=50&page=0");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Devices request failed (${res.status}): ${text}`);
    }
    const json = (await res.json()) as { data?: TbDevice[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("[tbListDevices] fallback to empty list", error);
    return [];
  }
}

export async function tbGetDevice(deviceId: string): Promise<TbDevice | null> {
  const res = await tbFetch(`/api/tenant/devices/${encodeURIComponent(deviceId)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Device request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as TbDevice;
}

export async function tbGetLatestTelemetry(
  deviceId: string
): Promise<TbLatestTelemetry | null> {
  const keys = encodeURIComponent("temperature,humidity,voltage,current,power,energy,energyKwhToday,rssi");
  const res = await tbFetch(
    `/api/plugins/telemetry/DEVICE/${encodeURIComponent(deviceId)}/values/timeseries?keys=${keys}&limit=1`
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telemetry request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Record<string, { ts: number; value: string }[]>;
  // Map to simplified shape if data is present; otherwise return null.
  if (!data || Object.keys(data).length === 0) return null;

  const pick = (key: string): number | null => {
    const v = data[key]?.[0]?.value;
    const n = v !== undefined ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  };

  const updatedAtTs = data[Object.keys(data)[0]]?.[0]?.ts ?? Date.now();

  return {
    temperatureC: pick("temperature") ?? 0,
    humidityPct: pick("humidity") ?? 0,
    voltageV: pick("voltage") ?? 0,
    currentA: pick("current") ?? 0,
    powerW: pick("power") ?? 0,
    energyKwhToday: pick("energyKwhToday") ?? pick("energy") ?? 0,
    rssiDbm: pick("rssi") ?? 0,
    updatedAtTs,
  } satisfies TbLatestTelemetry;
}

export async function tbListAlarms(): Promise<TbAlarm[]> {
  const res = await tbFetch("/api/alarms?pageSize=50&page=0");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Alarms request failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { data?: TbAlarm[] };
  return Array.isArray(json.data) ? json.data : [];
}

export async function tbListAlarmsForDevice(
  deviceId: string
): Promise<TbAlarm[]> {
  const res = await tbFetch(
    `/api/alarms?pageSize=50&page=0&entityId=${encodeURIComponent(deviceId)}&entityType=DEVICE`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Device alarms request failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { data?: TbAlarm[] };
  return Array.isArray(json.data) ? json.data : [];
}
