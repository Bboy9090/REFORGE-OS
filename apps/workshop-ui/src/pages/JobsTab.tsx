import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Case {
  id: string;
  type?: string;
  timestamp?: string;
}

interface MasterTicket {
  id: string;
  label: string;
  description?: string;
  cases: string[];
  created_at: string;
}

export default function JobsTab() {
  const [cases, setCases] = useState<Case[]>([]);
  const [masterTickets, setMasterTickets] = useState<MasterTicket[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedMasterId, setSelectedMasterId] = useState<string>("");
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCases();
    loadMasterTickets();
  }, []);

  const loadCases = async () => {
    try {
      const result = await invoke<string>("list_cases");
      const data = JSON.parse(result);
      setCases(Array.isArray(data) ? data.map(id => ({ id })) : []);
    } catch (error) {
      console.error("Failed to load cases:", error);
    }
  };

  const loadMasterTickets = async () => {
    try {
      const result = await invoke<string>("list_master_tickets");
      const data = JSON.parse(result);
      setMasterTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load master tickets:", error);
    }
  };

  const loadCaseDetails = async (caseId: string) => {
    setLoading(true);
    try {
      const result = await invoke<string>("load_case", { ticketId: caseId });
      const data = JSON.parse(result);
      setCaseDetails(data);
    } catch (error) {
      console.error("Failed to load case:", error);
      setCaseDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachCase = async () => {
    if (!selectedCaseId || !selectedMasterId) return;
    try {
      await invoke("attach_case_to_master", {
        masterId: selectedMasterId,
        caseId: selectedCaseId,
      });
      loadMasterTickets();
      setSelectedCaseId("");
      setSelectedMasterId("");
    } catch (error) {
      console.error("Failed to attach case:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Jobs & Cases</h2>
        <p style={{ color: 'var(--ink-muted)' }}>View case files and manage master tickets</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Cases</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  loadCaseDetails(c.id);
                }}
                className="w-full text-left p-3 rounded transition-colors"
                style={{
                  backgroundColor: selectedCaseId === c.id ? 'var(--surface-tertiary)' : 'var(--surface-primary)',
                  borderColor: selectedCaseId === c.id ? 'var(--accent-steel)' : 'var(--border-primary)',
                  border: selectedCaseId === c.id ? '2px solid var(--accent-steel)' : '1px solid var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  if (selectedCaseId !== c.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCaseId !== c.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                  }
                }}
              >
                <div className="font-mono text-sm" style={{ color: 'var(--ink-primary)' }}>{c.id}</div>
                {c.type && <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{c.type}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Master Tickets</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {masterTickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded transition-colors cursor-pointer"
                style={{
                  backgroundColor: selectedMasterId === t.id ? 'var(--surface-tertiary)' : 'var(--surface-primary)',
                  borderColor: selectedMasterId === t.id ? 'var(--accent-steel)' : 'var(--border-primary)',
                  border: selectedMasterId === t.id ? '2px solid var(--accent-steel)' : '1px solid var(--border-primary)'
                }}
                onClick={() => setSelectedMasterId(t.id)}
                onMouseEnter={(e) => {
                  if (selectedMasterId !== t.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMasterId !== t.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                  }
                }}
              >
                <div className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{t.label}</div>
                {t.description && <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>{t.description}</div>}
                <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{t.cases.length} cases</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {caseDetails && (
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Case Details</h3>
          <pre className="p-4 rounded text-sm overflow-auto max-h-96" style={{ 
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--ink-secondary)'
          }}>
            {JSON.stringify(caseDetails, null, 2)}
          </pre>
        </div>
      )}

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Attach Case to Master Ticket</h3>
        <div className="flex gap-4">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="flex-1 rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="">Select case...</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
          <select
            value={selectedMasterId}
            onChange={(e) => setSelectedMasterId(e.target.value)}
            className="flex-1 rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="">Select master ticket...</option>
            {masterTickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAttachCase}
            disabled={!selectedCaseId || !selectedMasterId}
            className="px-4 py-2 rounded transition-all duration-300"
            style={{
              backgroundColor: (!selectedCaseId || !selectedMasterId) ? 'var(--surface-tertiary)' : 'var(--accent-steel)',
              color: (!selectedCaseId || !selectedMasterId) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
              cursor: (!selectedCaseId || !selectedMasterId) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (selectedCaseId && selectedMasterId) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCaseId && selectedMasterId) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Attach
          </button>
        </div>
      </div>
    </div>
  );
}
