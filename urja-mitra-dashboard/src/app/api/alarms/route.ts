import { NextResponse } from "next/server";
import {
  tbListAlarms,
  tbListAlarmsForDevice,
} from "@/lib/thingsboard/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");

  try {
    const alarms = deviceId
      ? await tbListAlarmsForDevice(deviceId)
      : await tbListAlarms();
    return NextResponse.json(alarms);
  } catch (error) {
    console.error("[api/alarms]", error);
    return NextResponse.json(
      { error: "Failed to fetch alarms" },
      { status: 500 }
    );
  }
}
