// Device Insight Page
// Shows device state, capability class, and risk context
// Elegant, calm, authoritative - never scary or power-focused

import React from 'react';
import { LanguageOutput } from '../types/api';

interface DeviceInsightProps {
  deviceModel: string;
  platform: string;
  deviceClass: string;
  languageOutput: LanguageOutput;
  ownershipConfidence: number;
}

export default function DeviceInsight({
  deviceModel,
  platform,
  deviceClass,
  languageOutput,
  ownershipConfidence
}: DeviceInsightProps) {
  const getToneClass = (tone: string) => {
    switch (tone) {
      case 'prohibitive': return 'tone-prohibitive';
      case 'strict': return 'tone-strict';
      case 'cautionary': return 'tone-cautionary';
      default: return 'tone-informational';
    }
  };

  const getWarningIcon = (level: string) => {
    switch (level) {
      case 'elevated': return '⚠️';
      case 'standard': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <section className="device-insight">
      <div className="container">
        <h2>Device State Overview</h2>
        
        <div className="device-info">
          <div className="info-row">
            <span className="label">Device Model:</span>
            <span className="value">{deviceModel}</span>
          </div>
          <div className="info-row">
            <span className="label">Platform:</span>
            <span className="value">{platform}</span>
          </div>
          <div className="info-row">
            <span className="label">Device Class:</span>
            <span className="value">{deviceClass}</span>
          </div>
          <div className="info-row">
            <span className="label">Ownership Confidence:</span>
            <span className={`value confidence-${ownershipConfidence >= 85 ? 'high' : ownershipConfidence >= 70 ? 'medium' : 'low'}`}>
              {ownershipConfidence}%
            </span>
          </div>
        </div>

        <div className={`context-message ${getToneClass(languageOutput.tone)}`}>
          <div className="message-header">
            {getWarningIcon(languageOutput.warning_level) && (
              <span className="warning-icon">{getWarningIcon(languageOutput.warning_level)}</span>
            )}
            <h3>Observed Protection Layer</h3>
          </div>
          <p className="message-content">{languageOutput.user_facing_copy}</p>
        </div>

        <div className="recovery-feasibility">
          <h3>Recovery Feasibility: Under Review</h3>
          <p className="feasibility-note">
            Analysis indicates {languageOutput.recommended_path === 'external_authorization_required' 
              ? 'external authorization is required before proceeding'
              : languageOutput.recommended_path === 'conditional_review'
              ? 'conditional review may be necessary'
              : 'proceeding may be permitted with appropriate documentation'
            }.
          </p>
        </div>

        <div className="next-steps">
          <h3>Recommended Next Steps</h3>
          <ul>
            {languageOutput.recommended_path === 'external_authorization_required' && (
              <>
                <li>Gather ownership documentation</li>
                <li>Contact device manufacturer support</li>
                <li>Review carrier policies if applicable</li>
                <li>Consider legal authorization pathways if ownership is disputed</li>
              </>
            )}
            {languageOutput.recommended_path === 'conditional_review' && (
              <>
                <li>Review ownership documentation</li>
                <li>Assess data backup status</li>
                <li>Consider interpretive review mode (if qualified)</li>
              </>
            )}
            {languageOutput.recommended_path === 'permitted' && (
              <>
                <li>Proceed with standard analysis workflow</li>
                <li>Maintain audit documentation</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
