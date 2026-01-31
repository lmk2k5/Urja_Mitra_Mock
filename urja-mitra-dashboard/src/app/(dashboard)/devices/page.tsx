import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceTable } from "@/components/app/device-table";
import { tbListDevices } from "@/lib/thingsboard/mock";

export default async function DevicesPage() {
  const devices = await tbListDevices();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Devices</h1>
        <p className="text-sm text-muted-foreground">
          List of devices from ThingsBoard (mock).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All devices</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceTable devices={devices} />
        </CardContent>
      </Card>
    </div>
  );
}

