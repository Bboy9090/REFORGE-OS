import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DeviceMobile,
  AppleLogo,
  AndroidLogo,
  Lightning,
  Shield,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';

interface DeviceMode {
  mode: string;
  platform: string;
  purpose: string;
  actions: string[];
  restricted?: boolean;
}

interface ToolingPlatform {
  platform: string;
  icon: any;
  tools: string[];
  capabilities: string[];
  notSupported: string[];
}

const DEVICE_MODES: DeviceMode[] = [
  {
    mode: 'DFU',
    platform: 'Apple',
    purpose: 'Low-level restore / boot',
    actions: ['Detect', 'Identify', 'Restore firmware', 'Boot environment'],
  },
  {
    mode: 'Recovery',
    platform: 'Apple / Android',
    purpose: 'OS restore',
    actions: ['Restore firmware', 'Diagnostics'],
  },
  {
    mode: 'Fastboot',
    platform: 'Android',
    purpose: 'Bootloader flashing',
    actions: ['Flash partitions', 'Boot images', 'Status check'],
  },
  {
    mode: 'FastbootD',
    platform: 'Android',
    purpose: 'Dynamic partitions',
    actions: ['Flash logical partitions'],
  },
  {
    mode: 'Download (Odin)',
    platform: 'Samsung',
    purpose: 'Service flashing',
    actions: ['Flash official firmware'],
  },
  {
    mode: 'Preloader / BROM',
    platform: 'MediaTek',
    purpose: 'Service flashing',
    actions: ['Flash scatter firmware'],
    restricted: true,
  },
  {
    mode: 'EDL (9008)',
    platform: 'Qualcomm',
    purpose: 'Emergency mode',
    actions: ['Detect only (authorized use)'],
    restricted: true,
  },
  {
    mode: 'ADB (Authorized)',
    platform: 'Android',
    purpose: 'Diagnostics',
    actions: ['Logs', 'Reboot', 'Sideload'],
  },
];

const TOOLING_PLATFORMS: ToolingPlatform[] = [
  {
    platform: 'Apple (iPhone / iPad)',
    icon: AppleLogo,
    tools: ['checkra1n (A5–A11)', 'palera1n', 'libimobiledevice', 'irecovery', 'ideviceinfo', 'idevicerestore', 'Apple Configurator', 'iTunes / Finder Restore APIs'],
    capabilities: ['DFU / Recovery detection', 'Device & chipset identification', 'IPSW restore', 'Boot supported environments', 'Progress & log streaming'],
    notSupported: ['iCloud / Activation removal', 'Lock screen bypass', 'Identity manipulation'],
  },
  {
    platform: 'Android (Fastboot / ADB)',
    icon: AndroidLogo,
    tools: ['fastboot (Google)', 'adb (Google)', 'Android Flash Tool'],
    capabilities: ['Flash official firmware', 'Boot temporary images', 'Detect bootloader state', 'Reboot between modes', 'Stream logs'],
    notSupported: [],
  },
  {
    platform: 'Samsung',
    icon: DeviceMobile,
    tools: ['Odin (Windows)', 'Heimdall (Cross-platform)'],
    capabilities: ['Download mode detection', 'Flash official firmware (BL/AP/CP/CSC)', 'Restore stock OS', 'PIT usage (advanced + gated)'],
    notSupported: ['FRP automation', 'Knox tampering guidance'],
  },
  {
    platform: 'MediaTek (MTK)',
    icon: DeviceMobile,
    tools: ['SP Flash Tool', 'mtkclient (detection + flash only)'],
    capabilities: ['Preloader / BROM detection', 'Scatter-based flashing', 'Partition validation', 'Firmware restore'],
    notSupported: ['Preloader flashing gated', 'Secure boot exploits', 'Brick warnings required'],
  },
  {
    platform: 'Qualcomm',
    icon: DeviceMobile,
    tools: ['fastboot', 'QFIL / QPST (authorized environments)'],
    capabilities: ['EDL detection', 'Mode identification', 'User education on authorization'],
    notSupported: ['Firehose loaders', 'Auth bypass workflows'],
  },
];

export function BootForgeUSBSupportMatrix() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-card/90 to-card/60">
        <CardHeader>
          <CardTitle className="text-2xl font-display uppercase tracking-wide flex items-center gap-2">
            <Lightning className="w-6 h-6 text-primary" weight="duotone" />
            Official BootForge Support Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Ship-ready device mode detection and tooling integration specifications
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modes">Device Modes</TabsTrigger>
              <TabsTrigger value="tooling">Tooling Integration</TabsTrigger>
              <TabsTrigger value="policy">Safety Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="modes" className="mt-6">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {DEVICE_MODES.map((mode, idx) => (
                    <Card key={idx} className={mode.restricted ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{mode.mode}</h3>
                              {mode.restricted && (
                                <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">
                                  <Shield className="w-3 h-3 mr-1" weight="fill" />
                                  GATED
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <Badge variant="outline">{mode.platform}</Badge>
                              <span>{mode.purpose}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Supported Actions
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mode.actions.map((action, aidx) => (
                              <Badge key={aidx} variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {mode.restricted && (
                          <div className="mt-4 p-3 rounded-lg bg-amber-600/10 border border-amber-500/30">
                            <div className="flex items-start gap-2">
                              <Warning className="w-4 h-4 text-amber-400 mt-0.5" weight="fill" />
                              <div className="text-xs text-amber-300/90">
                                <strong>Restricted Mode:</strong> Detection and informational use only by default. 
                                Advanced operations require explicit authorization and safety checks.
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tooling" className="mt-6">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {TOOLING_PLATFORMS.map((platform, idx) => (
                    <Card key={idx} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <platform.icon className="w-8 h-8 text-primary" weight="duotone" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{platform.platform}</h3>
                            <div className="text-xs text-muted-foreground">Integrated & Wrapped Tools</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Integrated Tools
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {platform.tools.map((tool, tidx) => (
                                <Badge key={tidx} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-400" weight="fill" />
                              Allowed Capabilities
                            </div>
                            <ul className="space-y-1">
                              {platform.capabilities.map((cap, cidx) => (
                                <li key={cidx} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  <span>{cap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {platform.notSupported.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-rose-400" weight="fill" />
                                Not Supported / Restricted
                              </div>
                              <ul className="space-y-1">
                                {platform.notSupported.map((item, nidx) => (
                                  <li key={nidx} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-rose-400 mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="policy" className="mt-6">
              <div className="space-y-4">
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" weight="fill" />
                      <div>
                        <h3 className="font-semibold text-base mb-2 text-emerald-300">Allowed Operations</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Detect:</strong> Identify device state and capabilities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Restore:</strong> Flash official firmware from authorized sources</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Flash:</strong> Write verified images to appropriate partitions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Boot:</strong> Load supported boot environments</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Diagnose:</strong> Read device state and collect diagnostics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span><strong>Educate:</strong> Provide accurate information and recovery paths</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-500/30 bg-rose-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-rose-400" weight="fill" />
                      <div>
                        <h3 className="font-semibold text-base mb-2 text-rose-300">Prohibited Operations</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>Security lock removal or bypass (FRP, iCloud, MDM)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>Identity manipulation or IMEI modification</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>Unauthorized bootloader unlocking without proper credentials</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>Distribution of proprietary firmware or unauthorized images</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>Exploits targeting secure boot or hardware security modules</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardContent className="pt-6">
                    <div className="text-xs text-blue-300/90 space-y-3">
                      <p className="font-semibold text-blue-300 text-sm">Store-Safe Description</p>
                      <p>
                        Bobby's World / BootForge is a professional device restoration and diagnostics platform 
                        supporting DFU, Recovery, Fastboot, Download, and service modes across Apple and Android devices.
                      </p>
                      <p>
                        It integrates industry-standard and manufacturer-intended tools to restore firmware, 
                        flash official images, boot supported environments, and provide real-time progress and diagnostics.
                      </p>
                      <p className="font-semibold text-blue-300">
                        This platform operates within legal and ethical boundaries, focusing on legitimate repair, 
                        restoration, and diagnostic workflows used by OEM service centers, enterprise repair facilities, 
                        and authorized technicians.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
