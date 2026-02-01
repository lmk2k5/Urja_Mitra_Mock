"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TbSeriesPoint } from "@/lib/thingsboard/series";

const powerConfig = {
  powerW: {
    label: "Power (W)",
    theme: { light: "oklch(0.62 0.17 255)", dark: "oklch(0.72 0.16 255)" },
  },
  voltageV: {
    label: "Voltage (V)",
    theme: { light: "oklch(0.72 0.16 145)", dark: "oklch(0.78 0.16 145)" },
  },
} satisfies ChartConfig;

const energyConfig = {
  energyKwh: {
    label: "Energy (kWh)",
    theme: { light: "oklch(0.73 0.17 85)", dark: "oklch(0.78 0.17 85)" },
  },
} satisfies ChartConfig;

export function PowerVoltageChart({ data }: { data: TbSeriesPoint[] }) {
  return (
    <ChartContainer config={powerConfig} className="h-[200px] min-w-0 w-full sm:h-[240px] lg:h-[260px]">
      <AreaChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={36}
          tick={{ fontSize: 10 }}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          yAxisId="left"
          dataKey="powerW"
          type="monotone"
          fill="var(--color-powerW)"
          stroke="var(--color-powerW)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Area
          yAxisId="right"
          dataKey="voltageV"
          type="monotone"
          fill="var(--color-voltageV)"
          stroke="var(--color-voltageV)"
          fillOpacity={0.12}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function EnergyChart({ data }: { data: TbSeriesPoint[] }) {
  return (
    <ChartContainer config={energyConfig} className="h-[200px] min-w-0 w-full sm:h-[240px] lg:h-[260px]">
      <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tick={{ fontSize: 10 }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} tick={{ fontSize: 10 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="energyKwh"
          fill="var(--color-energyKwh)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

