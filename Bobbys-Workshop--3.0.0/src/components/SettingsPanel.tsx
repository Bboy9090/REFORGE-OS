import { AudioNotificationSettings } from "./AudioNotificationSettings";
import { AtmosphereSettings } from "./AtmosphereSettings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Gear } from "@phosphor-icons/react";

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gear className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure workshop preferences and notifications</p>
        </div>
      </div>

      <AudioNotificationSettings />
      
      <AtmosphereSettings />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>About Workshop Mode</CardTitle>
          <CardDescription>
            Bobby's World • Professional repair toolkit and knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            This application follows a strict "no placeholders" policy. All diagnostics come from real commands,
            all device detection uses real USB scanning, and all operations execute actual hardware interactions.
          </p>
          <Separator />
          <p className="text-xs">
            Version: 0.2.0 • Built with ❤️ in the Bronx
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
