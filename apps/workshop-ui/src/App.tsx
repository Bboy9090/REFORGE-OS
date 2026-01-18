import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import BackendHealthGate from "./components/BackendHealthGate";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummaryNew";
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
import OwnershipAttestation from "./pages/OwnershipAttestation";
import InterpretiveReview from "./pages/InterpretiveReview";
import ReportHistory from "./pages/ReportHistory";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import CertificationExam from "./pages/CertificationExam";
import HelpViewer from "./pages/HelpViewer";
import NotificationsCenter from "./pages/NotificationsCenter";
import DeviceComparison from "./pages/DeviceComparison";
import BatchAnalysis from "./pages/BatchAnalysis";
import "./App.css";
import "./styles/reforge-professional-theme.css";

// Navigation categories for organized menu
const NAV_CATEGORIES = {
  core: {
    label: "Core",
    icon: "⚡",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "analysis", label: "Device Analysis", icon: "🔍" },
      { id: "intake", label: "Intake", icon: "📥" },
      { id: "jobs", label: "Jobs", icon: "📋" },
    ]
  },
  compliance: {
    label: "Compliance",
    icon: "🛡️",
    items: [
      { id: "compliance", label: "Compliance Summary", icon: "✅" },
      { id: "legal", label: "Legal Classification", icon: "⚖️" },
      { id: "ownership", label: "Ownership", icon: "🔐" },
      { id: "audit", label: "Audit Log", icon: "📜" },
    ]
  },
  operations: {
    label: "Operations",
    icon: "🔧",
    items: [
      { id: "operations", label: "Ops Dashboard", icon: "📈" },
      { id: "diagnostics", label: "Diagnostics", icon: "🩺" },
      { id: "recovery", label: "Recovery", icon: "🔄" },
      { id: "drives", label: "Drives", icon: "💾" },
      { id: "imaging", label: "Imaging", icon: "📀" },
    ]
  },
  advanced: {
    label: "Advanced",
    icon: "🔮",
    items: [
      { id: "vault", label: "Custodian Vault", icon: "🏛️" },
      { id: "certification", label: "Certification", icon: "🎓" },
      { id: "bundles", label: "Evidence Bundles", icon: "📦" },
      { id: "batch", label: "Batch Analysis", icon: "📊" },
      { id: "compare", label: "Compare Devices", icon: "🔄" },
    ]
  },
  system: {
    label: "System",
    icon: "⚙️",
    items: [
      { id: "reports", label: "Reports", icon: "📄" },
      { id: "console", label: "Console", icon: "💻" },
      { id: "devmode", label: "Dev Mode", icon: "🛠️" },
      { id: "settings", label: "Settings", icon: "⚙️" },
      { id: "help", label: "Help", icon: "❓" },
    ]
  }
};

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault" | "intake" | "jobs" | "console" | "devmode" | "drives" | "imaging" | "diagnostics" | "recovery" | "audit" | "bundles" | "ownership" | "interpretive" | "reports" | "settings" | "profile" | "exam" | "help" | "notifications" | "compare" | "batch";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("core");

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getTabLabel = (tabId: string): string => {
    for (const category of Object.values(NAV_CATEGORIES)) {
      const item = category.items.find(i => i.id === tabId);
      if (item) return item.label;
    }
    return tabId.charAt(0).toUpperCase() + tabId.slice(1);
  };

  return (
    <BackendHealthGate>
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--ink-primary)' }}>
        {/* Sidebar Navigation */}
        <aside 
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col border-r`}
          style={{ 
            backgroundColor: 'var(--surface-secondary)', 
            borderColor: 'var(--border-primary)' 
          }}
        >
          {/* Logo Header */}
          <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-primary)' }}>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
                color: 'var(--ink-inverse)',
                boxShadow: 'var(--glow-gold)'
              }}
            >
              R
            </div>
            {!sidebarCollapsed && (
              <div className="fade-in">
                <h1 className="text-lg font-bold" style={{ color: 'var(--accent-gold)' }}>REFORGE OS</h1>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>v3.0.0</p>
              </div>
            )}
          </div>

          {/* Navigation Categories */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {Object.entries(NAV_CATEGORIES).map(([key, category]) => (
              <div key={key} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center' : 'justify-between'
                  }`}
                  style={{
                    backgroundColor: expandedCategory === key ? 'var(--surface-tertiary)' : 'transparent',
                    color: expandedCategory === key ? 'var(--accent-gold)' : 'var(--ink-secondary)'
                  }}
                  title={sidebarCollapsed ? category.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{category.label}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span 
                      className="transition-transform duration-200"
                      style={{ transform: expandedCategory === key ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      ▶
                    </span>
                  )}
                </button>

                {/* Category Items */}
                {expandedCategory === key && !sidebarCollapsed && (
                  <div className="mt-1 ml-4 space-y-1 fade-in">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left"
                        style={{
                          backgroundColor: activeTab === item.id ? 'var(--surface-elevated)' : 'transparent',
                          color: activeTab === item.id ? 'var(--accent-gold)' : 'var(--ink-muted)',
                          borderLeft: activeTab === item.id ? '3px solid var(--accent-gold)' : '3px solid transparent'
                        }}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Toggle & User Section */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                color: 'var(--ink-muted)'
              }}
            >
              <span style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
                ◀
              </span>
              {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header 
            className="h-16 flex items-center justify-between px-6 border-b"
            style={{ 
              backgroundColor: 'var(--surface-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
                {getTabLabel(activeTab)}
              </h2>
              <span 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: 'var(--surface-tertiary)',
                  color: 'var(--ink-muted)'
                }}
              >
                Analysis • Classification • Lawful Routing
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--state-success)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>System Ready</span>
              </div>
              
              {/* Quick Actions */}
              <button
                onClick={() => setActiveTab("notifications")}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeTab === 'notifications' ? 'var(--surface-tertiary)' : 'transparent',
                  color: 'var(--ink-muted)'
                }}
                title="Notifications"
              >
                🔔
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeTab === 'profile' ? 'var(--surface-tertiary)' : 'transparent',
                  color: 'var(--ink-muted)'
                }}
                title="Profile"
              >
                👤
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto fade-in">
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
              {activeTab === "ownership" && <OwnershipAttestation deviceId={deviceId || undefined} />}
              {activeTab === "interpretive" && <InterpretiveReview deviceId={deviceId || undefined} ownershipConfidence={85} />}
              {activeTab === "reports" && <ReportHistory />}
              {activeTab === "settings" && <Settings />}
              {activeTab === "profile" && <UserProfile />}
              {activeTab === "exam" && <CertificationExam />}
              {activeTab === "help" && <HelpViewer />}
              {activeTab === "notifications" && <NotificationsCenter />}
              {activeTab === "compare" && <DeviceComparison />}
              {activeTab === "batch" && <BatchAnalysis />}
            </div>
          </main>

          {/* Footer */}
          <footer 
            className="py-3 px-6 border-t text-center"
            style={{ 
              backgroundColor: 'var(--surface-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}
          >
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              This platform provides analysis and documentation only. No modification, circumvention, or account interference is performed or advised.
            </p>
          </footer>
        </div>
      </div>
    </BackendHealthGate>
  );
}

export default App;
