import type { TbAlarm, TbDevice, TbLatestTelemetry, TbEntityId } from "./types";

function makeId(seed: string): TbEntityId {
  return { id: seed, entityType: "DEVICE" };
}

function now() {
  return Date.now();
}

const DEVICES: TbDevice[] = [
  {
    id: makeId("dev-solar-001"),
    name: "Solar Inverter #001",
    label: "Rooftop Solar - Block A",
    type: "inverter",
    customerTitle: "UrjaMitra Demo",
    status: "ONLINE",
    lastActivityTs: now() - 1000 * 60 * 2,
  },
  {
    id: makeId("dev-meter-014"),
    name: "Smart Meter #014",
    label: "Main Feed - Floor 2",
    type: "meter",
    customerTitle: "UrjaMitra Demo",
    status: "ONLINE",
    lastActivityTs: now() - 1000 * 35,
  },
  {
    id: makeId("dev-pump-002"),
    name: "Pump Controller #002",
    label: "Water Pump - Basement",
    type: "controller",
    customerTitle: "UrjaMitra Demo",
    status: "OFFLINE",
    lastActivityTs: now() - 1000 * 60 * 60 * 6,
  },
  {
    id: makeId("dev-evse-007"),
    name: "EV Charger #007",
    label: "Parking - Bay 7",
    type: "evse",
    customerTitle: "UrjaMitra Demo",
    status: "ONLINE",
    lastActivityTs: now() - 1000 * 60 * 1,
  },
];

const LATEST: Record<string, TbLatestTelemetry> = {
  "dev-solar-001": {
    temperatureC: 44.2,
    humidityPct: 22.0,
    voltageV: 232.1,
    currentA: 9.7,
    powerW: 2150,
    energyKwhToday: 12.4,
    rssiDbm: -58,
    updatedAtTs: now() - 1000 * 60 * 1,
  },
  "dev-meter-014": {
    temperatureC: 33.9,
    humidityPct: 41.0,
    voltageV: 229.5,
    currentA: 3.4,
    powerW: 780,
    energyKwhToday: 6.2,
    rssiDbm: -62,
    updatedAtTs: now() - 1000 * 20,
  },
  "dev-pump-002": {
    temperatureC: 39.0,
    humidityPct: 55.0,
    voltageV: 0,
    currentA: 0,
    powerW: 0,
    energyKwhToday: 0.4,
    rssiDbm: -92,
    updatedAtTs: now() - 1000 * 60 * 60 * 6,
  },
  "dev-evse-007": {
    temperatureC: 31.5,
    humidityPct: 28.0,
    voltageV: 234.0,
    currentA: 14.2,
    powerW: 3320,
    energyKwhToday: 18.8,
    rssiDbm: -53,
    updatedAtTs: now() - 1000 * 10,
  },
};

const ALARMS: TbAlarm[] = [
  {
    id: "alarm-001",
    deviceId: "dev-pump-002",
    severity: "MAJOR",
    type: "DEVICE_OFFLINE",
    status: "ACTIVE_UNACK",
    createdTimeTs: now() - 1000 * 60 * 55,
    details: "No telemetry received for 6 hours.",
  },
  {
    id: "alarm-002",
    deviceId: "dev-solar-001",
    severity: "WARNING",
    type: "TEMP_HIGH",
    status: "ACTIVE_ACK",
    createdTimeTs: now() - 1000 * 60 * 10,
    details: "Inverter temperature above threshold (42°C).",
  },
];

export async function tbListDevices(): Promise<TbDevice[]> {
  return DEVICES;
}

export async function tbGetDevice(deviceId: string): Promise<TbDevice | null> {
  return DEVICES.find((d) => d.id.id === deviceId) ?? null;
}

export async function tbGetLatestTelemetry(
  deviceId: string,
): Promise<TbLatestTelemetry | null> {
  return LATEST[deviceId] ?? null;
}

export async function tbListAlarms(): Promise<TbAlarm[]> {
  return ALARMS.sort((a, b) => b.createdTimeTs - a.createdTimeTs);
}

export async function tbListAlarmsForDevice(
  deviceId: string,
): Promise<TbAlarm[]> {
  return (await tbListAlarms()).filter((a) => a.deviceId === deviceId);
}

