import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    CaretUp, 
    CaretDown, 
    X,
    Info,
    CheckCircle,
    Warning,
    XCircle
} from '@phosphor-icons/react';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

export function LogsPanel() {
    const [expanded, setExpanded] = useState(false);
    const [logs] = useState<LogEntry[]>([
        {
            id: '1',
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'Workshop initialized'
        }
    ]);

    const getLogIcon = (level: LogEntry['level']) => {
        switch (level) {
            case 'info':
                return <Info weight="fill" className="text-primary" />;
            case 'success':
                return <CheckCircle weight="fill" className="text-success" />;
            case 'warning':
                return <Warning weight="fill" className="text-warning" />;
            case 'error':
                return <XCircle weight="fill" className="text-destructive" />;
        }
    };

    return (
        <div 
            className={`border-t border-border bg-card/50 transition-all duration-300 ${
                expanded ? 'h-64' : 'h-10'
            }`}
        >
            <div className="h-10 flex items-center justify-between px-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        Console
                    </h3>
                    <Badge variant="outline" className="h-4 px-1.5 text-xs">
                        {logs.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <CaretDown /> : <CaretUp />}
                    </Button>
                </div>
            </div>

            {expanded && (
                <ScrollArea className="h-[calc(100%-2.5rem)]">
                    <div className="p-2 space-y-1">
                        {logs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                No activity yet
                            </div>
                        )}
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-2 p-2 rounded hover:bg-accent/5 font-mono text-xs"
                            >
                                <div className="mt-0.5">
                                    {getLogIcon(log.level)}
                                </div>
                                <span className="text-muted-foreground">{log.timestamp}</span>
                                <span className="flex-1 text-foreground">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
