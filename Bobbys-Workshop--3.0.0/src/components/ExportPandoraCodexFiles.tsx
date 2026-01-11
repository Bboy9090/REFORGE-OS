import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FileArrowDown,
  FileCode,
  FolderOpen,
  CheckCircle,
  Info
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

export function ExportPandoraCodexFiles() {
  const [exporting, setExporting] = useState(false);
  const [batchHistory] = useKV<any[]>('batch-flash-history', []);
  const [fastbootHistory] = useKV<any[]>('fastboot-flash-history', []);
  const [deviceConnections] = useKV<any[]>('usb-connection-history', []);

  const exportJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllData = async () => {
    setExporting(true);
    try {
      const allKeys = await window.spark.kv.keys();
      const allData: Record<string, any> = {};

      for (const key of allKeys) {
        const value = await window.spark.kv.get(key);
        allData[key] = value;
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        application: 'Pandora Codex - Device Detection Arsenal',
        data: allData
      };

      exportJSON(exportData, `pandora-codex-export-${Date.now()}.json`);
      toast.success('All data exported successfully');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const exportBatchHistory = () => {
    if (!batchHistory || batchHistory.length === 0) {
      toast.error('No batch flash history to export');
      return;
    }
    exportJSON(batchHistory, `batch-flash-history-${Date.now()}.json`);
    toast.success('Batch flash history exported');
  };

  const exportFastbootHistory = () => {
    if (!fastbootHistory || fastbootHistory.length === 0) {
      toast.error('No fastboot flash history to export');
      return;
    }
    exportJSON(fastbootHistory, `fastboot-flash-history-${Date.now()}.json`);
    toast.success('Fastboot flash history exported');
  };

  const exportDeviceConnections = () => {
    if (!deviceConnections || deviceConnections.length === 0) {
      toast.error('No device connection history to export');
      return;
    }
    exportJSON(deviceConnections, `device-connections-${Date.now()}.json`);
    toast.success('Device connection history exported');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileArrowDown size={20} weight="fill" className="text-primary" />
          <CardTitle>Export Pandora Codex Data</CardTitle>
        </div>
        <CardDescription>
          Export your device detection data, flash history, and configuration for backup or analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info size={16} />
          <AlertTitle>Data Export</AlertTitle>
          <AlertDescription>
            All exported files are in JSON format and can be imported back or analyzed with external tools.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Individual Exports</h3>
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={exportBatchHistory}
              disabled={!batchHistory || batchHistory.length === 0}
              className="justify-start"
            >
              <FileCode size={16} className="mr-2" />
              Export Batch Flash History ({batchHistory?.length || 0} sessions)
            </Button>

            <Button
              variant="outline"
              onClick={exportFastbootHistory}
              disabled={!fastbootHistory || fastbootHistory.length === 0}
              className="justify-start"
            >
              <FileCode size={16} className="mr-2" />
              Export Fastboot History ({fastbootHistory?.length || 0} operations)
            </Button>

            <Button
              variant="outline"
              onClick={exportDeviceConnections}
              disabled={!deviceConnections || deviceConnections.length === 0}
              className="justify-start"
            >
              <FileCode size={16} className="mr-2" />
              Export Device Connections ({deviceConnections?.length || 0} records)
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Complete Export</h3>
          <Button
            onClick={exportAllData}
            disabled={exporting}
            className="w-full"
          >
            <FolderOpen size={16} className="mr-2" />
            Export All Pandora Codex Data
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Exports all stored data including settings, history, and device information
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
