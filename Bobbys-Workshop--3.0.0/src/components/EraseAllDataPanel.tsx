import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrashSimple, 
  Warning, 
  ShieldWarning,
  DeviceMobile,
  LockKey,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

export function EraseAllDataPanel() {
  const { backendAvailable } = useApp();
  const [confirmText, setConfirmText] = useState('');
  const [erasing, setErasing] = useState(false);
  const [eraseProgress, setEraseProgress] = useState(0);
  const [keepActivationLock, setKeepActivationLock] = useState(true);
  const [secureWipe, setSecureWipe] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const handleErase = async () => {
    if (confirmText.toUpperCase() !== 'ERASE') {
      toast.error('Type "ERASE" to confirm');
      return;
    }

    if (!understood) {
      toast.error('You must acknowledge the warning');
      return;
    }

    if (!backendAvailable) {
      toast.error('Backend required for erase operations');
      return;
    }

    setErasing(true);
    setEraseProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setEraseProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      const response = await fetch('http://localhost:3001/api/device/erase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keepActivationLock, 
          secureWipe 
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) throw new Error('Erase failed');

      setEraseProgress(100);
      toast.success('Device erase initiated successfully');
      
      setTimeout(() => {
        setErasing(false);
        setEraseProgress(0);
        setConfirmText('');
        setUnderstood(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to erase device');
      setErasing(false);
      setEraseProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Erase All Data</h1>
        <p className="text-muted-foreground">
          Securely wipe device and restore to factory settings
        </p>
      </div>

      <Alert variant="destructive">
        <ShieldWarning className="h-5 w-5" />
        <AlertDescription className="space-y-2">
          <div className="font-bold text-lg">⚠️ DESTRUCTIVE ACTION WARNING</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>ALL DATA WILL BE PERMANENTLY DELETED</strong></li>
            <li>Photos, videos, messages, apps, and settings will be erased</li>
            <li>This action CANNOT be undone</li>
            <li>Ensure you have a backup before proceeding</li>
            <li>Device must have Find My iPhone disabled (unless keeping Activation Lock)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {erasing && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-destructive">Erasing device...</span>
                <span className="text-sm text-muted-foreground">{eraseProgress}%</span>
              </div>
              <Progress value={eraseProgress} className="bg-destructive/20" />
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Do not disconnect device during erase process
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobile />
            Connected Device
          </CardTitle>
          <CardDescription>
            Device that will be erased
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backendAvailable ? (
            <div className="flex items-center gap-3 p-3 bg-card/50 border border-border rounded-lg">
              <DeviceMobile className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <div className="font-medium">iPhone 14 Pro</div>
                <div className="text-sm text-muted-foreground">
                  iOS 17.2 • 256GB • UDID: 00008110...
                </div>
              </div>
              <Badge>Connected</Badge>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No device connected</p>
              <p className="text-sm mt-1">Backend required for device detection</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKey />
            Erase Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="keep-lock"
              checked={keepActivationLock}
              onCheckedChange={(checked) => setKeepActivationLock(checked as boolean)}
              disabled={erasing}
            />
            <div className="space-y-1">
              <Label htmlFor="keep-lock" className="cursor-pointer">
                Keep Activation Lock
              </Label>
              <p className="text-sm text-muted-foreground">
                Device will remain tied to your Apple ID. Recommended for personal use to prevent theft.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="secure-wipe"
              checked={secureWipe}
              onCheckedChange={(checked) => setSecureWipe(checked as boolean)}
              disabled={erasing}
            />
            <div className="space-y-1">
              <Label htmlFor="secure-wipe" className="cursor-pointer">
                Secure Wipe (Slower)
              </Label>
              <p className="text-sm text-muted-foreground">
                Overwrite data multiple times for maximum security. Takes significantly longer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TrashSimple />
            Confirm Erase
          </CardTitle>
          <CardDescription>
            This action requires explicit confirmation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="understand"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
              disabled={erasing}
            />
            <div className="space-y-1">
              <Label htmlFor="understand" className="cursor-pointer">
                I understand this will permanently delete all data
              </Label>
              <p className="text-sm text-muted-foreground">
                You acknowledge that all data will be lost and cannot be recovered.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <strong>ERASE</strong> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type ERASE"
              disabled={erasing || !understood}
              className="font-mono"
            />
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleErase}
            disabled={
              erasing || 
              !understood || 
              confirmText.toUpperCase() !== 'ERASE' ||
              !backendAvailable
            }
          >
            {erasing ? (
              <>
                <Warning className="mr-2 animate-pulse" />
                Erasing Device... {eraseProgress}%
              </>
            ) : (
              <>
                <TrashSimple className="mr-2" />
                Erase All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>After Erase:</strong> Device will restart automatically and show setup screen.
          You can set it up as new or restore from backup.
        </AlertDescription>
      </Alert>
    </div>
  );
}
