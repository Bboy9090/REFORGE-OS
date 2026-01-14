import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Drive {
  id: string;
  size_gb: number;
  model: string;
}

interface Recipe {
  key: string;
  name: string;
  os_type?: string;
}

export default function ImagingTab() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [imagePath, setImagePath] = useState<string>("");
  const [progress, setProgress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrives();
    loadRecipes();
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

  const loadRecipes = async () => {
    try {
      const result = await invoke<string>("list_os_recipes");
      const data = JSON.parse(result);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedRecipe || !selectedDrive) return;

    setLoading(true);
    setProgress("");

    try {
      const result = await invoke<string>("deploy_os", {
        recipeKey: selectedRecipe,
        targetDev: selectedDrive,
      });
      const data = JSON.parse(result);
      setProgress(JSON.stringify(data, null, 2));
    } catch (error) {
      setProgress(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>OS Imaging & Deployment</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Deploy OS images to drives using Phoenix Key recipes</p>
      </div>

      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Target Drive</label>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="w-full rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="">Select drive...</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} - {d.model} ({d.size_gb.toFixed(1)} GB)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>OS Recipe</label>
          <select
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
            className="w-full rounded px-3 py-2"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--ink-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <option value="">Select recipe...</option>
            {recipes.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name} ({r.os_type || r.key})
              </option>
            ))}
          </select>
        </div>

        <div className="border rounded p-3 text-sm" style={{ 
          backgroundColor: 'var(--state-error)',
          borderColor: 'var(--state-error)',
          opacity: 0.1
        }}>
          <div style={{ color: 'var(--state-error)' }}>
            ⚠️ Warning: This operation will overwrite all data on the selected drive. Make sure you have selected the correct target.
          </div>
        </div>

        <button
          onClick={handleDeploy}
          disabled={loading || !selectedRecipe || !selectedDrive}
          className="w-full px-4 py-2 rounded font-medium transition-all duration-300"
          style={{
            backgroundColor: (loading || !selectedRecipe || !selectedDrive) ? 'var(--surface-tertiary)' : 'var(--accent-bronze)',
            color: (loading || !selectedRecipe || !selectedDrive) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            cursor: (loading || !selectedRecipe || !selectedDrive) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && selectedRecipe && selectedDrive) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && selectedRecipe && selectedDrive) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {loading ? "Deploying..." : "Deploy OS"}
        </button>
      </div>

      {progress && (
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Deployment Status</h3>
          <pre className="font-mono text-sm p-4 rounded overflow-auto max-h-96" style={{ 
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--ink-secondary)'
          }}>
            {progress}
          </pre>
        </div>
      )}
    </div>
  );
}
