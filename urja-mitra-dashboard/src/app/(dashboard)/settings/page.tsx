import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your ThingsBoard connection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ThingsBoard API</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add <code className="font-mono text-foreground">THINGSBOARD_URL</code> and{" "}
          <code className="font-mono text-foreground">THINGSBOARD_TOKEN</code> to{" "}
          <code className="font-mono text-foreground">.env.local</code>. Implement
          the API calls in <code className="font-mono text-foreground">src/lib/thingsboard/client.ts</code>.
        </CardContent>
      </Card>
    </div>
  );
}

