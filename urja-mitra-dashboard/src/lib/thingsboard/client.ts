/**
 * ThingsBoard API client — replace these stubs with real HTTP calls.
 * Add THINGSBOARD_URL and THINGSBOARD_TOKEN to .env.local
 */

import type { TbAlarm, TbDevice, TbLatestTelemetry } from "./types";

export async function tbListDevices(): Promise<TbDevice[]> {
  // TODO: GET /api/tenant/devices
  return [];
}

export async function tbGetDevice(deviceId: string): Promise<TbDevice | null> {
  // TODO: GET /api/tenant/devices/{deviceId}
  return null;
}

export async function tbGetLatestTelemetry(
  deviceId: string
): Promise<TbLatestTelemetry | null> {
  // TODO: GET /api/plugins/telemetry/device/{deviceId}/values/timeseries
  return null;
}

export async function tbListAlarms(): Promise<TbAlarm[]> {
  // TODO: GET /api/alarms
  return [];
}

export async function tbListAlarmsForDevice(
  deviceId: string
): Promise<TbAlarm[]> {
  // TODO: GET /api/alarms?entityId={deviceId}
  return [];
}
