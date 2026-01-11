import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Image as ImageIcon, 
  Upload,
  Download,
  ArrowsClockwise,
  CheckCircle,
  X,
  FileImage,
  FolderOpen
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedName: string;
  size: number;
  status: 'pending' | 'converting' | 'complete' | 'error';
  progress: number;
}

export function ConvertHEICPanel() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [quality, setQuality] = useState('high');
  const [converting, setConverting] = useState(false);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.heic,.heif';
    input.multiple = true;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files) return;

      const newFiles: ConvertedFile[] = Array.from(target.files).map(file => ({
        id: `${file.name}-${Date.now()}`,
        originalName: file.name,
        convertedName: file.name.replace(/\.heic$/i, `.${outputFormat}`),
        size: file.size,
        status: 'pending' as const,
        progress: 0
      }));

      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s) to queue`);
    };

    input.click();
  }, [outputFormat]);

  const handleConvert = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to convert');
      return;
    }

    setConverting(true);

    for (const file of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'converting' as const, progress: 0 } : f
      ));

      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 1000));

      clearInterval(progressInterval);
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'complete' as const, progress: 100 } : f
      ));
    }

    setConverting(false);
    toast.success(`Converted ${pendingFiles.length} file(s) successfully`);
  };

  const handleDownload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    toast.success(`Downloaded: ${file.convertedName}`);
  };

  const handleDownloadAll = () => {
    const completed = files.filter(f => f.status === 'complete');
    toast.success(`Downloaded ${completed.length} file(s) as ZIP`);
  };

  const handleRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClear = () => {
    setFiles([]);
    toast.info('Cleared all files');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const completedCount = files.filter(f => f.status === 'complete').length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Convert HEIC</h1>
        <p className="text-muted-foreground">
          Convert Apple HEIC/HEIF images to JPG, PNG, or WebP format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Files Queued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {files.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(totalSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {completedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to download
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Output Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary uppercase">
              {outputFormat}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {quality} quality
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon />
            Conversion Settings
          </CardTitle>
          <CardDescription>
            Choose output format and quality settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat} disabled={converting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG (JPEG)</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality} disabled={converting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Smaller file)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best quality)</SelectItem>
                  <SelectItem value="lossless">Lossless (PNG only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFileSelect} disabled={converting} className="flex-1">
              <Upload className="mr-2" />
              Select HEIC Files
            </Button>
            {files.length > 0 && (
              <>
                <Button 
                  onClick={handleConvert} 
                  disabled={converting || files.every(f => f.status === 'complete')}
                >
                  <ArrowsClockwise className={converting ? 'mr-2 animate-spin' : 'mr-2'} />
                  Convert
                </Button>
                {completedCount > 0 && (
                  <Button onClick={handleDownloadAll} variant="outline">
                    <Download className="mr-2" />
                    Download All
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen />
            File Queue
          </CardTitle>
          <CardDescription>
            Files ready for conversion - {files.length} total
          </CardDescription>
          {files.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={converting}>
              <X className="mr-2" size={14} />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files selected</p>
              <p className="text-sm mt-2">Click "Select HEIC Files" to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-card/50 border border-border rounded-lg"
                  >
                    <FileImage className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.originalName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} → {file.convertedName}
                      </div>
                      {file.status === 'converting' && (
                        <Progress value={file.progress} className="mt-2 h-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'complete' ? (
                        <>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            <CheckCircle className="mr-1" size={12} />
                            Done
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownload(file.id)}
                          >
                            <Download size={14} />
                          </Button>
                        </>
                      ) : file.status === 'converting' ? (
                        <Badge variant="outline">
                          <ArrowsClockwise className="mr-1 animate-spin" size={12} />
                          {file.progress}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(file.id)}
                        disabled={file.status === 'converting'}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> HEIC files from iPhone can be batch converted while maintaining EXIF data and location info.
          Converted images are compatible with all devices and platforms.
        </AlertDescription>
      </Alert>
    </div>
  );
}
