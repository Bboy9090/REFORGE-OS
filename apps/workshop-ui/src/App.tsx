/**
 * REFORGE OS - Final Legendary Form
 * 
 * Layer 1: Bobby's Workshop (Public UI)
 * 
 * Features:
 * - Shop Mode / Solo Mode dual presentation
 * - Custodial Closet (read-only solutions vault)
 * - Phoenix Key productization
 * - Full compliance-first architecture
 */

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ModeProvider, useMode } from "./contexts/ModeContext";
import ModeSwitcher from "./components/ModeSwitcher";
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
import CustodialCloset from "./pages/CustodialCloset";
import PhoenixKeyManager from "./pages/PhoenixKeyManager";
import "./App.css";
import "./styles/reforge-professional-theme.css";

// Navigation categories - mode-aware
const getNavCategories = (isShopMode: boolean) => ({
  core: {
    label: "Core",
    icon: "⚡",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "analysis", label: "Device Analysis", icon: "🔍" },
      ...(isShopMode ? [
        { id: "intake", label: "Intake", icon: "📥" },
        { id: "jobs", label: "Work Orders", icon: "📋" },
      ] : []),
    ]
  },
  compliance: {
    label: "Compliance",
    icon: "🛡️",
    items: [
      { id: "compliance", label: "Compliance Summary", icon: "✅" },
      { id: "legal", label: "Legal Classification", icon: "⚖️" },
      { id: "ownership", label: "Ownership", icon: "🔐" },
      ...(isShopMode ? [{ id: "audit", label: "Audit Log", icon: "📜" }] : []),
    ]
  },
  operations: {
    label: "Operations",
    icon: "🔧",
    items: [
      ...(isShopMode ? [{ id: "operations", label: "Ops Dashboard", icon: "📈" }] : []),
      { id: "diagnostics", label: "Diagnostics", icon: "🩺" },
      { id: "recovery", label: "Recovery", icon: "🔄" },
      ...(isShopMode ? [
        { id: "drives", label: "Drives", icon: "💾" },
        { id: "imaging", label: "Imaging", icon: "📀" },
      ] : []),
    ]
  },
  knowledge: {
    label: "Knowledge",
    icon: "📚",
    items: [
      { id: "closet", label: "Custodial Closet", icon: "📚" },
      { id: "vault", label: "Custodian Vault", icon: "🏛️" },
    ]
  },
  ...(isShopMode ? {
    advanced: {
      label: "Advanced",
      icon: "🔮",
      items: [
        { id: "phoenixkey", label: "Phoenix Key", icon: "🔑" },
        { id: "certification", label: "Certification", icon: "🎓" },
        { id: "bundles", label: "Evidence Bundles", icon: "📦" },
        { id: "batch", label: "Batch Analysis", icon: "📊" },
        { id: "compare", label: "Compare Devices", icon: "🔄" },
      ]
    }
  } : {}),
  system: {
    label: "System",
    icon: "⚙️",
    items: [
      ...(isShopMode ? [{ id: "reports", label: "Reports", icon: "📄" }] : []),
      { id: "console", label: "Console", icon: "💻" },
      ...(isShopMode ? [{ id: "devmode", label: "Dev Mode", icon: "🛠️" }] : []),
      { id: "settings", label: "Settings", icon: "⚙️" },
      { id: "help", label: "Help", icon: "❓" },
    ]
  }
});

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault" | "intake" | "jobs" | "console" | "devmode" | "drives" | "imaging" | "diagnostics" | "recovery" | "audit" | "bundles" | "ownership" | "interpretive" | "reports" | "settings" | "profile" | "exam" | "help" | "notifications" | "compare" | "batch" | "closet" | "phoenixkey";

function AppContent() {
  const { mode, config, isShopMode } = useMode();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("core");

  const NAV_CATEGORIES = getNavCategories(isShopMode);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getTabLabel = (tabId: string): string => {
    for (const category of Object.values(NAV_CATEGORIES)) {
      const item = category.items.find(i => i.id === tabId);
      if (item) return item.label;
    }
    // Fallback labels
    const fallbacks: Record<string, string> = {
      profile: 'Profile',
      notifications: 'Notifications',
      exam: 'Certification Exam',
      interpretive: 'Interpretive Review',
      closet: 'Custodial Closet',
      phoenixkey: 'Phoenix Key',
    };
    return fallbacks[tabId] || tabId.charAt(0).toUpperCase() + tabId.slice(1);
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
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {isShopMode ? 'Shop Mode' : 'Solo Mode'}
                </p>
              </div>
            )}
          </div>

          {/* Mode Indicator (Collapsed) */}
          {sidebarCollapsed && (
            <div className="p-2 flex justify-center">
              <span className="text-lg" title={config.name}>{config.icon}</span>
            </div>
          )}

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

          {/* Sidebar Footer */}
          <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
            {/* Mode Switcher */}
            {!sidebarCollapsed && (
              <ModeSwitcher variant="compact" showDescription={false} />
            )}
            
            {/* Collapse Toggle */}
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
                {config.tagline}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mode Badge */}
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{ 
                  backgroundColor: isShopMode ? 'rgba(207, 181, 59, 0.1)' : 'rgba(74, 144, 164, 0.1)',
                  border: `1px solid ${isShopMode ? 'var(--accent-gold)' : '#4A90A4'}`
                }}
              >
                <span>{config.icon}</span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: isShopMode ? 'var(--accent-gold)' : '#4A90A4' }}
                >
                  {isShopMode ? 'Shop' : 'Solo'}
                </span>
              </div>

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
              {activeTab === "closet" && <CustodialCloset />}
              {activeTab === "phoenixkey" && <PhoenixKeyManager />}
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
              {config.branding.footerText}
            </p>
          </footer>
        </div>
      </div>
    </BackendHealthGate>
  );
}

// Main App with ModeProvider wrapper
function App() {
  return (
    <ModeProvider>
      <AppContent />
    </ModeProvider>
  );
}

export default App;
