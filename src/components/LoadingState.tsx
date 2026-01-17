import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({ 
  message = 'Loading...', 
  rows = 3,
  className = ''
}: LoadingStateProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </Card>
  );
}
