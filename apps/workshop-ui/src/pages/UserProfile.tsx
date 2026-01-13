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
      case 'admin': return 'bg-red-100 text-red-800';
      case 'custodian': return 'bg-purple-100 text-purple-800';
      case 'technician': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8 text-gray-500">No profile data available</div>;
  }

  return (
    <section className="user-profile">
      <div className="container max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2">User Profile</h2>
        <p className="text-gray-600 mb-8">Manage your account and view activity</p>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                <p className="text-gray-900">
                  {profile.certificationLevel || 'Not Certified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <p className="text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Account Security</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50">
                Two-Factor Authentication
              </button>
              <button className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50">
                API Keys
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            {activityHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityHistory.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.device}</p>
                    </div>
                    <p className="text-xs text-gray-500">
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
