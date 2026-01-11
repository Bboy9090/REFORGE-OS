import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileJson } from 'lucide-react';

export const RepairReportExport: React.FC = () => {
  return (
    <div className="flex gap-2">
      <Button disabled variant="secondary" size="sm" title="Export not implemented yet">
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button disabled variant="ghost" size="sm" title="Export not implemented yet">
        <FileJson className="h-4 w-4 mr-2" />
        Export JSON
      </Button>
    </div>
  );
};
