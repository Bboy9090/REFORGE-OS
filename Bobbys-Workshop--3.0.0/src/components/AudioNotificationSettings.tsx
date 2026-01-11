import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SpeakerHigh, SpeakerX } from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { AtmosphereMode } from "@/hooks/use-atmosphere";

export function AudioNotificationSettings() {
  const [atmosphereEnabled, setAtmosphereEnabled] = useKV<boolean>("atmosphere-enabled", false);
  const [atmosphereMode, setAtmosphereMode] = useKV<AtmosphereMode>("atmosphere-mode", "instrumental");
  const [atmosphereIntensity, setAtmosphereIntensity] = useKV<number>("atmosphere-intensity", 0.08);
  const [autoMuteOnErrors, setAutoMuteOnErrors] = useKV<boolean>("atmosphere-auto-mute", true);
  const [pauseOnComplete, setPauseOnComplete] = useKV<boolean>("atmosphere-pause-complete", true);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          {atmosphereEnabled ? <SpeakerHigh className="w-5 h-5 text-primary" /> : <SpeakerX className="w-5 h-5 text-muted-foreground" />}
          <div>
            <CardTitle>Workshop Atmosphere</CardTitle>
            <CardDescription>Low-key background atmosphere for focused work</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="atmosphere-toggle" className="text-base font-medium">
              Enable Workshop Atmosphere
            </Label>
            <p className="text-sm text-muted-foreground">
              Never auto-plays on launch. Starts only when work begins.
            </p>
          </div>
          <Switch
            id="atmosphere-toggle"
            checked={atmosphereEnabled}
            onCheckedChange={setAtmosphereEnabled}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-base font-medium">Mode</Label>
          <RadioGroup
            value={atmosphereMode}
            onValueChange={(value) => setAtmosphereMode(value as AtmosphereMode)}
            disabled={!atmosphereEnabled}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="instrumental" id="mode-instrumental" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="mode-instrumental" className="font-medium">
                  Instrumental
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rhythmic, unobtrusive, vocal-free.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="ambient" id="mode-ambient" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="mode-ambient" className="font-medium">
                  Ambient
                </Label>
                <p className="text-sm text-muted-foreground">
                  Texture only. No beat.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="external" id="mode-external" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="mode-external" className="font-medium">
                  External
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your system audio.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="intensity-slider" className="text-base font-medium">
              Intensity
            </Label>
            <span className="text-sm text-muted-foreground">
              {Math.round((atmosphereIntensity ?? 0.08) * 100)}% (max 15%)
            </span>
          </div>
          <Slider
            id="intensity-slider"
            value={[atmosphereIntensity ?? 0.08]}
            onValueChange={([value]) => setAtmosphereIntensity(value)}
            min={0}
            max={0.15}
            step={0.01}
            disabled={!atmosphereEnabled || atmosphereMode === "external"}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Hard capped at 15% volume for safety and focus.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mute" className="text-base font-medium">
                Auto-mute on Errors
              </Label>
              <p className="text-sm text-muted-foreground">
                Silence atmosphere when errors occur
              </p>
            </div>
            <Switch
              id="auto-mute"
              checked={autoMuteOnErrors}
              onCheckedChange={setAutoMuteOnErrors}
              disabled={!atmosphereEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pause-complete" className="text-base font-medium">
                Pause on Job Complete
              </Label>
              <p className="text-sm text-muted-foreground">
                Fade out when operations finish
              </p>
            </div>
            <Switch
              id="pause-complete"
              checked={pauseOnComplete}
              onCheckedChange={setPauseOnComplete}
              disabled={!atmosphereEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
