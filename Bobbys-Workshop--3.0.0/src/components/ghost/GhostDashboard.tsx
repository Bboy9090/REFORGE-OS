/**
 * Ghost Codex - Main Dashboard
 * Central hub for stealth and identity protection features
 */

import React, { useState } from 'react';
import { FileX, Shield, Eye, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanaryDashboard } from './CanaryDashboard';
import { PersonaVault } from './PersonaVault';
import { MetadataShredder } from './MetadataShredder';

export function GhostDashboard() {
  const [activeTab, setActiveTab] = useState<'shredder' | 'canary' | 'persona'>('shredder');

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-cyan-400">Ghost Codex</h1>
        <p className="text-sm sm:text-base text-gray-400">Stealth & Identity Protection</p>
      </div>

      {/* Tabs - Responsive */}
      <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
        {[
          { id: 'shredder', label: 'Metadata Shredder', icon: <FileX className="w-4 h-4" />, shortLabel: 'Shredder' },
          { id: 'canary', label: 'Canary Tokens', icon: <AlertTriangle className="w-4 h-4" />, shortLabel: 'Canary' },
          { id: 'persona', label: 'Persona Vault', icon: <Shield className="w-4 h-4" />, shortLabel: 'Persona' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-3 sm:px-4 py-2 flex items-center gap-2 border-b-2 transition-colors touch-target-min flex-shrink-0 whitespace-nowrap",
              activeTab === tab.id
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content - Responsive */}
      <div className="flex-1 bg-gray-950 rounded-lg border border-gray-800 p-3 sm:p-6 overflow-y-auto min-h-0">
        {activeTab === 'shredder' && (
          <MetadataShredder />
        )}

        {activeTab === 'canary' && (
          <div className="h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Canary Tokens</h2>
              <p className="text-gray-400 mb-6">Create bait files that alert when accessed</p>
              <button className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-cyan-500 text-left mb-4">
                <div className="flex items-center justify-between">
                  <span>Generate New Token</span>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CanaryDashboard />
            </div>
          </div>
        )}

        {activeTab === 'persona' && (
          <div className="h-full flex flex-col">
            <PersonaVault />
          </div>
        )}
      </div>
    </div>
  );
}
