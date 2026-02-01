/**
 * ThingsBoard time-series API — replace with real HTTP calls.
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
  deviceId?: string;
  keys?: string[];
  startTs?: number;
  endTs?: number;
  limit?: number;
};

export async function tbGetTimeSeries(
  _params?: TbGetTimeSeriesParams
): Promise<TbSeriesPoint[]> {
  // TODO: GET /api/plugins/telemetry/device/{deviceId}/values/timeseries
  return [];
}
