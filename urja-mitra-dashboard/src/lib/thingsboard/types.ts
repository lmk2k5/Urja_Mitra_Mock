export type TbEntityId = {
  id: string;
  entityType: "DEVICE";
};

export type TbDevice = {
  id: TbEntityId;
  name: string;
  label?: string;
  type?: string;
  customerTitle?: string;
  status: "ONLINE" | "OFFLINE";
  lastActivityTs: number;
};

export type TbLatestTelemetry = {
  temperatureC: number;
  humidityPct: number;
  voltageV: number;
  currentA: number;
  powerW: number;
  energyKwhToday: number;
  rssiDbm: number;
  updatedAtTs: number;
};

export type TbAlarm = {
  id: string;
  deviceId: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR" | "WARNING";
  type: string;
  status: "ACTIVE_UNACK" | "ACTIVE_ACK" | "CLEARED_ACK";
  createdTimeTs: number;
  details?: string;
};

