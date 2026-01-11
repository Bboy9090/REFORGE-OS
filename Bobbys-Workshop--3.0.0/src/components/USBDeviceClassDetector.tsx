import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Usb, RefreshCw, Info, Filter } from 'lucide-react';
import { detectUSBDevicesEnhanced, getUSBVendorName, type EnhancedUSBDeviceInfo } from '@/lib/deviceDetection';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DeviceClassFilter = 'storage' | 'audio' | 'hid' | 'video' | 'printer' | 'hub' | 'wireless' | 'vendor';

export function USBDeviceClassDetector() {
  const [devices, setDevices] = useState<EnhancedUSBDeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<DeviceClassFilter>>(new Set());

  const refresh = async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setSupported(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const detected = await detectUSBDevicesEnhanced();
      setDevices(detected);
      toast.success('USB Devices Scanned', {
        description: `Found ${detected.length} device(s) with class information`,
      });
    } catch (error) {
      toast.error('Failed to scan USB devices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const requestDevice = async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      toast.error('WebUSB not supported');
      return;
    }

    try {
      await nav.usb.requestDevice({ filters: [] });
      await refresh();
    } catch (error) {
      if (error instanceof Error && error.name !== 'NotFoundError') {
        toast.error('Failed to request device');
      }
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleFilter = (filter: DeviceClassFilter) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
  };

  const filterDevicesByClass = (device: EnhancedUSBDeviceInfo): boolean => {
    if (activeFilters.size === 0) return true;
    
    return device.classes.some(cls => {
      const className = cls.className.toLowerCase();
      
      if (activeFilters.has('storage') && (className.includes('storage') || className.includes('mass storage'))) {
        return true;
      }
      if (activeFilters.has('audio') && className.includes('audio')) {
        return true;
      }
      if (activeFilters.has('hid') && (className.includes('hid') || className.includes('human interface'))) {
        return true;
      }
      if (activeFilters.has('video') && className.includes('video')) {
        return true;
      }
      if (activeFilters.has('printer') && className.includes('printer')) {
        return true;
      }
      if (activeFilters.has('hub') && className.includes('hub')) {
        return true;
      }
      if (activeFilters.has('wireless') && (className.includes('wireless') || className.includes('bluetooth'))) {
        return true;
      }
      if (activeFilters.has('vendor') && className.includes('vendor')) {
        return true;
      }
      
      return false;
    });
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(filterDevicesByClass);
  }, [devices, activeFilters]);

  const filterOptions: { value: DeviceClassFilter; label: string; icon: string }[] = [
    { value: 'storage', label: 'Storage Devices', icon: '💾' },
    { value: 'audio', label: 'Audio Devices', icon: '🎵' },
    { value: 'hid', label: 'HID Devices', icon: '⌨️' },
    { value: 'video', label: 'Video Devices', icon: '📹' },
    { value: 'printer', label: 'Printers', icon: '🖨️' },
    { value: 'hub', label: 'USB Hubs', icon: '🔌' },
    { value: 'wireless', label: 'Wireless', icon: '📡' },
    { value: 'vendor', label: 'Vendor Specific', icon: '⚙️' },
  ];

  if (!supported) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Usb className="w-5 h-5" />
            USB Device Class Detection
          </CardTitle>
          <CardDescription>
            WebUSB API is not supported in this browser. Try Chrome, Edge, or Opera.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Usb className="w-5 h-5" />
              USB Device Class Detection
            </CardTitle>
            <CardDescription>
              Identify device types: storage, audio, HID, video, and more
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {activeFilters.size > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFilters.size}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Device Classes</span>
                  {activeFilters.size > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={activeFilters.has(option.value)}
                    onCheckedChange={() => toggleFilter(option.value)}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={requestDevice}
              disabled={loading}
            >
              <Usb className="w-4 h-4 mr-2" />
              Connect Device
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeFilters.size > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Array.from(activeFilters).map((filter) => {
              const option = filterOptions.find(o => o.value === filter);
              return (
                <Badge key={filter} variant="secondary" className="gap-1">
                  <span>{option?.icon}</span>
                  {option?.label}
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
        {loading && devices.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Scanning USB devices...
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Usb className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No USB Devices Found</p>
            <p className="text-sm">Click "Connect Device" to grant access to a USB device</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No Devices Match Selected Filters</p>
            <p className="text-sm mb-3">Try adjusting your filter settings</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-3">
              Showing {filteredDevices.length} of {devices.length} device{devices.length !== 1 ? 's' : ''}
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {filteredDevices.map((device, index) => (
                <AccordionItem
                key={device.id}
                value={device.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {device.classes[0]?.icon || '⚙️'}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">
                          {device.productName || `Device ${index + 1}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getUSBVendorName(device.vendorId)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {device.classes.slice(0, 2).map((cls, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cls.className}
                        </Badge>
                      ))}
                      {device.classes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{device.classes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Vendor ID</div>
                        <div className="font-mono">0x{device.vendorId.toString(16).padStart(4, '0').toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Product ID</div>
                        <div className="font-mono">0x{device.productId.toString(16).padStart(4, '0').toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">USB Version</div>
                        <div className="font-mono">{device.usbVersion}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Device Version</div>
                        <div className="font-mono">{device.deviceVersion}</div>
                      </div>
                      {device.serialNumber && (
                        <div className="col-span-2">
                          <div className="text-muted-foreground text-xs mb-1">Serial Number</div>
                          <div className="font-mono text-xs">{device.serialNumber}</div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Device Classes</h4>
                      </div>
                      <div className="space-y-3">
                        {device.classes.map((cls, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{cls.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm mb-1">
                                  {cls.className}
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {cls.description}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <Badge variant="outline" className="font-mono">
                                    Class: 0x{cls.classCode.toString(16).padStart(2, '0').toUpperCase()}
                                  </Badge>
                                  {cls.subclassCode !== undefined && (
                                    <Badge variant="outline" className="font-mono">
                                      Subclass: 0x{cls.subclassCode.toString(16).padStart(2, '0').toUpperCase()}
                                    </Badge>
                                  )}
                                  {cls.protocolCode !== undefined && (
                                    <Badge variant="outline" className="font-mono">
                                      Protocol: 0x{cls.protocolCode.toString(16).padStart(2, '0').toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                                {(cls.subclassName || cls.protocolName) && (
                                  <div className="mt-2 space-y-1 text-xs">
                                    {cls.subclassName && (
                                      <div className="text-muted-foreground">
                                        Subclass: {cls.subclassName}
                                      </div>
                                    )}
                                    {cls.protocolName && (
                                      <div className="text-muted-foreground">
                                        Protocol: {cls.protocolName}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {device.capabilities.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Capabilities</h4>
                          <div className="flex flex-wrap gap-2">
                            {device.capabilities.map((cap, i) => (
                              <Badge key={i} variant="secondary">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
