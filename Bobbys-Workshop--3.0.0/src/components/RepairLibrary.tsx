import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DeviceMobile, Monitor, Wrench, GraduationCap } from '@phosphor-icons/react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface RepairGuide {
  id: string;
  title: string;
  device: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'battery' | 'screen' | 'charging' | 'buttons' | 'camera' | 'software';
  description: string;
  estimatedTime: string;
  tools: string[];
}

const guides: RepairGuide[] = [
  {
    id: '1',
    title: 'iPhone Battery Replacement',
    device: 'iPhone 8, 8 Plus, X',
    difficulty: 'medium',
    category: 'battery',
    description: 'Step-by-step guide to replace a worn-out battery in iPhone 8 series and X. Includes adhesive removal techniques and proper cable handling.',
    estimatedTime: '30-45 min',
    tools: ['P2 Pentalobe screwdriver', 'Y000 Tri-point screwdriver', 'Suction cup', 'Spudger', 'Heat gun or iOpener']
  },
  {
    id: '2',
    title: 'Samsung Galaxy Screen Replacement',
    device: 'Galaxy S10, S10+, S10e',
    difficulty: 'hard',
    category: 'screen',
    description: 'Detailed walkthrough for replacing cracked Galaxy S10 series AMOLED displays. Critical adhesive and frame separation techniques covered.',
    estimatedTime: '60-90 min',
    tools: ['Heat gun', 'Suction cup', 'Guitar picks', 'T3 Torx screwdriver', 'Tweezers']
  },
  {
    id: '3',
    title: 'USB-C Charging Port Cleaning',
    device: 'Universal Android',
    difficulty: 'easy',
    category: 'charging',
    description: 'Safe cleaning techniques for USB-C ports filled with lint and debris. No soldering required.',
    estimatedTime: '5-10 min',
    tools: ['Wooden toothpick', 'Compressed air', 'Isopropyl alcohol', 'Cotton swabs']
  },
  {
    id: '4',
    title: 'iPhone Stuck Button Repair',
    device: 'iPhone 6, 6S, 7, 8',
    difficulty: 'medium',
    category: 'buttons',
    description: 'Fix volume, power, or home buttons that are unresponsive or stuck. Includes cleaning and flex cable replacement.',
    estimatedTime: '20-30 min',
    tools: ['P2 Pentalobe screwdriver', 'Tri-point screwdriver', 'Spudger', 'Tweezers']
  },
  {
    id: '5',
    title: 'Android Bootloop Software Fix',
    device: 'Universal Android',
    difficulty: 'medium',
    category: 'software',
    description: 'Diagnose and resolve common bootloop issues using ADB, fastboot, and safe mode techniques. No data loss methods prioritized.',
    estimatedTime: '15-45 min',
    tools: ['USB cable', 'Computer with ADB/Fastboot', 'Device drivers']
  },
  {
    id: '6',
    title: 'iPad Battery Replacement',
    device: 'iPad Air 2, Pro 9.7"',
    difficulty: 'hard',
    category: 'battery',
    description: 'Navigate the challenging adhesive and tight tolerances of iPad battery replacements. Safety precautions emphasized.',
    estimatedTime: '90-120 min',
    tools: ['Heat gun', 'Playing cards', 'Spudger set', 'Tweezers', 'Adhesive strips']
  }
];

export function RepairLibrary() {
  const [selectedGuide, setSelectedGuide] = useState<RepairGuide | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const difficultyColors = {
    easy: 'bg-accent/20 text-accent border-accent',
    medium: 'bg-primary/20 text-primary border-primary',
    hard: 'bg-destructive/20 text-destructive border-destructive'
  };

  const categoryIcons = {
    battery: '🔋',
    screen: '📱',
    charging: '🔌',
    buttons: '🎮',
    camera: '📷',
    software: '💾'
  };

  const filteredGuides = filter === 'all' 
    ? guides 
    : guides.filter(g => g.category === filter);

  if (selectedGuide) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedGuide(null)}>
          ← Back to Library
        </Button>
        
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-display uppercase">{selectedGuide.title}</CardTitle>
                <CardDescription className="text-lg mt-2">{selectedGuide.device}</CardDescription>
              </div>
              <Badge className={`${difficultyColors[selectedGuide.difficulty]} border`}>
                {selectedGuide.difficulty.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="text-lg font-semibold">{selectedGuide.estimatedTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">
                  {categoryIcons[selectedGuide.category]} {selectedGuide.category}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{selectedGuide.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Required Tools</h3>
              <div className="flex flex-wrap gap-2">
                {selectedGuide.tools.map((tool, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1">
                    <Wrench className="w-3 h-3 mr-1" weight="duotone" />
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-lg">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-6 h-6 text-accent flex-shrink-0" weight="duotone" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Educational Resource</h4>
                  <p className="text-sm text-muted-foreground">
                    For detailed step-by-step instructions with photos, visit{' '}
                    <a href="https://www.ifixit.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                      iFixit.com
                    </a>
                    {' '}or search for "{selectedGuide.title}" on YouTube for video tutorials.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display uppercase text-primary">Repair Library</h2>
          <p className="text-muted-foreground mt-1">Community-curated repair guides for common device issues</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="battery">🔋 Battery</TabsTrigger>
          <TabsTrigger value="screen">📱 Screen</TabsTrigger>
          <TabsTrigger value="charging">🔌 Charging</TabsTrigger>
          <TabsTrigger value="buttons">🎮 Buttons</TabsTrigger>
          <TabsTrigger value="camera">📷 Camera</TabsTrigger>
          <TabsTrigger value="software">💾 Software</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map(guide => (
                <Card 
                  key={guide.id} 
                  className="cursor-pointer hover:border-primary/60 transition-colors border-2"
                  onClick={() => setSelectedGuide(guide)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{guide.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {guide.device === 'Universal Android' || guide.device === 'Universal iOS' ? (
                            <span className="flex items-center gap-1">
                              <Monitor className="w-4 h-4" weight="duotone" />
                              {guide.device}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <DeviceMobile className="w-4 h-4" weight="duotone" />
                              {guide.device}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={`${difficultyColors[guide.difficulty]} border text-xs`}>
                        {guide.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{categoryIcons[guide.category]} {guide.category}</span>
                      <span>⏱️ {guide.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
