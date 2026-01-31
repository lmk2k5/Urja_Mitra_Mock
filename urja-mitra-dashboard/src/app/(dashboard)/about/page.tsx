import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">About Us</h1>
        <p className="text-sm text-muted-foreground">
          Learn more about UrjaMitra and our mission.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              UrjaMitra (Energy Friend) is an IoT-powered energy monitoring
              platform designed to help households and businesses understand and
              reduce their electricity consumption. We believe that awareness is
              the first step toward sustainable energy use.
            </p>
            <p>
              By providing real-time insights into energy usage, device status,
              and actionable tips, we aim to make it easier for everyone to save
              electricity, cut costs, and contribute to a greener future.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What We Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Real-time monitoring</strong> — Track power, voltage, and energy usage across your devices
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Device management</strong> — View and manage all connected IoT devices in one place
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Alerts & alarms</strong> — Get notified when something needs attention
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Energy-saving tips</strong> — Practical advice to reduce your consumption
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            UrjaMitra is built on ThingsBoard, an open-source IoT platform that
            enables scalable device connectivity, data collection, and
            visualization. This dashboard provides a user-friendly interface to
            monitor your energy infrastructure and make informed decisions.
          </p>
          <Separator />
          <p className="text-xs">
            This demo runs on mock data. Connect your ThingsBoard instance to
            see real device telemetry and alarms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
