import { SettingsPanel } from "../SettingsPanel";
import { BootForgeUSBSupportMatrix } from "../BootForgeUSBSupportMatrix";
import { SecurityLockEducationPanel } from "../SecurityLockEducationPanel";
import { AboutBobby } from "../AboutBobby";
import { AuthorizationTriggersGuide } from "../AuthorizationTriggersGuide";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    SlidersHorizontal, 
    DeviceTablet, 
    ShieldWarning, 
    Info,
    Gear,
    Book
} from '@phosphor-icons/react';

export function SettingsTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Gear weight="duotone" className="text-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Settings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Preferences, device modes, legal compliance, and about
                    </p>
                </div>
            </div>

            <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="preferences" className="gap-1.5 text-xs">
                        <SlidersHorizontal weight="duotone" size={16} />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="gap-1.5 text-xs">
                        <DeviceTablet weight="duotone" size={16} />
                        Devices
                    </TabsTrigger>
                    <TabsTrigger value="api" className="gap-1.5 text-xs">
                        <Book weight="duotone" size={16} />
                        API Docs
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="gap-1.5 text-xs">
                        <ShieldWarning weight="duotone" size={16} />
                        Legal
                    </TabsTrigger>
                    <TabsTrigger value="about" className="gap-1.5 text-xs">
                        <Info weight="duotone" size={16} />
                        About
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="preferences" className="mt-4">
                    <SettingsPanel />
                </TabsContent>

                <TabsContent value="devices" className="mt-4">
                    <BootForgeUSBSupportMatrix />
                </TabsContent>

                <TabsContent value="api" className="mt-4">
                    <AuthorizationTriggersGuide />
                </TabsContent>

                <TabsContent value="legal" className="mt-4">
                    <SecurityLockEducationPanel />
                </TabsContent>

                <TabsContent value="about" className="mt-4">
                    <AboutBobby />
                </TabsContent>
            </Tabs>
        </div>
    );
}
