// User Profile / Account Management
// Profile information, role display, certification status, activity history

import React, { useState, useEffect } from 'react';

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  certificationLevel: string | null;
  createdAt: string;
  lastActivity: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadActivityHistory();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from API
      // const response = await fetch('/api/v1/user/profile');
      // const data = await response.json();
      
      // Mock data
      setProfile({
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'Technician',
        certificationLevel: 'Level II - Repair Custodian',
        createdAt: '2024-01-15T10:00:00Z',
        lastActivity: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityHistory = async () => {
    try {
      // Mock activity history
      setActivityHistory([
        { id: '1', action: 'Device Analysis', device: 'iPhone 12', timestamp: new Date().toISOString() },
        { id: '2', action: 'Compliance Report Generated', device: 'Samsung Galaxy S21', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', action: 'Ownership Verification', device: 'iPad Pro', timestamp: new Date(Date.now() - 7200000).toISOString() },
      ]);
    } catch (err) {
      console.error('Failed to load activity history', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'var(--state-error)';
      case 'custodian': return 'var(--accent-bronze)';
      case 'technician': return 'var(--accent-steel)';
      default: return 'var(--accent-steel)';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ 
          borderColor: 'var(--accent-gold)',
          borderTopColor: 'transparent'
        }}></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>No profile data available</div>;
  }

  return (
    <section className="user-profile">
      <div className="container max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>User Profile</h2>
        <p className="mb-8" style={{ color: 'var(--ink-secondary)' }}>Manage your account and view activity</p>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Name</label>
                <p style={{ color: 'var(--ink-primary)' }}>{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Email</label>
                <p style={{ color: 'var(--ink-primary)' }}>{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Role</label>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{
                  backgroundColor: getRoleBadgeColor(profile.role),
                  color: 'var(--ink-primary)',
                  opacity: 0.8
                }}>
                  {profile.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Certification Level</label>
                <p style={{ color: 'var(--ink-primary)' }}>
                  {profile.certificationLevel || 'Not Certified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Account Created</label>
                <p style={{ color: 'var(--ink-primary)' }}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Account Security</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors" style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--ink-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              }}>
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors" style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--ink-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              }}>
                Two-Factor Authentication
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors" style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--ink-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              }}>
                API Keys
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Recent Activity</h3>
            {activityHistory.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityHistory.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2" style={{ 
                    borderBottom: '1px solid var(--border-primary)'
                  }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--ink-primary)' }}>{activity.action}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{activity.device}</p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
