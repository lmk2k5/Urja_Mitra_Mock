import { NextResponse } from "next/server";

const TB_URL = process.env.THINGSBOARD_URL;
const TB_USER = process.env.THINGSBOARD_USERNAME;
const TB_PASS = process.env.THINGSBOARD_PASSWORD;
const TB_DEVICE_ID =
  process.env.THINGSBOARD_DEVICE_ID ?? "06dfe980-ff8b-11f0-9ad3-05720371f07f"; // demo-only fallback

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
  // Default TB access token is ~2.5h; be conservative.
  tbTokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000;
  return tbToken;
}

async function tbFetch(path: string, init?: RequestInit) {
  const token = await ensureTbToken();
  const url = path.startsWith("/")
    ? `${getBaseUrl()}${path}`
    : `${getBaseUrl()}/${path}`;

  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Authorization", `Bearer ${token}`);

  return fetch(url, {
    ...init,
    headers,
  });
}

export async function GET() {
  try {
    // Devices
    const devicesRes = await tbFetch("/api/tenant/devices?pageSize=50&page=0");
    if (!devicesRes.ok) {
      const text = await devicesRes.text();
      throw new Error(`Devices request failed (${devicesRes.status}): ${text}`);
    }
    const devices = await devicesRes.json();

    // Alarms
    const alarmsRes = await tbFetch("/api/alarms?pageSize=50&page=0");
    if (!alarmsRes.ok) {
      const text = await alarmsRes.text();
      throw new Error(`Alarms request failed (${alarmsRes.status}): ${text}`);
    }
    const alarms = await alarmsRes.json();

    let latest: unknown = null;
    let history: unknown = null;

    if (TB_DEVICE_ID) {
      const now = Date.now();
      const startTs = now - 24 * 60 * 60 * 1000;
      const keys = encodeURIComponent(
        "temperature,humidity,voltage,current,power,energy,energyKwhToday,rssi"
      );

      const latestRes = await tbFetch(
        `/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?keys=${keys}&limit=1`
      );
      if (latestRes.ok) {
        latest = await latestRes.json();
      }

      const seriesRes = await tbFetch(
        `/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?keys=${keys}&startTs=${startTs}&endTs=${now}&limit=200`
      );
      if (seriesRes.ok) {
        history = await seriesRes.json();
      }
    }

    // demo-only shape; keep values minimal for frontend charts/cards
    return NextResponse.json({
      devices,
      latest,
      history,
      alarms,
    });
  } catch (error) {
    console.error("[api/tb]", error);
    return NextResponse.json(
      { error: "Failed to fetch ThingsBoard data" },
      { status: 500 }
    );
  }
}

