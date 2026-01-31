export type TbSeriesPoint = {
  ts: number;
  label: string;
  powerW: number;
  voltageV: number;
  currentA: number;
  energyKwh: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round(n: number, digits = 1) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

export function makeMockSeries({
  points = 24,
  minutesStep = 60,
  seed = 1,
  basePowerW = 1800,
}: {
  points?: number;
  minutesStep?: number;
  seed?: number;
  basePowerW?: number;
} = {}): TbSeriesPoint[] {
  const out: TbSeriesPoint[] = [];
  const now = Date.now();

  // deterministic-ish pseudo random
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  let cumulativeKwh = 0;

  for (let i = points - 1; i >= 0; i--) {
    const ts = now - i * minutesStep * 60 * 1000;

    // daily curve + noise
    const phase = (points - i) / points; // 0..1
    const curve = Math.sin(Math.PI * phase); // 0..1..0
    const noise = (rand() - 0.5) * 0.25; // ±0.125

    const power = clamp(basePowerW * (0.25 + 0.9 * curve) * (1 + noise), 80, 5200);
    const voltage = clamp(230 + (rand() - 0.5) * 8, 215, 245);
    const current = power / voltage;

    // integrate energy for the interval
    const hours = minutesStep / 60;
    cumulativeKwh += (power / 1000) * hours;

    const label = new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    out.push({
      ts,
      label,
      powerW: Math.round(power),
      voltageV: round(voltage, 1),
      currentA: round(current, 2),
      energyKwh: round(cumulativeKwh, 2),
    });
  }

  return out;
}

