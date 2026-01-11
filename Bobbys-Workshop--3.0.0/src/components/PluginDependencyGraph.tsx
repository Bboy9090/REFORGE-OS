import { GitBranch } from '@phosphor-icons/react';
import { EmptyState } from './EmptyState';

export function PluginDependencyGraph() {
  return (
    <EmptyState
      icon={<GitBranch className="w-12 h-12" weight="duotone" />}
      title="Plugin dependency graph disabled"
      description="This view previously simulated installed/update states using random values. Re-enable only after plugin installation/update status is sourced from a real registry + local install state."
    />
  );
}
