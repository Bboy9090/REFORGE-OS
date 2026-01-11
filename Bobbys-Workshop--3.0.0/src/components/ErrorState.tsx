import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Warning, XCircle } from '@phosphor-icons/react';

interface ErrorStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'warning' | 'error';
  className?: string;
}

export function ErrorState({ 
  title, 
  message, 
  action,
  variant = 'error',
  className = ''
}: ErrorStateProps) {
  const Icon = variant === 'warning' ? Warning : XCircle;
  
  return (
    <Card className={`p-6 ${className}`}>
      <Alert variant={variant === 'error' ? 'destructive' : 'default'}>
        <Icon className="h-5 w-5" weight="duotone" />
        <AlertTitle className="font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {message}
        </AlertDescription>
        {action && (
          <div className="mt-4">
            <Button 
              onClick={action.onClick} 
              variant={variant === 'error' ? 'destructive' : 'outline'}
              size="sm"
            >
              {action.label}
            </Button>
          </div>
        )}
      </Alert>
    </Card>
  );
}
