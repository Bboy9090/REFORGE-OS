import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  LockKey,
  ShieldCheck,
  Warning,
  Info,
  GitBranch,
  Terminal,
  Book,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface PrivateTool {
  id: string;
  name: string;
  category: 'frp' | 'mdm' | 'unlock' | 'jailbreak' | 'forensic';
  platform: 'ios' | 'android' | 'both';
  description: string;
  repo?: string;
  documentation?: string;
  legalStatus: 'educational' | 'authorized-use' | 'restricted';
  notes?: string;
}

const PRIVATE_TOOLS: PrivateTool[] = [
  {
    id: 'checkra1n',
    name: 'checkra1n',
    category: 'jailbreak',
    platform: 'ios',
    description: 'DFU-based jailbreak for A5-A11 devices. Enables SSH access and filesystem exploration.',
    repo: 'https://checkra.in',
    documentation: 'https://checkra.in/support',
    legalStatus: 'educational',
    notes: 'Boot supported environments only. No activation bypass included.',
  },
  {
    id: 'palera1n',
    name: 'palera1n',
    category: 'jailbreak',
    platform: 'ios',
    description: 'Modern checkm8-based jailbreak supporting A8-A11 on iOS 15-16.',
    repo: 'https://github.com/palera1n/palera1n',
    documentation: 'https://ios.cfw.guide/installing-palera1n/',
    legalStatus: 'educational',
    notes: 'Requires DFU mode. Research and learning purposes.',
  },
  {
    id: 'libimobiledevice',
    name: 'libimobiledevice',
    category: 'forensic',
    platform: 'ios',
    description: 'Cross-platform software library for iOS device communication.',
    repo: 'https://github.com/libimobiledevice/libimobiledevice',
    documentation: 'https://libimobiledevice.org',
    legalStatus: 'educational',
    notes: 'Industry standard for legitimate iOS forensics and diagnostics.',
  },
  {
    id: 'mtkclient',
    name: 'mtkclient',
    category: 'unlock',
    platform: 'android',
    description: 'MediaTek bootloader utility for Preloader/BROM communication.',
    repo: 'https://github.com/bkerler/mtkclient',
    documentation: 'https://github.com/bkerler/mtkclient/blob/main/README.md',
    legalStatus: 'authorized-use',
    notes: 'Powerful tool. Requires physical access and proper authorization.',
  },
  {
    id: 'heimdall',
    name: 'Heimdall',
    category: 'forensic',
    platform: 'android',
    description: 'Cross-platform Samsung Odin alternative for Download mode flashing.',
    repo: 'https://github.com/Benjamin-Dobell/Heimdall',
    documentation: 'https://github.com/Benjamin-Dobell/Heimdall/blob/master/README.md',
    legalStatus: 'educational',
    notes: 'Official firmware flashing only. OEM-approved protocol.',
  },
  {
    id: 'adb',
    name: 'Android Debug Bridge',
    category: 'forensic',
    platform: 'android',
    description: 'Google\'s official command-line tool for Android device communication.',
    repo: 'https://developer.android.com/studio/command-line/adb',
    documentation: 'https://developer.android.com/studio/command-line/adb',
    legalStatus: 'educational',
    notes: 'OEM tool. Standard for Android diagnostics and development.',
  },
];

const EDUCATIONAL_RESOURCES = [
  {
    title: 'FRP/iCloud Lock - What They Are',
    description: 'Understanding Factory Reset Protection and Activation Lock security features',
    link: 'https://support.google.com/android/answer/9459346',
    type: 'official',
  },
  {
    title: 'Legitimate Recovery Methods',
    description: 'Official Google/Apple account recovery procedures',
    link: 'https://support.google.com/accounts/answer/7682439',
    type: 'official',
  },
  {
    title: 'Proof of Ownership',
    description: 'Carrier and OEM unlock procedures for authorized users',
    link: 'https://www.apple.com/legal/internet-services/icloud/en/terms.html',
    type: 'legal',
  },
  {
    title: 'Right to Repair Movement',
    description: 'Community advocacy for device repair rights and security lock transparency',
    link: 'https://www.repair.org',
    type: 'community',
  },
  {
    title: 'iOS Jailbreaking Legality (USA)',
    description: 'DMCA exemptions for jailbreaking smartphones for interoperability',
    link: 'https://www.eff.org/deeplinks/2015/10/victory-users-librarian-congress-renews-and-expands-protections-fair-use',
    type: 'legal',
  },
];

export function BobbysVault() {
  const [isUnlocked, setIsUnlocked] = useKV<boolean>('vault-unlocked', false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const VAULT_PASSWORD = 'bobby1990'; 

  const handleUnlock = () => {
    if (vaultPassword === VAULT_PASSWORD) {
      setIsUnlocked(true);
      toast.success('Vault unlocked - Welcome back, Bobby');
      setVaultPassword('');
    } else {
      toast.error('Incorrect password');
    }
  };

  const filteredTools =
    selectedCategory === 'all'
      ? PRIVATE_TOOLS
      : PRIVATE_TOOLS.filter((t) => t.category === selectedCategory);

  if (!isUnlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-accent/30 bg-card/90">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <LockKey className="w-8 h-8 text-accent" weight="duotone" />
            </div>
            <CardTitle className="text-2xl font-display uppercase">Bobby's Vault</CardTitle>
            <CardDescription>
              Private tool registry and educational resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="vault-password">Vault Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="vault-password"
                    type={showPassword ? 'text' : 'password'}
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={handleUnlock}>Unlock</Button>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Warning className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-foreground">Educational Access Only</p>
                  <p className="text-muted-foreground">
                    This vault contains research tools and educational resources for legitimate repair
                    and forensic work. All content adheres to legal and ethical guidelines.
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
          <h2 className="text-3xl font-display uppercase tracking-wide">Bobby's Vault</h2>
          <p className="text-muted-foreground mt-1">Private tool registry and resources</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsUnlocked(false);
            toast.info('Vault locked');
          }}
        >
          <LockKey className="w-4 h-4 mr-2" />
          Lock Vault
        </Button>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">
            <Terminal className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Book className="w-4 h-4 mr-2" />
            Educational Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <Card className="bg-card/50 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Store-Safe Policy</p>
                  <p className="text-muted-foreground">
                    All tools listed here are for detection, diagnosis, education, and authorized use only.
                    No automated bypass functionality. No identity manipulation. Always verify ownership
                    and authorization before use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Tools
            </Button>
            <Button
              variant={selectedCategory === 'jailbreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('jailbreak')}
            >
              Jailbreak
            </Button>
            <Button
              variant={selectedCategory === 'forensic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('forensic')}
            >
              Forensic
            </Button>
            <Button
              variant={selectedCategory === 'unlock' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('unlock')}
            >
              Unlock
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <Badge
                          variant={
                            tool.legalStatus === 'educational'
                              ? 'default'
                              : tool.legalStatus === 'authorized-use'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {tool.legalStatus}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tool.platform}
                        </Badge>
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tool.notes && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{tool.notes}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {tool.repo && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.repo} target="_blank" rel="noopener noreferrer">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Repository
                        </a>
                      </Button>
                    )}
                    {tool.documentation && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.documentation} target="_blank" rel="noopener noreferrer">
                          <Book className="w-4 h-4 mr-2" />
                          Documentation
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="bg-card/50 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Educational Purpose</p>
                  <p className="text-muted-foreground">
                    These resources explain security locks, legitimate recovery procedures, and legal
                    frameworks. Understanding these systems helps technicians provide accurate guidance
                    to customers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {EDUCATIONAL_RESOURCES.map((resource, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="outline" className="text-xs capitalize">
                          {resource.type}
                        </Badge>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.link} target="_blank" rel="noopener noreferrer">
                      <Book className="w-4 h-4 mr-2" />
                      Read More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
