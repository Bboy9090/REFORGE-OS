/**
 * PHOENIX KEY MANAGER - Product Identity System
 * 
 * Phoenix Key is not just a USB - it's a THING.
 * 
 * Features:
 * - Key Tiers: Inspect / Recover / Forge
 * - Serial Identity
 * - Expiration / Renewal Concept
 * - Visual Identity
 */

import { useState, useEffect } from 'react';

// Phoenix Key Tiers
const KEY_TIERS = {
  inspect: {
    id: 'inspect',
    name: 'Phoenix Inspect',
    level: 1,
    color: '#4A90A4', // Cool Steel Blue
    gradient: 'linear-gradient(135deg, #4A90A4 0%, #2D5A68 100%)',
    icon: '🔍',
    tagline: 'See the Truth',
    description: 'Read-only device analysis and diagnostics',
    capabilities: [
      'Device state analysis',
      'Hardware diagnostics',
      'Software inventory',
      'Security assessment',
      'Compliance reporting',
    ],
    restrictions: [
      'No modification capabilities',
      'No recovery operations',
      'No firmware access',
    ],
    price: 'From $199/year',
    ideal_for: 'IT Support, Help Desks, First-Level Diagnostics'
  },
  recover: {
    id: 'recover',
    name: 'Phoenix Recover',
    level: 2,
    color: '#CFB53B', // Metallic Gold
    gradient: 'linear-gradient(135deg, #CFB53B 0%, #8B7355 100%)',
    icon: '🔄',
    tagline: 'Restore What Matters',
    description: 'Full diagnostic plus OEM-authorized recovery',
    capabilities: [
      'All Inspect capabilities',
      'Data backup & extraction',
      'OEM recovery workflows',
      'Firmware restoration',
      'Factory reset operations',
      'Evidence bundle generation',
    ],
    restrictions: [
      'No custom firmware',
      'No bootloader modification',
      'OEM paths only',
    ],
    price: 'From $499/year',
    ideal_for: 'Repair Shops, MSPs, Corporate IT'
  },
  forge: {
    id: 'forge',
    name: 'Phoenix Forge',
    level: 3,
    color: '#CD7F32', // Bronze
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    icon: '🔥',
    tagline: 'Authorized Power',
    description: 'Enterprise-grade capabilities with full audit trail',
    capabilities: [
      'All Recover capabilities',
      'Advanced firmware operations',
      'Enterprise MDM integration',
      'Multi-device batch operations',
      'Custom workflow creation',
      'Priority OEM escalation',
      'Legal hold support',
    ],
    restrictions: [
      'Full compliance tracking',
      'All operations audited',
      'Ownership verification required',
    ],
    price: 'From $1,499/year',
    ideal_for: 'Enterprises, Law Enforcement, Forensic Labs'
  }
};

// Sample registered keys (in production, from database)
const SAMPLE_KEYS = [
  {
    serial: 'PK-INSP-2024-00001',
    tier: 'inspect',
    activated: '2024-01-15',
    expires: '2025-01-15',
    status: 'active',
    organization: 'TechRepair Pro',
    devices_analyzed: 247
  },
  {
    serial: 'PK-RECV-2024-00042',
    tier: 'recover',
    activated: '2024-03-22',
    expires: '2025-03-22',
    status: 'active',
    organization: 'City Cellular',
    devices_analyzed: 1842
  },
  {
    serial: 'PK-FRGE-2023-00007',
    tier: 'forge',
    activated: '2023-11-01',
    expires: '2024-11-01',
    status: 'expiring_soon',
    organization: 'Enterprise IT Solutions',
    devices_analyzed: 5294
  }
];

interface PhoenixKey {
  serial: string;
  tier: string;
  activated: string;
  expires: string;
  status: string;
  organization: string;
  devices_analyzed: number;
}

export default function PhoenixKeyManager() {
  const [activeView, setActiveView] = useState<'tiers' | 'keys' | 'activate'>('tiers');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [registeredKeys, setRegisteredKeys] = useState<PhoenixKey[]>(SAMPLE_KEYS);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--state-success)';
      case 'expiring_soon': return 'var(--state-warning)';
      case 'expired': return 'var(--state-error)';
      default: return 'var(--ink-muted)';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getDaysUntilExpiry = (expires: string) => {
    const now = new Date();
    const expDate = new Date(expires);
    const diff = expDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleActivation = async () => {
    setActivating(true);
    // Simulate activation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setActivating(false);
    // In production, validate and register the key
    alert('Key activation would be processed here');
  };

  return (
    <div className="space-y-6">
      {/* Header with Phoenix Key Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Phoenix Key Logo */}
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #CFB53B 0%, #CD7F32 50%, #8B4513 100%)',
              boxShadow: '0 0 30px rgba(207, 181, 59, 0.4)'
            }}
          >
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>
            <span className="text-3xl relative z-10">🔑</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
              PHOENIX KEY
            </h1>
            <p style={{ color: 'var(--ink-muted)' }}>
              Authorization • Identity • Trust
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div 
          className="flex gap-1 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--surface-secondary)' }}
        >
          {[
            { id: 'tiers', label: 'Key Tiers', icon: '📊' },
            { id: 'keys', label: 'My Keys', icon: '🔑' },
            { id: 'activate', label: 'Activate', icon: '✨' },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: activeView === view.id ? 'var(--surface-elevated)' : 'transparent',
                color: activeView === view.id ? 'var(--accent-gold)' : 'var(--ink-muted)'
              }}
            >
              <span>{view.icon}</span>
              <span className="font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KEY TIERS View */}
      {activeView === 'tiers' && (
        <div className="space-y-6">
          {/* Tier Comparison Cards */}
          <div className="grid grid-cols-3 gap-6">
            {Object.values(KEY_TIERS).map((tier) => (
              <div 
                key={tier.id}
                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                  selectedTier === tier.id ? 'transform scale-105' : ''
                }`}
                style={{ 
                  borderColor: selectedTier === tier.id ? tier.color : 'var(--border-primary)',
                  boxShadow: selectedTier === tier.id ? `0 0 30px ${tier.color}40` : 'none'
                }}
              >
                {/* Tier Header */}
                <div 
                  className="p-6 text-center"
                  style={{ background: tier.gradient }}
                >
                  <div className="text-4xl mb-2">{tier.icon}</div>
                  <h2 className="text-xl font-bold text-white mb-1">{tier.name}</h2>
                  <p className="text-white/80 text-sm italic">"{tier.tagline}"</p>
                  <div className="mt-3 inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm">
                    Level {tier.level}
                  </div>
                </div>

                {/* Tier Content */}
                <div 
                  className="p-6"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <p className="text-center mb-6" style={{ color: 'var(--ink-muted)' }}>
                    {tier.description}
                  </p>

                  {/* Capabilities */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase mb-3" style={{ color: tier.color }}>
                      Capabilities
                    </h3>
                    <ul className="space-y-2">
                      {tier.capabilities.map((cap, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-2 text-sm"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          <span style={{ color: tier.color }}>✓</span>
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Restrictions */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase mb-3" style={{ color: 'var(--ink-muted)' }}>
                      Boundaries
                    </h3>
                    <ul className="space-y-2">
                      {tier.restrictions.map((res, i) => (
                        <li 
                          key={i}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          <span>○</span>
                          {res}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal For */}
                  <div 
                    className="p-3 rounded-lg text-center mb-4"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  >
                    <span className="text-xs uppercase" style={{ color: 'var(--ink-muted)' }}>
                      Ideal For:
                    </span>
                    <p className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {tier.ideal_for}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: tier.color }}
                    >
                      {tier.price}
                    </span>
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => setSelectedTier(tier.id)}
                    className="w-full mt-4 py-3 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      background: selectedTier === tier.id ? tier.gradient : 'transparent',
                      border: `2px solid ${tier.color}`,
                      color: selectedTier === tier.id ? 'white' : tier.color
                    }}
                  >
                    {selectedTier === tier.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Tier Details */}
          {selectedTier && (
            <div 
              className="p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: KEY_TIERS[selectedTier as keyof typeof KEY_TIERS].color
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
                    Ready to get {KEY_TIERS[selectedTier as keyof typeof KEY_TIERS].name}?
                  </h3>
                  <p style={{ color: 'var(--ink-muted)' }}>
                    Contact sales or activate an existing key below
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('activate')}
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      background: KEY_TIERS[selectedTier as keyof typeof KEY_TIERS].gradient,
                      color: 'white'
                    }}
                  >
                    Activate Key
                  </button>
                  <button
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2"
                    style={{
                      borderColor: KEY_TIERS[selectedTier as keyof typeof KEY_TIERS].color,
                      color: KEY_TIERS[selectedTier as keyof typeof KEY_TIERS].color,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY KEYS View */}
      {activeView === 'keys' && (
        <div className="space-y-6">
          {/* Keys Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                {registeredKeys.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>Total Keys</div>
            </div>
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--state-success)' }}>
                {registeredKeys.filter(k => k.status === 'active').length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>Active</div>
            </div>
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--state-warning)' }}>
                {registeredKeys.filter(k => k.status === 'expiring_soon').length}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>Expiring Soon</div>
            </div>
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
                {registeredKeys.reduce((sum, k) => sum + k.devices_analyzed, 0).toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>Devices Analyzed</div>
            </div>
          </div>

          {/* Keys List */}
          <div className="space-y-4">
            {registeredKeys.map((key) => {
              const tier = KEY_TIERS[key.tier as keyof typeof KEY_TIERS];
              const daysLeft = getDaysUntilExpiry(key.expires);
              
              return (
                <div 
                  key={key.serial}
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  {/* Key Header */}
                  <div 
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ background: tier.gradient }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <h3 className="font-bold text-white">{tier.name}</h3>
                        <p className="text-white/80 font-mono text-sm">{key.serial}</p>
                      </div>
                    </div>
                    <div 
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      {getStatusLabel(key.status)}
                    </div>
                  </div>

                  {/* Key Details */}
                  <div 
                    className="px-6 py-4 grid grid-cols-5 gap-6"
                    style={{ backgroundColor: 'var(--surface-secondary)' }}
                  >
                    <div>
                      <div className="text-xs uppercase mb-1" style={{ color: 'var(--ink-muted)' }}>
                        Organization
                      </div>
                      <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                        {key.organization}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase mb-1" style={{ color: 'var(--ink-muted)' }}>
                        Activated
                      </div>
                      <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                        {new Date(key.activated).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase mb-1" style={{ color: 'var(--ink-muted)' }}>
                        Expires
                      </div>
                      <div className="font-medium" style={{ color: getStatusColor(key.status) }}>
                        {new Date(key.expires).toLocaleDateString()}
                        <span className="text-xs ml-2">
                          ({daysLeft > 0 ? `${daysLeft} days left` : 'Expired'})
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase mb-1" style={{ color: 'var(--ink-muted)' }}>
                        Devices Analyzed
                      </div>
                      <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                        {key.devices_analyzed.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {key.status === 'expiring_soon' && (
                        <button
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={{
                            background: tier.gradient,
                            color: 'white'
                          }}
                        >
                          Renew
                        </button>
                      )}
                      <button
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 border"
                        style={{
                          borderColor: 'var(--border-primary)',
                          color: 'var(--ink-muted)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Expiry Progress Bar */}
                  {key.status === 'expiring_soon' && (
                    <div 
                      className="px-6 py-3"
                      style={{ backgroundColor: 'var(--surface-tertiary)' }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm" style={{ color: 'var(--state-warning)' }}>
                          ⚠️ Key expires in {daysLeft} days
                        </span>
                        <div 
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--surface-primary)' }}
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${Math.min(100, (daysLeft / 365) * 100)}%`,
                              backgroundColor: 'var(--state-warning)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVATE View */}
      {activeView === 'activate' && (
        <div className="max-w-2xl mx-auto">
          {/* Activation Card */}
          <div 
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: 'var(--accent-gold)' }}
          >
            {/* Header */}
            <div 
              className="p-8 text-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)'
              }}
            >
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-white mb-2">Activate Phoenix Key</h2>
              <p className="text-white/80">
                Enter your activation code to register your Phoenix Key
              </p>
            </div>

            {/* Form */}
            <div 
              className="p-8 space-y-6"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              {/* Activation Code Input */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--ink-primary)' }}
                >
                  Activation Code
                </label>
                <input
                  type="text"
                  placeholder="PK-XXXX-XXXX-XXXX-XXXX"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg text-center font-mono text-lg border-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: activationCode ? 'var(--accent-gold)' : 'var(--border-primary)',
                    color: 'var(--ink-primary)'
                  }}
                />
                <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
                  Your activation code was provided with your Phoenix Key purchase
                </p>
              </div>

              {/* Organization Name */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--ink-primary)' }}
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="Your Business Name"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--ink-primary)'
                  }}
                />
              </div>

              {/* Hardware ID */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--surface-tertiary)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      Hardware ID
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'var(--ink-muted)' }}>
                      HW-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--state-success)' }}>
                    ✓ Detected
                  </span>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" className="mt-1" />
                <label 
                  htmlFor="terms" 
                  className="text-sm"
                  style={{ color: 'var(--ink-secondary)' }}
                >
                  I agree to the Phoenix Key License Agreement and understand that this key is 
                  bound to my organization and hardware. All operations will be audited for 
                  compliance purposes.
                </label>
              </div>

              {/* Activate Button */}
              <button
                onClick={handleActivation}
                disabled={activating || !activationCode}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
                  color: 'white'
                }}
              >
                {activating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Activating...
                  </span>
                ) : (
                  'Activate Phoenix Key'
                )}
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div 
            className="mt-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <p style={{ color: 'var(--ink-muted)' }}>
              Need help? Contact support at{' '}
              <span style={{ color: 'var(--accent-gold)' }}>keys@reforge.tech</span>
            </p>
          </div>
        </div>
      )}

      {/* Footer Badge */}
      <div 
        className="text-center py-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-center gap-4">
          <div 
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              🔐 Hardware-bound licensing
            </span>
          </div>
          <div 
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              📋 Full audit trail
            </span>
          </div>
          <div 
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              🛡️ Compliance-first
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
