import { Books, Wrench, Cpu, Users, FolderOpen, Heart, Lightning, ShieldCheck, ChartLine, DeviceMobile, Gear, ListChecks, LockKey, Package, Storefront, Flask, FileText, ListDashes, GitBranch, Camera, FloppyDisk } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface HubCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  featured?: boolean;
}

function HubCard({ icon, title, description, onClick, featured }: HubCardProps) {
  return (
    <Card 
      className={`hover:scale-[1.02] transition-all cursor-pointer bg-card border-border hover:border-primary/50 group ${
        featured ? 'border-primary/40 shadow-lg shadow-primary/10' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-md bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

interface BobbysWorldHubProps {
  onNavigate: (section: string) => void;
}

export function BobbysWorldHub({ onNavigate }: BobbysWorldHubProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 py-10">
          <h1 className="text-5xl font-display uppercase tracking-tight text-foreground">
            Bobby's World
          </h1>
          <p className="text-lg text-muted-foreground">
            Workshop • Diagnostics • Educational Resources
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80">
            <Wrench className="w-4 h-4" />
            <span>Professional repair toolkit and knowledge base</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <HubCard
            icon={<FileText size={28} weight="duotone" />}
            title="Evidence Bundles"
            description="Signed diagnostic reports with cryptographic verification"
            onClick={() => onNavigate('evidence')}
            featured
          />
          <HubCard
            icon={<Flask size={28} weight="duotone" />}
            title="Automated Testing"
            description="Plugin security scanning, quality checks, and certification pipeline"
            onClick={() => onNavigate('testing')}
            featured
          />
          <HubCard
            icon={<Storefront size={28} weight="duotone" />}
            title="Plugin Marketplace"
            description="Community-built tools with automated testing and certification"
            onClick={() => onNavigate('marketplace')}
            featured
          />
          <HubCard
            icon={<ShieldCheck size={28} weight="duotone" />}
            title="Authority Dashboard"
            description="Evidence signing, correlation tracking, plugin ecosystem"
            onClick={() => onNavigate('authority')}
            featured
          />
          <HubCard
            icon={<ListDashes size={28} weight="duotone" />}
            title="Batch Diagnostics"
            description="Run diagnostics across multiple connected devices simultaneously"
            onClick={() => onNavigate('batch-diagnostics')}
            featured
          />
          <HubCard
            icon={<GitBranch size={28} weight="duotone" />}
            title="Dependency Graph"
            description="Visualize plugin dependencies, conflicts, and circular references"
            onClick={() => onNavigate('plugin-graph')}
            featured
          />
          <HubCard
            icon={<Camera size={28} weight="duotone" />}
            title="Snapshot Retention"
            description="Automatic backup management with configurable retention policies"
            onClick={() => onNavigate('snapshot-retention')}
            featured
          />
          <HubCard
            icon={<FloppyDisk size={28} weight="duotone" />}
            title="Workspace Backup"
            description="Automated backup system with scheduled intervals"
            onClick={() => onNavigate('workspace-backup')}
            featured
          />
          <HubCard
            icon={<DeviceMobile size={28} weight="duotone" />}
            title="iOS DFU Flash"
            description="checkra1n/palera1n jailbreak support with DFU mode detection"
            onClick={() => onNavigate('ios-dfu')}
            featured
          />
          <HubCard
            icon={<Lightning size={28} weight="duotone" />}
            title="Multi-Brand Flash"
            description="Samsung Odin, Xiaomi EDL, Universal Fastboot protocols"
            onClick={() => onNavigate('multi-brand-flash')}
            featured
          />
          <HubCard
            icon={<Cpu size={28} weight="duotone" />}
            title="MediaTek Flash"
            description="SP Flash Tool integration for MTK chipsets"
            onClick={() => onNavigate('mtk-flash')}
          />
          <HubCard
            icon={<LockKey size={28} weight="duotone" />}
            title="Security Lock Guide"
            description="FRP/MDM detection and legitimate recovery resources"
            onClick={() => onNavigate('security-edu')}
          />
          <HubCard
            icon={<Cpu size={28} weight="duotone" />}
            title="Device Diagnostics"
            description="Real USB detection with ADB/Fastboot integration"
            onClick={() => onNavigate('diagnostics')}
          />
          <HubCard
            icon={<ChartLine size={28} weight="duotone" />}
            title="Pandora Codex"
            description="Flash monitoring, benchmarking, and correlation tracking"
            onClick={() => onNavigate('pandora-codex')}
          />
          <HubCard
            icon={<ListChecks size={28} weight="duotone" />}
            title="Support Matrix"
            description="Official BootForge device modes and tooling specs"
            onClick={() => onNavigate('support-matrix')}
          />
          <HubCard
            icon={<Books size={28} weight="duotone" />}
            title="Repair Library"
            description="Teardown guides and repair tutorials"
            onClick={() => onNavigate('repair-library')}
          />
          <HubCard
            icon={<Wrench size={28} weight="duotone" />}
            title="Tool Registry"
            description="Open-source diagnostic tools catalog"
            onClick={() => onNavigate('tool-registry')}
          />
          <HubCard
            icon={<Users size={28} weight="duotone" />}
            title="Community"
            description="Forums, advocacy, and repair network"
            onClick={() => onNavigate('community')}
          />
          <HubCard
            icon={<FolderOpen size={28} weight="duotone" />}
            title="My Workspace"
            description="Personal notes and repair history"
            onClick={() => onNavigate('workspace')}
          />
          <HubCard
            icon={<LockKey size={28} weight="duotone" />}
            title="Bobby's Vault"
            description="Private tool registry and educational resources"
            onClick={() => onNavigate('vault')}
            featured
          />
          <HubCard
            icon={<Heart size={28} weight="duotone" />}
            title="About"
            description="Mission and right to repair advocacy"
            onClick={() => onNavigate('about')}
          />
          <HubCard
            icon={<Gear size={28} weight="duotone" />}
            title="Settings"
            description="Audio notifications and workshop preferences"
            onClick={() => onNavigate('settings')}
          />
        </div>

        <div className="mt-10 p-5 border border-warning/30 rounded-lg bg-warning/5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-warning flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">Legal Notice</h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                This toolkit is for <strong>authorized repair technicians only</strong>. All tools and guides 
                are for legitimate repair on devices you own or have permission to service. We do not support 
                bypassing security features, unauthorized unlocking, or activities violating manufacturer warranties 
                or local laws. Use responsibly.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground/60 py-6 font-mono">
          <p>Bobby's World • Workshop Toolkit • Educational Resources Only</p>
        </div>
      </div>
    </div>
  );
}
