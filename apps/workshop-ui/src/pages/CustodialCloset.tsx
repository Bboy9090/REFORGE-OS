/**
 * CUSTODIAL CLOSET - Read-Only Solutions Vault
 * 
 * The definitive knowledge base for:
 * - Problems & States
 * - OEM Paths
 * - Legal Routes
 * - Recovery Guidance
 * 
 * NO EXECUTION - JUST TRUTH
 * 
 * This is what makes REFORGE: Defensible, Scalable, Sellable
 */

import { useState, useEffect } from 'react';
import { solutionsApi } from '../lib/api-client';

// Device Categories
const DEVICE_CATEGORIES = {
  computers: {
    label: "Computers",
    icon: "💻",
    types: [
      { id: "computer_windows", label: "Windows PC", icon: "🪟" },
      { id: "computer_linux", label: "Linux", icon: "🐧" },
      { id: "macbook", label: "MacBook", icon: "💻" },
      { id: "imac", label: "iMac", icon: "🖥️" },
    ]
  },
  phones: {
    label: "Phones",
    icon: "📱",
    types: [
      { id: "android_phone", label: "Android Phone", icon: "🤖" },
      { id: "ios_iphone", label: "iPhone", icon: "📱" },
    ]
  },
  tablets: {
    label: "Tablets",
    icon: "📲",
    types: [
      { id: "android_tablet", label: "Android Tablet", icon: "📲" },
      { id: "ios_ipad", label: "iPad", icon: "📲" },
    ]
  }
};

// Problem Categories
const PROBLEM_CATEGORIES = [
  { id: "boot", label: "Boot Issues", icon: "🔄", description: "Device won't start or stuck in loop" },
  { id: "hardware", label: "Hardware", icon: "🔧", description: "Physical component failures" },
  { id: "software", label: "Software", icon: "📀", description: "OS and application issues" },
  { id: "performance", label: "Performance", icon: "⚡", description: "Slow or unresponsive device" },
  { id: "network", label: "Network", icon: "🌐", description: "Connectivity problems" },
  { id: "data", label: "Data", icon: "💾", description: "Data loss or recovery" },
  { id: "security", label: "Security", icon: "🔐", description: "Lock/bypass situations" },
];

// OEM Recovery Paths - TRUTH ONLY
const OEM_PATHS = {
  apple: {
    name: "Apple",
    logo: "🍎",
    support_url: "https://support.apple.com",
    paths: [
      {
        title: "Apple Store Genius Bar",
        description: "In-person support at Apple retail locations",
        requirements: ["Proof of purchase", "Apple ID access", "Device serial number"],
        timeline: "Same day to 5 business days",
        cost: "Varies by warranty status"
      },
      {
        title: "Apple Authorized Service Provider",
        description: "Third-party certified repair centers",
        requirements: ["Device serial number", "ID verification"],
        timeline: "3-7 business days",
        cost: "Varies by repair type"
      },
      {
        title: "Apple Account Recovery",
        description: "Official account recovery process for locked devices",
        requirements: ["Proof of purchase", "Original receipt", "Government ID"],
        timeline: "24-72 hours for verification",
        cost: "Free"
      }
    ]
  },
  samsung: {
    name: "Samsung",
    logo: "📱",
    support_url: "https://www.samsung.com/support",
    paths: [
      {
        title: "Samsung Care",
        description: "Official Samsung support and repair",
        requirements: ["IMEI number", "Proof of purchase", "Samsung account"],
        timeline: "5-10 business days",
        cost: "Varies by warranty status"
      },
      {
        title: "Samsung Account Recovery",
        description: "Account unlock through official channels",
        requirements: ["Proof of purchase", "ID verification"],
        timeline: "24-48 hours",
        cost: "Free"
      },
      {
        title: "Authorized Repair Center",
        description: "Samsung-certified third-party repair",
        requirements: ["Device serial/IMEI"],
        timeline: "3-7 business days",
        cost: "Varies"
      }
    ]
  },
  google: {
    name: "Google",
    logo: "🔍",
    support_url: "https://support.google.com/pixelphone",
    paths: [
      {
        title: "Google Support",
        description: "Official Pixel and Google device support",
        requirements: ["Google account", "IMEI/Serial", "Proof of purchase"],
        timeline: "Varies",
        cost: "Warranty dependent"
      },
      {
        title: "Google Account Recovery",
        description: "Official account recovery for FRP situations",
        requirements: ["Account verification", "Recovery phone/email"],
        timeline: "24 hours to 7 days",
        cost: "Free"
      }
    ]
  },
  motorola: {
    name: "Motorola",
    logo: "Ⓜ️",
    support_url: "https://www.motorola.com/support",
    paths: [
      {
        title: "Motorola Support",
        description: "Official Motorola device support",
        requirements: ["IMEI", "Purchase proof"],
        timeline: "5-10 business days",
        cost: "Warranty dependent"
      },
      {
        title: "Authorized Service Center",
        description: "Certified repair facilities",
        requirements: ["Device serial/IMEI"],
        timeline: "3-7 business days",
        cost: "Varies"
      }
    ]
  },
  microsoft: {
    name: "Microsoft",
    logo: "🪟",
    support_url: "https://support.microsoft.com",
    paths: [
      {
        title: "Microsoft Store",
        description: "In-person Windows/Surface support",
        requirements: ["Device serial", "Microsoft account"],
        timeline: "Same day to 5 business days",
        cost: "Varies"
      },
      {
        title: "Microsoft Account Recovery",
        description: "Account unlock for Windows devices",
        requirements: ["Account verification", "Recovery options"],
        timeline: "Immediate to 24 hours",
        cost: "Free"
      }
    ]
  }
};

// Legal Routes Reference
const LEGAL_ROUTES = {
  ownership_disputes: {
    title: "Ownership Disputes",
    description: "When ownership of a device is contested",
    routes: [
      {
        scenario: "Purchased second-hand, locked",
        action: "Request proof of sale from seller, contact original owner if possible",
        legal_path: "Small claims court if seller unresponsive",
        documentation: ["Receipt", "Communication records", "Seller information"]
      },
      {
        scenario: "Inherited device, locked to deceased",
        action: "Estate documentation through probate court",
        legal_path: "Probate court order for account access",
        documentation: ["Death certificate", "Estate documents", "Probate order"]
      },
      {
        scenario: "Company-owned device, employee departed",
        action: "MDM removal through enterprise channels",
        legal_path: "Enterprise IT process, HR documentation",
        documentation: ["Employment records", "IT asset records"]
      }
    ]
  },
  lost_stolen: {
    title: "Lost/Stolen Device Recovery",
    description: "Legal process for lost or stolen device situations",
    routes: [
      {
        scenario: "Found device, want to return",
        action: "Turn in to local police or carrier store",
        legal_path: "Good Samaritan documentation",
        documentation: ["Location found", "Date/time", "Your contact info"]
      },
      {
        scenario: "Your device was stolen",
        action: "File police report, report to carrier for blacklist",
        legal_path: "Police report required for insurance",
        documentation: ["Police report number", "IMEI", "Proof of purchase"]
      }
    ]
  },
  business_recovery: {
    title: "Business/Enterprise Recovery",
    description: "Corporate device recovery scenarios",
    routes: [
      {
        scenario: "Employee left with device",
        action: "HR termination documentation, legal demand letter",
        legal_path: "Employment contract enforcement",
        documentation: ["Employment contract", "IT asset assignment", "Termination docs"]
      },
      {
        scenario: "MDM locked after company change",
        action: "Contact new MDM admin or original vendor",
        legal_path: "Business succession documentation",
        documentation: ["Business acquisition docs", "IT transfer records"]
      }
    ]
  }
};

// Difficulty color mapping
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'var(--state-success)';
    case 'medium': return 'var(--state-warning)';
    case 'hard': return 'var(--accent-bronze)';
    case 'expert': return 'var(--state-error)';
    default: return 'var(--ink-muted)';
  }
};

interface Solution {
  id: string;
  title: string;
  description: string;
  device_type: string;
  category: string;
  solution_steps: string[];
  difficulty: string;
  estimated_time: string;
  tools_needed: string[];
  prerequisites: string[];
  warnings: string[];
  tags: string[];
}

export default function CustodialCloset() {
  const [activeSection, setActiveSection] = useState<'problems' | 'oem' | 'legal' | 'recovery'>('problems');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOEM, setSelectedOEM] = useState<string | null>(null);

  // Fetch solutions when filters change
  useEffect(() => {
    if (activeSection === 'problems') {
      fetchSolutions();
    }
  }, [selectedDeviceType, selectedCategory, searchQuery, activeSection]);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const response = await solutionsApi.list({
        device_type: selectedDeviceType || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      if (response.ok && response.solutions) {
        setSolutions(response.solutions);
      }
    } catch (error) {
      console.error('Failed to fetch solutions:', error);
      // Use embedded solutions as fallback
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
                boxShadow: 'var(--glow-gold)'
              }}
            >
              📚
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                Custodial Closet
              </h1>
              <p style={{ color: 'var(--ink-muted)' }}>
                Read-Only Solutions Vault • No Execution • Just Truth
              </p>
            </div>
          </div>
        </div>
        
        {/* READ-ONLY Badge */}
        <div 
          className="px-4 py-2 rounded-lg border-2"
          style={{ 
            borderColor: 'var(--accent-gold)',
            backgroundColor: 'rgba(207, 181, 59, 0.1)'
          }}
        >
          <span style={{ color: 'var(--accent-gold)' }} className="font-bold">
            READ-ONLY
          </span>
          <span style={{ color: 'var(--ink-muted)' }} className="ml-2 text-sm">
            Reference Only
          </span>
        </div>
      </div>

      {/* Section Navigation */}
      <div 
        className="flex gap-2 p-2 rounded-lg"
        style={{ backgroundColor: 'var(--surface-secondary)' }}
      >
        {[
          { id: 'problems', label: 'Problems & Solutions', icon: '🔧' },
          { id: 'oem', label: 'OEM Paths', icon: '🏭' },
          { id: 'legal', label: 'Legal Routes', icon: '⚖️' },
          { id: 'recovery', label: 'Recovery Guidance', icon: '🔄' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: activeSection === section.id ? 'var(--surface-elevated)' : 'transparent',
              color: activeSection === section.id ? 'var(--accent-gold)' : 'var(--ink-muted)',
              border: activeSection === section.id ? '1px solid var(--accent-gold)' : '1px solid transparent'
            }}
          >
            <span>{section.icon}</span>
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* PROBLEMS & SOLUTIONS Section */}
      {activeSection === 'problems' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="col-span-3 space-y-4">
            {/* Search */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-none outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-tertiary)',
                  color: 'var(--ink-primary)'
                }}
              />
            </div>

            {/* Device Types */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>
                Device Type
              </h3>
              {Object.entries(DEVICE_CATEGORIES).map(([key, category]) => (
                <div key={key} className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{category.icon}</span>
                    <span style={{ color: 'var(--ink-secondary)' }} className="text-sm font-medium">
                      {category.label}
                    </span>
                  </div>
                  <div className="space-y-1 ml-6">
                    {category.types.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedDeviceType(selectedDeviceType === type.id ? null : type.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200"
                        style={{
                          backgroundColor: selectedDeviceType === type.id ? 'var(--surface-tertiary)' : 'transparent',
                          color: selectedDeviceType === type.id ? 'var(--accent-gold)' : 'var(--ink-muted)'
                        }}
                      >
                        <span>{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Problem Categories */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>
                Problem Category
              </h3>
              <div className="space-y-1">
                {PROBLEM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200"
                    style={{
                      backgroundColor: selectedCategory === cat.id ? 'var(--surface-tertiary)' : 'transparent',
                      color: selectedCategory === cat.id ? 'var(--accent-gold)' : 'var(--ink-muted)'
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Solutions List */}
          <div className="col-span-9">
            {selectedSolution ? (
              // Solution Detail View
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--surface-tertiary)',
                    color: 'var(--ink-muted)'
                  }}
                >
                  ← Back to Solutions
                </button>

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink-primary)' }}>
                      {selectedSolution.title}
                    </h2>
                    <p style={{ color: 'var(--ink-muted)' }}>{selectedSolution.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: getDifficultyColor(selectedSolution.difficulty),
                        color: 'var(--ink-inverse)'
                      }}
                    >
                      {selectedSolution.difficulty}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: 'var(--surface-tertiary)',
                        color: 'var(--ink-muted)'
                      }}
                    >
                      ⏱️ {selectedSolution.estimated_time}
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                {selectedSolution.warnings.length > 0 && (
                  <div 
                    className="p-4 rounded-lg mb-6 border-l-4"
                    style={{ 
                      backgroundColor: 'rgba(255, 59, 48, 0.1)',
                      borderLeftColor: 'var(--state-error)'
                    }}
                  >
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--state-error)' }}>
                      ⚠️ Warnings
                    </h4>
                    <ul className="space-y-1">
                      {selectedSolution.warnings.map((warning, i) => (
                        <li key={i} style={{ color: 'var(--ink-secondary)' }}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {selectedSolution.prerequisites.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
                      Prerequisites
                    </h4>
                    <ul className="space-y-1">
                      {selectedSolution.prerequisites.map((prereq, i) => (
                        <li key={i} className="flex items-center gap-2" style={{ color: 'var(--ink-secondary)' }}>
                          <span style={{ color: 'var(--accent-gold)' }}>✓</span> {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tools Needed */}
                {selectedSolution.tools_needed.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
                      Tools Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSolution.tools_needed.map((tool, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ 
                            backgroundColor: 'var(--surface-tertiary)',
                            color: 'var(--ink-muted)'
                          }}
                        >
                          🔧 {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solution Steps */}
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>
                    Solution Steps
                  </h4>
                  <div className="space-y-3">
                    {selectedSolution.solution_steps.map((step, i) => (
                      <div 
                        key={i}
                        className="flex gap-4 p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--surface-tertiary)' }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
                          style={{ 
                            backgroundColor: 'var(--accent-gold)',
                            color: 'var(--ink-inverse)'
                          }}
                        >
                          {i + 1}
                        </div>
                        <p style={{ color: 'var(--ink-primary)' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex flex-wrap gap-2">
                    {selectedSolution.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: 'var(--surface-tertiary)',
                          color: 'var(--ink-muted)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Solutions List
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
                    <p style={{ color: 'var(--ink-muted)' }}>Loading solutions...</p>
                  </div>
                ) : solutions.length === 0 ? (
                  <div 
                    className="text-center py-12 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
                      Select a Device Type or Category
                    </h3>
                    <p style={{ color: 'var(--ink-muted)' }}>
                      Use the filters on the left to find solutions
                    </p>
                  </div>
                ) : (
                  solutions.map((solution) => (
                    <button
                      key={solution.id}
                      onClick={() => setSelectedSolution(solution)}
                      className="w-full p-4 rounded-lg border text-left transition-all duration-200"
                      style={{ 
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border-primary)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1" style={{ color: 'var(--ink-primary)' }}>
                            {solution.title}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            {solution.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getDifficultyColor(solution.difficulty),
                              color: 'var(--ink-inverse)'
                            }}
                          >
                            {solution.difficulty}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: 'var(--surface-tertiary)',
                              color: 'var(--ink-muted)'
                            }}
                          >
                            {solution.estimated_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ 
                            backgroundColor: 'var(--surface-tertiary)',
                            color: 'var(--accent-gold)'
                          }}
                        >
                          {solution.category}
                        </span>
                        <span style={{ color: 'var(--ink-muted)' }} className="text-xs">
                          {solution.solution_steps.length} steps
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OEM PATHS Section */}
      {activeSection === 'oem' && (
        <div className="grid grid-cols-12 gap-6">
          {/* OEM List */}
          <div className="col-span-3 space-y-2">
            {Object.entries(OEM_PATHS).map(([key, oem]) => (
              <button
                key={key}
                onClick={() => setSelectedOEM(selectedOEM === key ? null : key)}
                className="w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 border"
                style={{
                  backgroundColor: selectedOEM === key ? 'var(--surface-elevated)' : 'var(--surface-secondary)',
                  borderColor: selectedOEM === key ? 'var(--accent-gold)' : 'var(--border-primary)',
                  color: selectedOEM === key ? 'var(--accent-gold)' : 'var(--ink-primary)'
                }}
              >
                <span className="text-2xl">{oem.logo}</span>
                <div>
                  <div className="font-semibold">{oem.name}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {oem.paths.length} recovery paths
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* OEM Details */}
          <div className="col-span-9">
            {selectedOEM ? (
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{OEM_PATHS[selectedOEM as keyof typeof OEM_PATHS].logo}</span>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: 'var(--ink-primary)' }}>
                        {OEM_PATHS[selectedOEM as keyof typeof OEM_PATHS].name} Recovery Paths
                      </h2>
                      <a 
                        href={OEM_PATHS[selectedOEM as keyof typeof OEM_PATHS].support_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm"
                        style={{ color: 'var(--accent-gold)' }}
                      >
                        Official Support →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {OEM_PATHS[selectedOEM as keyof typeof OEM_PATHS].paths.map((path, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: 'var(--surface-tertiary)',
                        borderColor: 'var(--border-primary)'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>
                        {path.title}
                      </h3>
                      <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
                        {path.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--ink-muted)' }}>
                            Requirements
                          </h4>
                          <ul className="space-y-1">
                            {path.requirements.map((req, j) => (
                              <li key={j} className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                                • {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--ink-muted)' }}>
                            Timeline
                          </h4>
                          <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                            {path.timeline}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--ink-muted)' }}>
                            Cost
                          </h4>
                          <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                            {path.cost}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                className="text-center py-12 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>
                  Select an OEM
                </h3>
                <p style={{ color: 'var(--ink-muted)' }}>
                  View official recovery paths for each manufacturer
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEGAL ROUTES Section */}
      {activeSection === 'legal' && (
        <div className="space-y-6">
          {/* Legal Disclaimer */}
          <div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderLeftColor: 'var(--state-warning)'
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: 'var(--state-warning)' }}>
              ⚖️ Legal Disclaimer
            </h4>
            <p style={{ color: 'var(--ink-secondary)' }}>
              This information is for reference only and does not constitute legal advice. 
              Consult with a qualified attorney for your specific jurisdiction and situation.
            </p>
          </div>

          {Object.entries(LEGAL_ROUTES).map(([key, category]) => (
            <div 
              key={key}
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>
                {category.title}
              </h2>
              <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>
                {category.description}
              </p>

              <div className="space-y-4">
                {category.routes.map((route, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  >
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>
                      {route.scenario}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--accent-gold)' }}>
                          Recommended Action
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                          {route.action}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--accent-gold)' }}>
                          Legal Path
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                          {route.legal_path}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--accent-gold)' }}>
                          Documentation Needed
                        </h4>
                        <ul className="space-y-1">
                          {route.documentation.map((doc, j) => (
                            <li key={j} className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                              • {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECOVERY GUIDANCE Section */}
      {activeSection === 'recovery' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Recovery Best Practices */}
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
              <span>📋</span> Recovery Best Practices
            </h2>
            
            <div className="space-y-4">
              {[
                { title: "Document Everything", desc: "Photograph device condition, record serial numbers, note all visible damage" },
                { title: "Verify Ownership First", desc: "Never proceed without proof of ownership or proper authorization" },
                { title: "Backup Before Action", desc: "Always attempt data backup before any recovery operation" },
                { title: "Use Official Channels", desc: "Prefer OEM recovery paths over third-party solutions" },
                { title: "Maintain Audit Trail", desc: "Log all actions taken for legal defensibility" },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-tertiary)' }}
                >
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--ink-primary)' }}>
                    {i + 1}. {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Scenarios */}
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
              <span>🔄</span> Common Recovery Scenarios
            </h2>
            
            <div className="space-y-4">
              {[
                { 
                  scenario: "Forgotten Password/PIN", 
                  guidance: "Use official account recovery first. OEM reset as last resort (data loss)." 
                },
                { 
                  scenario: "FRP Lock (Android)", 
                  guidance: "Must use original Google account or contact carrier/OEM with ownership proof." 
                },
                { 
                  scenario: "iCloud Activation Lock", 
                  guidance: "Apple official channels only. Requires proof of purchase and ID." 
                },
                { 
                  scenario: "MDM Enrollment", 
                  guidance: "Contact organization that enrolled device. Enterprise IT or MDM vendor." 
                },
                { 
                  scenario: "Carrier Lock", 
                  guidance: "Request unlock from carrier after contract terms met. May require account access." 
                },
                { 
                  scenario: "Boot Loop", 
                  guidance: "Safe mode → Factory reset → OEM tools → Hardware diagnosis" 
                },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: 'var(--surface-tertiary)',
                    borderLeftColor: 'var(--accent-bronze)'
                  }}
                >
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--ink-primary)' }}>
                    {item.scenario}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                    {item.guidance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DO NOT Section */}
          <div 
            className="col-span-2 p-6 rounded-lg border-2"
            style={{ 
              backgroundColor: 'rgba(255, 59, 48, 0.05)',
              borderColor: 'var(--state-error)'
            }}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--state-error)' }}>
              <span>🚫</span> NEVER DO THE FOLLOWING
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                "Attempt to bypass locks on devices you don't own",
                "Use exploits or vulnerabilities to gain unauthorized access",
                "Modify device firmware without explicit authorization",
                "Promise unlock/bypass services to customers",
                "Destroy evidence of device state before documentation",
                "Ignore red flags indicating stolen or disputed ownership"
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <span style={{ color: 'var(--state-error)' }}>✕</span>
                  <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div 
        className="text-center py-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          Custodial Closet is a reference resource. No execution, modification, or circumvention is performed.
          <br />
          <span style={{ color: 'var(--accent-gold)' }}>This is what makes REFORGE: Defensible • Scalable • Sellable</span>
        </p>
      </div>
    </div>
  );
}
