import { PluginMarketplace } from "../PluginMarketplace";
import { PluginManager } from "../PluginManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Storefront, 
    Package, 
    CloudArrowUp,
    Plug,
    Warning,
    CheckCircle
} from '@phosphor-icons/react';
import { useBackendHealth } from '@/lib/backend-health';

export function HealthBadge({ isHealthy }: { isHealthy: boolean }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      {isHealthy ? <span className="text-green-600">Backend OK</span>
                 : <span className="text-red-600">Backend Unreachable</span>}
    </div>
  );
}

export function PluginsTab() {
  const health = useBackendHealth(30000);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <Plug weight="duotone" className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Plugins
            </h2>
            <p className="text-xs text-muted-foreground">
              Browse marketplace, manage installed plugins, and contribute extensions
            </p>
          </div>
        </div>
        <HealthBadge isHealthy={health.isHealthy} />
      </div>

      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
          <TabsTrigger value="marketplace" className="gap-1.5 text-xs">
            <Storefront weight="duotone" size={16} />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="installed" className="gap-1.5 text-xs">
            <Package weight="duotone" size={16} />
            Installed
          </TabsTrigger>
          <TabsTrigger value="submit" className="gap-1.5 text-xs">
            <CloudArrowUp weight="duotone" size={16} />
            Submit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-4">
          <PluginMarketplace />
        </TabsContent>

        <TabsContent value="installed" className="mt-4">
          <PluginManager onNavigate={() => {}} />
        </TabsContent>

        <TabsContent value="submit" className="mt-4">
          <div className="p-8 text-center">
            <CloudArrowUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Submit Your Plugin
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your tools with the community. All plugins are automatically tested for security and quality.
            </p>
            <p className="text-xs text-muted-foreground">
              Submission portal coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
