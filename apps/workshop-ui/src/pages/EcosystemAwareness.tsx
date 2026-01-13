// Ecosystem Awareness Page
// Educational, high-level overview of device security landscape
// NEVER mentions specific tools, steps, or execution paths

import React from 'react';

interface EcosystemAwarenessProps {
  platform: 'ios' | 'android';
  deviceClass: string;
}

export default function EcosystemAwareness({ platform, deviceClass }: EcosystemAwarenessProps) {
  const getEcosystemContext = () => {
    if (platform === 'ios') {
      return {
        title: "iOS Security Landscape",
        description: "Modern iOS devices are protected by multiple security layers. Over time, independent security research has explored these layers in controlled, academic environments.",
        context: "Bobby's Workshop does not deploy or operate such research tools. Their existence is referenced only to assess risk, compatibility, and legal context.",
        categories: [
          {
            name: "Hardware-Based Research",
            description: "Historical study of boot-level protections on legacy hardware",
            risk: "High account and data risk"
          },
          {
            name: "Kernel-Level Research",
            description: "Academic exploration of system-level modifications",
            risk: "High data risk, medium account risk"
          },
          {
            name: "Userland Customization",
            description: "Non-kernel system customization research",
            risk: "Medium data risk, low account risk"
          }
        ]
      };
    } else {
      return {
        title: "Android Security Landscape",
        description: "Android devices utilize various bootloader and system protection mechanisms. Independent research has explored these systems in academic and controlled environments.",
        context: "Bobby's Workshop does not deploy or operate such research tools. Their existence is referenced only to assess risk, compatibility, and legal context.",
        categories: [
          {
            name: "System Modification Research",
            description: "Academic study of system-level modifications",
            risk: "High data risk, medium account risk"
          },
          {
            name: "Bootloader Research",
            description: "Exploration of boot-level protections",
            risk: "High data risk, medium account risk"
          },
          {
            name: "Account-Level Research",
            description: "Study of account and activation state mechanisms",
            risk: "Critical account risk, high data risk"
          }
        ]
      };
    }
  };

  const context = getEcosystemContext();

  return (
    <section className="ecosystem-awareness">
      <div className="container">
        <h2>{context.title}</h2>
        
        <div className="intro">
          <p className="description">{context.description}</p>
          <p className="context">{context.context}</p>
        </div>

        <div className="categories">
          {context.categories.map((category, idx) => (
            <div key={idx} className="category-card">
              <h3>{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <div className="risk-badge">
                <span className="risk-label">Risk Profile:</span>
                <span className="risk-value">{category.risk}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="disclaimer">
          <p>
            <strong>Platform Position:</strong> The existence of security research projects 
            is acknowledged for risk assessment and legal classification purposes only. 
            No procedural guidance, tool recommendations, or execution paths are provided.
          </p>
        </div>
      </div>
    </section>
  );
}
