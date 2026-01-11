/**
 * TrapdoorBypassLaboratory
 * 
 * Wrapper for BobbysTraproom component that integrates with Secret Rooms authentication.
 * Provides access to advanced security bypass tools.
 */

import React, { useEffect } from 'react';
import { BobbysTraproom } from '../SecretRoom/BobbysTraproom';
import { SECRET_ROOM_PASSWORD } from '@/lib/secrets';

interface TrapdoorBypassLaboratoryProps {
  passcode?: string;
}

export function TrapdoorBypassLaboratory({ passcode }: TrapdoorBypassLaboratoryProps) {
  // The BobbysTraproom component has its own authentication
  // We need to pre-authenticate it using localStorage
  useEffect(() => {
    if (passcode) {
      // Store passcode for BobbysTraproom to use
      try {
        localStorage.setItem('bobbysWorkshop.secretRoomPasscode', passcode);
        // Also set the SECRET_ROOM_PASSWORD if it matches
        if (passcode === SECRET_ROOM_PASSWORD) {
          // Component will auto-authenticate
        }
      } catch (error) {
        console.error('[TrapdoorBypassLaboratory] Failed to store passcode:', error);
      }
    }
  }, [passcode]);

  return (
    <div className="h-full w-full bg-basement-concrete">
      <BobbysTraproom />
    </div>
  );
}
