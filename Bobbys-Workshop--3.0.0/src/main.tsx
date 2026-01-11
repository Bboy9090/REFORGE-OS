import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark";

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';
import { logger } from './lib/logger';
import './lib/console-cleaner';

import "./main.css";
import "./styles/theme.css";
import "./index.css";

// Initialize logger
logger.info('APP', 'Application starting');

const rootElement = document.getElementById('root');
if (!rootElement) {
  logger.fatal('APP', 'Root element not found');
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);
