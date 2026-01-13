import { useState, useEffect } from "react";
import { certificationApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

interface Certification {
  level: string;
  requirements: string[];
  status: "complete" | "in_progress" | "not_started";
}

export default function CertificationDashboard() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<any>(null);

  useEffect(() => {
    loadCertifications();
  }, []);

  async function loadCertifications() {
    setLoading(true);
    setError("");

    try {
      const response = await certificationApi.getStatus();
      
      if (response.ok) {
        setCurrentStatus(response);
        // Map API response to certification levels
        const levels: Certification[] = [
          {
            level: "Level I - Diagnostic Steward",
            requirements: [
              "Device analysis",
              "Ownership verification",
              "Legal classification",
              "Audit discipline"
            ],
            status: response.level?.includes("Level I") ? "complete" : "not_started",
          },
          {
            level: "Level II - Repair Custodian",
            requirements: [
              "Screen, battery, port replacement",
              "Guided repair compliance",
              "Customer transparency"
            ],
            status: response.level?.includes("Level II") ? "complete" : 
                   response.level?.includes("Level I") ? "in_progress" : "not_started",
          },
          {
            level: "Level III - Interpretive Authority",
            requirements: [
              "Custodian Vault access",
              "High-risk scenario handling",
              "Documentation review",
              "External authority routing"
            ],
            status: response.level?.includes("Level III") ? "complete" :
                   response.level?.includes("Level II") ? "in_progress" : "not_started",
          },
        ];
        setCertifications(levels);
      } else {
        setError(response.error || "Failed to load certification status");
        // Fallback to mock data
        setCertifications([
          {
            level: "Level I - Diagnostic Steward",
            requirements: ["Device analysis", "Ownership verification", "Legal classification", "Audit discipline"],
            status: "complete",
          },
          {
            level: "Level II - Repair Custodian",
            requirements: ["Screen, battery, port replacement", "Guided repair compliance", "Customer transparency"],
            status: "in_progress",
          },
          {
            level: "Level III - Interpretive Authority",
            requirements: ["Custodian Vault access", "High-risk scenario handling", "Documentation review", "External authority routing"],
            status: "not_started",
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load certifications");
      // Fallback to mock data
      setCertifications([
        {
          level: "Level I - Diagnostic Steward",
          requirements: ["Device analysis", "Ownership verification", "Legal classification", "Audit discipline"],
          status: "complete",
        },
        {
          level: "Level II - Repair Custodian",
          requirements: ["Screen, battery, port replacement", "Guided repair compliance", "Customer transparency"],
          status: "in_progress",
        },
        {
          level: "Level III - Interpretive Authority",
          requirements: ["Custodian Vault access", "High-risk scenario handling", "Documentation review", "External authority routing"],
          status: "not_started",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = {
    complete: "bg-green-600 text-white",
    in_progress: "bg-amber-600 text-white",
    not_started: "bg-gray-600 text-gray-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Certification Dashboard</h2>
        <p className="text-gray-400">
          Workshop-Certified Technician™ program - Hardware-verified training and skill progression
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {currentStatus && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Current Level:</span>
              <span className="text-sm font-semibold">{currentStatus.level || "Not Certified"}</span>
            </div>
            {currentStatus.requirements_met !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Requirements Met:</span>
                <span className={`text-sm font-semibold ${
                  currentStatus.requirements_met ? "text-green-400" : "text-amber-400"
                }`}>
                  {currentStatus.requirements_met ? "Yes" : "In Progress"}
                </span>
              </div>
            )}
            {currentStatus.next_level && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Next Level:</span>
                <span className="text-sm font-semibold">{currentStatus.next_level}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Certification Levels</h2>

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading certifications..." />
          </div>
        ) : (
        <div className="space-y-6">
          {certifications.map((cert, idx) => (
            <div key={idx} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{cert.level}</h3>
                <span className={`px-3 py-1 rounded text-xs font-medium ${statusBadge[cert.status]}`}>
                  {cert.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Requirements</label>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {cert.requirements.map((req, reqIdx) => (
                    <li key={reqIdx}>{req}</li>
                  ))}
                </ul>
              </div>

              {cert.status !== "complete" && (
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-sm text-white">
                  View Requirements
                </button>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Certification demonstrates competency in compliance-first device analysis and lawful recovery routing.
        </p>
      </div>
    </div>
  );
}