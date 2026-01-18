/**
 * MODE CONTEXT - Shop Mode vs Solo Mode
 * 
 * REFORGE OS has two presentation skins:
 * - Shop Mode: For repair shops, MSPs, enterprise IT
 * - Solo Mode: For personal tech users, hobbyists
 * 
 * Same engine. Different presentation.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OperatingMode = 'shop' | 'solo';

interface ModeConfig {
  id: OperatingMode;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  features: string[];
  navigation: {
    showAdvanced: boolean;
    showBatch: boolean;
    showReports: boolean;
    showCertification: boolean;
    showPhoenixKey: boolean;
    showCustodialCloset: boolean;
  };
  branding: {
    headerText: string;
    footerText: string;
    welcomeMessage: string;
  };
  terminology: {
    device: string;
    job: string;
    customer: string;
    report: string;
  };
}

const MODE_CONFIGS: Record<OperatingMode, ModeConfig> = {
  shop: {
    id: 'shop',
    name: 'Repair Shop Mode',
    tagline: 'Professional Device Services',
    icon: '🏪',
    description: 'Full-featured mode for repair shops, MSPs, and enterprise IT teams',
    features: [
      'Multi-device batch operations',
      'Customer case management',
      'Evidence bundle generation',
      'Compliance reporting',
      'Phoenix Key integration',
      'Certification tracking',
    ],
    navigation: {
      showAdvanced: true,
      showBatch: true,
      showReports: true,
      showCertification: true,
      showPhoenixKey: true,
      showCustodialCloset: true,
    },
    branding: {
      headerText: 'REFORGE OS • Professional',
      footerText: 'Compliance-first device analysis for repair professionals',
      welcomeMessage: 'Welcome to your Repair Shop Dashboard',
    },
    terminology: {
      device: 'Unit',
      job: 'Work Order',
      customer: 'Customer',
      report: 'Service Report',
    },
  },
  solo: {
    id: 'solo',
    name: 'Personal Tech Mode',
    tagline: 'Your Devices, Your Control',
    icon: '👤',
    description: 'Simplified mode for personal device management and troubleshooting',
    features: [
      'Device diagnostics',
      'Recovery guidance',
      'Personal device tracking',
      'Simple reporting',
      'Custodial Closet reference',
    ],
    navigation: {
      showAdvanced: false,
      showBatch: false,
      showReports: false,
      showCertification: false,
      showPhoenixKey: false,
      showCustodialCloset: true,
    },
    branding: {
      headerText: 'REFORGE OS • Personal',
      footerText: 'Smart device analysis for personal tech',
      welcomeMessage: 'Welcome to your Personal Tech Hub',
    },
    terminology: {
      device: 'Device',
      job: 'Task',
      customer: 'Profile',
      report: 'Summary',
    },
  },
};

interface ModeContextType {
  mode: OperatingMode;
  config: ModeConfig;
  setMode: (mode: OperatingMode) => void;
  isShopMode: boolean;
  isSoloMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  // Load saved mode from localStorage, default to 'shop'
  const [mode, setModeState] = useState<OperatingMode>(() => {
    const saved = localStorage.getItem('reforge_mode');
    return (saved === 'shop' || saved === 'solo') ? saved : 'shop';
  });

  const setMode = (newMode: OperatingMode) => {
    setModeState(newMode);
    localStorage.setItem('reforge_mode', newMode);
  };

  const value: ModeContextType = {
    mode,
    config: MODE_CONFIGS[mode],
    setMode,
    isShopMode: mode === 'shop',
    isSoloMode: mode === 'solo',
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export { MODE_CONFIGS };
