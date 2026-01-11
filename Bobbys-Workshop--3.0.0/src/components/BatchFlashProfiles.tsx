import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileArrowDown, 
  FileArrowUp, 
  FloppyDisk,
  Info,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface BatchFlashProfile {
  id: string;
  name: string;
  description: string;
  deviceModel: string;
  partitions: Array<{
    partition: string;
    fileName: string;
    notes?: string;
  }>;
  options: {
    continueOnError: boolean;
    verifyAfterFlash: boolean;
    rebootAfter: boolean;
  };
  createdAt: number;
}

export function BatchFlashProfiles() {
  const [profiles, setProfiles] = useKV<BatchFlashProfile[]>('batch-flash-profiles', []);
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [importData, setImportData] = useState('');

  const createProfile = () => {
    if (!profileName.trim()) {
      toast.error('Profile name is required');
      return;
    }

    const newProfile: BatchFlashProfile = {
      id: `profile-${Date.now()}`,
      name: profileName,
      description: profileDescription,
      deviceModel: deviceModel,
      partitions: [],
      options: {
        continueOnError: false,
        verifyAfterFlash: true,
        rebootAfter: false
      },
      createdAt: Date.now()
    };

    setProfiles(prev => [...(prev || []), newProfile]);
    toast.success('Profile created');
    
    setProfileName('');
    setProfileDescription('');
    setDeviceModel('');
  };

  const exportProfile = (profile: BatchFlashProfile) => {
    const json = JSON.stringify(profile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Profile exported');
  };

  const importProfile = () => {
    try {
      const profile = JSON.parse(importData) as BatchFlashProfile;
      
      if (!profile.id || !profile.name || !profile.partitions) {
        throw new Error('Invalid profile format');
      }

      profile.id = `profile-${Date.now()}`;
      profile.createdAt = Date.now();

      setProfiles(prev => [...(prev || []), profile]);
      toast.success('Profile imported successfully');
      setImportData('');
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  const deleteProfile = (profileId: string) => {
    setProfiles(prev => (prev || []).filter(p => p.id !== profileId));
    toast.success('Profile deleted');
  };

  const exportAllProfiles = () => {
    if (!profiles || profiles.length === 0) {
      toast.error('No profiles to export');
      return;
    }

    const json = JSON.stringify(profiles, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_flash_profiles_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('All profiles exported');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FloppyDisk size={20} weight="fill" className="text-primary" />
          <CardTitle>Batch Flash Profiles</CardTitle>
        </div>
        <CardDescription>
          Create, save, and share reusable batch flashing configurations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info size={16} />
          <AlertTitle>What are Profiles?</AlertTitle>
          <AlertDescription className="text-xs">
            Profiles let you save batch flash configurations (partition list, file names, options) for reuse.
            Perfect for repetitive flashing tasks or sharing configurations with others.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold">Create New Profile</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                placeholder="e.g., Pixel 6 Stock ROM"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="device-model">Device Model</Label>
              <Input
                id="device-model"
                placeholder="e.g., Pixel 6 (oriole)"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-description">Description</Label>
              <Textarea
                id="profile-description"
                placeholder="Optional notes about this profile..."
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={createProfile}>
              <FloppyDisk size={16} className="mr-2" />
              Create Profile
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Saved Profiles ({profiles?.length || 0})</h3>
            {profiles && profiles.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportAllProfiles}>
                <FileArrowDown size={16} className="mr-1" />
                Export All
              </Button>
            )}
          </div>

          {!profiles || profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FloppyDisk size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved profiles yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map(profile => (
                <div key={profile.id} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{profile.name}</h4>
                      {profile.deviceModel && (
                        <p className="text-xs text-muted-foreground">{profile.deviceModel}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportProfile(profile)}
                      >
                        <FileArrowDown size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProfile(profile.id)}
                      >
                        <span className="text-destructive">×</span>
                      </Button>
                    </div>
                  </div>

                  {profile.description && (
                    <p className="text-xs text-muted-foreground">{profile.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{profile.partitions.length} partitions</span>
                    <span>•</span>
                    <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>

                  {profile.partitions.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Partitions:</p>
                      <div className="text-xs text-muted-foreground">
                        {profile.partitions.map(p => p.partition).join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t flex flex-wrap gap-2">
                    {profile.options.continueOnError && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-muted-foreground">Continue on error</span>
                      </div>
                    )}
                    {profile.options.verifyAfterFlash && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-muted-foreground">Verify after flash</span>
                      </div>
                    )}
                    {profile.options.rebootAfter && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-muted-foreground">Auto reboot</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold">Import Profile</h3>
          <div className="space-y-2">
            <Label htmlFor="import-data">Profile JSON</Label>
            <Textarea
              id="import-data"
              placeholder="Paste profile JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={6}
            />
          </div>
          <Button onClick={importProfile} disabled={!importData.trim()}>
            <FileArrowUp size={16} className="mr-2" />
            Import Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
