import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Flask, X } from '@phosphor-icons/react';
import { useState } from 'react';

interface DemoModeBannerProps {
  onDisable?: () => void;
}

export function DemoModeBanner({ onDisable }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-warning/20 border-warning">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flask className="h-5 w-5 text-warning" weight="duotone" />
          <div>
            <AlertDescription className="text-sm font-medium text-foreground">
              <span className="font-bold">DEMO MODE:</span> Showing simulated data. 
              Backend API unavailable - some features may not work as expected.
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDisable && (
            <Button 
              onClick={onDisable} 
              variant="outline" 
              size="sm"
              className="border-warning text-warning hover:bg-warning/10"
            >
              Connect Backend
            </Button>
          )}
          <Button
            onClick={() => setDismissed(true)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
