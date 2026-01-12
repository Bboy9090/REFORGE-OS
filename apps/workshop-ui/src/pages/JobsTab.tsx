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
        <h2 className="text-2xl font-bold mb-2">Jobs & Cases</h2>
        <p className="text-gray-400">View case files and manage master tickets</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cases</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  loadCaseDetails(c.id);
                }}
                className={`w-full text-left p-3 rounded bg-gray-700 hover:bg-gray-600 ${
                  selectedCaseId === c.id ? "ring-2 ring-cyan-500" : ""
                }`}
              >
                <div className="font-mono text-sm">{c.id}</div>
                {c.type && <div className="text-xs text-gray-400">{c.type}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Master Tickets</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {masterTickets.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded bg-gray-700 ${
                  selectedMasterId === t.id ? "ring-2 ring-cyan-500" : ""
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                {t.description && <div className="text-sm text-gray-400">{t.description}</div>}
                <div className="text-xs text-gray-500 mt-1">{t.cases.length} cases</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {caseDetails && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Case Details</h3>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(caseDetails, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Attach Case to Master Ticket</h3>
        <div className="flex gap-4">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
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
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
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
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Attach
          </button>
        </div>
      </div>
    </div>
  );
}
