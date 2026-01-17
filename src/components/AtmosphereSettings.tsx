import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { MusicNote } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import type { AtmosphereMode } from '@/hooks/use-atmosphere';

interface AtmosphereConfig {
  enabled: boolean;
  mode: AtmosphereMode;
  intensity: number;
  autoMuteOnErrors: boolean;
  pauseOnComplete: boolean;
}

const DEFAULT_CONFIG: AtmosphereConfig = {
  enabled: false,
  mode: 'instrumental',
  intensity: 0.08,
  autoMuteOnErrors: true,
  pauseOnComplete: true,
};

export function AtmosphereSettings() {
  const [config, setConfig] = useKV<AtmosphereConfig>('workshop-atmosphere-config', DEFAULT_CONFIG);

  const currentConfig = config || DEFAULT_CONFIG;

  const updateConfig = (updates: Partial<AtmosphereConfig>) => {
    setConfig((current) => ({ ...(current || DEFAULT_CONFIG), ...updates }));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MusicNote className="w-5 h-5 text-primary" weight="duotone" />
          <div className="flex-1">
            <CardTitle>Workshop Atmosphere</CardTitle>
            <CardDescription>
              Low-key background atmosphere for focused work
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="atmosphere-enabled" className="text-base">
              Enable Workshop Atmosphere
            </Label>
            <div className="text-sm text-muted-foreground">
              Play subtle background audio during operations
            </div>
          </div>
          <Switch
            id="atmosphere-enabled"
            checked={currentConfig.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-medium">Mode</Label>
          <RadioGroup
            value={currentConfig.mode}
            onValueChange={(value) => updateConfig({ mode: value as AtmosphereMode })}
            disabled={!currentConfig.enabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instrumental" id="mode-instrumental" />
              <Label htmlFor="mode-instrumental" className="font-normal cursor-pointer">
                <div className="font-medium">Instrumental</div>
                <div className="text-xs text-muted-foreground">
                  Rhythmic, unobtrusive, vocal-free
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ambient" id="mode-ambient" />
              <Label htmlFor="mode-ambient" className="font-normal cursor-pointer">
                <div className="font-medium">Ambient</div>
                <div className="text-xs text-muted-foreground">
                  Texture only. No beat.
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="external" id="mode-external" />
              <Label htmlFor="mode-external" className="font-normal cursor-pointer">
                <div className="font-medium">External</div>
                <div className="text-xs text-muted-foreground">
                  Use your system audio.
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="intensity-slider" className="text-sm font-medium">
              Intensity
            </Label>
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(currentConfig.intensity * 100)}%
            </span>
          </div>
          <Slider
            id="intensity-slider"
            min={0}
            max={0.15}
            step={0.01}
            value={[currentConfig.intensity]}
            onValueChange={(value) => updateConfig({ intensity: value[0] })}
            disabled={!currentConfig.enabled || currentConfig.mode === 'external'}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Volume capped at 15% for safety and focus
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mute" className="text-base">
                Auto-mute on Errors
              </Label>
              <div className="text-sm text-muted-foreground">
                Automatically stop audio when errors occur
              </div>
            </div>
            <Switch
              id="auto-mute"
              checked={currentConfig.autoMuteOnErrors}
              onCheckedChange={(checked) => updateConfig({ autoMuteOnErrors: checked })}
              disabled={!currentConfig.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pause-complete" className="text-base">
                Pause on Job Complete
              </Label>
              <div className="text-sm text-muted-foreground">
                Stop audio when operations finish
              </div>
            </div>
            <Switch
              id="pause-complete"
              checked={currentConfig.pauseOnComplete}
              onCheckedChange={(checked) => updateConfig({ pauseOnComplete: checked })}
              disabled={!currentConfig.enabled}
            />
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Audio Policy</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Never auto-plays on app launch</li>
              <li>Volume hard-capped at 15%</li>
              <li>Silence = confidence (audio never competes with alerts)</li>
              <li>External mode: app respects your system audio</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
