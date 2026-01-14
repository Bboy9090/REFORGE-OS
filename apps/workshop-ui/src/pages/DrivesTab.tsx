import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Drive {
  id: string;
  size_gb: number;
  model: string;
  is_removable: boolean;
  is_ssd: boolean;
  description?: string;
}

export default function DrivesTab() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>("");
  const [smartData, setSmartData] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      const result = await invoke<string>("list_drives");
      const data = JSON.parse(result);
      setDrives(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load drives:", error);
    }
  };

  const loadSmartData = async (deviceId: string) => {
    setLoading(true);
    setSmartData("");
    try {
      const result = await invoke<string>("get_drive_smart", { deviceId });
      setSmartData(result);
    } catch (error) {
      setSmartData(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Drives</h2>
        <p style={{ color: 'var(--ink-muted)' }}>View physical drives and SMART health data</p>
      </div>

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Detected Drives</h3>
        <div className="space-y-2">
          {drives.map((drive) => (
            <div
              key={drive.id}
              className="p-4 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: selectedDrive === drive.id ? 'var(--surface-tertiary)' : 'var(--surface-primary)',
                borderColor: selectedDrive === drive.id ? 'var(--accent-gold)' : 'var(--border-primary)',
                border: selectedDrive === drive.id ? '2px solid var(--accent-gold)' : '1px solid var(--border-primary)'
              }}
              onClick={() => {
                setSelectedDrive(drive.id);
                loadSmartData(drive.id);
              }}
              onMouseEnter={(e) => {
                if (selectedDrive !== drive.id) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDrive !== drive.id) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{drive.id}</div>
                  <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                    {drive.model} • {drive.size_gb.toFixed(1)} GB
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                    {drive.is_ssd ? "SSD" : "HDD"} • {drive.is_removable ? "Removable" : "Fixed"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSmartData(drive.id);
                  }}
                  className="px-3 py-1 rounded text-sm transition-all duration-300"
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
                  SMART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {smartData && (
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>SMART Health Data</h3>
          {loading ? (
            <div style={{ color: 'var(--ink-muted)' }}>Loading...</div>
          ) : (
            <pre className="font-mono text-sm p-4 rounded overflow-auto max-h-96" style={{ 
              backgroundColor: 'var(--surface-primary)',
              color: 'var(--ink-secondary)'
            }}>
              {smartData}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
