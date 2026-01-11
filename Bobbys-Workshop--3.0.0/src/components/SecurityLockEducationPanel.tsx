import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck,
  Info,
  Warning,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  BookOpen,
  Link as LinkIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FRPStatus {
  detected: boolean;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  indicators: string[];
  deviceInfo?: {
    manufacturer?: string;
    model?: string;
    androidVersion?: string;
  };
}

interface MDMStatus {
  detected: boolean;
  profileName?: string;
  organization?: string;
  restrictions: string[];
}

export function SecurityLockEducationPanel() {
  const [frpStatus, setFrpStatus] = useState<FRPStatus | null>(null);
  const [mdmStatus, setMdmStatus] = useState<MDMStatus | null>(null);
  const [scanning, setScanning] = useState(false);

  const detectFRP = async () => {
    setScanning(true);
    toast.info('Scanning for FRP indicators...');

    try {
      const response = await fetch('http://localhost:3001/api/frp/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      setFrpStatus({
        detected: data.detected || false,
        confidence: data.confidence || 'unknown',
        indicators: data.indicators || [],
        deviceInfo: data.deviceInfo,
      });

      if (data.detected) {
        toast.warning('FRP lock detected', {
          description: 'Device has Factory Reset Protection enabled',
        });
      } else {
        toast.success('No FRP lock detected');
      }
    } catch (_error) {
      toast.error('Detection failed', {
        description: 'Unable to connect to detection service',
      });
    } finally {
      setScanning(false);
    }
  };

  const detectMDM = async () => {
    setScanning(true);
    toast.info('Scanning for MDM profiles...');

    try {
      const response = await fetch('http://localhost:3001/api/mdm/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      setMdmStatus({
        detected: data.detected || false,
        profileName: data.profileName,
        organization: data.organization,
        restrictions: data.restrictions || [],
      });

      if (data.detected) {
        toast.warning('MDM profile detected', {
          description: 'Device is managed by an organization',
        });
      } else {
        toast.success('No MDM profile detected');
      }
    } catch (_error) {
      toast.error('Detection failed', {
        description: 'Unable to connect to detection service',
      });
    } finally {
      setScanning(false);
    }
  };

  const legitimateResources = [
    {
      title: 'What is FRP (Factory Reset Protection)?',
      description:
        'FRP is a security feature that prevents unauthorized use of a device after factory reset. It requires the previously synced Google account credentials.',
      type: 'explanation',
    },
    {
      title: 'Legitimate Recovery Method #1: Account Sign-In',
      description:
        'Sign in with the Google account that was previously synced to the device. This is the primary and most straightforward method.',
      type: 'solution',
    },
    {
      title: 'Legitimate Recovery Method #2: Account Recovery',
      description:
        'Use Google Account Recovery (account.google.com/recovery) if you forgot the password. You may need backup email, phone number, or security questions.',
      type: 'solution',
    },
    {
      title: 'Legitimate Recovery Method #3: Proof of Purchase',
      description:
        'Contact the manufacturer or carrier with proof of purchase (receipt, invoice). They may unlock FRP after verifying ownership.',
      type: 'solution',
    },
    {
      title: 'Enterprise/MDM Devices',
      description:
        'If device shows MDM enrollment, contact the organization IT admin. Only authorized personnel can remove enterprise management profiles.',
      type: 'solution',
    },
    {
      title: 'Why FRP Exists',
      description:
        'FRP protects stolen devices from being resold. It reduces device theft incentive and protects user data. Bypassing FRP on devices you do not own is illegal.',
      type: 'explanation',
    },
  ];

  const officialResources = [
    {
      name: 'Google Account Help - Device Protection',
      url: 'https://support.google.com/accounts/answer/6160491',
      description: 'Official Google documentation on Factory Reset Protection',
    },
    {
      name: 'Google Account Recovery',
      url: 'https://accounts.google.com/signin/recovery',
      description: 'Recover access to your Google account',
    },
    {
      name: 'Samsung Find My Mobile',
      url: 'https://findmymobile.samsung.com',
      description: 'Samsung official device unlock service (requires Samsung account)',
    },
    {
      name: 'Apple Activation Lock Support',
      url: 'https://support.apple.com/en-us/HT201441',
      description: 'Official Apple guide for Activation Lock issues',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Security Lock Education</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detection tools and legitimate recovery resources for FRP and MDM
        </p>
      </div>

      <Alert className="border-warning/50 bg-warning/10">
        <Warning className="text-warning" />
        <AlertTitle className="text-foreground">Legal Notice</AlertTitle>
        <AlertDescription className="text-sm text-foreground">
          <strong>Only use these tools on devices you own or have authorization to service.</strong>
          {' '}Bypassing security locks on devices you do not own is illegal and violates anti-theft laws.
          This panel provides educational information and legitimate recovery paths only.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="detection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="resources">Official Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="text-primary" />
                  FRP Detection
                </CardTitle>
                <CardDescription>Check for Factory Reset Protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={detectFRP}
                  disabled={scanning}
                  className="w-full"
                >
                  <MagnifyingGlass />
                  {scanning ? 'Scanning...' : 'Detect FRP Status'}
                </Button>

                {frpStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {frpStatus.detected ? (
                        <XCircle className="text-destructive" size={20} />
                      ) : (
                        <CheckCircle className="text-success" size={20} />
                      )}
                      <span className="font-medium text-foreground">
                        {frpStatus.detected ? 'FRP Detected' : 'No FRP Lock'}
                      </span>
                      <Badge variant={frpStatus.detected ? 'destructive' : 'default'}>
                        {frpStatus.confidence}
                      </Badge>
                    </div>

                    {frpStatus.indicators.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Indicators:</p>
                        <ul className="text-xs text-foreground space-y-1">
                          {frpStatus.indicators.map((indicator, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {frpStatus.deviceInfo && (
                      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                        {frpStatus.deviceInfo.manufacturer && (
                          <p>Manufacturer: {frpStatus.deviceInfo.manufacturer}</p>
                        )}
                        {frpStatus.deviceInfo.model && (
                          <p>Model: {frpStatus.deviceInfo.model}</p>
                        )}
                        {frpStatus.deviceInfo.androidVersion && (
                          <p>Android: {frpStatus.deviceInfo.androidVersion}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="text-primary" />
                  MDM Detection
                </CardTitle>
                <CardDescription>Check for Mobile Device Management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={detectMDM}
                  disabled={scanning}
                  variant="secondary"
                  className="w-full"
                >
                  <MagnifyingGlass />
                  {scanning ? 'Scanning...' : 'Detect MDM Profile'}
                </Button>

                {mdmStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {mdmStatus.detected ? (
                        <XCircle className="text-destructive" size={20} />
                      ) : (
                        <CheckCircle className="text-success" size={20} />
                      )}
                      <span className="font-medium text-foreground">
                        {mdmStatus.detected ? 'MDM Detected' : 'No MDM Profile'}
                      </span>
                    </div>

                    {mdmStatus.detected && (
                      <>
                        {mdmStatus.profileName && (
                          <p className="text-sm text-foreground">
                            <span className="text-muted-foreground">Profile:</span>{' '}
                            {mdmStatus.profileName}
                          </p>
                        )}
                        {mdmStatus.organization && (
                          <p className="text-sm text-foreground">
                            <span className="text-muted-foreground">Organization:</span>{' '}
                            {mdmStatus.organization}
                          </p>
                        )}
                        {mdmStatus.restrictions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Restrictions:
                            </p>
                            <ul className="text-xs text-foreground space-y-1">
                              {mdmStatus.restrictions.map((restriction, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span>{restriction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Alert className="border-destructive/30 bg-destructive/5">
                          <AlertDescription className="text-xs text-foreground">
                            This device is enterprise-managed. Contact the organization's IT
                            administrator for assistance.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" />
                Understanding Security Locks
              </CardTitle>
              <CardDescription>
                What they are, why they exist, and legitimate ways to resolve them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legitimateResources.map((resource, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-background/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {resource.type === 'solution' ? (
                          <CheckCircle className="text-success" size={20} />
                        ) : (
                          <Info className="text-primary" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="text-primary" />
                Official Support Resources
              </CardTitle>
              <CardDescription>
                Direct links to manufacturer and platform support documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {officialResources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <LinkIcon className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {resource.description}
                        </p>
                        <p className="text-xs text-primary truncate">{resource.url}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <Alert className="mt-4 border-primary/30 bg-primary/5">
                <Info className="text-primary" />
                <AlertDescription className="text-xs text-foreground">
                  <strong>Before You Start:</strong> Gather proof of purchase, receipts, account
                  recovery information, and device IMEI/serial numbers. These will be required for
                  legitimate unlock procedures.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
