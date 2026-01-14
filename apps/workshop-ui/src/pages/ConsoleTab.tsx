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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>ADB/Fastboot Console</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Execute ADB and Fastboot commands</p>
      </div>

      <div className="flex-1 rounded-lg p-4 font-mono text-sm overflow-auto" style={{ 
        backgroundColor: 'var(--surface-primary)'
      }}>
        {output.length === 0 ? (
          <div style={{ color: 'var(--ink-muted)' }}>No output yet. Enter a command below.</div>
        ) : (
          output.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("$") ? 'var(--accent-steel)' : 'var(--ink-secondary)' }}>
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
          className="flex-1 rounded px-4 py-2 font-mono text-sm"
          style={{
            backgroundColor: 'var(--surface-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--ink-primary)',
            border: '1px solid var(--border-primary)'
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="px-6 py-2 rounded transition-all duration-300"
          style={{
            backgroundColor: (loading || !command.trim()) ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
            color: (loading || !command.trim()) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            boxShadow: (loading || !command.trim()) ? 'none' : 'var(--glow-gold)',
            cursor: (loading || !command.trim()) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && command.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && command.trim()) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
            }
          }}
        >
          Execute
        </button>
        <button
          type="button"
          onClick={clearOutput}
          className="px-4 py-2 rounded transition-all duration-300"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--ink-secondary)',
            border: '1px solid var(--border-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          }}
        >
          Clear
        </button>
      </form>

      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
        Note: Console commands require backend implementation for ADB/Fastboot execution.
      </div>
    </div>
  );
}
