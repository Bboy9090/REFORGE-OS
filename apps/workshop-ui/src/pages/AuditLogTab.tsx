import { useState, useEffect } from "react";
import { auditApi, casesApi } from "../lib/api-client";

interface AuditEvent {
  event_id: string;
  timestamp: string;
  level: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  case_id?: string;
  device_id?: string;
  message: string;
  metadata?: Record<string, any>;
}

export default function AuditLogTab() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
    loadCases();
  }, [filterLevel, filterAction, limit]);

  const loadCases = async () => {
    try {
      const response = await casesApi.list();
      if (response.ok && response.cases) {
        setCases(response.cases);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = selectedCaseId
        ? await auditApi.getCaseEvents(selectedCaseId)
        : await auditApi.getEvents({
            limit,
            level: filterLevel || undefined,
            action: filterAction || undefined,
          });

      if (response.ok && response.events) {
        setEvents(response.events);
      } else {
        setError(response.error || "Failed to load audit events");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load audit events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseFilter = async (caseId: string) => {
    setSelectedCaseId(caseId);
    if (caseId) {
      setLoading(true);
      try {
        const response = await auditApi.getCaseEvents(caseId);
        if (response.ok && response.events) {
          setEvents(response.events);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load case events");
      } finally {
        setLoading(false);
      }
    } else {
      loadEvents();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
      case "critical":
        return 'var(--state-error)';
      case "warn":
      case "warning":
        return 'var(--state-warning)';
      case "info":
        return 'var(--accent-steel)';
      default:
        return 'var(--ink-muted)';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Audit Log</h2>
        <p style={{ color: 'var(--ink-muted)' }}>View immutable audit trail of all system actions</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Filters</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Case ID</label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseFilter(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="">All Cases</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.customer_name} ({caseItem.id.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Level</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Action</label>
            <input
              type="text"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="Filter by action..."
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
              min="1"
              max="1000"
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </div>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="px-4 py-2 rounded text-sm transition-all duration-300"
          style={{
            backgroundColor: loading ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
            color: loading ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            boxShadow: loading ? 'none' : 'var(--glow-gold)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
            }
          }}
        >
          {loading ? "Loading..." : "Refresh Events"}
        </button>
      </div>

      {/* Events List */}
      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Audit Events ({events.length})</h3>
          {selectedCaseId && (
            <button
              onClick={() => handleCaseFilter("")}
              className="px-3 py-1 rounded text-sm transition-colors"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-secondary)',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
              }}
            >
              Clear Case Filter
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>Loading events...</div>
        )}

        {error && (
          <div className="p-3 rounded mb-4" style={{ 
            backgroundColor: 'var(--state-error)',
            borderColor: 'var(--state-error)',
            border: '1px solid var(--state-error)',
            opacity: 0.1
          }}>
            <div style={{ color: 'var(--state-error)' }}>{error}</div>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>
            No audit events found
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="p-4 rounded border transition-colors"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-steel)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: getLevelColor(event.level) }}>
                      {event.level.toUpperCase()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>{event.action}</span>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{event.resource_type}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm mb-2" style={{ color: 'var(--ink-secondary)' }}>{event.message}</div>
                
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
                  <span>Actor: {event.actor}</span>
                  {event.case_id && (
                    <span>Case: {event.case_id.substring(0, 8)}</span>
                  )}
                  {event.device_id && (
                    <span>Device: {event.device_id.substring(0, 8)}</span>
                  )}
                  {event.resource_id && (
                    <span>Resource: {event.resource_id.substring(0, 8)}</span>
                  )}
                </div>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer" style={{ color: 'var(--ink-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--ink-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--ink-muted)';
                      }}
                    >
                      Metadata
                    </summary>
                    <pre className="mt-2 text-xs p-2 rounded overflow-auto" style={{ 
                      backgroundColor: 'var(--surface-tertiary)',
                      color: 'var(--ink-secondary)'
                    }}>
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
