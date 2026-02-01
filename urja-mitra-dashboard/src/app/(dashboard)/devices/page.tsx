import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceTable } from "@/components/app/device-table";
import { apiGet } from "@/lib/api";
import type { TbDevice } from "@/lib/thingsboard/types";

export default async function DevicesPage() {
  const devices = await apiGet<TbDevice[]>("/api/devices");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Devices</h1>
        <p className="text-sm text-muted-foreground">
          List of devices from ThingsBoard.
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

