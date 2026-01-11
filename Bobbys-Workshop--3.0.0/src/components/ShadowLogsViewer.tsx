// ShadowLogsViewer.tsx - View encrypted shadow logs (admin only)

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Eye, Calendar, AlertTriangle, Lock } from 'lucide-react';

interface ShadowLogEntry {
  timestamp: string;
  operation: string;
  deviceSerial: string;
  userId: string;
  authorization: string;
  success?: boolean;
  metadata?: any;
  hash: string;
}

export function ShadowLogsViewer() {
  const [secretPasscode, setSecretPasscode] = useState(() => {
    try {
      return localStorage.getItem('bobbysWorkshop.secretRoomPasscode') || 'BJ0990';
    } catch {
      return 'BJ0990';
    }
  });
  const [showPasscodeEditor, setShowPasscodeEditor] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<ShadowLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setError('');
    if (!secretPasscode?.trim()) {
      setError('Secret Room passcode is required');
      setLogs([]);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/trapdoor/logs/shadow?date=${date}`,
        {
          headers: {
            'X-Secret-Room-Passcode': secretPasscode?.trim() || 'BJ0990',
          },
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data.entries || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (operation: string) => {
    if (operation.includes('bypass') || operation.includes('unlock')) {
      return <Badge variant="destructive">Destructive</Badge>;
    }
    if (operation.includes('requested') || operation.includes('access')) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">High Risk</Badge>;
    }
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  const getSuccessBadge = (success?: boolean) => {
    if (success === undefined) return null;
    return success 
      ? <Badge variant="default" className="bg-green-500">Success</Badge>
      : <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="space-y-6">
      <Alert className="border-blue-500 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>🔒 Shadow Logs - Admin Only</strong>
          <br />
          Shadow logs contain encrypted records of all sensitive operations. Access is logged for audit purposes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Shadow Logs Authentication
          </CardTitle>
          <CardDescription>
            Enter the Secret Room passcode to view shadow logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="secretPasscode">Secret Room Passcode</Label>
            <Input
              id="secretPasscode"
              type="password"
              placeholder="Enter Secret Room passcode (example: BJ0990)"
              value={secretPasscode}
              onChange={(e) => {
                const value = e.target.value;
                setSecretPasscode(value);
                try {
                  localStorage.setItem('bobbysWorkshop.secretRoomPasscode', value);
                } catch {
                  // ignore
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shadow logs are organized by date
            </p>
          </div>

          <Button
            onClick={fetchLogs}
            disabled={loading || !secretPasscode?.trim()}
            className="w-full"
          >
            {loading ? 'Loading...' : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Shadow Logs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shadow Logs - {date}
            </CardTitle>
            <CardDescription>
              {logs.length} encrypted {logs.length === 1 ? 'entry' : 'entries'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {logs.map((log, idx) => (
                  <Card key={idx} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRiskBadge(log.operation)}
                            {getSuccessBadge(log.success)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Operation:</strong>
                            <code className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                              {log.operation}
                            </code>
                          </div>

                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Device:</strong>
                            <span className="text-sm">{log.deviceSerial}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <strong className="text-sm">User/IP:</strong>
                            <span className="text-sm">{log.userId}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Authorization:</strong>
                            <span className="text-sm font-mono">{log.authorization}</span>
                          </div>

                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2">
                              <strong className="text-sm">Metadata:</strong>
                              <pre className="text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <strong className="text-xs text-muted-foreground">Hash:</strong>
                            <code className="text-xs text-muted-foreground font-mono">
                              {log.hash}
                            </code>
                          </div>
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

      {!error && logs.length === 0 && secretPasscode?.trim() && !loading && (
        <Alert>
          <AlertDescription>
            No shadow logs found for {date}. This could mean:
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>No sensitive operations were performed on this date</li>
              <li>Logs have been rotated (retention: 90 days)</li>
              <li>The date is in the future</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
