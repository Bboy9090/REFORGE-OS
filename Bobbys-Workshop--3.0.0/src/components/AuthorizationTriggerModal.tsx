import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldWarning, 
  Info, 
  Warning, 
  XCircle 
} from '@phosphor-icons/react';
import type { AuthorizationTrigger } from '@/lib/authorization-triggers';
import { executeTrigger } from '@/lib/authorization-triggers';
import { useAuthorizationHistory } from '@/hooks/use-authorization-history';

interface AuthorizationTriggerModalProps {
  trigger: AuthorizationTrigger | null;
  deviceId?: string;
  deviceName?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  additionalData?: Record<string, any>;
}

export function AuthorizationTriggerModal({
  trigger,
  deviceId,
  deviceName,
  open,
  onClose,
  onSuccess,
  onError,
  additionalData,
}: AuthorizationTriggerModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addHistoryEntry, updateHistoryEntry } = useAuthorizationHistory();

  if (!trigger) return null;

  const isConfirmationValid = trigger.requiresTypedConfirmation
    ? confirmationInput === trigger.confirmationText
    : true;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success/20 text-success border-success/50';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/50';
      case 'high':
        return 'bg-accent/20 text-accent border-accent/50';
      case 'destructive':
        return 'bg-destructive/20 text-destructive border-destructive/50';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Info className="h-4 w-4" />;
      case 'medium':
        return <Warning className="h-4 w-4" />;
      case 'high':
      case 'destructive':
        return <ShieldWarning className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;

    setIsExecuting(true);
    setError(null);

    const historyEntry = addHistoryEntry({
      triggerId: trigger.id,
      triggerName: trigger.name,
      category: trigger.category,
      deviceId,
      deviceName,
      status: 'pending',
      userResponse: 'approved',
      metadata: additionalData,
    });

    const startTime = performance.now();
    const result = await executeTrigger(trigger, deviceId, additionalData);
    const executionTime = performance.now() - startTime;

    updateHistoryEntry(historyEntry.id, {
      status: result.success ? 'success' : 'failed',
      executionTime,
      errorMessage: result.error,
      auditLog: {
        action: trigger.id,
        triggerId: trigger.id,
        deviceId,
        userResponse: result.success ? 'approved' : 'rejected',
        timestamp: performance.timeOrigin + performance.now(),
        executionResult: result.data,
        errorDetails: result.error,
      },
    });

    setIsExecuting(false);

    if (result.success) {
      onSuccess?.(result.data);
      handleClose();
    } else {
      setError(result.error || 'Operation failed');
      onError?.(result.error || 'Operation failed');
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setConfirmationInput('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle>{trigger.name}</DialogTitle>
            <Badge className={getRiskLevelColor(trigger.riskLevel)}>
              {getRiskIcon(trigger.riskLevel)}
              <span className="ml-1 uppercase text-[10px] tracking-wider font-bold">
                {trigger.riskLevel}
              </span>
            </Badge>
          </div>
          <DialogDescription>
            {trigger.frontendPrompt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {deviceId && (
            <div className="bg-card border border-border rounded-md p-3 space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Device ID
              </div>
              <div className="font-mono text-sm text-foreground">{deviceId}</div>
              {deviceName && (
                <div className="text-xs text-muted-foreground">{deviceName}</div>
              )}
            </div>
          )}

          <div className="text-sm text-foreground leading-relaxed">
            {trigger.modalText}
          </div>

          {trigger.requiresTypedConfirmation && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type <span className="font-mono text-primary">{trigger.confirmationText}</span> to
                confirm
              </label>
              <Input
                id="confirmation-input"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={trigger.confirmationText}
                className="font-mono"
                autoComplete="off"
                disabled={isExecuting}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {trigger.riskLevel === 'destructive' && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <ShieldWarning className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                This is a destructive operation that cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel} disabled={isExecuting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isExecuting}
            variant={trigger.riskLevel === 'destructive' ? 'destructive' : 'default'}
          >
            {isExecuting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
