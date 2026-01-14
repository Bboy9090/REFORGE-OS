// Full Interpretive Review Interface
// Complete interpretive review UI for Custodian Vault access
// Shows risk context, historical context, and routing recommendations

import React, { useState, useEffect } from 'react';
import { ForgeWorksAPI } from '../services/api';
import { LanguageOutput, AuthorityRoute } from '../types/api';

interface InterpretiveReviewProps {
  deviceId?: string;
  ownershipConfidence: number;
  onAcknowledgment?: () => void;
}

export default function InterpretiveReview({
  deviceId,
  ownershipConfidence,
  onAcknowledgment
}: InterpretiveReviewProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [languageOutput, setLanguageOutput] = useState<LanguageOutput | null>(null);
  const [authorityRoutes, setAuthorityRoutes] = useState<AuthorityRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deviceId && ownershipConfidence >= 85) {
      loadInterpretiveContext();
    }
  }, [deviceId, ownershipConfidence]);

  const loadInterpretiveContext = async () => {
    if (!deviceId) return;

    setLoading(true);
    setError(null);

    try {
      // Load language output (shaped by risk-language-engine)
      const deviceContext = {
        platform: 'ios', // Would come from device analysis
        deviceClass: 'A12-A17',
        ownershipConfidence,
        jurisdiction: 'us',
      };

      const classification = {
        research_class: 'kernel_research',
        risk_profile: {
          account: 'high',
          data: 'high',
          legal: 'medium',
        },
      };

      const language = await ForgeWorksAPI.shapeLanguage(deviceContext, classification);
      setLanguageOutput(language);

      // Load authority routes
      const routes = await ForgeWorksAPI.getAuthorityRoutes(deviceId, classification.research_class);
      setAuthorityRoutes(routes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interpretive context');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgment = () => {
    setAcknowledged(true);
    if (onAcknowledgment) {
      onAcknowledgment();
    }
  };

  const getToneBorderColor = (tone: string) => {
    switch (tone) {
      case 'prohibitive': return 'var(--state-error)';
      case 'strict': return 'var(--state-warning)';
      case 'cautionary': return 'var(--accent-steel)';
      default: return 'var(--border-primary)';
    }
  };

  if (ownershipConfidence < 85) {
    return (
      <div className="interpretive-review-gate">
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--state-warning)',
          borderColor: 'var(--state-warning)',
          border: '1px solid var(--state-warning)',
          opacity: 0.1
        }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--state-warning)' }}>
            Ownership Confidence Insufficient
          </h3>
          <p style={{ color: 'var(--ink-secondary)' }}>
            Interpretive Review Mode requires ownership confidence of 85% or higher. 
            Current confidence: {ownershipConfidence}%. External authorization may be required.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ 
          borderColor: 'var(--accent-gold)',
          borderTopColor: 'transparent'
        }}></div>
        <p className="mt-4" style={{ color: 'var(--ink-muted)' }}>Loading interpretive context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border px-4 py-3 rounded" style={{ 
        backgroundColor: 'var(--state-error)',
        borderColor: 'var(--state-error)',
        color: 'var(--ink-primary)',
        opacity: 0.1
      }}>
        <div style={{ color: 'var(--state-error)' }}>{error}</div>
      </div>
    );
  }

  return (
    <section className="interpretive-review">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Custodian Vault — Interpretive Review Mode</h2>
          <p style={{ color: 'var(--ink-secondary)' }}>
            Analysis only. No actions executed. Logged for compliance.
          </p>
        </div>

        {/* Acknowledgment Gate */}
        {!acknowledged && (
          <div className="rounded-lg p-6 mb-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--accent-steel)',
            border: '1px solid var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Review Acknowledgment Required</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1"
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  I acknowledge that Interpretive Review Mode provides historical context 
                  and risk assessment only. No procedural guidance, tool references, or 
                  execution steps are displayed. All activity is logged for compliance.
                </span>
              </label>
              <button
                onClick={handleAcknowledgment}
                disabled={!acknowledged}
                className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor: acknowledged ? 'var(--accent-gold)' : 'var(--surface-tertiary)',
                  color: acknowledged ? 'var(--ink-inverse)' : 'var(--ink-muted)',
                  boxShadow: acknowledged ? 'var(--glow-gold)' : 'none',
                  cursor: acknowledged ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (acknowledged) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (acknowledged) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  }
                }}
              >
                Proceed to Interpretive Review
              </button>
            </div>
          </div>
        )}

        {acknowledged && languageOutput && (
          <div className="space-y-6">
            {/* Risk Context */}
            <div className="border rounded-lg p-6" style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: getToneBorderColor(languageOutput.tone),
              border: `1px solid ${getToneBorderColor(languageOutput.tone)}`
            }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>Observed Risk Context</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>{languageOutput.user_facing_copy}</p>
              <div className="mt-4 flex items-center space-x-4">
                <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>Warning Level:</span>
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  color: 'var(--ink-secondary)'
                }}>
                  {languageOutput.warning_level}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>Tone:</span>
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  color: 'var(--ink-secondary)'
                }}>
                  {languageOutput.tone}
                </span>
              </div>
            </div>

            {/* Historical Context (Abstract Only) */}
            <div className="rounded-lg p-6" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>Historical Context (Assessment Only)</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--ink-secondary)' }}>
                Devices in this class have historically been subject to independent security 
                research. This context is provided for risk assessment purposes only.
              </p>
              <div className="rounded p-4" style={{ 
                backgroundColor: 'var(--surface-tertiary)'
              }}>
                <p className="text-xs italic" style={{ color: 'var(--ink-muted)' }}>
                  "This device class has been subject to system-level modification research. 
                  Unauthorized modification may result in data loss, account restrictions, 
                  or service term violations. External authorization may be required."
                </p>
              </div>
              <p className="text-xs mt-4" style={{ color: 'var(--ink-muted)' }}>
                <strong>Note:</strong> Historical context provided for assessment only. 
                No procedural guidance is displayed.
              </p>
            </div>

            {/* Authority Routing */}
            {authorityRoutes.length > 0 && (
              <div className="border rounded-lg p-6" style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid var(--border-primary)'
              }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Required Authority Pathways</h3>
                <div className="space-y-4">
                  {authorityRoutes.map((route) => (
                    <div key={route.id} className="border rounded p-4" style={{ 
                      backgroundColor: 'var(--surface-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {route.authorityType === 'oem' ? '🏭' :
                           route.authorityType === 'carrier' ? '📡' :
                           '⚖️'}
                        </span>
                        <span className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                          {route.authorityType === 'oem' ? 'Device Manufacturer' :
                           route.authorityType === 'carrier' ? 'Wireless Carrier' :
                           'Legal Authority'}
                        </span>
                      </div>
                      {route.contactPath && (
                        <p className="text-sm mb-2" style={{ color: 'var(--ink-secondary)' }}>
                          Contact: {route.contactPath}
                        </p>
                      )}
                      {route.documentationRequired && route.documentationRequired.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>Documentation Required:</p>
                          <ul className="text-xs list-disc list-inside" style={{ color: 'var(--ink-secondary)' }}>
                            {route.documentationRequired.map((doc, idx) => (
                              <li key={idx}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Disclaimer */}
            <div className="rounded-lg p-4" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              border: '1px solid var(--border-primary)'
            }}>
              <p className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                <strong>Compliance Statement:</strong> {languageOutput.compliance_disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
