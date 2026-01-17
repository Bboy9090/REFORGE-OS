import { EvidenceBundleManager } from "../EvidenceBundleManager";
import { SnapshotRetentionPanel } from "../SnapshotRetentionPanel";
import { RepairLibrary } from "../RepairLibrary";
import { EmptyState } from "../EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Archive, 
    ClockCounterClockwise, 
    ShieldCheck,
    Books,
    FileText
} from '@phosphor-icons/react';

export function ReportsTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <FileText weight="duotone" className="text-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Reports & Evidence
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Evidence bundles, automatic backups, and repair documentation
                    </p>
                </div>
            </div>

            <Tabs defaultValue="evidence" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="evidence" className="gap-1.5 text-xs">
                        <Archive weight="duotone" size={16} />
                        Bundles
                    </TabsTrigger>
                    <TabsTrigger value="backups" className="gap-1.5 text-xs">
                        <ClockCounterClockwise weight="duotone" size={16} />
                        Backups
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="gap-1.5 text-xs">
                        <ShieldCheck weight="duotone" size={16} />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="library" className="gap-1.5 text-xs">
                        <Books weight="duotone" size={16} />
                        Library
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="evidence" className="mt-4">
                    <EvidenceBundleManager />
                </TabsContent>

                <TabsContent value="backups" className="mt-4">
                    <SnapshotRetentionPanel />
                </TabsContent>

                <TabsContent value="dashboard" className="mt-4">
                    <EmptyState
                        icon={<ShieldCheck className="w-12 h-12" weight="duotone" />}
                        title="Authority dashboard disabled"
                        description="The previous authority dashboard displayed demo data. Re-enable only after it is backed by real evidence/correlation APIs."
                    />
                </TabsContent>

                <TabsContent value="library" className="mt-4">
                    <RepairLibrary />
                </TabsContent>
            </Tabs>
        </div>
    );
}
