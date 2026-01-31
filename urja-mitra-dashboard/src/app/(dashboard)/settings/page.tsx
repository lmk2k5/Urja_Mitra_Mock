import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Placeholder settings screen (mock).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ThingsBoard API</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This project currently uses dummy data from{" "}
          <span className="font-mono text-foreground">
            src/lib/thingsboard/mock.ts
          </span>
          . When you have a real ThingsBoard instance, replace the mock functions
          with real HTTP calls and move base URL/token to environment variables.
        </CardContent>
      </Card>
    </div>
  );
}

