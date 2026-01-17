import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, Wrench, Users, GraduationCap } from '@phosphor-icons/react';

export function AboutBobby() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display uppercase text-primary">Bobby's World</h1>
        <p className="text-xl text-muted-foreground">Bronx Workshop Edition</p>
      </div>

      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" weight="duotone" />
            The Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Bobby's World started in a small Bronx apartment in the 2000s - just a workspace, some tools, 
            and a boom-box playing 90s hip-hop. The mission was simple: fix phones for the neighborhood, 
            one device at a time, keeping technology accessible and repairable for everyone.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This toolkit carries that same spirit - providing free, honest repair knowledge and legitimate 
            diagnostic tools to empower technicians and device owners. No corporate gatekeeping, no planned 
            obsolescence acceptance, just real solutions for real problems.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-primary" weight="duotone" />
              Open Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All tools in this registry are open-source or freely available. No paywalls, no subscriptions, 
              just honest repair utilities.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-accent" weight="duotone" />
              Education First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every guide emphasizes learning and understanding, not just quick fixes. Knowledge empowers 
              sustainable repair practices.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-destructive" weight="duotone" />
              Community Powered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Built by repair technicians, for repair technicians. This project stands with the global Right 
              to Repair movement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle>Legal & Ethical Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Bobby's World is strictly for authorized repair work.</strong> All tools and guides are 
            intended for legitimate repair of devices you own or have explicit permission to repair. We do not 
            support, enable, or provide resources for:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
            <li>Bypassing security features designed to prevent theft</li>
            <li>Unauthorized device unlocking or carrier restrictions circumvention</li>
            <li>Violating manufacturer warranties without informed consent</li>
            <li>Any activity that may violate local, state, or federal laws</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use these resources responsibly, ethically, and in compliance with all applicable laws. Repair 
            is a right - but with that right comes responsibility.
          </p>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground py-6 border-t border-border">
        <p className="mb-2">🎵 Soundtrack: 90s Hip-Hop Classics</p>
        <p className="mb-4">Built with ❤️ in the Bronx</p>
        <p className="text-xs">
          This is an educational project supporting the Right to Repair movement.
          <br />
          Always follow manufacturer guidelines and local laws when repairing devices.
        </p>
      </div>
    </div>
  );
}
