import { useState, useCallback } from 'react';
import type { AuthorizationTrigger } from '@/lib/authorization-triggers';
import { getTriggerById } from '@/lib/authorization-triggers';

interface TriggerState {
  trigger: AuthorizationTrigger | null;
  deviceId?: string;
  deviceName?: string;
  additionalData?: Record<string, any>;
}

export function useAuthorizationTrigger() {
  const [triggerState, setTriggerState] = useState<TriggerState>({
    trigger: null,
  });
  const [isOpen, setIsOpen] = useState(false);

  const openTrigger = useCallback(
    (
      triggerId: string,
      options?: {
        deviceId?: string;
        deviceName?: string;
        additionalData?: Record<string, any>;
      }
    ) => {
      const trigger = getTriggerById(triggerId);
      if (!trigger) {
        console.error(`[useAuthorizationTrigger] Trigger not found: ${triggerId}`);
        return;
      }

      setTriggerState({
        trigger,
        deviceId: options?.deviceId,
        deviceName: options?.deviceName,
        additionalData: options?.additionalData,
      });
      setIsOpen(true);
    },
    []
  );

  const closeTrigger = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setTriggerState({ trigger: null });
    }, 200);
  }, []);

  return {
    ...triggerState,
    isOpen,
    openTrigger,
    closeTrigger,
  };
}
