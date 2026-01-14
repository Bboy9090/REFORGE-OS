// Notifications / Alerts Center
// System notifications and alerts

import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notifications
    setNotifications([
      {
        id: '1',
        type: 'warning',
        title: 'Ownership Confidence Low',
        message: 'Device analysis requires additional ownership documentation. Confidence score: 65%',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Compliance Report Generated',
        message: 'Compliance report for iPhone 12 has been generated. Audit reference: AUD-2024-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'success',
        title: 'Certification Updated',
        message: 'Your certification status has been updated to Level II - Repair Custodian',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
      {
        id: '4',
        type: 'error',
        title: 'Audit Log Export Failed',
        message: 'Failed to export audit log. Please try again or contact support.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: false,
      },
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case 'error': return 'var(--state-error)';
      case 'warning': return 'var(--state-warning)';
      case 'success': return 'var(--state-success)';
      default: return 'var(--accent-steel)';
    }
  };

  return (
    <section className="notifications-center">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Notifications</h2>
            <p style={{ color: 'var(--ink-secondary)' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm rounded-lg transition-all duration-300"
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
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-lg shadow-sm border p-4 mb-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          <div className="flex space-x-2">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === f ? '' : ''
                }`}
                style={{
                  backgroundColor: filter === f ? 'var(--accent-gold)' : 'var(--surface-tertiary)',
                  color: filter === f ? 'var(--ink-inverse)' : 'var(--ink-secondary)',
                  boxShadow: filter === f ? 'var(--glow-gold)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (filter !== f) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== f) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  }
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-lg shadow-sm border p-12 text-center" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}>
              <p style={{ color: 'var(--ink-muted)' }}>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-4"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: getTypeBorderColor(notification.type),
                  borderLeftWidth: !notification.read ? '4px' : '1px',
                  borderLeftStyle: 'solid'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-gold)' }}></span>
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>{notification.message}</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs transition-colors"
                        style={{ color: 'var(--accent-gold)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent-gold-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--accent-gold)';
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--state-error)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
