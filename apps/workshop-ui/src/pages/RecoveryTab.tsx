import { useState } from "react";
import { recoveryApi } from "../lib/api-client";

export default function RecoveryTab() {
  const [platform, setPlatform] = useState<string>("android");
  const [oem, setOem] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [guidanceType, setGuidanceType] = useState<string>("restore");
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<any>(null);
  const [firmwareSource, setFirmwareSource] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const lookupFirmware = async () => {
    if (!oem) {
      setError("Please enter OEM name");
      return;
    }

    setLoading(true);
    setError("");
    setFirmwareSource(null);

    try {
      const response = await recoveryApi.lookupFirmware(oem, model || undefined);
      if (response.ok && response.firmware_source) {
        setFirmwareSource(response.firmware_source);
      } else {
        setError(response.error || "Firmware source not found");
      }
    } catch (err: any) {
      setError(err.message || "Firmware lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const getGuidance = async () => {
    if (!platform) {
      setError("Please select platform");
      return;
    }

    setLoading(true);
    setError("");
    setGuidance(null);

    try {
      const response = await recoveryApi.getGuidance({
        platform,
        oem: oem || undefined,
        model: model || undefined,
        guidance_type: guidanceType,
      });

      if (response.ok && response.guidance) {
        setGuidance(response.guidance);
      } else {
        setError(response.error || "Failed to generate guidance");
      }
    } catch (err: any) {
      setError(err.message || "Guidance generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Recovery Guidance</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Get official OEM firmware sources and recovery instructions</p>
      </div>

      {/* Firmware Lookup */}
      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Firmware Source Lookup</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>OEM *</label>
            <input
              type="text"
              value={oem}
              onChange={(e) => setOem(e.target.value)}
              placeholder="e.g., samsung, google, apple"
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Model (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., Galaxy S21, Pixel 6"
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </div>
        </div>

        <button
          onClick={lookupFirmware}
          disabled={loading || !oem}
          className="px-4 py-2 rounded transition-all duration-300"
          style={{
            backgroundColor: (loading || !oem) ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
            color: (loading || !oem) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            boxShadow: (loading || !oem) ? 'none' : 'var(--glow-gold)',
            cursor: (loading || !oem) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && oem) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && oem) {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
            }
          }}
        >
          {loading ? "Looking up..." : "Lookup Firmware Source"}
        </button>

        {firmwareSource && (
          <div className="mt-4 p-4 rounded space-y-2" style={{ 
            backgroundColor: 'var(--surface-tertiary)'
          }}>
            <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>{firmwareSource.oem} Firmware Source</div>
            {firmwareSource.source_url && (
              <div>
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Download: </span>
                <a
                  href={firmwareSource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: 'var(--accent-steel)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--accent-steel)';
                  }}
                >
                  {firmwareSource.source_url}
                </a>
              </div>
            )}
            {firmwareSource.instructions_url && (
              <div>
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Instructions: </span>
                <a
                  href={firmwareSource.instructions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: 'var(--accent-steel)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--accent-steel)';
                  }}
                >
                  {firmwareSource.instructions_url}
                </a>
              </div>
            )}
            {firmwareSource.notes && (
              <div className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>{firmwareSource.notes}</div>
            )}
          </div>
        )}
      </div>

      {/* Recovery Guidance */}
      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Recovery Guidance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Platform *</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Guidance Type</label>
            <select
              value={guidanceType}
              onChange={(e) => setGuidanceType(e.target.value)}
              className="w-full rounded px-3 py-2"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="restore">Restore</option>
              <option value="update">Update</option>
              <option value="recovery">Recovery</option>
            </select>
          </div>
        </div>

        <button
          onClick={getGuidance}
          disabled={loading || !platform}
          className="px-4 py-2 rounded transition-all duration-300"
          style={{
            backgroundColor: (loading || !platform) ? 'var(--surface-tertiary)' : 'var(--accent-bronze)',
            color: (loading || !platform) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
            cursor: (loading || !platform) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && platform) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && platform) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {loading ? "Generating..." : "Get Recovery Guidance"}
        </button>

        {guidance && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Recovery Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                {guidance.steps?.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {guidance.warnings && guidance.warnings.length > 0 && (
              <div className="p-4 border rounded" style={{ 
                backgroundColor: 'var(--state-warning)',
                borderColor: 'var(--state-warning)',
                opacity: 0.1
              }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--state-warning)' }}>Warnings</h4>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--state-warning)' }}>
                  {guidance.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.official_links && guidance.official_links.length > 0 && (
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Official Links</h4>
                <ul className="space-y-2">
                  {guidance.official_links.map((link: any, idx: number) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: 'var(--accent-steel)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--accent-steel)';
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.firmware_source && (
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Firmware Source</h4>
                {guidance.firmware_source.source_url && (
                  <div className="text-sm">
                    <a
                      href={guidance.firmware_source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: 'var(--accent-steel)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--accent-steel)';
                      }}
                    >
                      {guidance.firmware_source.source_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded" style={{ 
          backgroundColor: 'var(--state-error)',
          borderColor: 'var(--state-error)',
          border: '1px solid var(--state-error)',
          opacity: 0.1
        }}>
          <div style={{ color: 'var(--state-error)' }}>{error}</div>
        </div>
      )}
    </div>
  );
}
