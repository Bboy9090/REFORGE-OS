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
        return "text-red-400";
      case "warn":
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Audit Log</h2>
        <p className="text-gray-400">View immutable audit trail of all system actions</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Case ID</label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Action</label>
            <input
              type="text"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="Filter by action..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
              min="1"
              max="1000"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
        >
          {loading ? "Loading..." : "Refresh Events"}
        </button>
      </div>

      {/* Events List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Audit Events ({events.length})</h3>
          {selectedCaseId && (
            <button
              onClick={() => handleCaseFilter("")}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Clear Case Filter
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-400">Loading events...</div>
        )}

        {error && (
          <div className="p-3 bg-red-900/50 text-red-200 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No audit events found
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="p-4 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${getLevelColor(event.level)}`}>
                      {event.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{event.action}</span>
                    <span className="text-xs text-gray-500">{event.resource_type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300 mb-2">{event.message}</div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
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
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                      Metadata
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-950 p-2 rounded overflow-auto">
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
