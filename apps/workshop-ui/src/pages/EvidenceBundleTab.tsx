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
        <h2 className="text-2xl font-bold mb-2">Evidence Bundle Generator</h2>
        <p className="text-gray-400">Generate evidence bundles for OEM/carrier support requests</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Generate Evidence Bundle</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Select Case *</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
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
          <label className="block text-sm font-medium mb-2">Bundle Type *</label>
          <select
            value={bundleType}
            onChange={(e) => setBundleType(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="apple_support">Apple Support Bundle</option>
            <option value="carrier">Carrier Support Bundle</option>
            <option value="generic">Generic Evidence Bundle</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {bundleType === "apple_support" && "For Apple Activation Lock support requests"}
            {bundleType === "carrier" && "For carrier unlock requests"}
            {bundleType === "generic" && "Generic evidence bundle for any purpose"}
          </p>
        </div>

        <button
          onClick={generateBundle}
          disabled={loading || !selectedCaseId}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium"
        >
          {loading ? "Generating..." : "Generate Bundle"}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.startsWith("Error")
              ? "bg-red-900/50 text-red-200"
              : "bg-blue-900/50 text-blue-200"
          }`}>
            {message}
          </div>
        )}

        {generatedBundle && (
          <div className="mt-4 p-4 bg-gray-900 rounded space-y-2">
            <div className="font-medium">Bundle Generated</div>
            <div className="text-sm text-gray-400">
              Bundle ID: {generatedBundle.bundle_id}
            </div>
            <div className="text-sm text-gray-400">
              Type: {generatedBundle.bundle_type}
            </div>
            <div className="text-sm text-gray-400">
              Case ID: {generatedBundle.case_id}
            </div>
            {generatedBundle.metadata?.zip_path && (
              <div className="text-sm text-gray-400">
                ZIP Path: {generatedBundle.metadata.zip_path}
              </div>
            )}
            {generatedBundle.files && generatedBundle.files.length > 0 && (
              <div className="text-sm text-gray-400">
                Files: {generatedBundle.files.length} files included
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">About Evidence Bundles</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <strong className="text-white">Apple Support Bundle:</strong> Includes device information, proof of ownership documents, diagnostics reports, and case notes for Apple support requests.
          </div>
          <div>
            <strong className="text-white">Carrier Support Bundle:</strong> Includes device information and proof of ownership for carrier unlock requests.
          </div>
          <div>
            <strong className="text-white">Generic Evidence Bundle:</strong> General-purpose evidence bundle with device information and case documents.
          </div>
          <div className="mt-4 text-xs text-gray-400">
            All bundles are packaged as ZIP files and include metadata for submission to OEM/carrier support.
          </div>
        </div>
      </div>
    </div>
  );
}
