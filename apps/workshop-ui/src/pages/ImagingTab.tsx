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
        <h2 className="text-2xl font-bold mb-2">OS Imaging & Deployment</h2>
        <p className="text-gray-400">Deploy OS images to drives using Phoenix Key recipes</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Target Drive</label>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
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
          <label className="block text-sm font-medium mb-2">OS Recipe</label>
          <select
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="">Select recipe...</option>
            {recipes.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name} ({r.os_type || r.key})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-red-900/20 border border-red-700/50 rounded p-3 text-sm text-red-200">
          ⚠️ Warning: This operation will overwrite all data on the selected drive. Make sure you have selected the correct target.
        </div>

        <button
          onClick={handleDeploy}
          disabled={loading || !selectedRecipe || !selectedDrive}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium"
        >
          {loading ? "Deploying..." : "Deploy OS"}
        </button>
      </div>

      {progress && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Deployment Status</h3>
          <pre className="font-mono text-sm bg-gray-900 p-4 rounded overflow-auto max-h-96 text-gray-300">
            {progress}
          </pre>
        </div>
      )}
    </div>
  );
}
