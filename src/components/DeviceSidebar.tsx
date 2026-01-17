import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    CaretLeft, 
    CaretRight, 
    DeviceMobile, 
    CheckCircle, 
    Warning,
    Question,
    Circle
} from '@phosphor-icons/react';
import { useAndroidDevices } from "@/hooks/use-android-devices";

interface DeviceSidebarProps {
    collapsed: boolean;
    onToggle: (collapsed: boolean) => void;
}

type DeviceStatus = 'connected' | 'weak' | 'confirmed' | 'likely' | 'unconfirmed';

function getStatusColor(status: DeviceStatus) {
    switch (status) {
        case 'connected':
            return 'bg-success';
        case 'weak':
            return 'bg-warning';
        case 'confirmed':
            return 'bg-primary';
        case 'likely':
            return 'bg-accent';
        case 'unconfirmed':
            return 'bg-muted-foreground';
        default:
            return 'bg-muted-foreground';
    }
}

function getStatusIcon(status: DeviceStatus) {
    switch (status) {
        case 'connected':
            return <CheckCircle weight="fill" className="text-success" />;
        case 'weak':
            return <Warning weight="fill" className="text-warning" />;
        case 'confirmed':
            return <CheckCircle weight="fill" className="text-primary" />;
        case 'likely':
            return <Circle weight="fill" className="text-accent" />;
        case 'unconfirmed':
            return <Question weight="fill" className="text-muted-foreground" />;
        default:
            return <Circle weight="fill" className="text-muted-foreground" />;
    }
}

export function DeviceSidebar({ collapsed, onToggle }: DeviceSidebarProps) {
    const { devices } = useAndroidDevices();

    return (
        <aside 
            className={`border-r border-border phone-box transition-all duration-300 ${
                collapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="h-full flex flex-col">
                <div className="h-12 border-b border-border flex items-center justify-between px-4 graffiti-tag">
                    {!collapsed && (
                        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            📱 Devices
                        </h2>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggle(!collapsed)}
                    >
                        {collapsed ? <CaretRight /> : <CaretLeft />}
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {devices.length === 0 && (
                            <div className={`${collapsed ? 'p-2' : 'p-4'} text-center`}>
                                <div className="text-muted-foreground text-xs">
                                    {collapsed ? (
                                        <DeviceMobile className="w-5 h-5 mx-auto opacity-30" />
                                    ) : (
                                        <>
                                            <DeviceMobile className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p>No phones in the box</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {devices.map((device) => (
                            <button
                                key={device.serial}
                                className="w-full text-left rounded-md hover:bg-accent/10 transition-colors p-2 device-card-console phone-stack"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5">
                                        {getStatusIcon(device.state as DeviceStatus)}
                                    </div>
                                    {!collapsed && (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {device.model || 'Unknown Device'}
                                                </p>
                                                {device.source && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className="text-xs px-1 py-0 h-4 sticker-worn"
                                                    >
                                                        {device.source}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs font-mono text-muted-foreground truncate console-text">
                                                {device.serial}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t border-border p-2 laundry-texture">
                    {!collapsed && (
                        <div className="text-xs font-mono text-muted-foreground px-2">
                            📦 {devices.length} {devices.length === 1 ? 'device' : 'devices'}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
