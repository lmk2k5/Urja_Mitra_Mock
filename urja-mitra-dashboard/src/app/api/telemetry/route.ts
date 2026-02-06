import { NextResponse } from "next/server";
import { tbGetLatestTelemetry } from "@/lib/thingsboard/client";
import { tbGetTimeSeries } from "@/lib/thingsboard/series";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const type = searchParams.get("type"); // "latest" | "series"

  try {
    if (type === "series") {
      if (!deviceId) {
        return NextResponse.json(
          { error: "deviceId is required for time-series telemetry" },
          { status: 400 }
        );
      }
      const series = await tbGetTimeSeries({
        deviceId,
      });
      return NextResponse.json(series);
    }

    // Default: latest telemetry
    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required for latest telemetry" },
        { status: 400 }
      );
    }
    const telemetry = await tbGetLatestTelemetry(deviceId);
    return NextResponse.json(telemetry);
  } catch (error) {
    console.error("[api/telemetry]", error);
    return NextResponse.json(
      { error: "Failed to fetch telemetry" },
      { status: 500 }
    );
  }
}
