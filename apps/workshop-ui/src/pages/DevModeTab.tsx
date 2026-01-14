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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Bobby Dev Mode</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Run diagnostic modules on connected devices</p>
      </div>

      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Device Profile</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
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
          className="w-full px-4 py-2 rounded font-medium transition-all duration-300"
          style={{
            backgroundColor: (loading || !selectedProfile || !selectedModule) ? 'var(--surface-tertiary)' : 'var(--accent-bronze)',
            color: (loading || !selectedProfile || !selectedModule) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            cursor: (loading || !selectedProfile || !selectedModule) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && selectedProfile && selectedModule) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && selectedProfile && selectedModule) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {loading ? "Running..." : "Run Module"}
        </button>
      </div>

      {output && (
        <div className="rounded-lg p-4" style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Output</h3>
            <button
              onClick={() => setOutput("")}
              className="text-sm transition-colors"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ink-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ink-muted)';
              }}
            >
              Clear
            </button>
          </div>
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96" style={{ color: 'var(--ink-secondary)' }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
