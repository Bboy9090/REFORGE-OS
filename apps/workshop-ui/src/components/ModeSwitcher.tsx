/**
 * MODE SWITCHER COMPONENT
 * 
 * Allows switching between Shop Mode and Solo Mode
 */

import { useState } from 'react';
import { useMode, OperatingMode, MODE_CONFIGS } from '../contexts/ModeContext';

interface ModeSwitcherProps {
  variant?: 'full' | 'compact' | 'minimal';
  showDescription?: boolean;
}

export default function ModeSwitcher({ 
  variant = 'full',
  showDescription = true 
}: ModeSwitcherProps) {
  const { mode, setMode, config } = useMode();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<OperatingMode | null>(null);

  const handleModeChange = (newMode: OperatingMode) => {
    if (newMode === mode) return;
    setPendingMode(newMode);
    setShowConfirm(true);
  };

  const confirmChange = () => {
    if (pendingMode) {
      setMode(pendingMode);
    }
    setShowConfirm(false);
    setPendingMode(null);
  };

  const cancelChange = () => {
    setShowConfirm(false);
    setPendingMode(null);
  };

  // Minimal variant - just an icon toggle
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => handleModeChange(mode === 'shop' ? 'solo' : 'shop')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: 'var(--surface-tertiary)',
          color: 'var(--ink-muted)'
        }}
        title={`Switch to ${mode === 'shop' ? 'Solo' : 'Shop'} Mode`}
      >
        <span>{config.icon}</span>
        <span className="text-sm">{config.name}</span>
      </button>
    );
  }

  // Compact variant - toggle button
  if (variant === 'compact') {
    return (
      <>
        <div 
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--surface-tertiary)' }}
        >
          {Object.values(MODE_CONFIGS).map((modeConfig) => (
            <button
              key={modeConfig.id}
              onClick={() => handleModeChange(modeConfig.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: mode === modeConfig.id ? 'var(--surface-elevated)' : 'transparent',
                color: mode === modeConfig.id ? 'var(--accent-gold)' : 'var(--ink-muted)',
                border: mode === modeConfig.id ? '1px solid var(--accent-gold)' : '1px solid transparent'
              }}
            >
              <span>{modeConfig.icon}</span>
              <span className="text-sm font-medium">{modeConfig.id === 'shop' ? 'Shop' : 'Solo'}</span>
            </button>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && pendingMode && (
          <ConfirmModal
            pendingMode={pendingMode}
            onConfirm={confirmChange}
            onCancel={cancelChange}
          />
        )}
      </>
    );
  }

  // Full variant - detailed cards
  return (
    <div className="space-y-6">
      {/* Mode Selection Cards */}
      <div className="grid grid-cols-2 gap-6">
        {Object.values(MODE_CONFIGS).map((modeConfig) => (
          <button
            key={modeConfig.id}
            onClick={() => handleModeChange(modeConfig.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
              mode === modeConfig.id ? 'transform scale-102' : ''
            }`}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: mode === modeConfig.id ? 'var(--accent-gold)' : 'var(--border-primary)',
              boxShadow: mode === modeConfig.id ? '0 0 30px rgba(207, 181, 59, 0.2)' : 'none'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ 
                    backgroundColor: mode === modeConfig.id 
                      ? 'var(--accent-gold)' 
                      : 'var(--surface-tertiary)'
                  }}
                >
                  {modeConfig.icon}
                </div>
                <div>
                  <h3 
                    className="font-bold"
                    style={{ 
                      color: mode === modeConfig.id 
                        ? 'var(--accent-gold)' 
                        : 'var(--ink-primary)' 
                    }}
                  >
                    {modeConfig.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                    {modeConfig.tagline}
                  </p>
                </div>
              </div>
              
              {mode === modeConfig.id && (
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--ink-inverse)'
                  }}
                >
                  Active
                </div>
              )}
            </div>

            {/* Description */}
            {showDescription && (
              <>
                <p className="mb-4 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {modeConfig.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {modeConfig.features.slice(0, 4).map((feature, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      <span style={{ color: 'var(--accent-gold)' }}>✓</span>
                      {feature}
                    </div>
                  ))}
                  {modeConfig.features.length > 4 && (
                    <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      +{modeConfig.features.length - 4} more features
                    </div>
                  )}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && pendingMode && (
        <ConfirmModal
          pendingMode={pendingMode}
          onConfirm={confirmChange}
          onCancel={cancelChange}
        />
      )}
    </div>
  );
}

// Confirmation Modal Component
function ConfirmModal({ 
  pendingMode, 
  onConfirm, 
  onCancel 
}: { 
  pendingMode: OperatingMode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const newConfig = MODE_CONFIGS[pendingMode];

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div 
        className="max-w-md w-full mx-4 rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface-secondary)' }}
      >
        {/* Header */}
        <div 
          className="p-6 text-center"
          style={{ 
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)'
          }}
        >
          <div className="text-4xl mb-2">{newConfig.icon}</div>
          <h2 className="text-xl font-bold text-white">
            Switch to {newConfig.name}?
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-center mb-6" style={{ color: 'var(--ink-secondary)' }}>
            {newConfig.description}
          </p>

          <div 
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: 'var(--surface-tertiary)' }}
          >
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
              What changes:
            </h4>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
              <li>• Navigation options will be adjusted</li>
              <li>• Interface terminology will update</li>
              <li>• Feature visibility will change</li>
              <li>• Your data and settings are preserved</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-medium transition-all duration-200 border"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-muted)',
                backgroundColor: 'transparent'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
                color: 'white'
              }}
            >
              Switch Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
