/**
 * TerminalLogStream
 * 
 * CRT-style terminal log viewer with green-on-black aesthetic.
 * Used throughout the workshop for displaying command output, logs, and streams.
 */

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface LogEntry {
  timestamp?: string;
  level?: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: string;
  id?: string;
  source?: string;
}

interface TerminalLogStreamProps {
  logs: LogEntry[];
  maxLines?: number;
  autoScroll?: boolean;
  className?: string;
}

export function TerminalLogStream({
  logs,
  maxLines = 100,
  autoScroll = true,
  className,
}: TerminalLogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Limit displayed logs
  const displayedLogs = maxLines > 0 ? logs.slice(-maxLines) : logs;

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'error':
        return 'text-state-danger';
      case 'warn':
        return 'text-tape-yellow';
      case 'success':
        return 'text-state-ready';
      default:
        return 'text-spray-cyan';
    }
  };

  const getLevelPrefix = (level?: string) => {
    switch (level) {
      case 'error':
        return '[ERROR]';
      case 'warn':
        return '[WARN]';
      case 'success':
        return '[OK]';
      default:
        return '[INFO]';
    }
  };

  return (
    <ScrollArea className={cn('h-full w-full', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'font-mono text-sm p-4 bg-drawer-hidden',
          'text-spray-cyan',
          'border border-panel rounded-lg',
          'overflow-auto'
        )}
        style={{
          fontFamily: 'monospace',
        }}
      >
        {displayedLogs.length === 0 ? (
          <div className="text-ink-muted italic">No logs available</div>
        ) : (
          displayedLogs.map((log, index) => (
            <div
              key={log.id || index}
              className={cn(
                'mb-1 leading-relaxed',
                getLevelColor(log.level)
              )}
            >
              {log.timestamp && (
                <span className="text-ink-muted mr-2">{log.timestamp}</span>
              )}
              {log.level && (
                <span className="text-ink-muted mr-2">{getLevelPrefix(log.level)}</span>
              )}
              {log.source && (
                <span className="text-ink-muted mr-2">[{log.source}]</span>
              )}
              <span>{log.message}</span>
              {log.details && (
                <div className="ml-8 mt-1 text-xs text-ink-muted whitespace-pre-wrap">
                  {log.details}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
