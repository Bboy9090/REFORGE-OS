import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Profile {
  key: string;
  name: string;
  brand: string;
}

export default function DevModeTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
    loadModules();
  }, []);

  const loadProfiles = async () => {
    try {
      const result = await invoke<string>("devmode_list_profiles");
      const data = JSON.parse(result);
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    }
  };

  const loadModules = async () => {
    try {
      const result = await invoke<string>("devmode_list_modules");
      const data = JSON.parse(result);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load modules:", error);
      setModules(["dossier", "warhammer", "darklab", "forbidden", "fastboot_arsenal", "recovery_ops"]);
    }
  };

  const handleRun = async () => {
    if (!selectedProfile || !selectedModule) return;

    setLoading(true);
    setOutput("");

    try {
      const result = await invoke<string>("devmode_run_module", {
        profile: selectedProfile,
        module: selectedModule,
      });
      const data = JSON.parse(result);
      setOutput(data.output || JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bobby Dev Mode</h2>
        <p className="text-gray-400">Run diagnostic modules on connected devices</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Device Profile</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">Select profile...</option>
              {profiles.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">Select module...</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !selectedProfile || !selectedModule}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium"
        >
          {loading ? "Running..." : "Run Module"}
        </button>
      </div>

      {output && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Output</h3>
            <button
              onClick={() => setOutput("")}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96 text-gray-300">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
