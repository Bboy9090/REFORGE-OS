import { useState } from "react";

export default function ConsoleTab() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    const cmd = command.trim();
    setOutput(prev => [...prev, `$ ${cmd}`]);

    // TODO: Implement ADB/Fastboot console command execution
    // This would require a backend endpoint that accepts commands
    setTimeout(() => {
      setOutput(prev => [...prev, `Command not implemented: ${cmd}`]);
      setCommand("");
      setLoading(false);
    }, 500);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold mb-2">ADB/Fastboot Console</h2>
        <p className="text-gray-400">Execute ADB and Fastboot commands</p>
      </div>

      <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto">
        {output.length === 0 ? (
          <div className="text-gray-500">No output yet. Enter a command below.</div>
        ) : (
          output.map((line, i) => (
            <div key={i} className={line.startsWith("$") ? "text-cyan-400" : "text-gray-300"}>
              {line}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="adb devices or fastboot devices"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 font-mono text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-6 py-2 rounded"
        >
          Execute
        </button>
        <button
          type="button"
          onClick={clearOutput}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          Clear
        </button>
      </form>

      <div className="text-xs text-gray-500">
        Note: Console commands require backend implementation for ADB/Fastboot execution.
      </div>
    </div>
  );
}
