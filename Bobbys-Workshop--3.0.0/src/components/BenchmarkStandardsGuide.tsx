import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Lightning,
  ArrowsDownUp,
  Cpu,
  HardDrive,
  Gauge,
  CheckCircle,
  RocketLaunch,
  Book
} from '@phosphor-icons/react';
import { INDUSTRY_BENCHMARKS, getBenchmarksByCategory } from '@/lib/industry-benchmarks';

export function BenchmarkStandardsGuide() {
  const categories = [
    { id: 'flash_speed', label: 'Flash Speed', icon: Lightning, color: 'text-accent' },
    { id: 'usb_bandwidth', label: 'USB Bandwidth', icon: ArrowsDownUp, color: 'text-primary' },
    { id: 'cpu_efficiency', label: 'CPU Efficiency', icon: Cpu, color: 'text-blue-400' },
    { id: 'memory_usage', label: 'Memory Usage', icon: HardDrive, color: 'text-purple-400' },
    { id: 'latency', label: 'Latency', icon: Gauge, color: 'text-amber-400' },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 'power_efficiency', label: 'Power Efficiency', icon: RocketLaunch, color: 'text-cyan-400' }
  ];

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5 text-primary" weight="duotone" />
          Industry Benchmark Standards
        </CardTitle>
        <CardDescription>
          Reference guide for performance evaluation criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flash_speed" className="w-full">
          <ScrollArea className="w-full pb-2">
            <TabsList className="inline-flex w-auto">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="gap-2">
                    <Icon className={`w-4 h-4 ${category.color}`} weight="duotone" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {categories.map(category => {
            const benchmarks = getBenchmarksByCategory(category.id);
            const Icon = category.icon;

            return (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-6 h-6 ${category.color}`} weight="duotone" />
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                  <Badge variant="outline">{benchmarks.length} metrics</Badge>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {benchmarks.map((benchmark, index) => (
                      <Card key={index} className="bg-background/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{benchmark.metric}</CardTitle>
                          <CardDescription className="text-xs">
                            {benchmark.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/10 border border-accent/20">
                                <span className="text-xs font-medium">Optimal</span>
                                <span className="text-xs font-mono text-accent font-semibold">
                                  {benchmark.standards.optimal.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground pl-2">
                                Exceeds industry standards, best-in-class performance
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="text-xs font-medium">Good</span>
                                <span className="text-xs font-mono text-primary font-semibold">
                                  {benchmark.standards.good.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground pl-2">
                                Meets industry standards, typical performance
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <span className="text-xs font-medium">Acceptable</span>
                                <span className="text-xs font-mono text-amber-400 font-semibold">
                                  {benchmark.standards.acceptable.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground pl-2">
                                Below average, optimization recommended
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                <span className="text-xs font-medium">Poor</span>
                                <span className="text-xs font-mono text-destructive font-semibold">
                                  {benchmark.standards.poor.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground pl-2">
                                Significantly below standards, immediate action needed
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Unit: {benchmark.unit}</span>
                            <span>Source: {benchmark.source}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
