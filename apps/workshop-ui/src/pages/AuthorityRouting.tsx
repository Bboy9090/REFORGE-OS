// Authority Routing Page
// Shows lawful pathways to external authorization
// Never replaces authority - routes to it

import React from 'react';
import { AuthorityRoute } from '../types/api';

interface AuthorityRoutingProps {
  routes: AuthorityRoute[];
  deviceModel: string;
}

export default function AuthorityRouting({ routes, deviceModel }: AuthorityRoutingProps) {
  const getAuthorityIcon = (type: string) => {
    switch (type) {
      case 'oem': return '🏭';
      case 'carrier': return '📡';
      case 'court': return '⚖️';
      default: return '📋';
    }
  };

  const getAuthorityLabel = (type: string) => {
    switch (type) {
      case 'oem': return 'Device Manufacturer';
      case 'carrier': return 'Wireless Carrier';
      case 'court': return 'Legal Authority';
      default: return 'External Authority';
    }
  };

  return (
    <section className="authority-routing">
      <div className="container">
        <h2>External Authorization Pathways</h2>
        
        <div className="intro">
          <p>
            Due to the device's security profile and jurisdiction, recovery requires 
            third-party authorization. The following lawful pathways are commonly accepted.
          </p>
        </div>

        {routes.length === 0 ? (
          <div className="no-routes">
            <p>No specific authority routes identified. General pathways may apply:</p>
            <ul>
              <li>Contact device manufacturer support</li>
              <li>Review carrier policies if device is carrier-locked</li>
              <li>Consult legal counsel for ownership disputes</li>
            </ul>
          </div>
        ) : (
          <div className="routes-list">
            {routes.map((route) => (
              <div key={route.id} className="route-card">
                <div className="route-header">
                  <span className="authority-icon">{getAuthorityIcon(route.authorityType)}</span>
                  <h3>{getAuthorityLabel(route.authorityType)}</h3>
                </div>
                
                <div className="route-content">
                  <div className="route-item">
                    <span className="label">Reference:</span>
                    <span className="value">{route.reference}</span>
                  </div>
                  
                  {route.contactPath && (
                    <div className="route-item">
                      <span className="label">Contact Path:</span>
                      <span className="value">{route.contactPath}</span>
                    </div>
                  )}
                  
                  {route.documentationRequired && route.documentationRequired.length > 0 && (
                    <div className="route-item">
                      <span className="label">Documentation Required:</span>
                      <ul className="doc-list">
                        {route.documentationRequired.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="routing-disclaimer">
          <p>
            <strong>Note:</strong> Bobby's Workshop does not replace or bypass external 
            authorization requirements. These pathways are provided for informational purposes 
            only. Actual authorization must be obtained directly from the listed authorities.
          </p>
        </div>
      </div>
    </section>
  );
}
