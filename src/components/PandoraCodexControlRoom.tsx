import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Lightning,
  ChartLine,
  Flask,
  ListChecks,
  Pulse,
  DeviceMobile,
} from '@phosphor-icons/react';
import { PandoraFlashPanel } from './PandoraFlashPanel';
import { PandoraMonitorPanel } from './PandoraMonitorPanel';
import { PandoraTestsPanel } from './PandoraTestsPanel';
import { PandoraStandardsPanel } from './PandoraStandardsPanel';
import { PandoraHotplugPanel } from './PandoraHotplugPanel';

export function PandoraCodexControlRoom() {
  const [activeTab, setActiveTab] = useState('flash');

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-card/90 to-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-display uppercase tracking-wide">
                Pandora Codex Control Room
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Real-time device flashing, monitoring, and performance benchmarking suite
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Pulse className="w-5 h-5 mr-2" weight="duotone" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="flash" className="flex flex-col gap-1 py-3">
                <Lightning className="w-5 h-5" weight="duotone" />
                <span className="text-xs">Flash</span>
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex flex-col gap-1 py-3">
                <ChartLine className="w-5 h-5" weight="duotone" />
                <span className="text-xs">Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex flex-col gap-1 py-3">
                <Flask className="w-5 h-5" weight="duotone" />
                <span className="text-xs">Tests</span>
              </TabsTrigger>
              <TabsTrigger value="standards" className="flex flex-col gap-1 py-3">
                <ListChecks className="w-5 h-5" weight="duotone" />
                <span className="text-xs">Standards</span>
              </TabsTrigger>
              <TabsTrigger value="hotplug" className="flex flex-col gap-1 py-3">
                <DeviceMobile className="w-5 h-5" weight="duotone" />
                <span className="text-xs">Hotplug</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flash" className="mt-6">
              <PandoraFlashPanel />
            </TabsContent>

            <TabsContent value="monitor" className="mt-6">
              <PandoraMonitorPanel />
            </TabsContent>

            <TabsContent value="tests" className="mt-6">
              <PandoraTestsPanel />
            </TabsContent>

            <TabsContent value="standards" className="mt-6">
              <PandoraStandardsPanel />
            </TabsContent>

            <TabsContent value="hotplug" className="mt-6">
              <PandoraHotplugPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
