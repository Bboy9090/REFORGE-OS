/**
 * SETTINGS PAGE
 * 
 * User preferences and system configuration
 * Including Operating Mode selection (Shop/Solo)
 */

import React, { useState } from 'react';
import { useMode } from '../contexts/ModeContext';
import ModeSwitcher from '../components/ModeSwitcher';

export default function Settings() {
  const { mode, config, isShopMode } = useMode();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8001');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>Settings</h1>
        <p style={{ color: 'var(--ink-muted)' }}>
          Manage your preferences and system configuration
        </p>
      </div>

      {/* Operating Mode - PROMINENT */}
      <div 
        className="rounded-xl border-2 p-6"
        style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--accent-gold)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--accent-gold)' }}>
              Operating Mode
            </h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Choose how REFORGE OS presents itself
            </p>
          </div>
        </div>
        
        <ModeSwitcher variant="full" showDescription={true} />

        {/* Current Mode Details */}
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--surface-tertiary)' }}
        >
          <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
            Current Mode: {config.name}
          </h4>
          <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
            {config.description}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Device Term:</span>{' '}
              <span style={{ color: 'var(--ink-primary)' }}>{config.terminology.device}</span>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Job Term:</span>{' '}
              <span style={{ color: 'var(--ink-primary)' }}>{config.terminology.job}</span>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Customer Term:</span>{' '}
              <span style={{ color: 'var(--ink-primary)' }}>{config.terminology.customer}</span>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Report Term:</span>{' '}
              <span style={{ color: 'var(--ink-primary)' }}>{config.terminology.report}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div 
        className="rounded-lg border p-6"
        style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
          <span>🎨</span> Appearance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="dark">Dark (Professional)</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div 
        className="rounded-lg border p-6"
        style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
          <span>🔔</span> Notifications
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
            <span style={{ color: 'var(--ink-secondary)' }}>Enable notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: 'var(--accent-gold)' }}
            />
          </label>
          {isShopMode && (
            <>
              <label className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Work order updates</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Compliance alerts</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Phoenix Key expiration</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* API Configuration */}
      <div 
        className="rounded-lg border p-6"
        style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
          <span>🔌</span> API Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
              ForgeWorks API Endpoint
            </label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full px-4 py-2 rounded-lg font-mono"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
              placeholder="http://localhost:8001"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
              Layer 2 ForgeWorks Core API endpoint
            </p>
          </div>
          
          {/* Connection Status */}
          <div 
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--surface-tertiary)' }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--state-success)' }}
            />
            <span style={{ color: 'var(--ink-secondary)' }}>Connected to ForgeWorks Core</span>
          </div>
        </div>
      </div>

      {/* Phoenix Key (Shop Mode Only) */}
      {isShopMode && (
        <div 
          className="rounded-lg border p-6"
          style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
            <span>🔑</span> Phoenix Key
          </h3>
          <div 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, rgba(207, 181, 59, 0.1) 0%, rgba(205, 127, 50, 0.1) 100%)',
              border: '1px solid var(--accent-gold)'
            }}
          >
            <div>
              <div className="font-semibold" style={{ color: 'var(--accent-gold)' }}>
                Phoenix Recover
              </div>
              <div className="text-sm font-mono" style={{ color: 'var(--ink-muted)' }}>
                PK-RECV-2024-00042
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm" style={{ color: 'var(--state-success)' }}>Active</div>
              <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Expires: Mar 22, 2025</div>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <div 
        className="rounded-lg border p-6"
        style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ink-primary)' }}>
          <span>ℹ️</span> About
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>Version:</span>{' '}
            <span style={{ color: 'var(--ink-primary)' }}>3.0.0 (Legendary)</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>Build:</span>{' '}
            <span style={{ color: 'var(--ink-primary)' }}>2024.01.18</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>Mode:</span>{' '}
            <span style={{ color: 'var(--accent-gold)' }}>{config.name}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-muted)' }}>Status:</span>{' '}
            <span style={{ color: 'var(--state-success)' }}>Industry-Ready</span>
          </div>
        </div>
        <div 
          className="mt-4 p-3 rounded-lg text-center"
          style={{ backgroundColor: 'var(--surface-tertiary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            REFORGE OS is <span style={{ color: 'var(--accent-gold)' }}>Defensible • Scalable • Sellable</span>
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
            color: 'var(--ink-inverse)',
            boxShadow: 'var(--glow-gold)',
            opacity: saveStatus === 'saving' ? 0.7 : 1
          }}
        >
          {saveStatus === 'saving' && <span className="animate-spin">⚙️</span>}
          {saveStatus === 'saved' && <span>✓</span>}
          {saveStatus === 'idle' ? 'Save Settings' : saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
        </button>
        <button 
          className="py-3 px-6 rounded-lg font-medium transition-all duration-200 border"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--ink-muted)',
            backgroundColor: 'transparent'
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
