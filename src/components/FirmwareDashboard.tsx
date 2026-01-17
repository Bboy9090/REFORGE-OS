import { Card } from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  ShieldCheck,
  Package,
  DeviceMobile
} from '@phosphor-icons/react';
import { FirmwareVersionChecker } from './FirmwareVersionChecker';
import { FirmwareLibrary } from './FirmwareLibrary';

export function FirmwareDashboard() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/20">
            <ShieldCheck size={32} className="text-primary" weight="fill" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Firmware Version Checker</h2>
            <p className="text-sm text-muted-foreground">
              Automatically check firmware versions on connected devices and browse available firmware for all supported brands and models
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="devices">
            <DeviceMobile size={16} className="mr-2" weight="fill" />
            Connected Devices
          </TabsTrigger>
          <TabsTrigger value="library">
            <Package size={16} className="mr-2" weight="fill" />
            Firmware Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <FirmwareVersionChecker />
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <FirmwareLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
