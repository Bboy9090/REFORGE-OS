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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Certification Dashboard</h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          Workshop-Certified Technician™ program - Hardware-verified training and skill progression
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {currentStatus && (
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Current Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Current Level:</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{currentStatus.level || "Not Certified"}</span>
            </div>
            {currentStatus.requirements_met !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Requirements Met:</span>
                <span className="text-sm font-semibold" style={{
                  color: currentStatus.requirements_met ? 'var(--state-success)' : 'var(--state-warning)'
                }}>
                  {currentStatus.requirements_met ? "Yes" : "In Progress"}
                </span>
              </div>
            )}
            {currentStatus.next_level && (
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Next Level:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{currentStatus.next_level}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Certification Levels</h2>

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading certifications..." />
          </div>
        ) : (
        <div className="space-y-6">
          {certifications.map((cert, idx) => (
            <div key={idx} className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{cert.level}</h3>
                <span className={`px-3 py-1 rounded text-xs font-medium ${statusBadge[cert.status]}`}>
                  {cert.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>Requirements</label>
                <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--ink-secondary)' }}>
                  {cert.requirements.map((req, reqIdx) => (
                    <li key={reqIdx}>{req}</li>
                  ))}
                </ul>
              </div>

              {cert.status !== "complete" && (
                <button 
                  className="mt-4 px-4 py-2 rounded font-medium text-sm transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--ink-inverse)',
                    boxShadow: 'var(--glow-gold)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  }}
                >
                  View Requirements
                </button>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          Certification demonstrates competency in compliance-first device analysis and lawful recovery routing.
        </p>
      </div>
    </div>
  );
}