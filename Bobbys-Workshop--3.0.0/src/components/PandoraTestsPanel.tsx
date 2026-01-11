import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from './EmptyState';
import { useApp } from '@/lib/app-context';
import { API_CONFIG, getAPIUrl } from '@/lib/apiConfig';
import { 
  Play, 
  Flask,
  CheckCircle,
  XCircle,
  Warning,
  CircleNotch
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'RUNNING' | 'SKIPPED';
  duration?: number;
  details?: string;
}

export function PandoraTestsPanel() {
  const { backendAvailable } = useApp();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const runAllTests = async () => {
    if (!backendAvailable) {
      toast.error('Connect backend to run tests');
      return;
    }

    setRunning(true);
    setTests([{ name: 'Running backend self-tests…', status: 'RUNNING' }]);
    toast.info('Running automated tests…');

    try {
      const res = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.TESTS_RUN), { method: 'POST' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const results: TestResult[] = Array.isArray(data?.results)
        ? data.results.map((r: any) => ({
            name: String(r?.name ?? 'Unnamed Test'),
            status: (r?.status as TestResult['status']) ?? 'SKIPPED',
            duration: typeof r?.duration === 'number' ? r.duration : undefined,
            details: typeof r?.details === 'string' ? r.details : undefined,
          }))
        : [];

      setTests(results);
      setHistory(prev => [{ timestamp: Date.now(), results: data }, ...prev.slice(0, 9)]);

      toast.success('Test suite completed');
    } catch (err) {
      console.error('Test suite failed:', err);
      setTests([{ name: 'Backend self-tests failed', status: 'FAIL', details: err instanceof Error ? err.message : String(err) }]);
      toast.error('Test suite failed');
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-emerald-400" weight="fill" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-rose-400" weight="fill" />;
      case 'RUNNING':
        return <CircleNotch className="w-5 h-5 text-primary animate-spin" />;
      case 'SKIPPED':
        return <Warning className="w-5 h-5 text-amber-400" weight="fill" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">PASS</Badge>;
      case 'FAIL':
        return <Badge className="bg-rose-600/20 text-rose-300 border-rose-500/30">FAIL</Badge>;
      case 'RUNNING':
        return <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">RUNNING</Badge>;
      case 'SKIPPED':
        return <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">SKIPPED</Badge>;
      case 'WARNING':
        return <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">WARNING</Badge>;
    }
  };

  const passCount = tests.filter(t => t.status === 'PASS').length;
  const failCount = tests.filter(t => t.status === 'FAIL').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flask className="w-5 h-5 text-primary" weight="duotone" />
                Automated Testing
              </CardTitle>
              <CardDescription>Validate detection, performance, and optimizations</CardDescription>
            </div>
            <Button onClick={runAllTests} disabled={running || !backendAvailable}>
              {running ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" weight="fill" />
              )}
              {backendAvailable ? 'Run All Tests' : 'Connect Backend'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tests.length === 0 && !running ? (
            <EmptyState
              icon={<Flask className="w-12 h-12" weight="duotone" />}
              title="No test results yet"
              description={backendAvailable
                ? 'Run automated tests to validate tooling and environment'
                : 'Connect to backend API to run automated tests'}
              action={backendAvailable ? {
                label: 'Run All Tests',
                onClick: runAllTests
              } : undefined}
            />
          ) : (
            <div className="space-y-4">
              {totalTests > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-primary/30">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Total Tests</div>
                      <div className="text-3xl font-bold">{totalTests}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-500/30">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Passed</div>
                      <div className="text-3xl font-bold text-emerald-400">{passCount}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-500/30">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Failed</div>
                      <div className="text-3xl font-bold text-rose-400">{failCount}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-2">
                {tests.map((test, idx) => (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            {test.details && (
                              <div className="text-xs text-muted-foreground mt-1">{test.details}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {test.duration && (
                            <span className="text-xs text-muted-foreground font-mono">{test.duration}ms</span>
                          )}
                          {getStatusBadge(test.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {history.map((run, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          Run #{history.length - idx}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(run.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {run.results?.length || 0} tests
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
