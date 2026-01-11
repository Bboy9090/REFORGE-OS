import { Link } from '@phosphor-icons/react';
import { EmptyState } from './EmptyState';

export function CorrelationDashboard() {
  return (
    <EmptyState
      icon={<Link className="w-12 h-12" weight="duotone" />}
      title="Correlation dashboard disabled"
      description="This dashboard previously generated and pushed demo device records into the correlation tracker. Re-enable only after it is driven exclusively by real scan + correlation APIs."
    />
  );
}
