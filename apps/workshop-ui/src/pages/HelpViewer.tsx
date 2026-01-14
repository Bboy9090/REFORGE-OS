// Help / Documentation Viewer
// In-app help system with search and navigation

import React, { useState } from 'react';

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  content: string;
  relatedTopics?: string[];
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Basics',
    content: 'Welcome to Bobby\'s Workshop 3.0. This platform provides compliance-first device analysis, legal classification, and lawful routing. All activity is logged for audit purposes.',
    relatedTopics: ['device-analysis', 'ownership-verification'],
  },
  {
    id: 'device-analysis',
    title: 'Device Analysis',
    category: 'Features',
    content: 'Device analysis classifies device capability ceilings and security states. It does not modify devices or provide execution paths. Analysis results inform legal classification and routing decisions.',
  },
  {
    id: 'ownership-verification',
    title: 'Ownership Verification',
    category: 'Features',
    content: 'Ownership verification requires documentation upload. Confidence scores range from 0-100%. Higher confidence may enable additional features. External authorization may be required for low confidence cases.',
  },
  {
    id: 'legal-classification',
    title: 'Legal Classification',
    category: 'Features',
    content: 'Legal classification provides jurisdiction-aware assessment of permitted, conditional, or prohibited status. Classification is based on device state, ownership, and jurisdiction laws.',
  },
  {
    id: 'compliance-reports',
    title: 'Compliance Reports',
    category: 'Features',
    content: 'Compliance reports document all analysis performed. Reports include device information, ownership assessment, legal classification, and audit references. Reports can be exported as PDF.',
  },
  {
    id: 'interpretive-review',
    title: 'Interpretive Review',
    category: 'Advanced',
    content: 'Interpretive Review Mode (Custodian Vault) provides historical context and risk assessment for complex cases. Requires ownership confidence ≥85% and Custodian role. No procedural guidance is provided.',
  },
  {
    id: 'certification',
    title: 'Certification',
    category: 'Training',
    content: 'The Workshop-Certified Technician program has three levels: Level I (Diagnostic Steward), Level II (Repair Custodian), and Level III (Interpretive Authority). Each level requires passing an exam.',
  },
];

export default function HelpViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(helpTopics.map(t => t.category)))];

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="help-viewer">
      <div className="container max-w-7xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Help & Documentation</h2>
        <p className="mb-8" style={{ color: 'var(--ink-secondary)' }}>Find answers and learn about platform features</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow-sm border p-4 mb-4" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}>
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--ink-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
            </div>

            <div className="rounded-lg shadow-sm border p-4 mb-4" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                    style={{
                      backgroundColor: selectedCategory === cat ? 'var(--accent-gold)' : 'transparent',
                      color: selectedCategory === cat ? 'var(--ink-inverse)' : 'var(--ink-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg shadow-sm border p-4" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>Topics</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                    style={{
                      backgroundColor: selectedTopic?.id === topic.id ? 'var(--accent-gold)' : 'transparent',
                      color: selectedTopic?.id === topic.id ? 'var(--ink-inverse)' : 'var(--ink-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTopic?.id !== topic.id) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTopic?.id !== topic.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {selectedTopic ? (
              <div className="rounded-lg shadow-sm border p-6" style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}>
                <div className="mb-4">
                  <span className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    color: 'var(--ink-secondary)'
                  }}>
                    {selectedTopic.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--accent-gold)' }}>{selectedTopic.title}</h3>
                <div className="prose max-w-none">
                  <p className="leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>{selectedTopic.content}</p>
                </div>
                {selectedTopic.relatedTopics && selectedTopic.relatedTopics.length > 0 && (
                  <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>Related Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.relatedTopics.map((topicId) => {
                        const topic = helpTopics.find(t => t.id === topicId);
                        return topic ? (
                          <button
                            key={topicId}
                            onClick={() => setSelectedTopic(topic)}
                            className="px-3 py-1 text-sm rounded transition-all duration-300"
                            style={{
                              backgroundColor: 'var(--surface-tertiary)',
                              color: 'var(--accent-gold)',
                              border: '1px solid var(--border-primary)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                              e.currentTarget.style.color = 'var(--accent-gold-light)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                              e.currentTarget.style.color = 'var(--accent-gold)';
                            }}
                          >
                            {topic.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg shadow-sm border p-12 text-center" style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}>
                <p style={{ color: 'var(--ink-muted)' }}>Select a topic from the sidebar to view help content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
