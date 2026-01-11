/**
 * TrapdoorWorkflowEngine
 * 
 * Wrapper for WorkflowExecutionConsole that integrates with Secret Rooms authentication.
 * Provides automated workflow execution capabilities.
 */

import React, { useEffect } from 'react';
import { WorkflowExecutionConsole } from '../WorkflowExecutionConsole';

interface TrapdoorWorkflowEngineProps {
  passcode?: string;
}

export function TrapdoorWorkflowEngine({ passcode }: TrapdoorWorkflowEngineProps) {
  // WorkflowExecutionConsole expects passcode in localStorage
  useEffect(() => {
    if (passcode) {
      try {
        localStorage.setItem('bobbysWorkshop.secretRoomPasscode', passcode);
      } catch (error) {
        console.error('[TrapdoorWorkflowEngine] Failed to store passcode:', error);
      }
    }
  }, [passcode]);

  return (
    <div className="h-full w-full bg-basement-concrete overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-primary mb-2">⚙️ Workflow Engine</h1>
          <p className="text-sm text-ink-muted">
            Execute automated workflows with conditional logic and parallel execution
          </p>
        </div>
        <WorkflowExecutionConsole />
      </div>
    </div>
  );
}
