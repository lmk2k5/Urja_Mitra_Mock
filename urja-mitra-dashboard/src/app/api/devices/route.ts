import { NextResponse } from "next/server";
import { tbListDevices } from "@/lib/thingsboard/client";

export async function GET() {
  try {
    const devices = await tbListDevices();
    return NextResponse.json(devices);
  } catch (error) {
    console.error("[api/devices]", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}
