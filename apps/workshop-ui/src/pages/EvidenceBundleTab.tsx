import { useState, useEffect } from "react";
import { casesApi, bundlesApi } from "../lib/api-client";

interface Case {
  id: string;
  customer_name: string;
  status: string;
}

export default function EvidenceBundleTab() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [bundleType, setBundleType] = useState<string>("apple_support");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [generatedBundle, setGeneratedBundle] = useState<any>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await casesApi.list();
      if (response.ok && response.cases) {
        setCases(response.cases);
      }
    } catch (error: any) {
      console.error("Failed to load cases:", error);
      setMessage(`Error: ${error.message || "Failed to load cases"}`);
    }
  };

  const generateBundle = async () => {
    if (!selectedCaseId) {
      setMessage("Error: Please select a case");
      return;
    }

    setLoading(true);
    setMessage("");
    setGeneratedBundle(null);

    try {
      // Get case details
      const caseResponse = await casesApi.get(selectedCaseId);
      if (!caseResponse.ok || !caseResponse.case) {
        throw new Error("Case not found");
      }

      const caseData = caseResponse.case;

      // Get devices for case
      const devicesResponse = await casesApi.getCaseDevices(selectedCaseId);
      const devices = devicesResponse.ok ? devicesResponse.devices : [];

      // Build device info
      const deviceInfo: any = {
        case_id: selectedCaseId,
        customer_name: caseData.customer_name,
        customer_email: caseData.customer_email,
        customer_phone: caseData.customer_phone,
        status: caseData.status,
        notes: caseData.notes,
        devices: devices,
      };

      // Generate bundle via API
      const bundleResponse = await bundlesApi.generate({
        case_id: selectedCaseId,
        bundle_type: bundleType,
        carrier: bundleType === "carrier" ? "Unknown" : undefined,
      });

      if (bundleResponse.ok && bundleResponse.bundle) {
        setGeneratedBundle(bundleResponse.bundle);
        setMessage(`Bundle generated successfully! Bundle ID: ${bundleResponse.bundle.bundle_id}`);
      } else {
        throw new Error(bundleResponse.error || "Bundle generation failed");
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "Bundle generation failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Evidence Bundle Generator</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Generate evidence bundles for OEM/carrier support requests</p>
      </div>

      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Generate Evidence Bundle</h3>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Select Case *</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="">Select a case...</option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.customer_name} - {caseItem.status} ({caseItem.id.substring(0, 8)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Bundle Type *</label>
          <select
            value={bundleType}
            onChange={(e) => setBundleType(e.target.value)}
            className="w-full rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="apple_support">Apple Support Bundle</option>
            <option value="carrier">Carrier Support Bundle</option>
            <option value="generic">Generic Evidence Bundle</option>
          </select>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
            {bundleType === "apple_support" && "For Apple Activation Lock support requests"}
            {bundleType === "carrier" && "For carrier unlock requests"}
            {bundleType === "generic" && "Generic evidence bundle for any purpose"}
          </p>
        </div>

        <button
          onClick={generateBundle}
          disabled={loading || !selectedCaseId}
          className="w-full px-4 py-2 rounded font-medium transition-all duration-300"
          style={{
            backgroundColor: (loading || !selectedCaseId) ? 'var(--surface-tertiary)' : 'var(--accent-bronze)',
            color: (loading || !selectedCaseId) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            cursor: (loading || !selectedCaseId) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && selectedCaseId) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && selectedCaseId) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {loading ? "Generating..." : "Generate Bundle"}
        </button>

        {message && (
          <div className="p-3 rounded" style={{ 
            backgroundColor: message.startsWith("Error") ? 'var(--state-error)' : 'var(--accent-steel)',
            borderColor: message.startsWith("Error") ? 'var(--state-error)' : 'var(--accent-steel)',
            border: '1px solid',
            opacity: 0.1
          }}>
            <div style={{ color: message.startsWith("Error") ? 'var(--state-error)' : 'var(--accent-steel)' }}>{message}</div>
          </div>
        )}

        {generatedBundle && (
          <div className="mt-4 p-4 rounded space-y-2" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
            <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>Bundle Generated</div>
            <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Bundle ID: {generatedBundle.bundle_id}
            </div>
            <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Type: {generatedBundle.bundle_type}
            </div>
            <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Case ID: {generatedBundle.case_id}
            </div>
            {generatedBundle.metadata?.zip_path && (
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                ZIP Path: {generatedBundle.metadata.zip_path}
              </div>
            )}
            {generatedBundle.files && generatedBundle.files.length > 0 && (
              <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                Files: {generatedBundle.files.length} files included
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>About Evidence Bundles</h3>
        <div className="space-y-3 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          <div>
            <strong style={{ color: 'var(--ink-primary)' }}>Apple Support Bundle:</strong> Includes device information, proof of ownership documents, diagnostics reports, and case notes for Apple support requests.
          </div>
          <div>
            <strong style={{ color: 'var(--ink-primary)' }}>Carrier Support Bundle:</strong> Includes device information and proof of ownership for carrier unlock requests.
          </div>
          <div>
            <strong style={{ color: 'var(--ink-primary)' }}>Generic Evidence Bundle:</strong> General-purpose evidence bundle with device information and case documents.
          </div>
          <div className="mt-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
            All bundles are packaged as ZIP files and include metadata for submission to OEM/carrier support.
          </div>
        </div>
      </div>
    </div>
  );
}
