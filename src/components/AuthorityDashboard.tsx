import { ShieldCheck } from '@phosphor-icons/react';
import { EmptyState } from './EmptyState';

interface AuthorityDashboardProps {
  onNavigate?: (section: string) => void;
}

export function AuthorityDashboard(_: AuthorityDashboardProps = {}) {
  return (
    <EmptyState
      icon={<ShieldCheck className="w-12 h-12" weight="duotone" />}
      title="Authority dashboard disabled"
      description="This dashboard previously displayed simulated authority metrics and demo evidence bundles. Re-enable only after real evidence storage and verification APIs are wired end-to-end."
    />
  );
}
