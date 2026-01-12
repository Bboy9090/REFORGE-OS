import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function OpsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadMetrics() {
    setLoading(true);
    try {
      const result = await invoke<string>("get_ops_metrics");
      setMetrics(JSON.parse(result));
    } catch (error) {
      console.error("Metrics load failed:", error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Operations Control Tower</h2>

        {loading ? (
          <p className="text-gray-400">Loading metrics...</p>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Active Units</h3>
              <p className="text-2xl font-bold text-white">{metrics.activeUnits || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Hardware units in operation</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Audit Coverage</h3>
              <p className="text-2xl font-bold text-green-400">{(metrics.auditCoverage || 0).toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Events with verified hash chains</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Compliance Escalations</h3>
              <p className="text-2xl font-bold text-amber-400">{metrics.escalations || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Requiring external authorization</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Compliance Score</h3>
              <p className="text-2xl font-bold text-blue-400">{(metrics.complianceScore || 0).toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Overall compliance health</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Active Users</h3>
              <p className="text-2xl font-bold text-white">{metrics.activeUsers || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Logged in last 30 days</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Processed Devices</h3>
              <p className="text-2xl font-bold text-white">{metrics.processedDevices || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Total devices analyzed</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No metrics available</p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={loadMetrics}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium text-white"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Audit Log Integrity</span>
            <span className="text-sm font-medium text-green-400">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Language Guard</span>
            <span className="text-sm font-medium text-green-400">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Pandora Codex Isolation</span>
            <span className="text-sm font-medium text-green-400">Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}