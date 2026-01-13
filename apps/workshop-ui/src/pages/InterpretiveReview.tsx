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

  if (ownershipConfidence < 85) {
    return (
      <div className="interpretive-review-gate">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Ownership Confidence Insufficient
          </h3>
          <p className="text-yellow-700">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading interpretive context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <section className="interpretive-review">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Custodian Vault — Interpretive Review Mode</h2>
          <p className="text-gray-600">
            Analysis only. No actions executed. Logged for compliance.
          </p>
        </div>

        {/* Acknowledgment Gate */}
        {!acknowledged && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Review Acknowledgment Required</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I acknowledge that Interpretive Review Mode provides historical context 
                  and risk assessment only. No procedural guidance, tool references, or 
                  execution steps are displayed. All activity is logged for compliance.
                </span>
              </label>
              <button
                onClick={handleAcknowledgment}
                disabled={!acknowledged}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Proceed to Interpretive Review
              </button>
            </div>
          </div>
        )}

        {acknowledged && languageOutput && (
          <div className="space-y-6">
            {/* Risk Context */}
            <div className={`border rounded-lg p-6 ${
              languageOutput.tone === 'prohibitive' ? 'border-red-200 bg-red-50' :
              languageOutput.tone === 'strict' ? 'border-yellow-200 bg-yellow-50' :
              languageOutput.tone === 'cautionary' ? 'border-blue-200 bg-blue-50' :
              'border-gray-200 bg-gray-50'
            }`}>
              <h3 className="font-semibold mb-3">Observed Risk Context</h3>
              <p className="text-sm leading-relaxed">{languageOutput.user_facing_copy}</p>
              <div className="mt-4 flex items-center space-x-4">
                <span className="text-xs font-medium">Warning Level:</span>
                <span className="text-xs px-2 py-1 bg-white rounded">
                  {languageOutput.warning_level}
                </span>
                <span className="text-xs font-medium">Tone:</span>
                <span className="text-xs px-2 py-1 bg-white rounded">
                  {languageOutput.tone}
                </span>
              </div>
            </div>

            {/* Historical Context (Abstract Only) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Historical Context (Assessment Only)</h3>
              <p className="text-sm text-gray-700 mb-4">
                Devices in this class have historically been subject to independent security 
                research. This context is provided for risk assessment purposes only.
              </p>
              <div className="bg-white rounded p-4">
                <p className="text-xs text-gray-600 italic">
                  "This device class has been subject to system-level modification research. 
                  Unauthorized modification may result in data loss, account restrictions, 
                  or service term violations. External authorization may be required."
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                <strong>Note:</strong> Historical context provided for assessment only. 
                No procedural guidance is displayed.
              </p>
            </div>

            {/* Authority Routing */}
            {authorityRoutes.length > 0 && (
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Required Authority Pathways</h3>
                <div className="space-y-4">
                  {authorityRoutes.map((route) => (
                    <div key={route.id} className="bg-white border rounded p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">
                          {route.authorityType === 'oem' ? '🏭' :
                           route.authorityType === 'carrier' ? '📡' :
                           '⚖️'}
                        </span>
                        <span className="font-medium">
                          {route.authorityType === 'oem' ? 'Device Manufacturer' :
                           route.authorityType === 'carrier' ? 'Wireless Carrier' :
                           'Legal Authority'}
                        </span>
                      </div>
                      {route.contactPath && (
                        <p className="text-sm text-gray-600 mb-2">
                          Contact: {route.contactPath}
                        </p>
                      )}
                      {route.documentationRequired && route.documentationRequired.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Documentation Required:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>Compliance Statement:</strong> {languageOutput.compliance_disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
