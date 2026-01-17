import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePluginRegistry, usePluginDownload } from '@/hooks/use-plugin-registry';
import type { RegistryPlugin } from '@/types/plugin-registry';
import { 
  MagnifyingGlass, 
  Download, 
  Shield, 
  Star, 
  TrendUp,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export function PluginRegistryBrowser() {
  const { fetchManifest, searchPlugins, isLoading } = usePluginRegistry();
  const [plugins, setPlugins] = useState<RegistryPlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  const loadPlugins = useCallback(async () => {
    try {
      const manifest = await fetchManifest();
      setPlugins(manifest.plugins);
    } catch {
      toast.error('Failed to load plugins from registry');
    }
  }, [fetchManifest, setPlugins]);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPlugins();
      return;
    }

    try {
      const results = await searchPlugins(searchQuery, {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
        certified: certifiedOnly || undefined,
      });
      setPlugins(results);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    if (categoryFilter !== 'all' && plugin.category !== categoryFilter) return false;
    if (platformFilter !== 'all' && plugin.platform !== platformFilter) return false;
    if (certifiedOnly && !plugin.certified) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              size={18}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="flash">Flash</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="android">Android</SelectItem>
              <SelectItem value="ios">iOS</SelectItem>
              <SelectItem value="cross-platform">Cross-Platform</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} disabled={isLoading}>
            <MagnifyingGlass weight="bold" className="mr-2" />
            Search
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={certifiedOnly}
              onChange={(e) => setCertifiedOnly(e.target.checked)}
              className="rounded border-border"
            />
            <Shield weight="fill" className="text-primary" size={16} />
            <span>Certified only</span>
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <PluginRegistryCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No plugins found</p>
        </Card>
      )}
    </div>
  );
}

function PluginRegistryCard({ plugin }: { plugin: RegistryPlugin }) {
  const { download, isDownloading, progress } = usePluginDownload(plugin.id);

  const handleDownload = async () => {
    try {
      const blob = await download();
      toast.success(`Downloaded ${plugin.name} v${plugin.version}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{plugin.name}</h4>
            {plugin.certified && (
              <Badge className="bg-primary/20 text-primary border-primary text-xs">
                <Shield weight="fill" size={12} className="mr-1" />
                Certified
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">v{plugin.version} • by {plugin.author}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plugin.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs capitalize">{plugin.category}</Badge>
        <Badge variant="outline" className="text-xs capitalize">{plugin.platform}</Badge>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Download size={14} />
          <span>{plugin.downloads.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star weight="fill" className="text-warning" size={14} />
          <span>{plugin.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendUp size={14} />
          <span>{(plugin.size / 1024).toFixed(0)} KB</span>
        </div>
      </div>

      {plugin.securityScan && (
        <div className={`flex items-center gap-2 p-2 rounded mb-3 text-xs ${
          plugin.securityScan.status === 'passed' 
            ? 'bg-success/10 text-success' 
            : plugin.securityScan.status === 'failed'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted'
        }`}>
          {plugin.securityScan.status === 'passed' ? (
            <CheckCircle weight="fill" size={14} />
          ) : (
            <Warning weight="fill" size={14} />
          )}
          <span>Security scan: {plugin.securityScan.status}</span>
        </div>
      )}

      {isDownloading && (
        <div className="mb-3">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% downloaded</p>
        </div>
      )}

      <Button 
        onClick={handleDownload} 
        disabled={isDownloading}
        className="w-full"
        size="sm"
      >
        <Download weight="bold" className="mr-2" />
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>
    </Card>
  );
}
