import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Certificate, 
  Download, 
  FileText, 
  ShieldCheck, 
  Clock,
  Hash,
  User,
  CheckCircle
} from '@phosphor-icons/react';

export interface EvidenceBundle {
  id: string;
  deviceId: string;
  timestamp: string;
  diagnosticData: any;
  correlationData: any;
  shopIdentity: string;
  signature: string;
  hash: string;
  verified: boolean;
}

interface EvidenceBundleViewerProps {
  bundle: EvidenceBundle;
  onExport?: (bundle: EvidenceBundle) => void;
  onVerify?: (bundle: EvidenceBundle) => Promise<boolean>;
}

export function EvidenceBundleViewer({ bundle, onExport, onVerify }: EvidenceBundleViewerProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleVerify = async () => {
    if (!onVerify) return;
    
    setVerifying(true);
    try {
      const result = await onVerify(bundle);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(bundle);
    }
  };

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Certificate className="w-6 h-6 text-primary" weight="fill" />
            <h3 className="text-xl font-display font-semibold text-foreground">
              Evidence Bundle
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cryptographically signed diagnostic evidence
          </p>
        </div>

        <Badge variant={bundle.verified ? 'default' : 'secondary'} className="font-mono">
          {bundle.verified ? (
            <><ShieldCheck className="w-3 h-3 mr-1" weight="fill" /> Signed</>
          ) : (
            <>Unsigned</>
          )}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Bundle ID:</span>
          </div>
          <div className="font-mono text-xs text-foreground bg-muted/30 p-2 rounded break-all">
            {bundle.id}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Device ID:</span>
          </div>
          <div className="font-mono text-xs text-foreground bg-muted/30 p-2 rounded break-all">
            {bundle.deviceId}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Timestamp:</span>
          </div>
          <div className="text-sm text-foreground">
            {new Date(bundle.timestamp).toLocaleString()}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Shop Identity:</span>
          </div>
          <div className="text-sm text-foreground font-medium">
            {bundle.shopIdentity}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" weight="fill" />
          <span className="text-muted-foreground font-medium">Signature Hash (SHA-256):</span>
        </div>
        <div className="font-mono text-xs text-foreground bg-muted/30 p-3 rounded break-all">
          {bundle.hash}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Certificate className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Cryptographic Signature:</span>
        </div>
        <div className="font-mono text-xs text-foreground bg-muted/30 p-3 rounded break-all max-h-32 overflow-y-auto">
          {bundle.signature}
        </div>
      </div>

      {verificationResult !== null && (
        <div className={`p-4 rounded-lg border ${
          verificationResult 
            ? 'bg-success/10 border-success/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <div className="flex items-center gap-2">
            {verificationResult ? (
              <>
                <CheckCircle className="w-5 h-5 text-success" weight="fill" />
                <span className="text-success font-semibold">Verification Successful</span>
              </>
            ) : (
              <>
                <Certificate className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-semibold">Verification Failed</span>
              </>
            )}
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            {verificationResult 
              ? 'This evidence bundle has been cryptographically verified and is legally admissible.'
              : 'This evidence bundle could not be verified. Signature may be invalid or tampered.'}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleVerify} 
          disabled={verifying || !onVerify}
          className="flex-1"
          variant="outline"
        >
          <ShieldCheck className="w-4 h-4 mr-2" weight="fill" />
          {verifying ? 'Verifying...' : 'Verify Signature'}
        </Button>
        
        <Button 
          onClick={handleExport}
          disabled={!onExport}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Bundle
        </Button>
      </div>

      <div className="bg-muted/20 border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">Legal Admissibility Notice</p>
        <p>
          This evidence bundle is cryptographically signed and timestamped. 
          It can be used in customer disputes, warranty claims, and legal proceedings 
          to demonstrate device condition at time of diagnostic.
        </p>
        <p>
          The SHA-256 hash ensures data integrity. Any modification to the bundle 
          will invalidate the signature.
        </p>
      </div>
    </Card>
  );
}

export function EvidenceBundleList({ bundles, onSelectBundle }: { 
  bundles: EvidenceBundle[]; 
  onSelectBundle: (bundle: EvidenceBundle) => void;
}) {
  return (
    <div className="space-y-3">
      {bundles.map((bundle) => (
        <Card 
          key={bundle.id} 
          className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
          onClick={() => onSelectBundle(bundle)}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Certificate className="w-4 h-4 text-primary" weight="fill" />
                <span className="font-mono text-sm text-foreground font-semibold">
                  {bundle.deviceId.substring(0, 16)}...
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(bundle.timestamp).toLocaleString()}
              </p>
            </div>

            <Badge variant={bundle.verified ? 'default' : 'secondary'} className="font-mono text-xs">
              {bundle.verified ? 'Signed' : 'Unsigned'}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
