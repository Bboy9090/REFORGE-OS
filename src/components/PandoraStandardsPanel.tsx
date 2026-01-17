import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ListChecks,
  Lightning,
  HardDrive,
  Usb,
  CheckCircle,
  Warning,
  XCircle
} from '@phosphor-icons/react';

interface BenchmarkStandard {
  metric: string;
  level: string;
  description?: string;
  threshold?: number;
}

const API_BASE = 'http://localhost:3001';

export function PandoraStandardsPanel() {
  const [standards, setStandards] = useState<BenchmarkStandard[]>([]);
  const [_loading, _setLoading] = useState(true);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/standards`);
      if (res.ok) {
        const data = await res.json();
        setStandards(data);
      } else {
        setStandards(getDefaultStandards());
      }
    } catch (_err) {
      setStandards(getDefaultStandards());
    } finally {
      _setLoading(false);
    }
  };

  const getDefaultStandards = (): BenchmarkStandard[] => [
    { metric: 'Flash Speed', level: 'Optimal (USB 3.2 Gen 2)', description: 'Best-in-class performance', threshold: 1250 },
    { metric: 'Random Write IOPS', level: 'Good (High-end eMMC)', description: 'Meets industry standards', threshold: 8000 },
    { metric: 'Fastboot Flash Throughput', level: 'Acceptable (Older devices)', description: 'Below average, needs tuning', threshold: 15 },
  ];

  const flashSpeedCriteria = [
    { level: 'Optimal', description: 'USB 3.2 Gen 2 (1250 MB/s)', icon: CheckCircle, color: 'text-emerald-400' },
    { level: 'Good', description: 'USB 3.1 (625 MB/s)', icon: CheckCircle, color: 'text-green-400' },
    { level: 'Acceptable', description: 'USB 3.0 (300 MB/s)', icon: Warning, color: 'text-amber-400' },
    { level: 'Poor', description: 'USB 2.0 (60 MB/s)', icon: XCircle, color: 'text-rose-400' },
  ];

  const iopsCriteria = [
    { level: 'Optimal', description: 'NVMe-class (>50K IOPS)', icon: CheckCircle, color: 'text-emerald-400' },
    { level: 'Good', description: 'High-end eMMC (8K-15K IOPS)', icon: CheckCircle, color: 'text-green-400' },
    { level: 'Acceptable', description: 'Standard eMMC (2K-8K IOPS)', icon: Warning, color: 'text-amber-400' },
    { level: 'Poor', description: 'Legacy (<2K IOPS)', icon: XCircle, color: 'text-rose-400' },
  ];

  const throughputCriteria = [
    { level: 'Optimal', description: 'Modern devices (>30 MB/s)', icon: CheckCircle, color: 'text-emerald-400' },
    { level: 'Good', description: 'Mid-range (15-30 MB/s)', icon: CheckCircle, color: 'text-green-400' },
    { level: 'Acceptable', description: 'Older devices (8-15 MB/s)', icon: Warning, color: 'text-amber-400' },
    { level: 'Poor', description: 'Very old/throttled (<8 MB/s)', icon: XCircle, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" weight="duotone" />
              Industry Benchmark Standards
            </CardTitle>
            <CardDescription>Performance criteria and reference specifications</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="flash">Flash Speed</TabsTrigger>
              <TabsTrigger value="iops">IOPS</TabsTrigger>
              <TabsTrigger value="throughput">Throughput</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {standards.map((standard, idx) => (
                    <Card key={idx} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-base mb-1">{standard.metric}</div>
                            <div className="text-sm text-muted-foreground">{standard.level}</div>
                            {standard.description && (
                              <div className="text-xs text-muted-foreground mt-2">{standard.description}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-4">
                            Reference
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="flash" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightning className="w-4 h-4 text-primary" weight="duotone" />
                    Flash Speed Metrics
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Based on USB-IF specifications and industry testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flashSpeedCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <criteria.icon className={`w-5 h-5 ${criteria.color}`} weight="fill" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{criteria.level}</div>
                          <div className="text-xs text-muted-foreground">{criteria.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="iops" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" weight="duotone" />
                    Random Write IOPS
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Based on JEDEC standards for flash storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {iopsCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <criteria.icon className={`w-5 h-5 ${criteria.color}`} weight="fill" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{criteria.level}</div>
                          <div className="text-xs text-muted-foreground">{criteria.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="throughput" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Usb className="w-4 h-4 text-primary" weight="duotone" />
                    Fastboot Flash Throughput
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Based on Android Platform Tools and OEM testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {throughputCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <criteria.icon className={`w-5 h-5 ${criteria.color}`} weight="fill" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{criteria.level}</div>
                          <div className="text-xs text-muted-foreground">{criteria.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-blue-500/30 bg-blue-600/5">
        <CardContent className="pt-6">
          <div className="text-xs text-blue-300/80 space-y-2">
            <p className="font-semibold text-blue-300">Reference Sources:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>USB Implementers Forum (USB-IF) Specifications</li>
              <li>JEDEC Solid State Technology Association Standards</li>
              <li>Android Platform Tools Documentation</li>
              <li>OEM Flashing Tool Benchmarks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
