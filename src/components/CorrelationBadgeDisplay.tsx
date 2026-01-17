import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info, Warning, XCircle, Shield } from '@phosphor-icons/react';
import type { CorrelationBadge } from '@/hooks/use-correlation-tracking';

interface CorrelationBadgeDisplayProps {
  badge: CorrelationBadge;
  matchedIds?: string[];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showMatchedIds?: boolean;
  className?: string;
}

const badgeConfig: Record<CorrelationBadge, {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = {
  'CORRELATED': {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/20',
    label: 'CORRELATED',
    description: 'Per-device correlation present (matched tool ID)',
  },
  'SYSTEM-CONFIRMED': {
    icon: Shield,
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20',
    label: 'SYSTEM-CONFIRMED',
    description: 'System-level confirmation exists',
  },
  'LIKELY': {
    icon: Info,
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20',
    label: 'LIKELY',
    description: 'Strong signals, not confirmed',
  },
  'UNCONFIRMED': {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/20',
    label: 'UNCONFIRMED',
    description: 'Uncertain detection',
  },
  'CORRELATED (WEAK)': {
    icon: Warning,
    color: 'text-accent',
    bgColor: 'bg-accent/10 border-accent/20',
    label: 'CORRELATED (WEAK)',
    description: 'Matched tool ID present, mode not strongly confirmed',
  },
};

export function CorrelationBadgeDisplay({
  badge,
  matchedIds = [],
  size = 'md',
  showIcon = true,
  showMatchedIds = false,
  className = '',
}: CorrelationBadgeDisplayProps) {
  const config = badgeConfig[badge];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge
        variant="outline"
        className={`${config.bgColor} ${config.color} border ${sizeClasses[size]} font-mono font-semibold flex items-center gap-1.5`}
      >
        {showIcon && <Icon className="w-4 h-4" weight="bold" />}
        {config.label}
      </Badge>
      
      {showMatchedIds && matchedIds.length > 0 && (
        <div className="text-xs text-muted-foreground font-mono">
          IDs: {matchedIds.join(', ')}
        </div>
      )}
    </div>
  );
}

interface CorrelationBadgeWithTooltipProps extends CorrelationBadgeDisplayProps {
  confidenceScore?: number;
  notes?: string[];
}

export function CorrelationBadgeWithTooltip({
  badge,
  matchedIds = [],
  confidenceScore,
  notes = [],
  size = 'md',
  showIcon = true,
  showMatchedIds = false,
}: CorrelationBadgeWithTooltipProps) {
  const config = badgeConfig[badge];

  return (
    <div className="group relative inline-block">
      <CorrelationBadgeDisplay
        badge={badge}
        matchedIds={matchedIds}
        size={size}
        showIcon={showIcon}
        showMatchedIds={showMatchedIds}
      />
      
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64">
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm space-y-2">
          <div className="font-semibold text-foreground">
            {config.label}
          </div>
          
          <div className="text-muted-foreground text-xs">
            {config.description}
          </div>
          
          {confidenceScore !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence:</span>
              <span className={`font-mono font-semibold ${
                confidenceScore >= 0.90 ? 'text-success' :
                confidenceScore >= 0.75 ? 'text-warning' :
                'text-destructive'
              }`}>
                {(confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
          
          {matchedIds.length > 0 && (
            <div className="text-xs space-y-1">
              <div className="text-muted-foreground">Matched IDs:</div>
              {matchedIds.map((id, idx) => (
                <div key={idx} className="font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                  {id}
                </div>
              ))}
            </div>
          )}
          
          {notes.length > 0 && (
            <div className="text-xs space-y-1 pt-2 border-t border-border">
              <div className="text-muted-foreground font-semibold">Notes:</div>
              {notes.map((note, idx) => (
                <div key={idx} className="text-foreground">
                  • {note}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
