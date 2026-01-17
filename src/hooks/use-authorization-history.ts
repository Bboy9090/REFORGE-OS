import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useEffect } from 'react';
import type { 
  AuthorizationHistoryEntry, 
  AuthorizationRetryConfig,
  TimelineGroup 
} from '@/types/authorization-history';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const DEFAULT_RETRY_CONFIG: AuthorizationRetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  timeout: 30000,
};

export function useAuthorizationHistory() {
  const [history, setHistory, deleteHistory] = useKV<AuthorizationHistoryEntry[]>(
    'authorization-history',
    []
  );
  const [retryConfig] = useKV<AuthorizationRetryConfig>(
    'authorization-retry-config',
    DEFAULT_RETRY_CONFIG
  );
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});

  const addHistoryEntry = useCallback(
    (entry: Omit<AuthorizationHistoryEntry, 'id' | 'timestamp'>) => {
      const config = retryConfig || DEFAULT_RETRY_CONFIG;
      const newEntry: AuthorizationHistoryEntry = {
        ...entry,
        id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: entry.retryCount || 0,
        maxRetries: config.maxRetries,
      };

      setHistory((currentHistory) => [newEntry, ...(currentHistory || [])]);
      return newEntry;
    },
    [setHistory, retryConfig]
  );

  const updateHistoryEntry = useCallback(
    (id: string, updates: Partial<AuthorizationHistoryEntry>) => {
      setHistory((currentHistory) =>
        (currentHistory || []).map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
    },
    [setHistory]
  );

  const deleteHistoryEntry = useCallback(
    (id: string) => {
      setHistory((currentHistory) => 
        (currentHistory || []).filter((entry) => entry.id !== id)
      );
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const retryAuthorization = useCallback(
    async (
      entryId: string,
      executeFn: () => Promise<any>
    ): Promise<boolean> => {
      const currentHistory = history || [];
      const config = retryConfig || DEFAULT_RETRY_CONFIG;
      
      const entry = currentHistory.find((e) => e.id === entryId);
      if (!entry) {
        console.error('[AuthHistory] Entry not found for retry:', entryId);
        return false;
      }

      const currentRetryCount = entry.retryCount || 0;
      if (currentRetryCount >= config.maxRetries) {
        console.warn('[AuthHistory] Max retries reached for:', entryId);
        updateHistoryEntry(entryId, {
          status: 'failed',
          errorMessage: 'Maximum retry attempts exceeded',
        });
        return false;
      }

      setIsRetrying((current) => ({ ...current, [entryId]: true }));

      updateHistoryEntry(entryId, {
        status: 'retrying',
        retryCount: currentRetryCount + 1,
      });

      const delay = config.retryDelay * Math.pow(
        config.backoffMultiplier,
        currentRetryCount
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        const startTime = Date.now();
        const result = await Promise.race([
          executeFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), config.timeout)
          ),
        ]);

        const executionTime = Date.now() - startTime;

        updateHistoryEntry(entryId, {
          status: 'success',
          executionTime,
          errorMessage: undefined,
          metadata: {
            ...entry.metadata,
            retrySucceeded: true,
            lastRetryAt: Date.now(),
          },
        });

        setIsRetrying((current) => ({ ...current, [entryId]: false }));
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (currentRetryCount + 1 >= config.maxRetries) {
          updateHistoryEntry(entryId, {
            status: 'failed',
            errorMessage: `Failed after ${currentRetryCount + 1} retries: ${errorMessage}`,
          });
          setIsRetrying((current) => ({ ...current, [entryId]: false }));
          return false;
        } else {
          updateHistoryEntry(entryId, {
            status: 'failed',
            errorMessage,
            metadata: {
              ...entry.metadata,
              lastRetryError: errorMessage,
              lastRetryAt: Date.now(),
            },
          });
          setIsRetrying((current) => ({ ...current, [entryId]: false }));
          return false;
        }
      }
    },
    [history, retryConfig, updateHistoryEntry]
  );

  const getTimelineGroups = useCallback((): TimelineGroup[] => {
    const currentHistory = history || [];
    const groups: Record<string, AuthorizationHistoryEntry[]> = {};

    currentHistory.forEach((entry) => {
      const date = new Date(entry.timestamp);
      let dateKey: string;

      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM d, yyyy');
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return Object.entries(groups).map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => b.timestamp - a.timestamp),
    }));
  }, [history]);

  const getFilteredHistory = useCallback(
    (filters: {
      category?: string;
      status?: string;
      deviceId?: string;
      dateRange?: { start: number; end: number };
    }) => {
      const currentHistory = history || [];
      return currentHistory.filter((entry) => {
        if (filters.category && entry.category !== filters.category) return false;
        if (filters.status && entry.status !== filters.status) return false;
        if (filters.deviceId && entry.deviceId !== filters.deviceId) return false;
        if (filters.dateRange) {
          if (
            entry.timestamp < filters.dateRange.start ||
            entry.timestamp > filters.dateRange.end
          ) {
            return false;
          }
        }
        return true;
      });
    },
    [history]
  );

  const getStats = useCallback(() => {
    const currentHistory = history || [];
    const total = currentHistory.length;
    const successful = currentHistory.filter((e) => e.status === 'success').length;
    const failed = currentHistory.filter((e) => e.status === 'failed').length;
    const pending = currentHistory.filter((e) => e.status === 'pending').length;
    const retrying = currentHistory.filter((e) => e.status === 'retrying').length;
    const avgExecutionTime =
      currentHistory
        .filter((e) => e.executionTime)
        .reduce((sum, e) => sum + (e.executionTime || 0), 0) /
        currentHistory.filter((e) => e.executionTime).length || 0;

    return {
      total,
      successful,
      failed,
      pending,
      retrying,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgExecutionTime,
    };
  }, [history]);

  return {
    history,
    addHistoryEntry,
    updateHistoryEntry,
    deleteHistoryEntry,
    clearHistory,
    retryAuthorization,
    getTimelineGroups,
    getFilteredHistory,
    getStats,
    isRetrying,
    retryConfig,
  };
}
