/**
 * WorkbenchFirmware
 * 
 * Library + search/download
 */

import React, { useState } from 'react';
import { Search, Download, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkbenchFirmware() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Firmware
        </h1>
        <p className="text-sm text-ink-muted">
          Firmware library, search, and download
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search firmware by brand, model, version..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-workbench-steel border border-panel text-ink-primary text-sm font-mono placeholder:text-ink-muted focus:outline-none focus:border-spray-cyan focus:glow-cyan transition-all motion-snap"
        />
      </div>

      {/* Firmware Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-panel bg-workbench-steel"
          >
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-spray-cyan" />
              <div>
                <h3 className="text-sm font-mono font-bold text-ink-primary">
                  Firmware {i}
                </h3>
                <p className="text-xs text-ink-muted">Brand Model v1.0</p>
              </div>
            </div>
            <button className="w-full px-3 py-2 rounded-md border border-panel bg-basement-concrete text-ink-primary text-sm font-mono hover:border-spray-cyan hover:glow-cyan transition-all motion-snap flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
