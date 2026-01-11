/**
 * TrapdoorFlashForge
 * 
 * Multi-brand advanced flashing operations for Secret Rooms.
 * Provides access to Samsung Odin, MediaTek SP Flash, Qualcomm EDL, and more.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Flashlight, Archive, Cpu, Smartphone, Zap } from 'lucide-react';
import { SamsungOdinFlashPanel } from '../SamsungOdinFlashPanel';
import { XiaomiEDLFlashPanel } from '../XiaomiEDLFlashPanel';
import { UniversalFlashPanel } from '../UniversalFlashPanel';
import { IOSDFUFlashPanel } from '../IOSDFUFlashPanel';
import { MediaTekFlashPanel } from '../MediaTekFlashPanel';
import { cn } from '@/lib/utils';

interface TrapdoorFlashForgeProps {
  passcode?: string;
}

export function TrapdoorFlashForge({ passcode }: TrapdoorFlashForgeProps) {
  return (
    <div className="h-full w-full bg-basement-concrete overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ink-primary flex items-center gap-2">
            <Flashlight className="w-6 h-6 text-spray-cyan" />
            ⚡ Flash Forge
          </h1>
          <p className="text-sm text-ink-muted">
            Multi-brand flash operations - Samsung Odin, MediaTek SP Flash, Qualcomm EDL, and more
          </p>
        </div>

        {/* Warning Banner */}
        <Alert className="border-state-danger bg-state-danger/10">
          <AlertTriangle className="h-4 w-4 text-state-danger" />
          <AlertDescription className="text-ink-primary">
            <strong className="text-state-danger">⚠️ DESTRUCTIVE OPERATIONS:</strong> Flashing firmware will 
            overwrite device data. Use only with firmware from trusted sources. Ensure you have proper 
            authorization and backups.
          </AlertDescription>
        </Alert>

        {/* Flash Methods Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className={cn("border-panel bg-workbench-steel/50")}>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-spray-cyan mx-auto mb-2" />
              <div className="text-sm font-medium text-ink-primary">Fastboot</div>
              <div className="text-xs text-ink-muted mt-1">Google, OnePlus</div>
            </CardContent>
          </Card>

          <Card className={cn("border-panel bg-workbench-steel/50")}>
            <CardContent className="p-4 text-center">
              <Archive className="w-8 h-8 text-tape-yellow mx-auto mb-2" />
              <div className="text-sm font-medium text-ink-primary">Odin</div>
              <div className="text-xs text-ink-muted mt-1">Samsung</div>
            </CardContent>
          </Card>

          <Card className={cn("border-panel bg-workbench-steel/50")}>
            <CardContent className="p-4 text-center">
              <Cpu className="w-8 h-8 text-state-danger mx-auto mb-2" />
              <div className="text-sm font-medium text-ink-primary">EDL</div>
              <div className="text-xs text-ink-muted mt-1">Xiaomi, Qualcomm</div>
            </CardContent>
          </Card>

          <Card className={cn("border-panel bg-workbench-steel/50")}>
            <CardContent className="p-4 text-center">
              <Flashlight className="w-8 h-8 text-spray-magenta mx-auto mb-2" />
              <div className="text-sm font-medium text-ink-primary">SP Flash</div>
              <div className="text-xs text-ink-muted mt-1">MediaTek</div>
            </CardContent>
          </Card>

          <Card className={cn("border-panel bg-workbench-steel/50")}>
            <CardContent className="p-4 text-center">
              <Smartphone className="w-8 h-8 text-spray-cyan mx-auto mb-2" />
              <div className="text-sm font-medium text-ink-primary">DFU</div>
              <div className="text-xs text-ink-muted mt-1">iOS</div>
            </CardContent>
          </Card>
        </div>

        {/* Flash Panels */}
        <Tabs defaultValue="universal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-workbench-steel border-panel">
            <TabsTrigger value="universal" className="gap-2 data-[state=active]:bg-spray-cyan/20">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Fastboot</span>
            </TabsTrigger>
            <TabsTrigger value="samsung" className="gap-2 data-[state=active]:bg-tape-yellow/20">
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Odin</span>
            </TabsTrigger>
            <TabsTrigger value="xiaomi" className="gap-2 data-[state=active]:bg-state-danger/20">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">EDL</span>
            </TabsTrigger>
            <TabsTrigger value="mediatek" className="gap-2 data-[state=active]:bg-spray-magenta/20">
              <Flashlight className="w-4 h-4" />
              <span className="hidden sm:inline">SP Flash</span>
            </TabsTrigger>
            <TabsTrigger value="ios" className="gap-2 data-[state=active]:bg-spray-cyan/20">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">DFU</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="universal" className="mt-0">
              <Card className="border-panel bg-workbench-steel">
                <CardHeader>
                  <CardTitle>Universal Fastboot</CardTitle>
                  <CardDescription>
                    Standard fastboot protocol for Google Pixel, OnePlus, Motorola, and other devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UniversalFlashPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="samsung" className="mt-0">
              <Card className="border-panel bg-workbench-steel">
                <CardHeader>
                  <CardTitle>Samsung Odin Protocol</CardTitle>
                  <CardDescription>
                    Advanced Samsung Galaxy firmware flashing with AP/BL/CP/CSC support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SamsungOdinFlashPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xiaomi" className="mt-0">
              <Card className="border-panel bg-workbench-steel">
                <CardHeader>
                  <CardTitle>Qualcomm EDL (Emergency Download)</CardTitle>
                  <CardDescription>
                    Firehose protocol for Xiaomi, Qualcomm-based devices in brick recovery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <XiaomiEDLFlashPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mediatek" className="mt-0">
              <Card className="border-panel bg-workbench-steel">
                <CardHeader>
                  <CardTitle>MediaTek SP Flash Tool</CardTitle>
                  <CardDescription>
                    Scatter file-based flashing for MediaTek chipsets (Preloader/DA mode)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaTekFlashPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ios" className="mt-0">
              <Card className="border-panel bg-workbench-steel">
                <CardHeader>
                  <CardTitle>iOS DFU Mode</CardTitle>
                  <CardDescription>
                    Device Firmware Upgrade mode for iPhone/iPad recovery and jailbreak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IOSDFUFlashPanel />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
