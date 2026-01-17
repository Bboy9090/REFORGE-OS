import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ProhibitInset,
  ShieldCheck, 
  CloudArrowUp,
  CheckCircle,
  Warning,
  DeviceMobile,
  Info
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

export function StopIOSUpdatePanel() {
  const { backendAvailable } = useApp();
  const [updateBlocked, setUpdateBlocked] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleToggleBlock = async () => {
    if (!backendAvailable) {
      toast.error('Backend required for update control');
      return;
    }

    setProcessing(true);

    try {
      const action = updateBlocked ? 'enable' : 'disable';
      const response = await fetch(`http://localhost:3001/api/device/updates/${action}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to toggle updates');

      setUpdateBlocked(!updateBlocked);
      toast.success(updateBlocked ? 'iOS updates enabled' : 'iOS updates blocked');
    } catch (_error) {
      toast.error('Failed to control iOS updates');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUpdate = async () => {
    if (!backendAvailable) {
      toast.error('Backend required');
      return;
    }

    try {
      await fetch('http://localhost:3001/api/device/updates/delete', { method: 'POST' });
      toast.success('Downloaded update file deleted');
    } catch (_error) {
      toast.error('Failed to delete update');
    }
  };

  const handleRestoreDefaults = async () => {
    setUpdateBlocked(false);
    setAutoCheck(true);
    setDownloadBlocked(false);
    toast.success('Settings restored to default');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Stop iOS Update</h1>
        <p className="text-muted-foreground">
          Block automatic iOS updates and delete downloaded update files
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>About this feature:</strong> Prevents iOS from automatically downloading and installing updates.
          Useful if you want to stay on current iOS version for jailbreak, compatibility, or stability reasons.
        </AlertDescription>
      </Alert>

      {updateBlocked && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ProhibitInset className="text-primary" size={20} weight="fill" />
                </div>
                <div>
                  <div className="font-semibold">iOS Updates Blocked</div>
                  <div className="text-sm text-muted-foreground">
                    Automatic updates are currently disabled
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <ShieldCheck className="mr-1" size={14} />
                Protected
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobile />
            Device Status
          </CardTitle>
          <CardDescription>
            Current iOS update configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backendAvailable ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Current iOS Version</div>
                  <div className="text-sm text-muted-foreground">iOS 17.2.1</div>
                </div>
                <Badge variant="outline">Up to date</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Available Update</div>
                  <div className="text-sm text-muted-foreground">iOS 17.3 (2.8 GB)</div>
                </div>
                <Badge variant="secondary">Downloaded</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No device connected</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ProhibitInset />
            Update Control
          </CardTitle>
          <CardDescription>
            Configure automatic update behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block iOS Updates</Label>
              <p className="text-sm text-muted-foreground">
                Prevent automatic download and installation
              </p>
            </div>
            <Switch
              checked={updateBlocked}
              onCheckedChange={handleToggleBlock}
              disabled={!backendAvailable || processing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block Update Check</Label>
              <p className="text-sm text-muted-foreground">
                Disable automatic checking for new updates
              </p>
            </div>
            <Switch
              checked={autoCheck}
              onCheckedChange={setAutoCheck}
              disabled={!backendAvailable}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block Background Download</Label>
              <p className="text-sm text-muted-foreground">
                Prevent updates from downloading in background
              </p>
            </div>
            <Switch
              checked={downloadBlocked}
              onCheckedChange={setDownloadBlocked}
              disabled={!backendAvailable}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUp />
            Downloaded Updates
          </CardTitle>
          <CardDescription>
            Manage already downloaded update files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Warning className="h-4 w-4" />
            <AlertDescription>
              An iOS 17.3 update (2.8 GB) is downloaded and ready to install. 
              Delete it to free up space and prevent installation prompts.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleDeleteUpdate}
            variant="destructive"
            className="w-full"
            disabled={!backendAvailable}
          >
            Delete Downloaded Update
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <strong>Reversible:</strong> You can enable updates anytime by toggling off the block
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Warning className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <strong>Security Risk:</strong> Staying on old iOS versions may expose security vulnerabilities
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
            <div>
              <strong>Compatibility:</strong> Some apps may require newer iOS versions to function
            </div>
          </div>

          <Separator />

          <Button
            onClick={handleRestoreDefaults}
            variant="outline"
            className="w-full"
          >
            Restore Default Settings
          </Button>
        </CardContent>
      </Card>

      {!backendAvailable && (
        <Alert>
          <Warning className="h-4 w-4" />
          <AlertDescription>
            Backend API required for update control features. Connect backend to use this tool.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
