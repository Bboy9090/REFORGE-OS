import { Shield } from '@phosphor-icons/react';
import { EmptyState } from './EmptyState';

export function EvidenceBundleManager() {
  return (
    <EmptyState
      icon={<Shield className="w-12 h-12" weight="duotone" />}
      title="Evidence bundles disabled"
      description="This evidence bundle UI previously implied cryptographic signing and verification, but it was not backed by real keys or a server-side chain-of-custody. Re-enable only after it is wired to real evidence storage + real signature verification."
    />
  );
}
