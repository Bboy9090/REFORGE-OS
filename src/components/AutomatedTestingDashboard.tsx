import { Flask } from '@phosphor-icons/react';
import { EmptyState } from './EmptyState';

export function AutomatedTestingDashboard() {
  return (
    <EmptyState
      icon={<Flask className="w-12 h-12" weight="duotone" />}
      title="Automated plugin testing disabled"
      description="This dashboard previously used simulated runs and synthetic findings. Re-enable only after it is backed by real test-runner APIs and produces results from actual executions."
    />
  );
}
