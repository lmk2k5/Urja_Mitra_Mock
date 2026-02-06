import { NextResponse } from "next/server";

const TB_URL = process.env.THINGSBOARD_URL;
const TB_USER = process.env.THINGSBOARD_USERNAME;
const TB_PASS = process.env.THINGSBOARD_PASSWORD;
const TB_DEVICE_ID =
  process.env.THINGSBOARD_DEVICE_ID ?? "06dfe980-ff8b-11f0-9ad3-05720371f07f"; // demo-only fallback
const TB_USE_MOCK = process.env.THINGSBOARD_USE_MOCK === "true";

let tbToken: string | null = null;
let tbTokenExpiresAt = 0;

function mockPayload() {
  const now = Date.now();
  const ts = (offsetMinutes = 0) => now - offsetMinutes * 60 * 1000;

  return {
    devices: {
      data: [
        {
          id: { id: "mock-device-1", entityType: "DEVICE" },
          name: "Demo Feeder",
          label: "Zone A",
          type: "demo",
          customerTitle: "Demo Org",
          status: "ONLINE",
          lastActivityTs: now,
        },
      ],
    },
    alarms: {
      data: [
        {
          id: { id: "mock-alarm-1", entityType: "ALARM" },
          type: "Voltage",
          severity: "MINOR",
          status: "ACTIVE_UNACK",
          createdTime: ts(30),
          details: "Demo alarm (mock mode)",
        },
      ],
    },
    latest: {
      power: [{ ts: ts(1), value: "1200" }],
      voltage: [{ ts: ts(1), value: "230" }],
      current: [{ ts: ts(1), value: "5.2" }],
      energy: [{ ts: ts(1), value: "8.4" }],
    },
    history: {
      power: [
        { ts: ts(120), value: "900" },
        { ts: ts(90), value: "1000" },
        { ts: ts(60), value: "1150" },
        { ts: ts(30), value: "1180" },
        { ts: ts(1), value: "1200" },
      ],
      voltage: [
        { ts: ts(120), value: "228" },
        { ts: ts(90), value: "229" },
        { ts: ts(60), value: "230" },
        { ts: ts(30), value: "231" },
        { ts: ts(1), value: "230" },
      ],
      current: [
        { ts: ts(120), value: "4.1" },
        { ts: ts(90), value: "4.5" },
        { ts: ts(60), value: "5.0" },
        { ts: ts(30), value: "5.1" },
        { ts: ts(1), value: "5.2" },
      ],
      energy: [
        { ts: ts(120), value: "6.0" },
        { ts: ts(90), value: "6.7" },
        { ts: ts(60), value: "7.3" },
        { ts: ts(30), value: "7.9" },
        { ts: ts(1), value: "8.4" },
      ],
    },
    history30d: {
      power: [
        { ts: ts(24 * 60 * 7), value: "800" },
        { ts: ts(24 * 60 * 5), value: "950" },
        { ts: ts(24 * 60 * 3), value: "1100" },
        { ts: ts(24 * 60 * 2), value: "1180" },
        { ts: ts(1), value: "1200" },
      ],
      voltage: [
        { ts: ts(24 * 60 * 7), value: "227" },
        { ts: ts(24 * 60 * 5), value: "228" },
        { ts: ts(24 * 60 * 3), value: "229" },
        { ts: ts(24 * 60 * 2), value: "230" },
        { ts: ts(1), value: "230" },
      ],
      current: [
        { ts: ts(24 * 60 * 7), value: "4.0" },
        { ts: ts(24 * 60 * 5), value: "4.4" },
        { ts: ts(24 * 60 * 3), value: "4.9" },
        { ts: ts(24 * 60 * 2), value: "5.0" },
        { ts: ts(1), value: "5.2" },
      ],
      energy: [
        { ts: ts(24 * 60 * 7), value: "3.0" },
        { ts: ts(24 * 60 * 5), value: "4.5" },
        { ts: ts(24 * 60 * 3), value: "6.2" },
        { ts: ts(24 * 60 * 2), value: "7.8" },
        { ts: ts(1), value: "8.4" },
      ],
    },
  };
}

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
    if (TB_USE_MOCK) {
      return NextResponse.json(mockPayload());
    }

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
    let history30d: unknown = null;

    if (TB_DEVICE_ID) {
      const now = Date.now();
      const startTs = now - 24 * 60 * 60 * 1000;
      const startTs30d = now - 30 * 24 * 60 * 60 * 1000;
      const keys = encodeURIComponent("voltage,current,power,energy");

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

      const seriesMonthRes = await tbFetch(
        `/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?keys=${keys}&startTs=${startTs30d}&endTs=${now}&limit=1000`
      );
      if (seriesMonthRes.ok) {
        history30d = await seriesMonthRes.json();
      }
    }

    // demo-only shape; keep values minimal for frontend charts/cards
    return NextResponse.json({
      devices,
      latest,
      history,
      history30d,
      alarms,
    });
  } catch (error) {
    console.error("[api/tb]", error);
    if (TB_USE_MOCK) {
      return NextResponse.json(mockPayload());
    }
    return NextResponse.json(
      { error: "Failed to fetch ThingsBoard data" },
      { status: 500 }
    );
  }
}

