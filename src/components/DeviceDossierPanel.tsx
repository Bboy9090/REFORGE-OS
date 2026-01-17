import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import type { DossierSeed } from '@/types/correlation';
import { 
  Shield, 
  Warning, 
  CheckCircle, 
  XCircle, 
  Info,
  LockKey,
  Eye
} from '@phosphor-icons/react';

interface DeviceDossierPanelProps {
  dossier: DossierSeed & { id: string };
}

export function DeviceDossierPanel({ dossier }: DeviceDossierPanelProps) {
  const confidenceColor = (conf: number) => {
    if (conf >= 0.90) return 'text-accent';
    if (conf >= 0.70) return 'text-primary';
    return 'text-destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" weight="duotone" />
              Device Dossier
            </CardTitle>
            <CardDescription>
              Platform: <span className="font-semibold">{dossier.platform}</span> • 
              Mode: <span className="font-semibold">{dossier.device_mode}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className={`text-2xl font-bold ${confidenceColor(dossier.confidence)}`}>
              {(dossier.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" weight="duotone" />
            Correlation Status
          </div>
          <CorrelationBadgeDisplay 
            badge={dossier.correlation_badge}
            matchedIds={dossier.matched_ids}
          />
          {dossier.correlation_notes.length > 0 && (
            <div className="mt-2 space-y-1">
              {dossier.correlation_notes.map((note, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" weight="duotone" />
            Detection Evidence
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">USB Evidence</div>
              <div className="space-y-1">
                {dossier.detection_evidence.usb_evidence.length > 0 ? (
                  dossier.detection_evidence.usb_evidence.map((ev, idx) => (
                    <div key={idx} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {ev}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No USB evidence</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Tool Evidence</div>
              <div className="space-y-1">
                {dossier.detection_evidence.tools_evidence.length > 0 ? (
                  dossier.detection_evidence.tools_evidence.map((ev, idx) => (
                    <div key={idx} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {ev}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No tool evidence</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <LockKey className="w-4 h-4" weight="duotone" />
            Policy Gates
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Badge variant={dossier.policy_gates.correlation_present ? 'default' : 'outline'}>
                Correlation: {dossier.policy_gates.correlation_present ? 'Yes' : 'No'}
              </Badge>
              <Badge variant="outline">
                Block Threshold: {(dossier.policy_gates.block_destructive_if_confidence_below * 100).toFixed(0)}%
              </Badge>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Allowed Actions</div>
              <div className="flex flex-wrap gap-2">
                {dossier.policy_gates.allowed_actions.map((action, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" weight="fill" />
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Blocked Actions</div>
              <div className="flex flex-wrap gap-2">
                {dossier.policy_gates.blocked_actions.map((action, idx) => (
                  <Badge key={idx} variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" weight="fill" />
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {dossier.policy_gates.reasons.map((reason, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">
                  • {reason}
                </p>
              ))}
            </div>
          </div>
        </div>

        {dossier.warnings.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Warning className="w-4 h-4 text-destructive" weight="duotone" />
                Warnings
              </div>
              <div className="space-y-2">
                {dossier.warnings.map((warning, idx) => (
                  <Alert key={idx} variant="destructive">
                    <Warning className="w-4 h-4" weight="fill" />
                    <AlertDescription className="text-sm">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <div className="text-sm font-semibold mb-2">Summary</div>
          <div className="space-y-1">
            {dossier.summary_lines.map((line, idx) => (
              <p key={idx} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
