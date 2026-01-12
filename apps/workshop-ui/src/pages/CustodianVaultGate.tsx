import { useState, useEffect } from "react";
import { solutionsApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

interface CustodianVaultProps {
  ownershipConfidence?: number;
  deviceId?: string;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  device_type: string;
  category: string;
  solution_steps: string[];
  difficulty: string;
  estimated_time: string;
  tools_needed: string[];
  warnings: string[];
  tags: string[];
}

const DEVICE_TYPE_LABELS: Record<string, string> = {
  computer_windows: "Windows PC",
  computer_linux: "Linux PC",
  macbook: "MacBook",
  imac: "iMac",
  android_phone: "Android Phone",
  android_tablet: "Android Tablet",
  ios_iphone: "iPhone",
  ios_ipad: "iPad",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "badge-success",
  medium: "badge-info",
  hard: "badge-warning",
  expert: "badge-error",
};

export default function CustodianVaultGate({ 
  ownershipConfidence = 0,
  deviceId 
}: CustodianVaultProps) {
  const [acknowledged, setAcknowledledged] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (acknowledged) {
      loadSolutions();
    }
  }, [acknowledged, selectedDeviceType, selectedCategory, searchQuery]);

  const loadSolutions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await solutionsApi.list({
        device_type: selectedDeviceType || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });

      if (response.ok && response.solutions) {
        setSolutions(response.solutions);
      } else {
        setError(response.error || "Failed to load solutions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load solutions");
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  if (ownershipConfidence < 85) {
    return (
      <div className="space-y-6 fade-in">
        <div className="card bg-amber-900/20 border-amber-700/50">
          <h3 className="text-lg font-semibold text-amber-200 mb-2">
            Ownership Confidence Insufficient
          </h3>
          <p className="text-amber-100">
            Additional documentation may be required to access the Custodial Closet.
          </p>
          <p className="text-sm text-amber-200/80 mt-2">
            External authorization may be required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Custodial Closet — Solutions Database
        </h2>
        <p className="text-gray-400">
          Access repair solutions for all device types. Analysis and documentation only.
        </p>
      </div>

      <div className="card bg-blue-900/20 border-blue-700/50">
        <h3 className="font-semibold text-blue-200 mb-2">Custodial Closet Access</h3>
        <p className="text-sm text-blue-100">
          This environment provides repair solutions and procedures for all device types.
          All access is logged for compliance. Solutions are for legitimate repair purposes only.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledledged(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-300">
            I understand this provides repair solutions for legitimate repair purposes only.
            All activity is logged for compliance.
          </span>
        </label>
      </div>

      {acknowledged && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Search Solutions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Device Type</label>
                <select
                  value={selectedDeviceType}
                  onChange={(e) => setSelectedDeviceType(e.target.value)}
                  className="input"
                >
                  <option value="">All Devices</option>
                  <option value="computer_windows">Windows PC</option>
                  <option value="computer_linux">Linux PC</option>
                  <option value="macbook">MacBook</option>
                  <option value="imac">iMac</option>
                  <option value="android_phone">Android Phone</option>
                  <option value="android_tablet">Android Tablet</option>
                  <option value="ios_iphone">iPhone</option>
                  <option value="ios_ipad">iPad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  <option value="boot">Boot Issues</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="performance">Performance</option>
                  <option value="network">Network</option>
                  <option value="data">Data</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search solutions..."
                  className="input"
                />
              </div>
            </div>
          </div>

          {error && (
            <ErrorAlert message={error} onDismiss={() => setError("")} />
          )}

          {loading && (
            <div className="card">
              <LoadingSpinner size="lg" text="Loading solutions..." />
            </div>
          )}

          {!loading && selectedSolution && (
            <div className="card">
              <button
                onClick={() => setSelectedSolution(null)}
                className="btn btn-outline mb-4"
              >
                ← Back to Solutions
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedSolution.title}</h3>
                  <p className="text-gray-400 mb-4">{selectedSolution.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge ${DIFFICULTY_COLORS[selectedSolution.difficulty] || "badge-info"}`}>
                      {selectedSolution.difficulty}
                    </span>
                    <span className="badge badge-info">
                      {DEVICE_TYPE_LABELS[selectedSolution.device_type] || selectedSolution.device_type}
                    </span>
                    <span className="badge badge-info">
                      {selectedSolution.estimated_time}
                    </span>
                  </div>
                </div>

                {selectedSolution.warnings.length > 0 && (
                  <div className="alert alert-warning">
                    <div>
                      <strong className="font-semibold">Warnings:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {selectedSolution.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSolution.tools_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tools Needed:</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {selectedSolution.tools_needed.map((tool, idx) => (
                        <li key={idx}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3">Solution Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    {selectedSolution.solution_steps.map((step, idx) => (
                      <li key={idx} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!loading && !selectedSolution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Solutions ({solutions.length})
                </h3>
              </div>

              {solutions.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-gray-400">No solutions found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="card cursor-pointer hover:border-primary transition-all"
                      onClick={() => setSelectedSolution(solution)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg flex-1">{solution.title}</h4>
                        <span className={`badge ${DIFFICULTY_COLORS[solution.difficulty] || "badge-info"} ml-2`}>
                          {solution.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {solution.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-info text-xs">
                          {DEVICE_TYPE_LABELS[solution.device_type] || solution.device_type}
                        </span>
                        <span className="badge badge-info text-xs">
                          {solution.estimated_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
