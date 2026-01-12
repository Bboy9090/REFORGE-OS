import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummary";
import LegalClassification from "./pages/LegalClassification";
import CustodianVaultGate from "./pages/CustodianVaultGate";
import CertificationDashboard from "./pages/CertificationDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import IntakeTab from "./pages/IntakeTab";
import JobsTab from "./pages/JobsTab";
import ConsoleTab from "./pages/ConsoleTab";
import DevModeTab from "./pages/DevModeTab";
import DrivesTab from "./pages/DrivesTab";
import ImagingTab from "./pages/ImagingTab";
import DiagnosticsTab from "./pages/DiagnosticsTab";
import RecoveryTab from "./pages/RecoveryTab";
import AuditLogTab from "./pages/AuditLogTab";
import EvidenceBundleTab from "./pages/EvidenceBundleTab";
import "./App.css";

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault" | "intake" | "jobs" | "console" | "devmode" | "drives" | "imaging" | "diagnostics" | "recovery" | "audit" | "bundles";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/assets/icons/app-icon.svg" alt="REFORGE OS" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">REFORGE OS</h1>
              <p className="text-sm text-gray-400">Analysis • Classification • Lawful Routing</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Professional Repair Platform
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "analysis"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Device Analysis
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "compliance"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Compliance Summary
            </button>
            <button
              onClick={() => setActiveTab("legal")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "legal"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Legal Classification
            </button>
            <button
              onClick={() => setActiveTab("certification")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "certification"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Certification
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "vault"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Custodian Vault
            </button>
            <button
              onClick={() => setActiveTab("operations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "operations"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Operations
            </button>
            <button
              onClick={() => setActiveTab("intake")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "intake"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Intake
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "jobs"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab("devmode")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "devmode"
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Dev Mode
            </button>
            <button
              onClick={() => setActiveTab("drives")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "drives"
                  ? "border-yellow-500 text-yellow-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Drives
            </button>
            <button
              onClick={() => setActiveTab("imaging")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "imaging"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Imaging
            </button>
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "diagnostics"
                  ? "border-pink-500 text-pink-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Diagnostics
            </button>
            <button
              onClick={() => setActiveTab("recovery")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "recovery"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Recovery
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "audit"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "console"
                  ? "border-gray-500 text-gray-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Console
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === "dashboard" && <DeviceOverview />}
        {activeTab === "analysis" && <DeviceOverview onDeviceSelected={setDeviceId} />}
        {activeTab === "compliance" && <ComplianceSummary deviceId={deviceId || undefined} />}
        {activeTab === "legal" && <LegalClassification deviceId={deviceId || undefined} />}
        {activeTab === "certification" && <CertificationDashboard />}
        {activeTab === "vault" && <CustodianVaultGate deviceId={deviceId || undefined} />}
        {activeTab === "operations" && <OpsDashboard />}
        {activeTab === "intake" && <IntakeTab />}
        {activeTab === "jobs" && <JobsTab />}
        {activeTab === "devmode" && <DevModeTab />}
        {activeTab === "drives" && <DrivesTab />}
        {activeTab === "imaging" && <ImagingTab />}
        {activeTab === "diagnostics" && <DiagnosticsTab />}
        {activeTab === "recovery" && <RecoveryTab />}
        {activeTab === "audit" && <AuditLogTab />}
        {activeTab === "bundles" && <EvidenceBundleTab />}
        {activeTab === "console" && <ConsoleTab />}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>This platform provides analysis and documentation only.</p>
          <p className="mt-1">No modification, circumvention, or account interference is performed or advised.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;