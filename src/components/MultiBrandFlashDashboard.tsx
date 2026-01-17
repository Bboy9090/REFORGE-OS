import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DeviceMobile,
  Lightning,
  AppleLogo,
  Archive,
  Cpu,
  ShieldCheck,
  Warning,
} from '@phosphor-icons/react';
import { IOSDFUFlashPanel } from './IOSDFUFlashPanel';
import { XiaomiEDLFlashPanel } from './XiaomiEDLFlashPanel';
import { SamsungOdinFlashPanel } from './SamsungOdinFlashPanel';
import { UniversalFlashPanel } from './UniversalFlashPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MultiBrandFlashDashboard() {
  const [activeTab, setActiveTab] = useState('universal');

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-card/80 to-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DeviceMobile className="w-10 h-10 text-primary" weight="duotone" />
              <div>
                <CardTitle className="text-2xl">Multi-Brand Device Flash Station</CardTitle>
                <CardDescription className="text-base mt-1">
                  Universal flashing support for Android, iOS, and emergency recovery modes
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-4 text-center">
                <Lightning className="w-8 h-8 text-accent mx-auto mb-2" weight="fill" />
                <div className="text-sm font-medium">Fastboot</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Google, OnePlus, Motorola
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 text-center">
                <Cpu className="w-8 h-8 text-destructive mx-auto mb-2" weight="duotone" />
                <div className="text-sm font-medium">EDL Mode</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Xiaomi, Qualcomm SoC
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Archive className="w-8 h-8 text-primary mx-auto mb-2" weight="fill" />
                <div className="text-sm font-medium">Odin</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Samsung Galaxy
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 text-center">
                <AppleLogo className="w-8 h-8 text-primary mx-auto mb-2" weight="fill" />
                <div className="text-sm font-medium">DFU Mode</div>
                <div className="text-xs text-muted-foreground mt-1">
                  iPhone, iPad
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="universal" className="gap-2 py-3">
            <Lightning className="w-4 h-4" weight="duotone" />
            <span className="hidden sm:inline">Universal Fastboot</span>
            <span className="sm:hidden">Fastboot</span>
          </TabsTrigger>
          <TabsTrigger value="samsung" className="gap-2 py-3">
            <Archive className="w-4 h-4" weight="fill" />
            <span className="hidden sm:inline">Samsung Odin</span>
            <span className="sm:hidden">Odin</span>
          </TabsTrigger>
          <TabsTrigger value="xiaomi" className="gap-2 py-3">
            <Cpu className="w-4 h-4" weight="duotone" />
            <span className="hidden sm:inline">Xiaomi EDL</span>
            <span className="sm:hidden">EDL</span>
          </TabsTrigger>
          <TabsTrigger value="ios" className="gap-2 py-3">
            <AppleLogo className="w-4 h-4" weight="fill" />
            <span className="hidden sm:inline">iOS DFU</span>
            <span className="sm:hidden">DFU</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="universal" className="mt-0">
            <UniversalFlashPanel />
          </TabsContent>

          <TabsContent value="samsung" className="mt-0">
            <SamsungOdinFlashPanel />
          </TabsContent>

          <TabsContent value="xiaomi" className="mt-0">
            <XiaomiEDLFlashPanel />
          </TabsContent>

          <TabsContent value="ios" className="mt-0">
            <IOSDFUFlashPanel />
          </TabsContent>
        </div>
      </Tabs>

      <Alert>
        <ShieldCheck className="w-4 h-4" />
        <AlertTitle>Legal & Safety Notice</AlertTitle>
        <AlertDescription className="text-xs space-y-2">
          <p>
            This tool is designed for legitimate device repair and recovery purposes only.
            All flashing operations should be performed with:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Official firmware from manufacturer or trusted sources</li>
            <li>Full backup of important data before proceeding</li>
            <li>Understanding that flashing may void warranties</li>
            <li>Compliance with local laws and regulations</li>
          </ul>
          <p className="mt-2">
            <strong>Supported Brands:</strong> Google Pixel, Samsung Galaxy, Xiaomi/Redmi/POCO, 
            OnePlus, Motorola, ASUS, Sony, Nokia, LG, Huawei, OPPO, Vivo, Realme, Honor, Nothing,
            Fairphone, Apple iPhone/iPad, and other Qualcomm/MediaTek devices.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
