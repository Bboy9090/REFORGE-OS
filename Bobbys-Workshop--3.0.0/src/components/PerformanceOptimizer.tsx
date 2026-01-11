import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Lightning,
  CheckCircle,
  TrendUp,
  Sparkle,
  Wrench,
  Target,
  ChartLine,
  RocketLaunch,
  Info,
  ArrowRight,
  CheckSquare,
  Square,
  Brain,
  Warning
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import type { MonitoringSession, RealtimeMetrics, BottleneckDetection } from './RealTimeFlashMonitor';

export interface OptimizationRecommendation {
  id: string;
  category: 'hardware' | 'software' | 'configuration' | 'environment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  expectedImprovement: number;
  steps: string[];
  appliedAt?: number;
  status: 'pending' | 'applied' | 'dismissed';
  confidence: number;
  relatedBottlenecks: string[];
}

export interface PerformanceScore {
  overall: number;
  speed: number;
  stability: number;
  efficiency: number;
  reliability: number;
}

export interface OptimizationProfile {
  name: string;
  description: string;
  recommendations: OptimizationRecommendation[];
  estimatedImprovement: number;
}

interface PerformanceOptimizerProps {
  sessions: MonitoringSession[];
  currentMetrics: RealtimeMetrics | null;
  activeBottlenecks: BottleneckDetection[];
}

export function PerformanceOptimizer({ sessions, currentMetrics, activeBottlenecks }: PerformanceOptimizerProps) {
  const [recommendations, setRecommendations] = useKV<OptimizationRecommendation[]>('optimization-recommendations', []);
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore | null>(null);
  const [optimizationProfiles, setOptimizationProfiles] = useState<OptimizationProfile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const score = calculatePerformanceScore();
      setPerformanceScore(score);

      const newRecommendations = generateRecommendations();
      setRecommendations(prevRecs => {
        const existingIds = new Set((prevRecs || []).map(r => r.id));
        const uniqueNew = newRecommendations.filter(r => !existingIds.has(r.id));
        return [...(prevRecs || []), ...uniqueNew];
      });

      const profiles = generateOptimizationProfiles(newRecommendations);
      setOptimizationProfiles(profiles);

      setIsAnalyzing(false);
      toast.success('Performance analysis complete');
    }, 1500);
  }, [sessions, activeBottlenecks]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      analyzePerformance();
    }
  }, [sessions, activeBottlenecks, analyzePerformance]);

  const calculatePerformanceScore = (): PerformanceScore => {
    if (!sessions || sessions.length === 0) {
      return { overall: 0, speed: 0, stability: 0, efficiency: 0, reliability: 0 };
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) {
      return { overall: 0, speed: 0, stability: 0, efficiency: 0, reliability: 0 };
    }

    const avgSpeed = completedSessions.reduce((sum, s) => sum + s.averageSpeed, 0) / completedSessions.length;
    const maxPossibleSpeed = 500 * 1024 * 1024;
    const speedScore = Math.min(100, (avgSpeed / maxPossibleSpeed) * 100);

    const speedVariance = completedSessions.map(s => {
      const variance = s.metrics.reduce((sum, m, i, arr) => {
        if (i === 0) return 0;
        return sum + Math.abs(m.transferSpeed - arr[i - 1].transferSpeed);
      }, 0) / s.metrics.length;
      return variance;
    });
    const avgVariance = speedVariance.reduce((sum, v) => sum + v, 0) / speedVariance.length;
    const stabilityScore = Math.max(0, 100 - (avgVariance / (10 * 1024 * 1024)) * 20);

    const avgCpu = completedSessions.reduce((sum, s) => {
      const sessionCpu = s.metrics.reduce((cpuSum, m) => cpuSum + m.cpuUsage, 0) / s.metrics.length;
      return sum + sessionCpu;
    }, 0) / completedSessions.length;
    const efficiencyScore = Math.max(0, 100 - avgCpu);

    const totalBottlenecks = completedSessions.reduce((sum, s) => sum + s.bottlenecks.length, 0);
    const avgBottlenecks = totalBottlenecks / completedSessions.length;
    const reliabilityScore = Math.max(0, 100 - (avgBottlenecks * 10));

    const overall = (speedScore + stabilityScore + efficiencyScore + reliabilityScore) / 4;

    return {
      overall: Math.round(overall),
      speed: Math.round(speedScore),
      stability: Math.round(stabilityScore),
      efficiency: Math.round(efficiencyScore),
      reliability: Math.round(reliabilityScore)
    };
  };

  const generateRecommendations = (): OptimizationRecommendation[] => {
    const newRecs: OptimizationRecommendation[] = [];
    const completedSessions = sessions.filter(s => s.status === 'completed');

    if (completedSessions.length === 0) return newRecs;

    const avgSpeed = completedSessions.reduce((sum, s) => sum + s.averageSpeed, 0) / completedSessions.length;
    const usbBottlenecks = activeBottlenecks.filter(b => b.type === 'usb');
    const cpuBottlenecks = activeBottlenecks.filter(b => b.type === 'cpu');
    const memoryBottlenecks = activeBottlenecks.filter(b => b.type === 'memory');

    if (avgSpeed < 20 * 1024 * 1024 || usbBottlenecks.length > 0) {
      newRecs.push({
        id: `rec-usb-upgrade-${Date.now()}`,
        category: 'hardware',
        priority: 'critical',
        title: 'Upgrade to USB 3.0 or Higher',
        description: 'Your transfer speeds indicate USB 2.0 connectivity. Upgrading to USB 3.0+ can provide 5-10x speed improvement.',
        impact: 'Transfer speeds could improve from current avg to 100-400 MB/s',
        effort: 'low',
        expectedImprovement: 300,
        steps: [
          'Verify your device supports USB 3.0 or higher',
          'Purchase a certified USB 3.0 cable (blue port)',
          'Connect device to USB 3.0 port on your computer',
          'Verify connection speed with lsusb or device manager',
          'Run test flash to confirm improvement'
        ],
        status: 'pending',
        confidence: 0.92,
        relatedBottlenecks: usbBottlenecks.map(b => b.id)
      });
    }

    if (cpuBottlenecks.length > 0 || (currentMetrics && currentMetrics.cpuUsage > 70)) {
      newRecs.push({
        id: `rec-cpu-optimization-${Date.now()}`,
        category: 'software',
        priority: 'high',
        title: 'Optimize CPU Usage During Flash',
        description: 'High CPU usage is limiting transfer speeds. Background processes are competing for resources.',
        impact: 'Reduce CPU usage by 20-30%, improving transfer stability',
        effort: 'low',
        expectedImprovement: 25,
        steps: [
          'Close unnecessary browser tabs and applications',
          'Disable antivirus real-time scanning temporarily',
          'Stop background sync services (cloud storage, etc.)',
          'Use Task Manager/Activity Monitor to identify CPU-heavy processes',
          'Consider upgrading to a faster CPU if consistently throttled'
        ],
        status: 'pending',
        confidence: 0.88,
        relatedBottlenecks: cpuBottlenecks.map(b => b.id)
      });
    }

    const speedVariance = completedSessions.map(s => {
      if (s.metrics.length < 2) return 0;
      const variance = s.metrics.reduce((sum, m, i, arr) => {
        if (i === 0) return 0;
        return sum + Math.abs(m.transferSpeed - arr[i - 1].transferSpeed);
      }, 0) / s.metrics.length;
      return variance;
    });
    const avgVariance = speedVariance.reduce((sum, v) => sum + v, 0) / speedVariance.length;

    if (avgVariance > 5 * 1024 * 1024) {
      newRecs.push({
        id: `rec-stability-improvement-${Date.now()}`,
        category: 'configuration',
        priority: 'medium',
        title: 'Improve Transfer Stability',
        description: 'Transfer speeds show high variance, indicating unstable connection or resource contention.',
        impact: 'More consistent speeds, reduced flash failures',
        effort: 'medium',
        expectedImprovement: 40,
        steps: [
          'Try a different USB cable to rule out cable quality',
          'Connect device directly to motherboard USB port (avoid hubs)',
          'Update USB drivers and device firmware',
          'Disable USB selective suspend in power settings',
          'Check for electromagnetic interference near cables'
        ],
        status: 'pending',
        confidence: 0.75,
        relatedBottlenecks: []
      });
    }

    if (memoryBottlenecks.length > 0) {
      newRecs.push({
        id: `rec-memory-optimization-${Date.now()}`,
        category: 'software',
        priority: 'high',
        title: 'Free Up System Memory',
        description: 'Memory pressure is causing buffer starvation and reduced performance.',
        impact: 'Smoother transfers with fewer interruptions',
        effort: 'low',
        expectedImprovement: 20,
        steps: [
          'Close memory-intensive applications (browsers, IDEs, etc.)',
          'Clear system cache and temporary files',
          'Restart your computer to free up memory leaks',
          'Consider adding more RAM if consistently hitting limits',
          'Use lightweight applications during flashing operations'
        ],
        status: 'pending',
        confidence: 0.85,
        relatedBottlenecks: memoryBottlenecks.map(b => b.id)
      });
    }

    const diskIOBottlenecks = activeBottlenecks.filter(b => b.type === 'disk');
    if (diskIOBottlenecks.length > 0) {
      newRecs.push({
        id: `rec-disk-optimization-${Date.now()}`,
        category: 'hardware',
        priority: 'medium',
        title: 'Optimize Disk I/O Performance',
        description: 'Disk read speeds are bottlenecking the flash process.',
        impact: 'Faster file reads, smoother transfers',
        effort: 'medium',
        expectedImprovement: 35,
        steps: [
          'Move firmware files to an SSD if currently on HDD',
          'Defragment HDD or run TRIM on SSD',
          'Close applications performing heavy disk operations',
          'Disable Windows Search indexing for firmware directory',
          'Consider upgrading to NVMe SSD for maximum performance'
        ],
        status: 'pending',
        confidence: 0.79,
        relatedBottlenecks: diskIOBottlenecks.map(b => b.id)
      });
    }

    if (completedSessions.length >= 3) {
      const recentSessions = completedSessions.slice(0, 3);
      const trendingSpeeds = recentSessions.map(s => s.averageSpeed);
      const isDecreasing = trendingSpeeds.every((speed, i) => i === 0 || speed < trendingSpeeds[i - 1]);

      if (isDecreasing) {
        newRecs.push({
          id: `rec-performance-degradation-${Date.now()}`,
          category: 'environment',
          priority: 'high',
          title: 'Investigate Performance Degradation',
          description: 'Performance has been declining over recent sessions. This may indicate thermal throttling or system issues.',
          impact: 'Restore performance to previous levels',
          effort: 'medium',
          expectedImprovement: 50,
          steps: [
            'Check CPU and system temperatures during flash',
            'Clean dust from computer vents and fans',
            'Ensure adequate ventilation around device',
            'Update system BIOS and all drivers',
            'Run hardware diagnostics to check for failing components',
            'Check for malware or resource-hogging background processes'
          ],
          status: 'pending',
          confidence: 0.82,
          relatedBottlenecks: []
        });
      }
    }

    newRecs.push({
      id: `rec-buffer-optimization-${Date.now()}`,
      category: 'configuration',
      priority: 'low',
      title: 'Optimize Buffer Settings',
      description: 'Fine-tune buffer sizes for optimal throughput based on your hardware.',
      impact: 'Marginal speed improvements (5-10%)',
      effort: 'high',
      expectedImprovement: 8,
      steps: [
        'Experiment with different buffer sizes in fastboot',
        'Monitor buffer health metrics during transfers',
        'Adjust based on your specific hardware combination',
        'Document optimal settings for future use'
      ],
      status: 'pending',
      confidence: 0.65,
      relatedBottlenecks: []
    });

    return newRecs;
  };

  const generateOptimizationProfiles = (recs: OptimizationRecommendation[]): OptimizationProfile[] => {
    const profiles: OptimizationProfile[] = [];

    const criticalRecs = recs.filter(r => r.priority === 'critical' && r.status === 'pending');
    const highRecs = recs.filter(r => r.priority === 'high' && r.status === 'pending');
    const mediumRecs = recs.filter(r => r.priority === 'medium' && r.status === 'pending');
    const lowEffortRecs = recs.filter(r => r.effort === 'low' && r.status === 'pending');

    if (criticalRecs.length > 0 || highRecs.length > 0) {
      profiles.push({
        name: 'Quick Wins',
        description: 'Low-effort, high-impact optimizations you can implement immediately',
        recommendations: lowEffortRecs.slice(0, 3),
        estimatedImprovement: lowEffortRecs.slice(0, 3).reduce((sum, r) => sum + r.expectedImprovement, 0)
      });
    }

    if (criticalRecs.length > 0) {
      profiles.push({
        name: 'Critical Path',
        description: 'Address the most severe performance bottlenecks first',
        recommendations: criticalRecs,
        estimatedImprovement: criticalRecs.reduce((sum, r) => sum + r.expectedImprovement, 0)
      });
    }

    const hardwareRecs = recs.filter(r => r.category === 'hardware' && r.status === 'pending');
    if (hardwareRecs.length > 0) {
      profiles.push({
        name: 'Hardware Upgrade Path',
        description: 'Hardware improvements for maximum performance gains',
        recommendations: hardwareRecs,
        estimatedImprovement: hardwareRecs.reduce((sum, r) => sum + r.expectedImprovement, 0)
      });
    }

    const softwareRecs = recs.filter(r => r.category === 'software' && r.status === 'pending');
    const configRecs = recs.filter(r => r.category === 'configuration' && r.status === 'pending');
    if (softwareRecs.length > 0 || configRecs.length > 0) {
      profiles.push({
        name: 'Software Optimization',
        description: 'Software and configuration tweaks for better performance',
        recommendations: [...softwareRecs, ...configRecs],
        estimatedImprovement: [...softwareRecs, ...configRecs].reduce((sum, r) => sum + r.expectedImprovement, 0)
      });
    }

    return profiles;
  };

  const applyRecommendation = (recId: string) => {
    setRecommendations(prev => 
      (prev || []).map(r => 
        r.id === recId ? { ...r, status: 'applied' as const, appliedAt: Date.now() } : r
      )
    );
    toast.success('Recommendation marked as applied');
  };

  const dismissRecommendation = (recId: string) => {
    setRecommendations(prev => 
      (prev || []).map(r => 
        r.id === recId ? { ...r, status: 'dismissed' as const } : r
      )
    );
    toast.info('Recommendation dismissed');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low': return <Badge variant="outline" className="bg-green-500/20 text-green-400">Low Effort</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">Medium Effort</Badge>;
      case 'high': return <Badge variant="outline" className="bg-orange-500/20 text-orange-400">High Effort</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const pendingRecs = (recommendations || []).filter(r => r.status === 'pending');
  const appliedRecs = (recommendations || []).filter(r => r.status === 'applied');

  return (
    <div className="space-y-6">
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="w-6 h-6 text-accent" />
                Performance Optimizer
              </CardTitle>
              <CardDescription className="mt-2">
                AI-powered recommendations to maximize flash performance
              </CardDescription>
            </div>
            <Button 
              onClick={analyzePerformance} 
              disabled={isAnalyzing || !sessions || sessions.length === 0}
              className="gap-2"
            >
              <Sparkle className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {performanceScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold font-mono flex items-baseline gap-2">
                    <span className={getScoreColor(performanceScore.overall)}>{performanceScore.overall}</span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Performance</div>
                </div>
                {performanceScore.overall >= 80 && (
                  <RocketLaunch className="w-12 h-12 text-green-500" />
                )}
                {performanceScore.overall < 80 && performanceScore.overall >= 60 && (
                  <TrendUp className="w-12 h-12 text-yellow-500" />
                )}
                {performanceScore.overall < 60 && (
                  <Warning className="w-12 h-12 text-orange-500" />
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Speed</div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(performanceScore.speed)}`}>
                    {performanceScore.speed}
                  </div>
                  <Progress value={performanceScore.speed} className="mt-2 h-1" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Stability</div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(performanceScore.stability)}`}>
                    {performanceScore.stability}
                  </div>
                  <Progress value={performanceScore.stability} className="mt-2 h-1" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Efficiency</div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(performanceScore.efficiency)}`}>
                    {performanceScore.efficiency}
                  </div>
                  <Progress value={performanceScore.efficiency} className="mt-2 h-1" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Reliability</div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(performanceScore.reliability)}`}>
                    {performanceScore.reliability}
                  </div>
                  <Progress value={performanceScore.reliability} className="mt-2 h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {optimizationProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ChartLine className="w-5 h-5" />
              Optimization Profiles
            </CardTitle>
            <CardDescription>
              Curated sets of recommendations for different optimization strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {optimizationProfiles.map((profile, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProfile === profile.name
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedProfile(profile.name === selectedProfile ? null : profile.name)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{profile.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      +{profile.estimatedImprovement}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Lightning className="w-3 h-3" />
                    <span>{profile.recommendations.length} recommendations</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5" />
              Active Recommendations ({pendingRecs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {pendingRecs.map((rec) => (
                  <Alert key={rec.id} className={`${getPriorityColor(rec.priority)} border-2`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <AlertTitle className="text-base font-semibold flex items-center gap-2 mb-1">
                            {rec.title}
                            <Badge variant="outline" className="text-xs uppercase">
                              {rec.priority}
                            </Badge>
                            {getEffortBadge(rec.effort)}
                          </AlertTitle>
                          <AlertDescription className="text-sm">
                            {rec.description}
                          </AlertDescription>
                        </div>
                      </div>

                      <div className="bg-background/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendUp className="w-3 h-3" />
                          <span className="font-semibold">Expected Impact:</span>
                          <span>{rec.impact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <RocketLaunch className="w-3 h-3 text-accent" />
                          <span className="font-semibold text-accent">+{rec.expectedImprovement}% improvement</span>
                          <span className="text-muted-foreground">• {(rec.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Implementation Steps:
                        </div>
                        <div className="space-y-1.5 pl-5">
                          {rec.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <ArrowRight className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => applyRecommendation(rec.id)}
                          className="gap-2"
                        >
                          <CheckSquare className="w-3 h-3" />
                          Mark Applied
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissRecommendation(rec.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {appliedRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Applied Optimizations ({appliedRecs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {appliedRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Applied {rec.appliedAt ? new Date(rec.appliedAt).toLocaleString() : 'recently'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-400">
                      +{rec.expectedImprovement}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {(!recommendations || recommendations.length === 0) && !isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recommendations available yet</p>
              <p className="text-sm mt-2">Run monitoring sessions to gather data for optimization analysis</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
