import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TB_URL = process.env.THINGSBOARD_URL;

function getBaseUrl(): string {
  if (!TB_URL) {
    throw new Error("THINGSBOARD_URL is not configured");
  }
  return TB_URL.replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  try {
    // Read HttpOnly JWT from request cookies (works in Route Handlers with NextRequest).
    const jwtCookie = request.cookies.get("tb_jwt");
    if (!jwtCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized: login required for control actions" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      deviceId?: string;
      method?: string;
      params?: unknown;
    };

    if (!body.deviceId || !body.method) {
      return NextResponse.json(
        { error: "deviceId and method are required" },
        { status: 400 }
      );
    }

    const url = `${getBaseUrl()}/api/rpc/twoway/${encodeURIComponent(
      body.deviceId
    )}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Authorization": `Bearer ${jwtCookie.value}`,
      },
      body: JSON.stringify({
        method: body.method,
        params: body.params ?? {},
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("[api/control] RPC failed", {
        status: res.status,
        statusText: res.statusText,
        body: text,
      });
      return NextResponse.json(
        {
          error: text || "Control RPC failed",
          status: res.status,
          statusText: res.statusText,
        },
        { status: res.status }
      );
    }

    // Return raw ThingsBoard RPC response to the frontend (still JSON).
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({ ok: true, raw: text || null });
    }
  } catch (error) {
    console.error("[api/control] unexpected", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error during control RPC",
      },
      { status: 500 }
    );
  }
}

