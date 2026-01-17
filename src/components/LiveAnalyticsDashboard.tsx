import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  DeviceMobile,
  TrendUp,
  Clock,
  Cpu,
  HardDrive,
  Zap,
  WifiHigh,
  CheckCircle,
  XCircle,
  Circle
} from '@phosphor-icons/react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WS_URL = import.meta.env.VITE_ANALYTICS_WS_URL || 'ws://localhost:3001/ws/analytics';

interface DeviceMetrics {
  deviceId: string;
  deviceName: string;
  platform: 'android' | 'ios' | 'windows' | 'iot' | 'unknown';
  status: 'online' | 'offline' | 'busy';
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  temperature: number;
  batteryLevel?: number;
  networkLatency: number;
  lastUpdate: number;
  workflows: {
    running: number;
    completed: number;
    failed: number;
  };
}

interface WorkflowEvent {
  id: string;
  workflowName: string;
  deviceId: string;
  status: 'started' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  timestamp: number;
}

export function LiveAnalyticsDashboard() {
  const [devices, setDevices] = useState<Map<string, DeviceMetrics>>(new Map());
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[LiveAnalytics] WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('[LiveAnalytics] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[LiveAnalytics] WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('[LiveAnalytics] WebSocket disconnected');
          setIsConnected(false);
          
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('[LiveAnalytics] Connection error:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'device_metrics':
        setDevices(prev => {
          const updated = new Map(prev);
          updated.set(data.deviceId, {
            ...data.metrics,
            deviceId: data.deviceId,
            lastUpdate: Date.now()
          });
          return updated;
        });
        
        // Update historical data
        setHistoricalData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            cpu: data.metrics.cpuUsage,
            memory: data.metrics.memoryUsage,
            storage: data.metrics.storageUsage,
            temperature: data.metrics.temperature
          }];
          return newData.slice(-30); // Keep last 30 data points
        });
        break;

      case 'workflow_event':
        setWorkflowEvents(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(e => e.id === data.event.id);
          
          if (existingIndex >= 0) {
            updated[existingIndex] = { ...data.event, timestamp: Date.now() };
          } else {
            updated.unshift({ ...data.event, timestamp: Date.now() });
          }
          
          return updated.slice(0, 50); // Keep last 50 events
        });
        break;

      case 'device_disconnected':
        setDevices(prev => {
          const updated = new Map(prev);
          const device = updated.get(data.deviceId);
          if (device) {
            updated.set(data.deviceId, { ...device, status: 'offline' });
          }
          return updated;
        });
        break;
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-500';
      case 'busy': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      case 'busy': return <Circle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android':
      case 'ios':
        return <DeviceMobile className="w-5 h-5" />;
      case 'windows':
      case 'iot':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const devicesArray = Array.from(devices.values());
  const selectedDeviceData = selectedDevice ? devices.get(selectedDevice) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Analytics</h1>
          <p className="text-muted-foreground">Real-time device and workflow monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Badge variant="outline">
            {devicesArray.length} Device{devicesArray.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                <DeviceMobile className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{devicesArray.length}</div>
                <p className="text-xs text-muted-foreground">
                  {devicesArray.filter(d => d.status === 'online').length} online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workflowEvents.filter(w => w.status === 'running').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {workflowEvents.filter(w => w.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {devicesArray.length > 0
                    ? Math.round(devicesArray.reduce((acc, d) => acc + d.cpuUsage, 0) / devicesArray.length)
                    : 0}%
                </div>
                <Progress 
                  value={devicesArray.length > 0
                    ? devicesArray.reduce((acc, d) => acc + d.cpuUsage, 0) / devicesArray.length
                    : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Memory</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {devicesArray.length > 0
                    ? Math.round(devicesArray.reduce((acc, d) => acc + d.memoryUsage, 0) / devicesArray.length)
                    : 0}%
                </div>
                <Progress 
                  value={devicesArray.length > 0
                    ? devicesArray.reduce((acc, d) => acc + d.memoryUsage, 0) / devicesArray.length
                    : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Real-time charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Trend</CardTitle>
                <CardDescription>Last 30 measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#2FD3FF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory & Storage</CardTitle>
                <CardDescription>Resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="memory" stackId="1" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="storage" stackId="1" stroke="#F1C40F" fill="#F1C40F" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devicesArray.map(device => (
              <Card 
                key={device.deviceId} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedDevice === device.deviceId ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDevice(device.deviceId)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(device.platform)}
                      <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="text-xs font-medium capitalize">{device.status}</span>
                    </div>
                  </div>
                  <CardDescription className="font-mono text-xs">{device.deviceId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-medium">{device.cpuUsage}%</span>
                    </div>
                    <Progress value={device.cpuUsage} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="font-medium">{device.memoryUsage}%</span>
                    </div>
                    <Progress value={device.memoryUsage} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{device.temperature}°C</span>
                    </div>
                    {device.batteryLevel !== undefined && (
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <WifiHigh className="w-3 h-3" />
                      <span>{device.networkLatency}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(device.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      {device.workflows.running} Running
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {device.workflows.completed} Done
                    </Badge>
                    {device.workflows.failed > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {device.workflows.failed} Failed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {devicesArray.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DeviceMobile className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No devices connected</p>
                  <p className="text-sm text-muted-foreground mt-2">Connect a device to see live analytics</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Events</CardTitle>
              <CardDescription>Live workflow execution updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {workflowEvents.map(event => (
                    <Card key={event.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span className="font-medium">{event.workflowName}</span>
                        </div>
                        <Badge variant={
                          event.status === 'completed' ? 'default' :
                          event.status === 'failed' ? 'destructive' :
                          'secondary'
                        }>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Device: {event.deviceId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Step: {event.currentStep}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{event.progress}%</span>
                          </div>
                          <Progress value={event.progress} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  ))}

                  {workflowEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Activity className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No workflow events</p>
                      <p className="text-sm text-muted-foreground mt-2">Execute a workflow to see live updates</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {selectedDeviceData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Device Details: {selectedDeviceData.deviceName}</CardTitle>
                  <CardDescription>Real-time metrics and performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <p className="text-2xl font-bold">{selectedDeviceData.cpuUsage}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <p className="text-2xl font-bold">{selectedDeviceData.memoryUsage}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <p className="text-2xl font-bold">{selectedDeviceData.storageUsage}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="text-2xl font-bold">{selectedDeviceData.temperature}°C</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Historical Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={historicalData.slice(-10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cpu" fill="#2FD3FF" name="CPU %" />
                        <Bar dataKey="memory" fill="#2ECC71" name="Memory %" />
                        <Bar dataKey="temperature" fill="#E74C3C" name="Temp °C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendUp className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a device to view detailed metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
