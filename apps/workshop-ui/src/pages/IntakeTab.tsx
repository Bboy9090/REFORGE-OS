import { useState, useEffect } from "react";
import { casesApi, devicesApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";

interface Case {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  notes?: string;
  created_at?: string;
}

interface Device {
  id: string;
  platform: string;
  model?: string;
  serial?: string;
}

export default function IntakeTab() {
  const [cases, setCases] = useState<Case[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  // Device detection
  const [detectingDevices, setDetectingDevices] = useState(false);
  const [detectedDevices, setDetectedDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  
  // Manual device entry
  const [useManualDevice, setUseManualDevice] = useState(false);
  const [manualPlatform, setManualPlatform] = useState<string>("android");
  const [manualModel, setManualModel] = useState("");
  const [manualSerial, setManualSerial] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await casesApi.list();
      if (response.ok && response.cases) {
        setCases(response.cases);
      }
    } catch (error: any) {
      console.error("Failed to load cases:", error);
    }
  };

  const detectDevices = async () => {
    setDetectingDevices(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await devicesApi.detect();
      if (response.ok && response.devices) {
        setDetectedDevices(response.devices);
        if (response.devices.length > 0) {
          setSuccess(`Detected ${response.devices.length} device(s)`);
        } else {
          setError("No devices detected. Ensure device is connected and authorized.");
        }
      } else {
        setError(response.error || "Device detection failed");
      }
    } catch (error: any) {
      console.error("Device detection failed:", error);
      setError(error.message || "Device detection failed");
      setDetectedDevices([]);
    } finally {
      setDetectingDevices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create case
      const caseResponse = await casesApi.create({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        notes: notes,
      });

      if (!caseResponse.ok || !caseResponse.case) {
        throw new Error(caseResponse.error || "Failed to create case");
      }

      const caseId = caseResponse.case.id;
      setSuccess(`Case created successfully! Case ID: ${caseId.substring(0, 8)}...`);

      // Add device if selected or manual entry
      if (selectedDevice || (useManualDevice && manualModel)) {
        const deviceData: any = {
          platform: useManualDevice ? manualPlatform : detectedDevices.find(d => d.id === selectedDevice)?.platform || "unknown",
        };

        if (useManualDevice) {
          deviceData.model = manualModel;
          deviceData.serial = manualSerial;
        } else {
          const device = detectedDevices.find(d => d.id === selectedDevice);
          if (device) {
            deviceData.model = device.model;
            deviceData.serial = device.serial;
            deviceData.passport = device;
          }
        }

        await devicesApi.addToCase(caseId, deviceData);
        setSuccess(prev => prev + " Device added to case.");
      }

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
      setSelectedDevice("");
      setUseManualDevice(false);
      setManualModel("");
      setManualSerial("");

      // Reload cases
      await loadCases();
    } catch (error: any) {
      console.error("Failed to create case:", error);
      setError(error.message || "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Device Intake</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Create a new repair case and add devices</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess("")} />}

      {/* Case Creation Form */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>New Repair Case</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                Customer Name <span style={{ color: 'var(--state-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Device issue description, symptoms, etc."
            />
          </div>

          {/* Device Detection */}
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Device Detection</h4>
              <button
                type="button"
                onClick={detectDevices}
                disabled={detectingDevices}
                className="btn btn-outline"
              >
                {detectingDevices ? (
                  <>
                    <span className="spinner w-4 h-4"></span>
                    Detecting...
                  </>
                ) : (
                  "Detect Devices"
                )}
              </button>
            </div>

            {detectedDevices.length > 0 && !useManualDevice && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Select Detected Device</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="input"
                >
                  <option value="">No device</option>
                  {detectedDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.model || "Unknown"} - {device.platform} ({device.serial || "No serial"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useManualDevice}
                  onChange={(e) => setUseManualDevice(e.target.checked)}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Enter device manually</span>
              </label>
            </div>

            {useManualDevice && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Platform</label>
                  <select
                    value={manualPlatform}
                    onChange={(e) => setManualPlatform(e.target.value)}
                    className="input"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="windows">Windows</option>
                    <option value="linux">Linux</option>
                    <option value="macos">macOS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Model</label>
                  <input
                    type="text"
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    className="input"
                    placeholder="iPhone 13 Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Serial</label>
                  <input
                    type="text"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <button
              type="button"
              onClick={() => {
                setCustomerName("");
                setCustomerEmail("");
                setCustomerPhone("");
                setNotes("");
                setSelectedDevice("");
                setUseManualDevice(false);
                setError("");
                setSuccess("");
              }}
              className="btn btn-outline"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !customerName}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner w-4 h-4"></span>
                  Creating...
                </>
              ) : (
                "Create Case"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Cases */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Recent Cases</h3>
        {cases.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>No cases yet</p>
        ) : (
          <div className="space-y-2">
            {cases.slice(0, 10).map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-3 rounded-lg transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--surface-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                }}
                onClick={() => setSelectedCaseId(caseItem.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>{caseItem.customer_name}</div>
                    <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>{caseItem.id.substring(0, 8)}...</div>
                  </div>
                  <span className={`badge ${
                    caseItem.status === "completed" ? "badge-success" :
                    caseItem.status === "in-progress" ? "badge-info" :
                    caseItem.status === "closed" ? "badge-info" :
                    "badge-warning"
                  }`}>
                    {caseItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
