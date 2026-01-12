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
        <h2 className="text-2xl font-bold mb-2">Drives</h2>
        <p className="text-gray-400">View physical drives and SMART health data</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Detected Drives</h3>
        <div className="space-y-2">
          {drives.map((drive) => (
            <div
              key={drive.id}
              className={`p-4 rounded bg-gray-700 cursor-pointer hover:bg-gray-600 ${
                selectedDrive === drive.id ? "ring-2 ring-yellow-500" : ""
              }`}
              onClick={() => {
                setSelectedDrive(drive.id);
                loadSmartData(drive.id);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{drive.id}</div>
                  <div className="text-sm text-gray-400">
                    {drive.model} • {drive.size_gb.toFixed(1)} GB
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {drive.is_ssd ? "SSD" : "HDD"} • {drive.is_removable ? "Removable" : "Fixed"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSmartData(drive.id);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                >
                  SMART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {smartData && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">SMART Health Data</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <pre className="font-mono text-sm bg-gray-900 p-4 rounded overflow-auto max-h-96 text-gray-300">
              {smartData}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
