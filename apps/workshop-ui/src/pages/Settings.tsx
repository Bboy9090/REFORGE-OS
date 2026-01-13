// Settings / Preferences Page
// User preferences and system settings

import React, { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000');

  return (
    <section className="settings">
      <div className="container max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Settings</h2>
        <p className="mb-8" style={{ color: 'var(--ink-secondary)' }}>Manage your preferences and system configuration</p>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Appearance</h3>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Theme</label>
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
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Notifications</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--accent-gold)' }}
              />
              <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Enable notifications</span>
            </label>
          </div>

          {/* Language */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Language</h3>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Language</label>
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

          {/* API Configuration */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>API Configuration</h3>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>API Endpoint</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--ink-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                placeholder="http://localhost:8000"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                Configure the backend API endpoint
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button 
              className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent-gold)',
                color: 'var(--ink-inverse)',
                boxShadow: 'var(--glow-gold)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
