import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  ArrowClockwise, 
  MagnifyingGlass,
  Download,
  DeviceMobile,
  Package,
  CalendarBlank,
  File,
  CheckCircle,
  Info
} from '@phosphor-icons/react';
import { 
  getAllBrandsWithFirmware, 
  getBrandFirmwareList, 
  searchFirmware 
} from '../lib/firmware-api';
import type { BrandFirmwareList, FirmwareDatabase } from '../types/firmware';

export function FirmwareLibrary() {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brandFirmware, setBrandFirmware] = useState<BrandFirmwareList | null>(null);
  const [searchResults, setSearchResults] = useState<FirmwareDatabase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const brandsList = await getAllBrandsWithFirmware();
      setBrands(brandsList.sort());
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrandFirmware = async (brand: string) => {
    setIsLoading(true);
    setSelectedBrand(brand);
    try {
      const firmware = await getBrandFirmwareList(brand);
      setBrandFirmware(firmware);
    } catch (error) {
      console.error(`Failed to load firmware for ${brand}:`, error);
      setBrandFirmware(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchFirmware(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search firmware:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const renderFirmwareCard = (firmware: FirmwareDatabase) => (
    <Card key={`${firmware.brand}-${firmware.model}`} className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DeviceMobile size={18} className="text-primary" weight="fill" />
              <h3 className="font-semibold">{firmware.brand} {firmware.model}</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              <Package size={12} className="mr-1" />
              {firmware.versions.length} version{firmware.versions.length !== 1 ? 's' : ''} available
            </Badge>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            Latest: {firmware.latestVersion}
          </Badge>
        </div>

        {firmware.latestBuildDate && (
          <div className="text-sm flex items-center gap-2 text-muted-foreground">
            <CalendarBlank size={14} />
            <span>Released: {firmware.latestBuildDate}</span>
          </div>
        )}

        {firmware.notes && (
          <p className="text-sm text-muted-foreground">{firmware.notes}</p>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Available Versions
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-1 pr-3">
              {firmware.versions.map((version, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle 
                      size={14} 
                      className={version.version === firmware.latestVersion ? 'text-primary' : 'text-muted-foreground'} 
                      weight={version.version === firmware.latestVersion ? 'fill' : 'regular'}
                    />
                    <span className="font-mono">{version.version}</span>
                    {version.buildNumber && (
                      <span className="text-xs text-muted-foreground">({version.buildNumber})</span>
                    )}
                  </div>
                  {version.buildDate && (
                    <span className="text-xs text-muted-foreground">{version.buildDate}</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {firmware.officialDownloadUrl && (
          <Button 
            size="sm" 
            className="w-full bg-primary text-primary-foreground"
            onClick={() => window.open(firmware.officialDownloadUrl, '_blank')}
          >
            <Download className="mr-2" size={16} weight="fill" />
            Download from Official Source
          </Button>
        )}
      </div>
    </Card>
  );

  const renderBrandList = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Supported Brands</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadBrands}
            disabled={isLoading}
          >
            <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <ArrowClockwise size={20} className="animate-spin" />
            <span>Loading brands...</span>
          </div>
        </Card>
      ) : brands.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Package size={48} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No Firmware Database Available</h3>
            <p className="text-sm text-muted-foreground">
              The firmware database is not accessible. Check backend API connection.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {brands.map(brand => (
            <Button
              key={brand}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => loadBrandFirmware(brand)}
            >
              <DeviceMobile size={24} weight="fill" />
              <span className="font-semibold">{brand}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  const renderBrandModels = () => {
    if (!brandFirmware) return null;

    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedBrand('');
                  setBrandFirmware(null);
                }}
              >
                ← Back
              </Button>
              <h2 className="text-lg font-semibold">{brandFirmware.brand} Models</h2>
              <Badge variant="outline">
                {brandFirmware.models.length} model{brandFirmware.models.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <ArrowClockwise size={20} className="animate-spin" />
              <span>Loading models...</span>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {brandFirmware.models.map(model => (
              <Card key={model.model} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{model.model}</h3>
                      {model.codename && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Codename: {model.codename}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {model.latestVersion}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {model.versions.length} version{model.versions.length !== 1 ? 's' : ''} available
                  </div>

                  <ScrollArea className="h-24 border border-border rounded p-2">
                    <div className="space-y-1 text-xs font-mono">
                      {model.versions.map((version, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>{version.version}</span>
                          {version.buildNumber && (
                            <span className="text-muted-foreground">({version.buildNumber})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {model.downloadUrls && model.downloadUrls.length > 0 && (
                    <div className="flex gap-2">
                      {model.downloadUrls.map((url, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <Download size={14} className="mr-1" />
                          Source {idx + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search firmware by brand, model, or version..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-primary text-primary-foreground"
          >
            <MagnifyingGlass size={18} className={isSearching ? 'animate-pulse mr-2' : 'mr-2'} />
            Search
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="browse">
            <DeviceMobile size={16} className="mr-2" />
            Browse by Brand
          </TabsTrigger>
          <TabsTrigger value="search">
            <MagnifyingGlass size={16} className="mr-2" />
            Search Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {selectedBrand && brandFirmware ? renderBrandModels() : renderBrandList()}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          {searchResults.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {searchResults.map(firmware => renderFirmwareCard(firmware))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Info size={48} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold">No Search Results</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? `No firmware found matching "${searchQuery}"`
                    : 'Enter a search query to find firmware'}
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
