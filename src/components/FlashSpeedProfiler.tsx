import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Gauge,
  TrendUp,
  TrendDown,
  Lightbulb,
  ChartLine,
  Pulse,
  Clock,
  ArrowClockwise,
  Cpu,
  HardDrive,
  Lightning,
  Warning,
  CheckCircle,
  Info,
  Sparkle,
  Target
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export interface FlashSpeedProfile {
  id: string;
  deviceSerial: string;
  deviceModel?: string;
  partition: string;
  fileSize: number;
  timestamp: number;
  duration: number;
  averageSpeed: number;
  peakSpeed: number;
  minSpeed: number;
  speedVariance: number;
  transferEfficiency: number;
  speedProfile: Array<{ time: number; speed: number }>;
  usbVersion?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  errors: number;
  retries: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'hardware' | 'software' | 'configuration' | 'maintenance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
  estimatedImprovement: string;
  confidence: number;
}

export interface PerformanceMetrics {
  avgSpeed: number;
  avgDuration: number;
  totalTransferred: number;
  totalOperations: number;
  successRate: number;
  avgEfficiency: number;
  speedTrend: 'improving' | 'declining' | 'stable';
  performanceScore: number;
}

export function FlashSpeedProfiler() {
  const [profiles, setProfiles] = useKV<FlashSpeedProfile[]>('flash-speed-profiles', []);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      calculateMetrics();
      generateRecommendations();
    }
  }, [profiles]);

  const calculateMetrics = () => {
    if (!profiles || profiles.length === 0) return;

    const totalSpeed = profiles.reduce((sum, p) => sum + p.averageSpeed, 0);
    const totalDuration = profiles.reduce((sum, p) => sum + p.duration, 0);
    const totalBytes = profiles.reduce((sum, p) => sum + p.fileSize, 0);
    const totalEfficiency = profiles.reduce((sum, p) => sum + p.transferEfficiency, 0);
    const successCount = profiles.filter(p => p.errors === 0).length;

    const avgSpeed = totalSpeed / profiles.length;
    const avgDuration = totalDuration / profiles.length;
    const avgEfficiency = totalEfficiency / profiles.length;
    const successRate = (successCount / profiles.length) * 100;

    let speedTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (profiles.length >= 5) {
      const recentProfiles = profiles.slice(0, 5);
      const olderProfiles = profiles.slice(Math.max(5, profiles.length - 5));
      const recentAvg = recentProfiles.reduce((sum, p) => sum + p.averageSpeed, 0) / recentProfiles.length;
      const olderAvg = olderProfiles.reduce((sum, p) => sum + p.averageSpeed, 0) / olderProfiles.length;
      
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
      if (change > 10) speedTrend = 'improving';
      else if (change < -10) speedTrend = 'declining';
    }

    const performanceScore = Math.min(100, Math.round(
      (avgEfficiency * 0.4) + 
      (successRate * 0.3) + 
      ((avgSpeed / (10 * 1024 * 1024)) * 100 * 0.3)
    ));

    setMetrics({
      avgSpeed,
      avgDuration,
      totalTransferred: totalBytes,
      totalOperations: profiles.length,
      successRate,
      avgEfficiency,
      speedTrend,
      performanceScore
    });
  };

  const generateRecommendations = () => {
    if (!profiles || profiles.length < 2) return;

    const newRecommendations: OptimizationRecommendation[] = [];

    const avgSpeed = profiles.reduce((sum, p) => sum + p.averageSpeed, 0) / profiles.length;
    const avgEfficiency = profiles.reduce((sum, p) => sum + p.transferEfficiency, 0) / profiles.length;
    const hasHighVariance = profiles.some(p => p.speedVariance > 30);
    const hasErrors = profiles.some(p => p.errors > 0);
    const usb2Devices = profiles.filter(p => p.usbVersion === '2.0');
    const lowSpeedProfiles = profiles.filter(p => p.averageSpeed < 3 * 1024 * 1024);

    if (avgSpeed < 5 * 1024 * 1024) {
      newRecommendations.push({
        id: 'slow-transfer',
        category: 'hardware',
        severity: 'high',
        title: 'Below Optimal Transfer Speeds',
        description: `Average transfer speed of ${formatSpeed(avgSpeed)} is below optimal. USB 2.0 typically achieves 10-30 MB/s, USB 3.0 can reach 100+ MB/s.`,
        impact: 'Significantly increased flash times, reduced workflow efficiency',
        actionItems: [
          'Verify you\'re using a USB 3.0 cable and port',
          'Try different USB ports (preferably rear panel ports on desktop)',
          'Check cable quality - replace if damaged or aged',
          'Close background applications using USB bandwidth'
        ],
        estimatedImprovement: '2-5x speed increase',
        confidence: 0.85
      });
    }

    if (hasHighVariance) {
      newRecommendations.push({
        id: 'speed-variance',
        category: 'hardware',
        severity: 'medium',
        title: 'Inconsistent Transfer Speeds Detected',
        description: 'Significant speed fluctuations observed during transfers, indicating potential connection or system resource issues.',
        impact: 'Unpredictable flash times, potential transfer failures',
        actionItems: [
          'Check USB cable connection for loose fit',
          'Monitor CPU usage during flashing - close CPU-intensive applications',
          'Disable USB power management in system settings',
          'Update USB and chipset drivers',
          'Try a different USB hub or port'
        ],
        estimatedImprovement: '20-40% more stable transfers',
        confidence: 0.75
      });
    }

    if (usb2Devices.length > 0 && usb2Devices.length === profiles.length) {
      newRecommendations.push({
        id: 'usb-version',
        category: 'hardware',
        severity: 'critical',
        title: 'USB 2.0 Bottleneck Identified',
        description: 'All detected transfers are using USB 2.0, which is significantly slower than USB 3.0/3.1.',
        impact: 'Flash operations taking 3-10x longer than necessary',
        actionItems: [
          'Upgrade to USB 3.0 or higher cable (blue port connector)',
          'Verify device supports USB 3.0 in fastboot mode',
          'Update device firmware to enable USB 3.0 support',
          'Use a USB 3.0 port (usually blue colored or marked SS)'
        ],
        estimatedImprovement: '3-10x speed increase',
        confidence: 0.95
      });
    }

    if (avgEfficiency < 60) {
      newRecommendations.push({
        id: 'low-efficiency',
        category: 'configuration',
        severity: 'high',
        title: 'Low Transfer Efficiency',
        description: `Transfer efficiency of ${avgEfficiency.toFixed(1)}% indicates significant protocol overhead or system bottlenecks.`,
        impact: 'Wasted time and resources during flash operations',
        actionItems: [
          'Update fastboot drivers to latest version',
          'Increase USB transfer buffer size in system settings',
          'Disable real-time antivirus scanning for flash tool directory',
          'Use native USB controller instead of USB hub when possible',
          'Enable high-performance power plan during flashing'
        ],
        estimatedImprovement: '15-30% efficiency gain',
        confidence: 0.70
      });
    }

    if (hasErrors) {
      const errorProfiles = profiles.filter(p => p.errors > 0);
      const errorRate = (errorProfiles.length / profiles.length) * 100;
      
      newRecommendations.push({
        id: 'error-rate',
        category: 'maintenance',
        severity: errorRate > 20 ? 'critical' : 'high',
        title: `${errorRate.toFixed(0)}% Error Rate Detected`,
        description: 'Recurring errors during flash operations indicate hardware or connection reliability issues.',
        impact: 'Failed flashes, potential device corruption, wasted time',
        actionItems: [
          'Test with a different USB cable - current one may be faulty',
          'Clean USB ports on both computer and device',
          'Check device battery level - maintain above 50% during flashing',
          'Update ADB/Fastboot tools to latest version',
          'Test on a different computer to isolate hardware issues',
          'Verify firmware file integrity (checksum validation)'
        ],
        estimatedImprovement: 'Up to 95% error reduction',
        confidence: 0.80
      });
    }

    if (lowSpeedProfiles.length > profiles.length / 2) {
      newRecommendations.push({
        id: 'partition-specific',
        category: 'software',
        severity: 'medium',
        title: 'Specific Partitions Showing Poor Performance',
        description: 'Certain partitions consistently flash slower than others, possibly due to write speed limitations.',
        impact: 'Extended flash times for system-critical partitions',
        actionItems: [
          'Verify device is in correct fastboot mode (not fastbootd)',
          'Some partitions have write-once protections - this is normal',
          'Consider batch flashing related partitions together',
          'Monitor device temperature - thermal throttling may occur',
          'Update device bootloader if available'
        ],
        estimatedImprovement: '10-25% improvement for affected partitions',
        confidence: 0.65
      });
    }

    const sortedProfile = profiles.sort((a, b) => b.timestamp - a.timestamp);
    if (sortedProfile.length >= 10) {
      const recent = sortedProfile.slice(0, 5);
      const older = sortedProfile.slice(5, 10);
      const recentAvg = recent.reduce((sum, p) => sum + p.averageSpeed, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.averageSpeed, 0) / older.length;
      
      if (recentAvg < olderAvg * 0.7) {
        newRecommendations.push({
          id: 'degrading-performance',
          category: 'maintenance',
          severity: 'high',
          title: 'Performance Degradation Detected',
          description: 'Transfer speeds have decreased by more than 30% over recent operations.',
          impact: 'Progressively slower flash operations over time',
          actionItems: [
            'Restart computer to clear system resources',
            'Check for background OS updates consuming bandwidth',
            'Inspect USB cable for physical damage',
            'Clear ADB/Fastboot cache and temporary files',
            'Update system USB drivers',
            'Check device storage health if repeatedly flashing userdata'
          ],
          estimatedImprovement: 'Restore to previous performance levels',
          confidence: 0.75
        });
      }
    }

    newRecommendations.push({
      id: 'general-optimization',
      category: 'configuration',
      severity: 'low',
      title: 'General Optimization Best Practices',
      description: 'Additional optimizations that can improve overall flash performance.',
      impact: 'Incremental improvements adding up to better overall experience',
      actionItems: [
        'Use SSD for storing firmware files instead of HDD',
        'Disable unnecessary startup programs',
        'Maintain adequate free disk space (20%+ free)',
        'Keep fastboot/ADB tools updated to latest stable version',
        'Use quality USB cables certified for high-speed data',
        'Flash during low system activity periods',
        'Monitor system temperature - ensure adequate cooling'
      ],
      estimatedImprovement: '5-15% cumulative improvement',
      confidence: 0.60
    });

    const sorted = newRecommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    setRecommendations(sorted);
  };

  const simulateAnalysis = async () => {
    setAnalyzing(true);
    
    toast.info('Analyzing flash performance profiles...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sampleProfiles: FlashSpeedProfile[] = Array.from({ length: 15 }, (_, i) => ({
      id: `profile-${Date.now()}-${i}`,
      deviceSerial: i % 3 === 0 ? 'DEVICE-001' : i % 3 === 1 ? 'DEVICE-002' : 'DEVICE-003',
      deviceModel: i % 3 === 0 ? 'Pixel 6' : i % 3 === 1 ? 'OnePlus 9' : 'Samsung S21',
      partition: ['boot', 'system', 'vendor', 'recovery'][i % 4],
      fileSize: (50 + Math.random() * 500) * 1024 * 1024,
      timestamp: Date.now() - (i * 3600000),
      duration: 30000 + Math.random() * 60000,
      averageSpeed: (2 + Math.random() * 6) * 1024 * 1024,
      peakSpeed: (5 + Math.random() * 10) * 1024 * 1024,
      minSpeed: (1 + Math.random() * 2) * 1024 * 1024,
      speedVariance: Math.random() * 40,
      transferEfficiency: 50 + Math.random() * 40,
      speedProfile: Array.from({ length: 20 }, (_, j) => ({
        time: j * 5,
        speed: (3 + Math.random() * 4) * 1024 * 1024
      })),
      usbVersion: Math.random() > 0.6 ? '3.0' : '2.0',
      cpuUsage: 20 + Math.random() * 40,
      memoryUsage: 30 + Math.random() * 30,
      errors: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      retries: Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0
    }));

    setProfiles(prev => [...sampleProfiles, ...(prev || [])]);
    
    toast.success('Analysis complete - recommendations generated');
    setAnalyzing(false);
  };

  const clearProfiles = () => {
    setProfiles([]);
    setRecommendations([]);
    setMetrics(null);
    toast.success('Profile data cleared');
  };

  const formatSpeed = (bytesPerSecond: number) => {
    const mbps = bytesPerSecond / (1024 * 1024);
    return `${mbps.toFixed(2)} MB/s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getSeverityBadge = (severity: OptimizationRecommendation['severity']) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getCategoryIcon = (category: OptimizationRecommendation['category']) => {
    const icons = {
      hardware: <HardDrive size={16} />,
      software: <Cpu size={16} />,
      configuration: <Target size={16} />,
      maintenance: <Pulse size={16} />
    };
    return icons[category];
  };

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={20} weight="fill" className="text-primary" />
            <CardTitle>Flash Speed Profiler & Optimizer</CardTitle>
          </div>
          <div className="flex gap-2">
            {profiles && profiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearProfiles}
              >
                <ArrowClockwise size={16} />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={simulateAnalysis}
              disabled={analyzing}
            >
              <Sparkle size={16} className={analyzing ? 'animate-spin' : ''} />
              {analyzing ? 'Analyzing...' : 'Generate Demo Data'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Analyze flash performance, identify bottlenecks, and receive AI-powered optimization recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!profiles || profiles.length === 0 ? (
          <div className="text-center py-12">
            <Gauge size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Flash operations will be automatically profiled.<br />
              Or generate demo data to explore features.
            </p>
            <Button onClick={simulateAnalysis}>
              <Sparkle size={16} className="mr-2" />
              Generate Demo Profiles
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <ChartLine size={16} className="mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Lightbulb size={16} className="mr-1" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="profiles">
                <Pulse size={16} className="mr-1" />
                Profiles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {metrics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Performance Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className={`text-3xl font-bold ${getPerformanceScoreColor(metrics.performanceScore)}`}>
                            {metrics.performanceScore}
                          </span>
                          <Gauge size={32} className={getPerformanceScoreColor(metrics.performanceScore)} weight="fill" />
                        </div>
                        <Progress value={metrics.performanceScore} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Average Speed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {formatSpeed(metrics.avgSpeed)}
                          </span>
                          <Lightning size={32} weight="fill" className="text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metrics.speedTrend === 'improving' && (
                            <span className="text-green-500 flex items-center gap-1">
                              <TrendUp size={12} weight="bold" /> Improving
                            </span>
                          )}
                          {metrics.speedTrend === 'declining' && (
                            <span className="text-red-500 flex items-center gap-1">
                              <TrendDown size={12} weight="bold" /> Declining
                            </span>
                          )}
                          {metrics.speedTrend === 'stable' && (
                            <span className="text-muted-foreground">Stable</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {metrics.successRate.toFixed(1)}%
                          </span>
                          <CheckCircle size={32} weight="fill" className="text-green-500" />
                        </div>
                        <Progress value={metrics.successRate} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Operations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {metrics.totalOperations}
                          </span>
                          <Pulse size={32} weight="fill" className="text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(metrics.totalTransferred)} transferred
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Info size={16} />
                      Performance Insights
                    </h3>
                    
                    <div className="grid gap-3">
                      <Alert>
                        <Clock size={16} />
                        <AlertTitle>Average Flash Duration</AlertTitle>
                        <AlertDescription>
                          {formatDuration(metrics.avgDuration)} per operation
                        </AlertDescription>
                      </Alert>

                      <Alert>
                        <Target size={16} />
                        <AlertTitle>Transfer Efficiency</AlertTitle>
                        <AlertDescription>
                          {metrics.avgEfficiency.toFixed(1)}% - {
                            metrics.avgEfficiency >= 75 ? 'Excellent efficiency' :
                            metrics.avgEfficiency >= 60 ? 'Good efficiency' :
                            metrics.avgEfficiency >= 40 ? 'Room for improvement' :
                            'Significant optimization needed'
                          }
                        </AlertDescription>
                      </Alert>

                      {metrics.speedTrend === 'declining' && (
                        <Alert variant="destructive">
                          <Warning size={16} />
                          <AlertTitle>Performance Declining</AlertTitle>
                          <AlertDescription>
                            Transfer speeds have decreased over recent operations. Check recommendations for solutions.
                          </AlertDescription>
                        </Alert>
                      )}

                      {metrics.successRate < 90 && (
                        <Alert variant="destructive">
                          <Warning size={16} />
                          <AlertTitle>High Error Rate</AlertTitle>
                          <AlertDescription>
                            {(100 - metrics.successRate).toFixed(1)}% of operations encountered errors. Review connection quality and hardware.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb size={48} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No recommendations available yet.<br />
                    More data needed for analysis.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {recommendations.map(rec => (
                      <Card key={rec.id} className="border-l-4" style={{
                        borderLeftColor: 
                          rec.severity === 'critical' ? 'rgb(239 68 68)' :
                          rec.severity === 'high' ? 'rgb(249 115 22)' :
                          rec.severity === 'medium' ? 'rgb(234 179 8)' :
                          'rgb(148 163 184)'
                      }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {getCategoryIcon(rec.category)}
                              <div className="flex-1">
                                <CardTitle className="text-base">{rec.title}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                                </p>
                              </div>
                            </div>
                            {getSeverityBadge(rec.severity)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{rec.description}</p>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Impact:</p>
                            <p className="text-xs">{rec.impact}</p>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Action Items:</p>
                            <ul className="space-y-1 text-xs">
                              {rec.actionItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 text-xs">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-muted-foreground">Expected: </span>
                                <span className="font-semibold text-green-600">{rec.estimatedImprovement}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Confidence: </span>
                                <span className="font-semibold">{(rec.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <Progress value={rec.confidence * 100} className="w-20 h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="profiles" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {profiles.length} Profile{profiles.length !== 1 ? 's' : ''} Recorded
                </h3>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {profiles.slice().sort((a, b) => b.timestamp - a.timestamp).map(profile => (
                    <Card key={profile.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{profile.partition}</span>
                                {profile.errors > 0 && (
                                  <Badge variant="destructive">
                                    {profile.errors} error{profile.errors !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {profile.deviceSerial} {profile.deviceModel && `• ${profile.deviceModel}`}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(profile.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Avg Speed</p>
                              <p className="font-semibold">{formatSpeed(profile.averageSpeed)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Peak Speed</p>
                              <p className="font-semibold">{formatSpeed(profile.peakSpeed)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-semibold">{formatDuration(profile.duration)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">File Size</p>
                              <p className="font-semibold">{formatBytes(profile.fileSize)}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Transfer Efficiency</span>
                              <span className="font-semibold">{profile.transferEfficiency.toFixed(1)}%</span>
                            </div>
                            <Progress value={profile.transferEfficiency} />
                          </div>

                          {profile.usbVersion && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">USB {profile.usbVersion}</Badge>
                              {profile.speedVariance > 30 && (
                                <Badge variant="secondary">High Variance</Badge>
                              )}
                              {profile.retries > 0 && (
                                <Badge variant="secondary">{profile.retries} retry</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
