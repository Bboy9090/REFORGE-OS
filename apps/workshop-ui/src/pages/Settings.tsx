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
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-gray-600 mb-8">Manage your preferences and system configuration</p>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Appearance</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Notifications</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Enable notifications</span>
            </label>
          </div>

          {/* Language */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Language</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">API Configuration</h3>
            <div>
              <label className="block text-sm font-medium mb-2">API Endpoint</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="http://localhost:8000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure the backend API endpoint
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
