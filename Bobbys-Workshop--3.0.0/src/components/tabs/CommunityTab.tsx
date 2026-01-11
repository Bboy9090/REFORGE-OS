import { CommunityResources } from "../CommunityResources";
import { MyWorkspace } from "../MyWorkspace";
import { BobbysVault } from "../BobbysVault";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    ChatsCircle, 
    Briefcase, 
    Vault,
    Users
} from '@phosphor-icons/react';

export function CommunityTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Users weight="duotone" className="text-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Community
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Forums, workspace, and educational resources
                    </p>
                </div>
            </div>

            <Tabs defaultValue="forums" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="forums" className="gap-1.5 text-xs">
                        <ChatsCircle weight="duotone" size={16} />
                        Forums
                    </TabsTrigger>
                    <TabsTrigger value="workspace" className="gap-1.5 text-xs">
                        <Briefcase weight="duotone" size={16} />
                        Workspace
                    </TabsTrigger>
                    <TabsTrigger value="vault" className="gap-1.5 text-xs">
                        <Vault weight="duotone" size={16} />
                        Vault
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="forums" className="mt-4">
                    <CommunityResources />
                </TabsContent>

                <TabsContent value="workspace" className="mt-4">
                    <MyWorkspace />
                </TabsContent>

                <TabsContent value="vault" className="mt-4">
                    <BobbysVault />
                </TabsContent>
            </Tabs>
        </div>
    );
}
