import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Users, YoutubeLogo, GithubLogo, RedditLogo } from '@phosphor-icons/react';

interface CommunityResource {
  id: string;
  name: string;
  category: 'advocacy' | 'forum' | 'video' | 'local';
  description: string;
  url: string;
}

const resources: CommunityResource[] = [
  {
    id: 'ifixit',
    name: 'iFixit',
    category: 'advocacy',
    description: 'Leading right-to-repair advocacy organization with repair guides and tools',
    url: 'https://www.ifixit.com'
  },
  {
    id: 'repair-org',
    name: 'Repair.org',
    category: 'advocacy',
    description: 'Coalition fighting for your right to repair electronics',
    url: 'https://www.repair.org'
  },
  {
    id: 'xda',
    name: 'XDA Developers',
    category: 'forum',
    description: 'Leading Android development and modding community forum',
    url: 'https://forum.xda-developers.com'
  },
  {
    id: 'reddit-repair',
    name: 'r/mobilerepair',
    category: 'forum',
    description: 'Reddit community for mobile device repair professionals',
    url: 'https://www.reddit.com/r/mobilerepair'
  },
  {
    id: 'hugh-jeffreys',
    name: 'Hugh Jeffreys',
    category: 'video',
    description: 'Right-to-repair advocate with detailed repair tutorials',
    url: 'https://www.youtube.com/@hughjeffreys'
  },
  {
    id: 'jerryrig',
    name: 'JerryRigEverything',
    category: 'video',
    description: 'Durability tests and repair tutorials for smartphones',
    url: 'https://www.youtube.com/@JerryRigEverything'
  }
];

const categoryIcons = {
  advocacy: <Users className="w-5 h-5" weight="duotone" />,
  forum: <RedditLogo className="w-5 h-5" weight="duotone" />,
  video: <YoutubeLogo className="w-5 h-5" weight="duotone" />,
  local: <Link className="w-5 h-5" weight="duotone" />
};

const categoryColors = {
  advocacy: 'bg-accent/20 text-accent border-accent',
  forum: 'bg-primary/20 text-primary border-primary',
  video: 'bg-destructive/20 text-destructive border-destructive',
  local: 'bg-secondary/20 text-secondary-foreground border-secondary'
};

export function CommunityResources() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display uppercase text-primary">Community Resources</h2>
        <p className="text-muted-foreground mt-1">Connect with repair advocates, forums, and educational channels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map(resource => (
          <Card key={resource.id} className="border-2 hover:border-primary/60 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {categoryIcons[resource.category]}
                  <div>
                    <CardTitle className="text-lg font-semibold">{resource.name}</CardTitle>
                    <CardDescription className="mt-1">{resource.description}</CardDescription>
                  </div>
                </div>
                <Badge className={`${categoryColors[resource.category]} border text-xs`}>
                  {resource.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <Link className="w-4 h-4 mr-2" weight="duotone" />
                  Visit Resource
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" weight="duotone" />
            Right to Repair Movement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Right to Repair movement advocates for consumers' ability to repair their own electronic devices. 
            By supporting repair-friendly legislation and choosing repairable products, we can reduce e-waste, 
            save money, and empower communities to fix their own technology.
          </p>
          <Button variant="outline" asChild>
            <a href="https://www.repair.org/stand-up" target="_blank" rel="noopener noreferrer">
              Learn How to Support
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
