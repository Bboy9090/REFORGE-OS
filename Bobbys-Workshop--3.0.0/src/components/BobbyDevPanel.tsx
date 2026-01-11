import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Monitor, Globe, DeviceMobile } from '@phosphor-icons/react';

export function BobbyDevPanel() {
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    platform: '',
    language: '',
    online: true,
    cookiesEnabled: false
  });

  const [systemInfo, setSystemInfo] = useState({
    cores: 0,
    memory: 0,
    connection: ''
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';

    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Edg') > -1) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '';
    }

    setBrowserInfo({
      name: browserName,
      version: browserVersion,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled
    });

    const nav = navigator as any;
    setSystemInfo({
      cores: nav.hardwareConcurrency || 0,
      memory: nav.deviceMemory || 0,
      connection: nav.connection?.effectiveType || 'unknown'
    });

    const handleOnline = () => setBrowserInfo(prev => ({ ...prev, online: true }));
    const handleOffline = () => setBrowserInfo(prev => ({ ...prev, online: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wrench size={24} className="text-primary" />
              <CardTitle className="text-2xl">Bobby Dev Panel</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Private Creator Arsenal • Pandora Codex Development Environment
            </CardDescription>
          </div>
          <Badge variant={browserInfo.online ? 'default' : 'destructive'}>
            {browserInfo.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Monitor size={20} />
              <h3 className="font-semibold">Browser</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{browserInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">{browserInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">{browserInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cookies:</span>
                <span className="font-medium">{browserInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <DeviceMobile size={20} />
              <h3 className="font-semibold">Platform</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">OS:</span>
                <span className="font-medium">{browserInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPU Cores:</span>
                <span className="font-medium">{systemInfo.cores || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RAM:</span>
                <span className="font-medium">{systemInfo.memory ? `${systemInfo.memory} GB` : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screen:</span>
                <span className="font-medium">{window.screen.width}×{window.screen.height}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Globe size={20} />
              <h3 className="font-semibold">Network</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={browserInfo.online ? 'default' : 'destructive'} className="text-xs">
                  {browserInfo.online ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{systemInfo.connection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol:</span>
                <span className="font-medium">{window.location.protocol.replace(':', '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host:</span>
                <span className="font-medium text-xs">{window.location.hostname}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
