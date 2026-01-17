import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, BookOpen, AndroidLogo, AppleLogo, Desktop, Star } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { copyTextToClipboard } from "@/lib/clipboard";

interface Tool {
  id: string;
  name: string;
  category: 'android' | 'ios' | 'cross-platform' | 'utility';
  description: string;
  platform: 'linux' | 'macos' | 'windows' | 'all';
  license: 'open-source' | 'freeware' | 'proprietary';
  installCmd: string;
  docsUrl: string;
  legalStatus: 'fully-legal' | 'authorized-only' | 'educational';
}

const publicTools: Tool[] = [
  {
    id: 'adb',
    name: 'Android Debug Bridge (ADB)',
    category: 'android',
    description: 'Official command-line tool for Android device communication, debugging, and file transfer',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install android-tools-adb  # Ubuntu/Debian\nbrew install android-platform-tools  # macOS',
    docsUrl: 'https://developer.android.com/studio/command-line/adb',
    legalStatus: 'fully-legal'
  },
  {
    id: 'fastboot',
    name: 'Fastboot',
    category: 'android',
    description: 'Official tool for flashing firmware and unlocking bootloaders on Android devices',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install android-tools-fastboot  # Ubuntu/Debian\nbrew install android-platform-tools  # macOS',
    docsUrl: 'https://developer.android.com/studio/command-line/fastboot',
    legalStatus: 'authorized-only'
  },
  {
    id: 'libimobiledevice',
    name: 'libimobiledevice',
    category: 'ios',
    description: 'Open-source library for iOS device communication without iTunes',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install libimobiledevice-utils  # Ubuntu/Debian\nbrew install libimobiledevice  # macOS',
    docsUrl: 'https://libimobiledevice.org/',
    legalStatus: 'fully-legal'
  },
  {
    id: 'scrcpy',
    name: 'scrcpy',
    category: 'android',
    description: 'Display and control Android devices from desktop, perfect for diagnostics',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install scrcpy  # Ubuntu/Debian\nbrew install scrcpy  # macOS',
    docsUrl: 'https://github.com/Genymobile/scrcpy',
    legalStatus: 'fully-legal'
  },
  {
    id: 'heimdall',
    name: 'Heimdall',
    category: 'android',
    description: 'Open-source alternative to Samsung Odin for flashing firmware',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install heimdall-flash  # Ubuntu/Debian\nbrew install heimdall  # macOS',
    docsUrl: 'https://github.com/Benjamin-Dobell/Heimdall',
    legalStatus: 'authorized-only'
  },
  {
    id: 'idevicerestore',
    name: 'idevicerestore',
    category: 'ios',
    description: 'Restore firmware on iOS devices using IPSW files',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install idevicerestore  # Ubuntu/Debian\nbrew install idevicerestore  # macOS',
    docsUrl: 'https://github.com/libimobiledevice/idevicerestore',
    legalStatus: 'authorized-only'
  },
  {
    id: 'python-adb',
    name: 'Pure Python ADB',
    category: 'android',
    description: 'Python implementation of ADB protocol for scripting and automation',
    platform: 'all',
    license: 'open-source',
    installCmd: 'pip install pure-python-adb',
    docsUrl: 'https://github.com/Swind/pure-python-adb',
    legalStatus: 'fully-legal'
  },
  {
    id: 'apktool',
    name: 'Apktool',
    category: 'android',
    description: 'Reverse engineering tool for Android APK files',
    platform: 'all',
    license: 'open-source',
    installCmd: 'sudo apt install apktool  # Ubuntu/Debian\nbrew install apktool  # macOS',
    docsUrl: 'https://github.com/iBotPeaches/Apktool',
    legalStatus: 'educational'
  }
];

export function ToolRegistry() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [favorites, setFavorites] = useKV<string[]>('bobby-tool-favorites', []);

  const legalStatusColors = {
    'fully-legal': 'bg-accent/20 text-accent border-accent',
    'authorized-only': 'bg-primary/20 text-primary border-primary',
    'educational': 'bg-secondary/20 text-secondary-foreground border-secondary'
  };

  const categoryIcons = {
    android: <AndroidLogo className="w-5 h-5" weight="duotone" />,
    ios: <AppleLogo className="w-5 h-5" weight="duotone" />,
    'cross-platform': <Desktop className="w-5 h-5" weight="duotone" />,
    utility: <Desktop className="w-5 h-5" weight="duotone" />
  };

  const filteredTools = filter === 'all' 
    ? publicTools 
    : filter === 'favorites'
    ? publicTools.filter(t => (favorites || []).includes(t.id))
    : publicTools.filter(t => t.category === filter);

  const toggleFavorite = (toolId: string) => {
    setFavorites(currentFavorites => {
      const current = currentFavorites || [];
      if (current.includes(toolId)) {
        toast.success('Removed from favorites');
        return current.filter(id => id !== toolId);
      } else {
        toast.success('Added to favorites');
        return [...current, toolId];
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    await copyTextToClipboard(text, {
      successMessage: 'Copied to clipboard',
      unavailableMessage: 'Clipboard access is unavailable. Please copy the command manually.'
    });
  };

  if (selectedTool) {
    const isFavorite = (favorites || []).includes(selectedTool.id);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedTool(null)}>
            ← Back to Registry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavorite(selectedTool.id)}
          >
            {isFavorite ? (
              <Star className="w-4 h-4 text-primary" weight="fill" />
            ) : (
              <Star className="w-4 h-4" weight="regular" />
            )}
          </Button>
        </div>
        
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {categoryIcons[selectedTool.category]}
                  <CardTitle className="text-3xl font-display uppercase">{selectedTool.name}</CardTitle>
                </div>
                <CardDescription className="text-lg">{selectedTool.description}</CardDescription>
              </div>
              <Badge className={`${legalStatusColors[selectedTool.legalStatus]} border`}>
                {selectedTool.legalStatus.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold capitalize">{selectedTool.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform</p>
                <p className="text-lg font-semibold capitalize">{selectedTool.platform}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License</p>
                <p className="text-lg font-semibold capitalize">{selectedTool.license}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Installation</h3>
              <div className="relative">
                <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  {selectedTool.installCmd}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(selectedTool.installCmd)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" asChild>
                <a href={selectedTool.docsUrl} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="w-4 h-4 mr-2" weight="duotone" />
                  Read Documentation
                </a>
              </Button>
            </div>

            {selectedTool.legalStatus === 'authorized-only' && (
              <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Authorized Use Only</h4>
                    <p className="text-sm text-muted-foreground">
                      This tool performs system-level operations and should only be used on devices you own or have explicit permission to modify. 
                      Unauthorized use may violate manufacturer warranties or local laws.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTool.legalStatus === 'educational' && (
              <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📚</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Educational Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      This tool is provided for educational and research purposes. Use responsibly and in compliance with applicable laws and software licenses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display uppercase text-primary">Tool Registry</h2>
          <p className="text-muted-foreground mt-1">Curated open-source tools for legitimate device repair and diagnostics</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All Tools</TabsTrigger>
          <TabsTrigger value="android">
            <AndroidLogo className="w-4 h-4 mr-1" weight="duotone" />
            Android
          </TabsTrigger>
          <TabsTrigger value="ios">
            <AppleLogo className="w-4 h-4 mr-1" weight="duotone" />
            iOS
          </TabsTrigger>
          <TabsTrigger value="cross-platform">
            <Desktop className="w-4 h-4 mr-1" weight="duotone" />
            Cross-Platform
          </TabsTrigger>
          <TabsTrigger value="utility">Utility</TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="w-4 h-4 mr-1" weight="duotone" />
            Favorites ({(favorites || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map(tool => {
                const isFavorite = (favorites || []).includes(tool.id);
                return (
                  <Card 
                    key={tool.id} 
                    className="cursor-pointer hover:border-primary/60 transition-colors border-2 relative"
                    onClick={() => setSelectedTool(tool)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                    >
                      {isFavorite ? (
                        <Star className="w-4 h-4 text-primary" weight="fill" />
                      ) : (
                        <Star className="w-4 h-4" weight="regular" />
                      )}
                    </Button>
                    <CardHeader>
                      <div className="flex items-start gap-3 pr-8">
                        {categoryIcons[tool.category]}
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">{tool.name}</CardTitle>
                          <CardDescription className="mt-1">{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between">
                      <Badge className={`${legalStatusColors[tool.legalStatus]} border text-xs`}>
                        {tool.legalStatus.replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{tool.license}</span>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tools found in this category.</p>
                {filter === 'favorites' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the star icon on any tool to add it to your favorites.
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
