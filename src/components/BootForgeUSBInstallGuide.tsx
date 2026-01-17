import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  Terminal,
  CheckCircle,
  Copy,
  Lightning
} from '@phosphor-icons/react';
import { copyTextToClipboard } from '@/lib/clipboard';

interface InstallStep {
  title: string;
  description: string;
  command?: string;
  optional?: boolean;
}

const installSteps: InstallStep[] = [
  {
    title: 'Install Rust Toolchain',
    description: 'BootForgeUSB is written in Rust. Install the Rust compiler and Cargo package manager.',
    command: 'curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh'
  },
  {
    title: 'Reload Shell Environment',
    description: 'After Rust installation, reload your shell configuration to use cargo commands.',
    command: 'source $HOME/.cargo/env'
  },
  {
    title: 'Build BootForgeUSB CLI',
    description: 'Navigate to the BootForgeUSB library and build the CLI tool.',
    command: 'cd libs/bootforgeusb && cargo install --path . --bin bootforgeusb-cli'
  },
  {
    title: 'Verify Installation',
    description: 'Check that the CLI is properly installed and accessible.',
    command: 'bootforgeusb-cli --help'
  }
];

const optionalTools: InstallStep[] = [
  {
    title: 'Install ADB (Android Debug Bridge)',
    description: 'Required for Android device correlation and advanced features.',
    command: 'sudo apt-get install android-tools-adb',
    optional: true
  },
  {
    title: 'Install Fastboot',
    description: 'Required for Android bootloader detection and flashing operations.',
    command: 'sudo apt-get install android-tools-fastboot',
    optional: true
  },
  {
    title: 'Install libimobiledevice (iOS)',
    description: 'Required for iOS device detection and correlation.',
    command: 'sudo apt-get install libimobiledevice-utils',
    optional: true
  }
];

function CopyButton({ text }: { text: string }) {
  const copyToClipboard = async () => {
    await copyTextToClipboard(text, {
      successMessage: 'Command copied to clipboard',
      unavailableMessage: 'Clipboard access is unavailable. Please copy the command manually.'
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => void copyToClipboard()}
      className="h-7 px-2"
    >
      <Copy className="w-3 h-3" />
    </Button>
  );
}

export function BootForgeUSBInstallGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Installation Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightning className="w-5 h-5 text-primary" weight="duotone" />
            BootForgeUSB CLI Installation Guide
          </DialogTitle>
          <DialogDescription>
            Follow these steps to install BootForgeUSB CLI and enable real USB device scanning
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <Card className="p-4 border-blue-500/30 bg-blue-600/10">
              <p className="text-sm text-blue-300">
                <strong>What is BootForgeUSB?</strong> A Rust-based USB device scanner that detects and classifies
                mobile devices (Android & iOS) by analyzing USB signatures, interface descriptors, and tool correlations.
              </p>
            </Card>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Required Installation Steps
              </h3>
              <div className="space-y-3">
                {installSteps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        </div>
                        {step.command && (
                          <div className="relative">
                            <pre className="text-xs bg-muted/20 border border-border rounded p-2 pr-10 overflow-x-auto font-mono">
                              {step.command}
                            </pre>
                            <div className="absolute top-1 right-1">
                              <CopyButton text={step.command} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                Optional Tools (Recommended)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Install these tools to enable device correlation and advanced platform detection:
              </p>
              <div className="space-y-3">
                {optionalTools.map((tool, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                        Optional
                      </Badge>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{tool.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                        </div>
                        {tool.command && (
                          <div className="relative">
                            <pre className="text-xs bg-muted/20 border border-border rounded p-2 pr-10 overflow-x-auto font-mono">
                              {tool.command}
                            </pre>
                            <div className="absolute top-1 right-1">
                              <CopyButton text={tool.command} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <Card className="p-4 border-emerald-500/30 bg-emerald-600/10">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2">After Installation</h4>
              <ol className="text-xs text-emerald-300/80 space-y-1 list-decimal list-inside ml-2">
                <li>Restart your terminal or IDE to ensure PATH is updated</li>
                <li>Refresh the BootForgeUSB Scanner status</li>
                <li>Connect your Android or iOS device via USB</li>
                <li>Click "Scan Real Devices" to detect connected hardware</li>
              </ol>
            </Card>

            <Card className="p-4 border-amber-500/30 bg-amber-600/10">
              <h4 className="text-sm font-semibold text-amber-300 mb-2">Troubleshooting</h4>
              <ul className="text-xs text-amber-300/80 space-y-1 list-disc list-inside ml-2">
                <li><strong>Command not found:</strong> Restart terminal or run <code>source ~/.cargo/env</code></li>
                <li><strong>Permission denied (Linux):</strong> Add udev rules for USB access</li>
                <li><strong>No devices found:</strong> Enable USB debugging (Android) or trust computer (iOS)</li>
                <li><strong>Build failed:</strong> Ensure libusb is installed (<code>sudo apt-get install libusb-1.0-0-dev</code>)</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
