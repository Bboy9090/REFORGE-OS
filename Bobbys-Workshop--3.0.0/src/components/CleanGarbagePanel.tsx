import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trash, 
  Broom,
  HardDrives,
  Scan,
  CheckCircle,
  Warning,
  Clock,
  Database
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

interface CacheCategory {
  id: string;
  name: string;
  description: string;
  size: number;
  selected: boolean;
  icon: string;
}

export function CleanGarbagePanel() {
  const { backendAvailable } = useApp();
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [categories, setCategories] = useState<CacheCategory[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);

  const mockCategories: CacheCategory[] = [
    { id: 'app_cache', name: 'App Cache', description: 'Temporary app data', size: 523000000, selected: true, icon: '📱' },
    { id: 'browser_cache', name: 'Browser Cache', description: 'Web browser temporary files', size: 342000000, selected: true, icon: '🌐' },
    { id: 'system_logs', name: 'System Logs', description: 'Diagnostic and crash logs', size: 89000000, selected: true, icon: '📄' },
    { id: 'temp_files', name: 'Temp Files', description: 'System temporary files', size: 156000000, selected: true, icon: '🗂️' },
    { id: 'cookies', name: 'Cookies & Data', description: 'Web cookies and site data', size: 23000000, selected: false, icon: '🍪' },
    { id: 'downloads', name: 'Download Cache', description: 'Temporary download files', size: 234000000, selected: true, icon: '⬇️' },
    { id: 'thumbnails', name: 'Image Thumbnails', description: 'Generated preview images', size: 445000000, selected: true, icon: '🖼️' },
    { id: 'offline_data', name: 'Offline Data', description: 'App offline storage', size: 187000000, selected: false, icon: '💾' },
  ];

  useEffect(() => {
    const total = categories.reduce((sum, cat) => sum + cat.size, 0);
    const selected = categories.filter(c => c.selected).reduce((sum, cat) => sum + cat.size, 0);
    setTotalSize(total);
    setSelectedSize(selected);
  }, [categories]);

  const handleScan = async () => {
    setScanning(true);
    
    if (!backendAvailable) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCategories(mockCategories);
      setScanning(false);
      toast.success('Scan complete (demo data)');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/device/cache/scan');
      const data = await response.json();
      setCategories(data.categories || mockCategories);
      toast.success(`Found ${formatBytes(data.totalSize || totalSize)} of cache data`);
    } catch (error) {
      setCategories(mockCategories);
      toast.error('Scan failed - showing demo data');
    } finally {
      setScanning(false);
    }
  };

  const handleClean = async () => {
    if (!backendAvailable) {
      toast.error('Backend required for cleaning operations');
      return;
    }

    const selectedIds = categories.filter(c => c.selected).map(c => c.id);
    if (selectedIds.length === 0) {
      toast.error('No categories selected');
      return;
    }

    setCleaning(true);
    setCleanProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setCleanProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:3001/api/device/cache/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedIds })
      });

      clearInterval(progressInterval);
      setCleanProgress(100);

      if (!response.ok) throw new Error('Clean failed');

      const data = await response.json();
      toast.success(`Cleaned ${formatBytes(data.freedSpace || selectedSize)}`);
      
      setTimeout(() => {
        setCategories([]);
        setCleanProgress(0);
        setCleaning(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to clean cache');
      setCleaning(false);
      setCleanProgress(0);
    }
  };

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, selected: !cat.selected } : cat
    ));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Clean Garbage</h1>
        <p className="text-muted-foreground">
          Remove temporary files, cache, and unnecessary data to free up space
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrives className="w-4 h-4" />
              Total Cache Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {formatBytes(totalSize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {formatBytes(selectedSize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {categories.filter(c => c.selected).length} selected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Cleaned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              Never
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No cleanup history
            </p>
          </CardContent>
        </Card>
      </div>

      {cleaning && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Cleaning in progress...</span>
                <span className="text-sm text-muted-foreground">{cleanProgress}%</span>
              </div>
              <Progress value={cleanProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database />
            Cache Categories
          </CardTitle>
          <CardDescription>
            Select categories to clean. Unchecked items will be preserved.
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleScan}
              disabled={scanning || cleaning}
              variant="outline"
              size="sm"
            >
              {scanning ? (
                <>
                  <Scan className="mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="mr-2" />
                  Scan Device
                </>
              )}
            </Button>
            {categories.length > 0 && (
              <Button
                onClick={handleClean}
                disabled={cleaning || selectedSize === 0}
                size="sm"
              >
                <Broom className="mr-2" />
                Clean Selected ({formatBytes(selectedSize)})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scan performed yet</p>
              <p className="text-sm mt-2">Click "Scan Device" to analyze cache data</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={category.selected}
                        onCheckedChange={() => toggleCategory(category.id)}
                        disabled={cleaning}
                      />
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatBytes(category.size)}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Warning className="h-4 w-4" />
        <AlertDescription>
          Cleaning cache is safe and won't delete personal data. Some apps may need to re-download data after cleaning.
        </AlertDescription>
      </Alert>
    </div>
  );
}
