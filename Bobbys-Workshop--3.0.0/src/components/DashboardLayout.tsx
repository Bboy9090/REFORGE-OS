/**
 * DashboardLayout - Main application layout
 * 
 * Migrated to new design system:
 * - Design tokens (midnight-room, workbench-steel, etc.)
 * - "What's up, doc?" greeting
 * - WorkbenchSystemStatus
 * - New navigation structure
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DeviceSidebar } from "./DeviceSidebar";
import { BackendStatusIndicator } from "./BackendStatusIndicator";
import { WorkbenchSystemStatus } from "./workbench/WorkbenchSystemStatus";
import { OrnamentBugsGreeting } from "./ornaments/OrnamentBugsGreeting";
import { useApp } from "@/lib/app-context";
import { useBugsGreeting } from "@/hooks/useBugsGreeting";
import { 
    LayoutDashboard,
    Smartphone,
    Flashlight,
    Apple,
    Shield,
    Activity,
    Package,
    Workflow,
    Lock,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Screen imports
import { WorkbenchDashboard } from './screens/WorkbenchDashboard';
import { WorkbenchDevices } from './screens/WorkbenchDevices';
import { WorkbenchFlashing } from './screens/WorkbenchFlashing';
import { WorkbenchIOS } from './screens/WorkbenchIOS';
import { WorkbenchSecurity } from './screens/WorkbenchSecurity';
import { WorkbenchMonitoring } from './screens/WorkbenchMonitoring';
import { WorkbenchFirmware } from './screens/WorkbenchFirmware';
import { WorkbenchWorkflows } from './screens/WorkbenchWorkflows';
import { WorkbenchSecretRooms } from './screens/WorkbenchSecretRooms';
import { WorkbenchSettings } from './screens/WorkbenchSettings';

export function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { backendAvailable } = useApp();
    const { showGreeting, dismiss } = useBugsGreeting({ enabled: true });

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Devices', icon: Smartphone },
        { id: 'flashing', label: 'Flashing', icon: Flashlight },
        { id: 'ios', label: 'iOS', icon: Apple },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'firmware', label: 'Firmware', icon: Package },
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'secret-rooms', label: 'Secret Rooms', icon: Lock, locked: true },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-screen flex flex-col bg-midnight-room">
            {/* Header */}
            <header className="h-14 border-b border-panel bg-workbench-steel flex items-center px-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-spray-cyan/30 bg-spray-cyan/10 flex items-center justify-center">
                        <span className="text-spray-cyan font-mono font-bold text-sm">BW</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-ink-primary font-mono">
                            BOBBY'S WORKSHOP
                        </h1>
                        <p className="text-xs text-ink-muted font-mono">
                            & His World of Secrets and Traps
                        </p>
                    </div>
                </div>
                
                <div className="flex-1" />
                
                {/* Greeting - Only show once per session */}
                {showGreeting && (
                    <OrnamentBugsGreeting 
                        variant={backendAvailable ? 'devices' : 'warning'}
                        onDismiss={dismiss}
                        autoHide={true}
                        autoHideDuration={4000}
                    />
                )}
                
                <div className="flex items-center gap-3">
                    <BackendStatusIndicator />
                    <div className="text-xs font-mono text-ink-muted">
                        v2.0.0
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Device Sidebar */}
                <DeviceSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        {/* Navigation Tabs */}
                        <div className="border-b border-panel bg-workbench-steel">
                            <TabsList className="h-12 bg-transparent w-full justify-start rounded-none border-0 px-3 gap-1 overflow-x-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    
                                    return (
                                        <TabsTrigger
                                            key={item.id}
                                            value={item.id}
                                            className={cn(
                                                "gap-2 px-4 h-10 rounded-md transition-all motion-snap",
                                                "data-[state=active]:bg-spray-cyan/20 data-[state=active]:text-spray-cyan",
                                                "data-[state=active]:border-spray-cyan/50 data-[state=active]:border",
                                                "data-[state=inactive]:text-ink-muted data-[state=inactive]:hover:text-ink-primary",
                                                item.locked && !isActive && "opacity-50"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {item.locked && (
                                                <Lock className="w-3 h-3" />
                                            )}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6 min-h-0">
                                <TabsContent value="dashboard" className="mt-0">
                                    <WorkbenchDashboard />
                                </TabsContent>
                                <TabsContent value="devices" className="mt-0">
                                    <WorkbenchDevices />
                                </TabsContent>
                                <TabsContent value="flashing" className="mt-0">
                                    <WorkbenchFlashing />
                                </TabsContent>
                                <TabsContent value="ios" className="mt-0">
                                    <WorkbenchIOS />
                                </TabsContent>
                                <TabsContent value="security" className="mt-0">
                                    <WorkbenchSecurity />
                                </TabsContent>
                                <TabsContent value="monitoring" className="mt-0">
                                    <WorkbenchMonitoring />
                                </TabsContent>
                                <TabsContent value="firmware" className="mt-0">
                                    <WorkbenchFirmware />
                                </TabsContent>
                                <TabsContent value="workflows" className="mt-0">
                                    <WorkbenchWorkflows />
                                </TabsContent>
                                <TabsContent value="secret-rooms" className="mt-0 p-0">
                                    <WorkbenchSecretRooms />
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0">
                                    <WorkbenchSettings />
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
