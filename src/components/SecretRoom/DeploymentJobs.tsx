import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Upload } from 'lucide-react';

interface Device {
  id: string;
  name?: string;
  model?: string;
  status?: string;
}

interface DeploymentJobsProps {
  devices: Device[];
}

export const DeploymentJobs: React.FC<DeploymentJobsProps> = () => {
  const jobs: any[] = [];

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="h-12 w-12" />}
        title="No deployment jobs"
        description="Start a deployment to see jobs here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deployment Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div key={job.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{job.name}</h4>
                    <p className="text-sm text-muted-foreground">{job.device}</p>
                  </div>
                  <Badge variant={job.status === 'completed' ? 'secondary' : 'outline'}>
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{job.progress}% complete</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
