import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Play, 
  Stop, 
  Warning, 
  Globe,
  Target,
  Navigation,
  Clock
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
  emoji: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, emoji: '🌉' },
  { name: 'New York', lat: 40.7128, lng: -74.0060, emoji: '🗽' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, emoji: '🗼' },
  { name: 'London', lat: 51.5074, lng: -0.1278, emoji: '🏰' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, emoji: '🗼' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, emoji: '🏙️' },
];

export function VirtualLocationPanel() {
  const { backendAvailable } = useApp();
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [locationName, setLocationName] = useState('Custom Location');
  const [isActive, setIsActive] = useState(false);
  const [spoofingDevice, setSpoofingDevice] = useState<string | null>(null);

  const handleSetLocation = async () => {
    if (!backendAvailable) {
      toast.error('Backend not available - feature disabled in demo mode');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/device/location/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, name: locationName })
      });

      if (!response.ok) throw new Error('Failed to set location');

      const data = await response.json();
      setIsActive(true);
      setSpoofingDevice(data.deviceId || 'Unknown');
      toast.success(`Virtual location set: ${locationName}`);
    } catch (_error) {
      toast.error('Failed to set virtual location');
    }
  };

  const handleStopLocation = async () => {
    if (!backendAvailable) return;

    try {
      await fetch('http://localhost:3001/api/device/location/stop', { method: 'POST' });
      setIsActive(false);
      setSpoofingDevice(null);
      toast.success('Virtual location stopped');
    } catch (_error) {
      toast.error('Failed to stop virtual location');
    }
  };

  const handlePresetSelect = (preset: LocationPreset) => {
    setLatitude(preset.lat.toString());
    setLongitude(preset.lng.toString());
    setLocationName(preset.name);
    toast.info(`Preset selected: ${preset.emoji} ${preset.name}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Virtual Location</h1>
        <p className="text-muted-foreground">
          Simulate GPS location for iOS devices (requires jailbreak or developer mode)
        </p>
      </div>

      <Alert>
        <Warning className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Notice:</strong> Virtual location spoofing may violate terms of service for certain apps.
          Use responsibly and only on devices you own. Not for bypassing security or location restrictions.
        </AlertDescription>
      </Alert>

      {isActive && spoofingDevice && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="text-primary animate-pulse" size={20} />
                </div>
                <div>
                  <div className="font-semibold">Location Spoofing Active</div>
                  <div className="text-sm text-muted-foreground">
                    Device: {spoofingDevice} • {locationName}
                  </div>
                </div>
              </div>
              <Button variant="destructive" onClick={handleStopLocation}>
                <Stop className="mr-2" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin />
            Custom Location
          </CardTitle>
          <CardDescription>
            Enter GPS coordinates or use quick presets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="37.7749"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-122.4194"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              id="location-name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="My Custom Location"
            />
          </div>

          <Button 
            onClick={handleSetLocation} 
            className="w-full"
            disabled={!backendAvailable || isActive}
          >
            <Play className="mr-2" />
            Set Virtual Location
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe />
            Quick Presets
          </CardTitle>
          <CardDescription>
            Popular location shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LOCATION_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => handlePresetSelect(preset)}
                className="justify-start"
                disabled={isActive}
              >
                <span className="mr-2">{preset.emoji}</span>
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target />
            Advanced Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Restore on Disconnect</Label>
              <p className="text-sm text-muted-foreground">
                Restore real location when device unplugged
              </p>
            </div>
            <Switch disabled={!backendAvailable} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Simulate Movement</Label>
              <p className="text-sm text-muted-foreground">
                Gradually change location over time (route simulation)
              </p>
            </div>
            <Switch disabled={!backendAvailable} />
          </div>
        </CardContent>
      </Card>

      {!backendAvailable && (
        <Alert>
          <Warning className="h-4 w-4" />
          <AlertDescription>
            Backend API required for virtual location features. Connect backend to use this tool.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
