import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  Thermometer,
  Zap,
  Tv,
  Refrigerator,
  Plug,
} from "lucide-react";

const tipsByCategory = [
  {
    icon: Lightbulb,
    title: "Lighting",
    tips: [
      "Switch to LED bulbs — they use up to 80% less energy than incandescent bulbs.",
      "Turn off lights when leaving a room. Use motion sensors in hallways and bathrooms.",
      "Use natural daylight when possible. Open curtains and blinds during the day.",
      "Choose the right bulb brightness — use lower wattage where full brightness isn't needed.",
    ],
  },
  {
    icon: Thermometer,
    title: "Heating & Cooling",
    tips: [
      "Set your thermostat to 24–26°C in summer and 18–20°C in winter. Each degree saves energy.",
      "Use ceiling fans to circulate air — they use far less power than AC.",
      "Seal gaps around doors and windows to prevent drafts and heat loss.",
      "Maintain your AC filters — clean filters improve efficiency by up to 15%.",
    ],
  },
  {
    icon: Zap,
    title: "Appliances",
    tips: [
      "Unplug chargers and devices when not in use — they draw phantom power.",
      "Run washing machines and dishwashers only when full.",
      "Use cold water for laundry when possible — 90% of washer energy goes to heating water.",
      "Choose energy-efficient appliances (look for 5-star or Energy Star ratings).",
    ],
  },
  {
    icon: Refrigerator,
    title: "Refrigerator & Kitchen",
    tips: [
      "Keep the fridge between 2–4°C and freezer at -18°C. Colder settings waste energy.",
      "Don't leave the fridge door open — every minute adds to your bill.",
      "Let hot food cool before putting it in the fridge.",
      "Use a microwave or toaster oven for small meals instead of the full oven.",
    ],
  },
  {
    icon: Tv,
    title: "Electronics",
    tips: [
      "Enable power-saving or sleep mode on computers, TVs, and monitors.",
      "Use a power strip to turn off multiple devices at once when not in use.",
      "Lower screen brightness on TVs and monitors — it significantly reduces power use.",
      "Stream on smaller screens when possible — TVs use more energy than phones or tablets.",
    ],
  },
  {
    icon: Plug,
    title: "General Habits",
    tips: [
      "Schedule heavy appliance use during off-peak hours if your utility offers time-of-use rates.",
      "Insulate your water heater and pipes to reduce heat loss.",
      "Fix leaky faucets — hot water leaks waste both water and energy.",
      "Consider solar panels or solar water heaters for long-term savings.",
    ],
  },
];

export default function TipsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Tips to Save Electricity
        </h1>
        <p className="text-sm text-muted-foreground">
          Practical advice to reduce your energy consumption and lower your
          electricity bills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tipsByCategory.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {category.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
