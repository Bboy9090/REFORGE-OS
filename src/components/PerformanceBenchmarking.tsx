import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Medal,
  Target,
  Lightning,
  Gauge,
  ArrowsDownUp,
  Cpu,
  HardDrive,
  DownloadSimple,
  RocketLaunch,
  Warning,
  CheckCircle,
  Trophy,
  Flag
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import {
  INDUSTRY_BENCHMARKS,
  evaluateAgainstBenchmark,
  calculatePercentile,
  generateRecommendation,
  getBenchmarksByCategory
} from '@/lib/industry-benchmarks';
import { BenchmarkResult, BenchmarkSession, PerformanceComparison } from '@/types/benchmarks';
import { RealtimeMetrics } from './RealTimeFlashMonitor';

interface PerformanceBenchmarkingProps {
  currentMetrics?: RealtimeMetrics;
  isActive?: boolean;
}

export function PerformanceBenchmarking({ currentMetrics, isActive }: PerformanceBenchmarkingProps) {
  const [benchmarkSessions, setBenchmarkSessions] = useKV<BenchmarkSession[]>('benchmark-sessions', []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  const categories = [
    { id: 'all', label: 'All Metrics', icon: ChartBar },
    { id: 'flash_speed', label: 'Flash Speed', icon: Lightning },
    { id: 'usb_bandwidth', label: 'USB Bandwidth', icon: ArrowsDownUp },
    { id: 'cpu_efficiency', label: 'CPU Efficiency', icon: Cpu },
    { id: 'memory_usage', label: 'Memory Usage', icon: HardDrive },
    { id: 'latency', label: 'Latency', icon: Gauge },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle },
    { id: 'power_efficiency', label: 'Power Efficiency', icon: RocketLaunch }
  ];

  const currentBenchmarkResults = useMemo(() => {
    if (!currentMetrics) return [];

    const results: BenchmarkResult[] = [];

    const metricMappings: Array<{
      benchmarkMetric: string;
      currentValue: number;
    }> = [
      { benchmarkMetric: 'Sequential Write Speed', currentValue: currentMetrics.transferSpeed },
      { benchmarkMetric: 'USB Bus Utilization', currentValue: currentMetrics.usbUtilization },
      { benchmarkMetric: 'CPU Usage During Flash', currentValue: currentMetrics.cpuUsage },
      { benchmarkMetric: 'Memory Footprint', currentValue: currentMetrics.memoryUsage },
      {
        benchmarkMetric: 'CPU Efficiency Score',
        currentValue: currentMetrics.cpuUsage > 0 ? currentMetrics.transferSpeed / currentMetrics.cpuUsage : 0
      }
    ];

    metricMappings.forEach(({ benchmarkMetric, currentValue }) => {
      const benchmark = INDUSTRY_BENCHMARKS.find(b => b.metric === benchmarkMetric);
      if (!benchmark) return;

      const rating = evaluateAgainstBenchmark(benchmarkMetric, currentValue);
      const percentile = calculatePercentile(benchmarkMetric, currentValue);
      const recommendation = generateRecommendation(benchmarkMetric, currentValue, rating);

      let comparison = '';
      if (rating === 'optimal') comparison = 'Exceeds industry standards';
      else if (rating === 'good') comparison = 'Meets industry standards';
      else if (rating === 'acceptable') comparison = 'Below industry average';
      else comparison = 'Significantly below standards';

      results.push({
        metric: benchmarkMetric,
        currentValue,
        standard: benchmark,
        rating: rating as any,
        percentile,
        comparison,
        recommendation
      });
    });

    return results;
  }, [currentMetrics]);

  const overallScore = useMemo(() => {
    if (currentBenchmarkResults.length === 0) return 0;

    const scoreMap = { optimal: 100, good: 75, acceptable: 50, poor: 25, unknown: 0 };
    const totalScore = currentBenchmarkResults.reduce(
      (sum, result) => sum + scoreMap[result.rating],
      0
    );

    return Math.round(totalScore / currentBenchmarkResults.length);
  }, [currentBenchmarkResults]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent';
    if (score >= 75) return 'text-primary';
    if (score >= 50) return 'text-amber-400';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'optimal': return 'bg-accent text-accent-foreground';
      case 'good': return 'bg-primary text-primary-foreground';
      case 'acceptable': return 'bg-amber-500 text-white';
      case 'poor': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'optimal': return <Trophy className="w-4 h-4" weight="fill" />;
      case 'good': return <CheckCircle className="w-4 h-4" weight="fill" />;
      case 'acceptable': return <Warning className="w-4 h-4" weight="fill" />;
      case 'poor': return <Warning className="w-4 h-4" weight="fill" />;
      default: return null;
    }
  };

  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') return currentBenchmarkResults;
    return currentBenchmarkResults.filter(r => r.standard.category === selectedCategory);
  }, [currentBenchmarkResults, selectedCategory]);

  const saveBenchmarkSession = () => {
    if (currentBenchmarkResults.length === 0) {
      toast.error('No benchmark data to save');
      return;
    }

    const session: BenchmarkSession = {
      id: `benchmark-${Date.now()}`,
      timestamp: Date.now(),
      deviceInfo: {},
      results: currentBenchmarkResults,
      overallScore,
      category: selectedCategory,
      duration: 0
    };

    setBenchmarkSessions(current => [session, ...(current || [])].slice(0, 50));
    toast.success('Benchmark session saved');
  };

  const exportBenchmarkData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      overallScore,
      results: currentBenchmarkResults,
      sessions: (benchmarkSessions || []).slice(0, 10)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Benchmark data exported');
  };

  const performanceComparisons = useMemo((): PerformanceComparison[] => {
    return currentBenchmarkResults.map(result => {
      const benchmark = result.standard;
      const yourValue = result.currentValue;
      
      let industryAverage = 0;
      let topPerformer = 0;

      if (benchmark.standards.good.min !== undefined && benchmark.standards.good.max !== undefined) {
        industryAverage = (benchmark.standards.good.min + benchmark.standards.good.max) / 2;
      } else if (benchmark.standards.acceptable.min !== undefined && benchmark.standards.acceptable.max !== undefined) {
        industryAverage = (benchmark.standards.acceptable.min + benchmark.standards.acceptable.max) / 2;
      }

      if (benchmark.standards.optimal.min !== undefined) {
        topPerformer = benchmark.standards.optimal.min * 1.2;
      } else if (benchmark.standards.optimal.max !== undefined) {
        topPerformer = benchmark.standards.optimal.max * 0.8;
      }

      const percentDifference = industryAverage > 0 
        ? ((yourValue - industryAverage) / industryAverage) * 100 
        : 0;

      let ranking: PerformanceComparison['ranking'] = 'average';
      if (result.percentile >= 90) ranking = 'top-10';
      else if (result.percentile >= 70) ranking = 'above-average';
      else if (result.percentile >= 40) ranking = 'average';
      else if (result.percentile >= 20) ranking = 'below-average';
      else ranking = 'needs-improvement';

      return {
        metric: result.metric,
        yourValue,
        industryAverage,
        topPerformer,
        percentDifference,
        ranking
      };
    });
  }, [currentBenchmarkResults]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-primary" weight="duotone" />
                Performance Benchmarking
              </CardTitle>
              <CardDescription>
                Compare your performance against industry standards
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={saveBenchmarkSession}
                disabled={currentBenchmarkResults.length === 0}
              >
                <Flag className="w-4 h-4 mr-2" />
                Save Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportBenchmarkData}
                disabled={currentBenchmarkResults.length === 0}
              >
                <DownloadSimple className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentBenchmarkResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Start a flash operation to see benchmark comparisons</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-4xl font-bold font-mono ${getScoreColor(overallScore)}`}>
                          {overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getScoreLabel(overallScore)}
                        </div>
                      </div>
                      <Trophy
                        className={`w-12 h-12 ${getScoreColor(overallScore)}`}
                        weight="duotone"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Industry Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono text-foreground">
                          Top {Math.round(100 - (currentBenchmarkResults.reduce((sum, r) => sum + r.percentile, 0) / currentBenchmarkResults.length))}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Percentile ranking
                        </div>
                      </div>
                      <Medal className="w-12 h-12 text-primary" weight="duotone" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Standards Met
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono text-foreground">
                          {currentBenchmarkResults.filter(r => r.rating === 'optimal' || r.rating === 'good').length}
                          <span className="text-lg text-muted-foreground">
                            /{currentBenchmarkResults.length}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Meeting or exceeding
                        </div>
                      </div>
                      <CheckCircle className="w-12 h-12 text-accent" weight="duotone" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  const count = category.id === 'all' 
                    ? currentBenchmarkResults.length 
                    : currentBenchmarkResults.filter(r => r.standard.category === category.id).length;
                  
                  return (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4 mr-2" weight="duotone" />
                      {category.label}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="results">Benchmark Results</TabsTrigger>
                  <TabsTrigger value="comparison">Industry Comparison</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4 mt-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {filteredResults.map((result, index) => (
                        <Card key={index} className="bg-background/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-base">
                                    {result.metric}
                                  </CardTitle>
                                  <Badge className={getRatingColor(result.rating)}>
                                    {getRatingIcon(result.rating)}
                                    <span className="ml-1">{result.rating.toUpperCase()}</span>
                                  </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                  {result.standard.description}
                                </CardDescription>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold font-mono text-foreground">
                                  {result.currentValue.toFixed(1)}
                                  <span className="text-sm text-muted-foreground ml-1">
                                    {result.standard.unit}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {result.percentile.toFixed(0)}th percentile
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Performance Level</span>
                                <span className="font-medium">{result.comparison}</span>
                              </div>
                              <Progress value={result.percentile} className="h-2" />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-1">Optimal</div>
                                <div className="font-mono font-medium text-accent">
                                  {result.standard.standards.optimal.label.split('(')[1]?.replace(')', '') || 
                                   result.standard.standards.optimal.label}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Good</div>
                                <div className="font-mono font-medium text-primary">
                                  {result.standard.standards.good.label.split('(')[1]?.replace(')', '') || 
                                   result.standard.standards.good.label}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Acceptable</div>
                                <div className="font-mono font-medium text-amber-400">
                                  {result.standard.standards.acceptable.label.split('(')[1]?.replace(')', '') || 
                                   result.standard.standards.acceptable.label}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Poor</div>
                                <div className="font-mono font-medium text-destructive">
                                  {result.standard.standards.poor.label.split('(')[1]?.replace(')', '') || 
                                   result.standard.standards.poor.label}
                                </div>
                              </div>
                            </div>

                            {result.recommendation && (
                              <>
                                <Separator />
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <Lightning className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-xs font-medium text-amber-400 mb-1">
                                        Recommendation
                                      </div>
                                      <div className="text-xs text-foreground/90">
                                        {result.recommendation}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="text-[10px] text-muted-foreground pt-1">
                              Source: {result.standard.source}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4 mt-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {performanceComparisons.map((comparison, index) => (
                        <Card key={index} className="bg-background/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              <span>{comparison.metric}</span>
                              <Badge variant={
                                comparison.ranking === 'top-10' ? 'default' :
                                comparison.ranking === 'above-average' ? 'secondary' :
                                comparison.ranking === 'average' ? 'outline' :
                                'destructive'
                              }>
                                {comparison.ranking.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Your Performance</div>
                                <div className="text-lg font-bold font-mono text-foreground">
                                  {comparison.yourValue.toFixed(1)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Industry Average</div>
                                <div className="text-lg font-bold font-mono text-muted-foreground">
                                  {comparison.industryAverage.toFixed(1)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Top Performer</div>
                                <div className="text-lg font-bold font-mono text-accent">
                                  {comparison.topPerformer.toFixed(1)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              {comparison.percentDifference >= 0 ? (
                                <TrendUp className="w-5 h-5 text-accent" weight="bold" />
                              ) : (
                                <TrendDown className="w-5 h-5 text-destructive" weight="bold" />
                              )}
                              <span className={comparison.percentDifference >= 0 ? 'text-accent' : 'text-destructive'}>
                                {Math.abs(comparison.percentDifference).toFixed(1)}%
                              </span>
                              <span className="text-muted-foreground">
                                {comparison.percentDifference >= 0 ? 'above' : 'below'} industry average
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress to Top Performer</span>
                                <span>
                                  {((comparison.yourValue / comparison.topPerformer) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress 
                                value={(comparison.yourValue / comparison.topPerformer) * 100} 
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                  <ScrollArea className="h-[600px] pr-4">
                    {(!benchmarkSessions || benchmarkSessions.length === 0) ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No saved benchmark sessions yet</p>
                        <p className="text-xs mt-2">Click "Save Session" to store your benchmark results</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(benchmarkSessions || []).map((session, index) => (
                          <Card key={session.id} className="bg-background/50">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-sm">
                                    Session {(benchmarkSessions?.length || 0) - index}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {new Date(session.timestamp).toLocaleString()}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold font-mono ${getScoreColor(session.overallScore)}`}>
                                    {session.overallScore}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getScoreLabel(session.overallScore)}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {session.results.map((result, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {result.metric.split(' ')[0]}: {result.currentValue.toFixed(1)}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
