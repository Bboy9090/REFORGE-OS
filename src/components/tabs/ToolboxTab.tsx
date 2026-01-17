import { Toolbox } from "@phosphor-icons/react";

import { BatchActivationPanel } from "../BatchActivationPanel";

export function ToolboxTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Toolbox weight="duotone" className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Toolbox</h2>
          <p className="text-xs text-muted-foreground">
            Utility tools and quick actions
          </p>
        </div>
      </div>

      <BatchActivationPanel />
    </div>
  );
}
