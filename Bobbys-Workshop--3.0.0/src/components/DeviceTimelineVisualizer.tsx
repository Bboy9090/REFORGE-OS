import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CalendarBlank,
  Clock,
  Circle,
  TrendUp
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { getUSBVendorName } from '@/lib/deviceDetection';

interface ConnectionEvent {
  id: string;
  type: 'connect' | 'disconnect';
  timestamp: number;
  duration?: number;
  deviceInfo: {
    vendorId: number;
    productId: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
  };
}

export function DeviceTimelineVisualizer() {
  const [connectionHistory] = useKV<ConnectionEvent[]>('device-connection-history', []);

  const timelineData = useMemo(() => {
    const history = connectionHistory || [];
    const now = Date.now();
    
    const last24Hours: ConnectionEvent[] = [];
    const last7Days: ConnectionEvent[] = [];
    const last30Days: ConnectionEvent[] = [];
    
    history.forEach(event => {
      const age = now - event.timestamp;
      if (age < 24 * 60 * 60 * 1000) {
        last24Hours.push(event);
      }
      if (age < 7 * 24 * 60 * 60 * 1000) {
        last7Days.push(event);
      }
      if (age < 30 * 24 * 60 * 60 * 1000) {
        last30Days.push(event);
      }
    });
    
    const hourlyData = new Array(24).fill(0).map(() => ({ connects: 0, disconnects: 0 }));
    last24Hours.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      if (event.type === 'connect') {
        hourlyData[hour].connects++;
      } else {
        hourlyData[hour].disconnects++;
      }
    });
    
    const dailyData = new Array(7).fill(0).map(() => ({ connects: 0, disconnects: 0 }));
    last7Days.forEach(event => {
      const daysAgo = Math.floor((now - event.timestamp) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7) {
        if (event.type === 'connect') {
          dailyData[6 - daysAgo].connects++;
        } else {
          dailyData[6 - daysAgo].disconnects++;
        }
      }
    });
    
    const weeklyData = new Array(4).fill(0).map(() => ({ connects: 0, disconnects: 0 }));
    last30Days.forEach(event => {
      const weeksAgo = Math.floor((now - event.timestamp) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo < 4) {
        if (event.type === 'connect') {
          weeklyData[3 - weeksAgo].connects++;
        } else {
          weeklyData[3 - weeksAgo].disconnects++;
        }
      }
    });
    
    return {
      hourly: hourlyData,
      daily: dailyData,
      weekly: weeklyData,
      last24Hours,
      last7Days,
      last30Days,
    };
  }, [connectionHistory]);

  const renderBarChart = (data: { connects: number; disconnects: number }[], labels: string[]) => {
    const maxValue = Math.max(...data.map(d => d.connects + d.disconnects), 1);
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const total = item.connects + item.disconnects;
          const connectPercent = total > 0 ? (item.connects / total) * 100 : 0;
          const height = (total / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-xs text-muted-foreground text-right">
                {labels[index]}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden flex">
                  {total > 0 && (
                    <>
                      <div 
                        className="bg-green-500/70 transition-all duration-300"
                        style={{ width: `${connectPercent}%` }}
                      />
                      <div 
                        className="bg-red-500/70 transition-all duration-300"
                        style={{ width: `${100 - connectPercent}%` }}
                      />
                    </>
                  )}
                </div>
                <div className="w-12 text-xs font-semibold text-right">
                  {total}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const getDayLabel = (daysAgo: number) => {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getWeekLabel = (weeksAgo: number) => {
    if (weeksAgo === 0) return 'This week';
    if (weeksAgo === 1) return 'Last week';
    return `${weeksAgo} weeks ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarBlank size={20} className="text-primary" weight="duotone" />
          <CardTitle>Connection Timeline</CardTitle>
        </div>
        <CardDescription>
          Visualize device connection patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="24h" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="24h" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-green-500" />
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-red-500" />
                  <span className="text-xs text-muted-foreground">Disconnected</span>
                </div>
              </div>
              <Badge variant="secondary">
                {timelineData.last24Hours.length} events
              </Badge>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              {renderBarChart(
                timelineData.hourly,
                Array.from({ length: 24 }, (_, i) => getHourLabel(i))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="7d" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-green-500" />
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-red-500" />
                  <span className="text-xs text-muted-foreground">Disconnected</span>
                </div>
              </div>
              <Badge variant="secondary">
                {timelineData.last7Days.length} events
              </Badge>
            </div>
            <div className="pt-4">
              {renderBarChart(
                timelineData.daily,
                Array.from({ length: 7 }, (_, i) => getDayLabel(6 - i))
              )}
            </div>
          </TabsContent>

          <TabsContent value="30d" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-green-500" />
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={12} weight="fill" className="text-red-500" />
                  <span className="text-xs text-muted-foreground">Disconnected</span>
                </div>
              </div>
              <Badge variant="secondary">
                {timelineData.last30Days.length} events
              </Badge>
            </div>
            <div className="pt-4">
              {renderBarChart(
                timelineData.weekly,
                Array.from({ length: 4 }, (_, i) => getWeekLabel(3 - i))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
