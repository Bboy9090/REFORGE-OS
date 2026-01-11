import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stack, 
  Info, 
  Warning, 
  CheckCircle, 
  Lightning,
  ListNumbers,
  ShieldWarning,
  Books,
  Wrench
} from '@phosphor-icons/react';

export function BatchFlashingGuide() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Books size={20} weight="fill" className="text-primary" />
          <CardTitle>Batch Flashing Guide</CardTitle>
        </div>
        <CardDescription>
          Comprehensive guide for sequential multi-partition firmware flashing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Info size={16} className="mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <ListNumbers size={16} className="mr-1" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="safety">
              <ShieldWarning size={16} className="mr-1" />
              Safety
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              <Wrench size={16} className="mr-1" />
              Troubleshooting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Alert>
              <Lightning size={16} />
              <AlertTitle>What is Batch Flashing?</AlertTitle>
              <AlertDescription>
                Batch flashing allows you to flash multiple firmware partitions sequentially in a single automated operation. 
                This is essential for installing complete firmware packages, custom ROMs, or updating multiple system components at once.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold">Key Features</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                    <h4 className="font-medium text-sm">Sequential Execution</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically flash multiple partitions in order without manual intervention between operations.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                    <h4 className="font-medium text-sm">Progress Tracking</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time monitoring of each partition's flash status with detailed progress indicators and timing.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                    <h4 className="font-medium text-sm">Error Handling</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose to continue or stop on errors, with detailed error messages and automatic rollback prevention.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                    <h4 className="font-medium text-sm">Session History</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatic logging of all batch operations with success/failure counts and duration tracking.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Supported Partitions</h3>
              <div className="space-y-2">
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Critical</Badge>
                    <h4 className="font-medium text-sm">System Partitions</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Require extra confirmation due to potential for device bricking:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">boot</Badge>
                    <Badge variant="outline" className="text-xs">system</Badge>
                    <Badge variant="outline" className="text-xs">vendor</Badge>
                    <Badge variant="outline" className="text-xs">bootloader</Badge>
                    <Badge variant="outline" className="text-xs">radio</Badge>
                    <Badge variant="outline" className="text-xs">vbmeta</Badge>
                    <Badge variant="outline" className="text-xs">super</Badge>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Standard</Badge>
                    <h4 className="font-medium text-sm">Common Partitions</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">recovery</Badge>
                    <Badge variant="outline" className="text-xs">product</Badge>
                    <Badge variant="outline" className="text-xs">system_ext</Badge>
                    <Badge variant="outline" className="text-xs">odm</Badge>
                    <Badge variant="outline" className="text-xs">dtbo</Badge>
                    <Badge variant="outline" className="text-xs">persist</Badge>
                    <Badge variant="outline" className="text-xs">cache</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Create Batch Session</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select your target device from the dropdown and configure batch options:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Continue on error</strong>: Flash remaining partitions even if one fails</li>
                    <li><strong>Verify after flash</strong>: Add verification step (recommended)</li>
                    <li><strong>Reboot after completion</strong>: Automatically reboot device when done</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Add Partitions to Queue</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use the partition dropdown to add each partition you need to flash. Each partition can only be added once.
                  </p>
                  <Alert className="mt-2">
                    <Info size={14} />
                    <AlertDescription className="text-xs">
                      <strong>Recommended Order:</strong> bootloader → radio → boot → system → vendor → recovery → vbmeta
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Select Firmware Files</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    For each partition in the queue, click the file input and select the corresponding .img or .bin file.
                    Ensure the file matches the partition and your device model.
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                    Example: boot.img → boot partition, system.img → system partition
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Reorder (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the ↑ and ↓ buttons to adjust the flash order. Some devices require specific ordering for successful flashing.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Start Batch Flash</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click "Start Batch Flash" and confirm the warning dialog. Monitor real-time progress as each partition is flashed sequentially.
                  </p>
                  <Alert variant="destructive" className="mt-2">
                    <Warning size={14} />
                    <AlertDescription className="text-xs">
                      Do not disconnect the device or close the browser during flashing!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Review Results</h4>
                  <p className="text-sm text-muted-foreground">
                    After completion, review the success/failure counts and check session history for detailed records.
                    Start a new session or reset to flash additional partitions.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4 mt-4">
            <Alert variant="destructive">
              <ShieldWarning size={16} />
              <AlertTitle>Critical Safety Information</AlertTitle>
              <AlertDescription>
                Batch flashing can permanently brick your device if done incorrectly. Read and understand all safety warnings.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold text-destructive">⚠️ Before You Begin</h3>
              <div className="space-y-2">
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Bootloader Must Be Unlocked
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Device must be in fastboot mode with an unlocked bootloader. Flashing with a locked bootloader will fail and may cause issues.
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Backup All Important Data
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Flashing system partitions can result in complete data loss. Backup everything before proceeding.
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Verify Firmware Files
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ensure all firmware files are correct for your specific device model and variant. Wrong files WILL brick your device.
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Maintain Power Connection
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ensure device battery is above 50% and USB connection is stable. Power loss during flashing can brick the device.
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Do Not Interrupt
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Never disconnect USB, close browser, or power off during flashing. Interruption can result in an unbootable device.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Test on non-critical partitions first (recovery, cache)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Keep verification option enabled for critical partitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Use high-quality USB cable directly connected to computer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Have stock firmware and unbrick guide ready as backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Research device-specific requirements before starting</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Device Not Detected</h4>
                <p className="text-sm text-muted-foreground mb-2">No devices appear in the dropdown:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Ensure device is in fastboot mode (power + volume down)</li>
                  <li>Check USB cable connection (try different port/cable)</li>
                  <li>Verify fastboot is installed: <code className="bg-muted px-1 py-0.5 rounded">fastboot devices</code></li>
                  <li>Install/update device drivers on Windows</li>
                  <li>Check USB debugging authorization on device</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Flash Operation Fails</h4>
                <p className="text-sm text-muted-foreground mb-2">Individual partition flash returns error:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Verify bootloader is unlocked (check device info tab)</li>
                  <li>Confirm file is correct .img for your device model</li>
                  <li>Check partition name matches device partition table</li>
                  <li>Ensure file is not corrupted (verify checksum)</li>
                  <li>Review backend server logs for detailed error messages</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Files Not Uploading</h4>
                <p className="text-sm text-muted-foreground mb-2">File selection doesn't work or upload fails:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check file size is reasonable (&lt;4GB recommended)</li>
                  <li>Verify file extension is .img or .bin</li>
                  <li>Ensure backend server has sufficient disk space</li>
                  <li>Check server upload directory permissions</li>
                  <li>Try a different browser</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Batch Gets Stuck</h4>
                <p className="text-sm text-muted-foreground mb-2">Progress stops or doesn't update:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check backend server is still running</li>
                  <li>Verify device is still in fastboot mode</li>
                  <li>Check browser console for JavaScript errors</li>
                  <li>Refresh page and start new session (history preserved)</li>
                  <li>Restart backend server if necessary</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Device Won't Boot After Flash</h4>
                <p className="text-sm text-muted-foreground mb-2">Device is bricked or stuck in boot loop:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Boot to fastboot mode and reflash boot partition with stock image</li>
                  <li>Flash complete stock firmware package</li>
                  <li>Try flashing vbmeta with --disable-verity --disable-verification flags</li>
                  <li>Wipe cache and userdata partitions</li>
                  <li>Consult device-specific unbrick guides on XDA forums</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info size={16} />
              <AlertTitle>Need More Help?</AlertTitle>
              <AlertDescription className="text-xs">
                Check the backend server logs at <code className="bg-muted px-1 py-0.5 rounded">server/</code> directory.
                For device-specific issues, consult XDA Developers forums or manufacturer support documentation.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
