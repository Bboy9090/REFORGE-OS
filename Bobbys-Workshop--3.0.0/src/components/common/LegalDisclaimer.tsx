/**
 * Legal Disclaimer Component
 * Ensures users understand legal implications of device manipulation operations
 * Required for legal compliance - all bypass/flash/jailbreak features must include this
 */

import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface LegalDisclaimerProps {
  operation: 'bypass' | 'flash' | 'jailbreak' | 'unlock' | 'root' | 'shred' | 'general';
  onAccept: () => void;
  onDecline?: () => void;
  variant?: 'modal' | 'inline' | 'banner';
  showFullText?: boolean;
}

const LEGAL_WARNINGS: Record<LegalDisclaimerProps['operation'], {
  title: string;
  shortWarning: string;
  fullWarning: string;
  legalNote: string;
}> = {
  bypass: {
    title: 'FRP/MDM/Activation Lock Bypass',
    shortWarning: 'This operation bypasses factory reset protection or device management. Only use on devices you legally own.',
    fullWarning: `Factory Reset Protection (FRP), Mobile Device Management (MDM), and Activation Lock bypasses are intended ONLY for:
    
    • Devices you legally own and can prove ownership
    • Devices you have explicit written permission to modify
    • Personal devices where you have forgotten credentials
    
    ILLEGAL USES include:
    • Bypassing security on stolen devices
    • Circumventing corporate MDM without authorization
    • Removing iCloud/Google accounts without owner consent
    • Any use that violates local, state, or federal laws
    
    Using these tools on devices you do not own or without proper authorization may result in:
    • Criminal charges (theft, unauthorized access)
    • Civil liability
    • Violation of DMCA or computer fraud statutes`,
    legalNote: 'By proceeding, you certify that you own this device or have written authorization from the owner. All operations are logged for audit purposes.',
  },
  flash: {
    title: 'Device Firmware Flash Operation',
    shortWarning: 'Flashing firmware can permanently damage your device. Only flash firmware intended for your specific device model.',
    fullWarning: `Firmware flashing operations involve writing low-level software to your device's storage:
    
    LEGAL USES:
    • Installing official firmware on your own device
    • Restoring devices you own to factory settings
    • Installing custom ROMs on devices you own (where permitted)
    
    RISKS:
    • Permanent device damage (bricking)
    • Voiding manufacturer warranty
    • Loss of data and settings
    • Potential security vulnerabilities
    
    ILLEGAL USES:
    • Flashing firmware on stolen devices
    • Removing carrier locks without authorization
    • Bypassing security measures for unauthorized access`,
    legalNote: 'You are solely responsible for any damage caused by firmware flashing. Ensure you have backups and understand the risks.',
  },
  jailbreak: {
    title: 'iOS Jailbreak Operation',
    shortWarning: 'Jailbreaking removes iOS security restrictions. This may void warranty and is only legal on devices you own.',
    fullWarning: `iOS jailbreaking involves removing Apple's security restrictions:
    
    LEGAL STATUS:
    • Legal for personal use on devices you own (DMCA exemption)
    • May void Apple warranty
    • Breaks device security model
    
    RISKS:
    • Security vulnerabilities
    • Instability and crashes
    • Loss of warranty support
    • Potential data loss
    
    ILLEGAL USES:
    • Jailbreaking devices you do not own
    • Removing MDM/Activation Lock illegally
    • Bypassing enterprise security policies`,
    legalNote: 'Jailbreaking is legal only on devices you own. Apple may refuse warranty service on jailbroken devices.',
  },
  unlock: {
    title: 'Bootloader Unlock',
    shortWarning: 'Unlocking bootloader removes security protections. Only perform on devices you own with manufacturer authorization.',
    fullWarning: `Bootloader unlocking allows custom firmware installation:
    
    LEGAL CONSIDERATIONS:
    • Manufacturers provide unlock tools for some devices
    • May void warranty
    • Required for custom ROM installation
    
    RISKS:
    • Permanent security downgrade
    • Potential data loss
    • Warranty voidance
    
    ILLEGAL USES:
    • Unlocking stolen devices
    • Bypassing carrier locks illegally
    • Removing enterprise security`,
    legalNote: 'Only unlock bootloaders on devices you own and where manufacturer permits.',
  },
  root: {
    title: 'Android Root Access',
    shortWarning: 'Rooting grants system-level access. Only root devices you own and understand the security implications.',
    fullWarning: `Rooting Android provides administrator-level access:
    
    LEGAL STATUS:
    • Legal on devices you own
    • May void warranty
    • Breaks security model
    
    RISKS:
    • Security vulnerabilities
    • Apps may refuse to run
    • Potential data loss
    • System instability`,
    legalNote: 'Rooting is legal only on devices you own. Many banking and security apps will not function on rooted devices.',
  },
  shred: {
    title: 'Metadata Removal (Shredding)',
    shortWarning: 'Removing metadata is legal for privacy protection on files you own. Ensure you have legal right to modify files.',
    fullWarning: `Metadata shredding removes digital fingerprints from files:
    
    LEGAL USES:
    • Privacy protection on personal files
    • Removing location data from photos
    • Anonymizing documents you own
    
    ILLEGAL USES:
    • Removing evidence from investigation
    • Tampering with court evidence
    • Destroying proof of ownership`,
    legalNote: 'Only remove metadata from files you legally own or have permission to modify.',
  },
  general: {
    title: 'Device Manipulation Operation',
    shortWarning: 'This operation modifies device software or security. Only use on devices you legally own.',
    fullWarning: `Device manipulation operations involve modifying device software or security:
    
    LEGAL REQUIREMENTS:
    • You must own the device or have written authorization
    • You must comply with local, state, and federal laws
    • You must not violate DMCA or computer fraud statutes
    
    ALL OPERATIONS ARE LOGGED for audit and legal compliance.`,
    legalNote: 'By proceeding, you certify legal ownership or authorization. Misuse may result in criminal charges.',
  },
};

export function LegalDisclaimer({
  operation,
  onAccept,
  onDecline,
  variant = 'modal',
  showFullText = false,
}: LegalDisclaimerProps) {
  const [accepted, setAccepted] = useState(false);
  const [showFull, setShowFull] = useState(showFullText);
  const warning = LEGAL_WARNINGS[operation];

  if (variant === 'banner') {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-400">{warning.title}</AlertTitle>
        <AlertDescription className="text-gray-300 mt-2">
          {warning.shortWarning}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <Card className="border-amber-500/50 bg-amber-500/10 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Shield className="w-5 h-5" />
            Legal Warning
          </CardTitle>
          <CardDescription className="text-gray-300">
            {warning.shortWarning}
          </CardDescription>
        </CardHeader>
        {showFull && (
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300 whitespace-pre-line">
              {warning.fullWarning}
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400 font-mono">{warning.legalNote}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="legal-accept"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-gray-900 border-gray-700 rounded focus:ring-cyan-500"
              />
              <label htmlFor="legal-accept" className="text-sm text-gray-300">
                I understand the legal implications and confirm I own this device or have authorization
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (accepted) {
                    onAccept();
                  }
                }}
                disabled={!accepted}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept & Continue
              </Button>
              {onDecline && (
                <Button
                  onClick={onDecline}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        )}
        {!showFull && (
          <CardContent>
            <Button
              onClick={() => setShowFull(true)}
              variant="ghost"
              className="text-amber-400 hover:text-amber-300"
            >
              Show Full Legal Warning
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  // Modal variant (default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-amber-500/50 bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400 text-xl">
            <Shield className="w-6 h-6" />
            {warning.title} - Legal Disclaimer
          </CardTitle>
          <CardDescription className="text-gray-300">
            {warning.shortWarning}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
            {warning.fullWarning}
          </div>
          
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 font-mono leading-relaxed">
              ⚠️ {warning.legalNote}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              id="legal-accept-modal"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-cyan-500 bg-gray-900 border-gray-700 rounded focus:ring-cyan-500 flex-shrink-0"
            />
            <label htmlFor="legal-accept-modal" className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">I certify that:</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>I own this device or have written authorization from the owner</li>
                <li>I understand the legal implications of this operation</li>
                <li>I will not use this tool for illegal purposes</li>
                <li>I understand all operations are logged for audit purposes</li>
              </ul>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                if (accepted) {
                  onAccept();
                }
              }}
              disabled={!accepted}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Accept & Proceed
            </Button>
            {onDecline && (
              <Button
                onClick={onDecline}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                size="lg"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
