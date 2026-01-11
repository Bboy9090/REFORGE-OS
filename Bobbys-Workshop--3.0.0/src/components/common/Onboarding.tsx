/**
 * User Onboarding Component
 * Guides new users through the application features
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import React types if needed

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bobby\'s Workshop',
    description: 'This is your command center for audio forensics, device manipulation, and stealth operations.',
  },
  {
    id: 'phoenix-key',
    title: 'Phoenix Key Authentication',
    description: 'Unlock Secret Rooms with the Phoenix Key. Enter the secret sequence to access advanced features.',
    target: '[data-onboarding="phoenix-key"]',
    position: 'bottom',
  },
  {
    id: 'secret-rooms',
    title: 'Secret Rooms',
    description: 'Three specialized modules: Sonic Codex (audio forensics), Ghost Codex (stealth), and Pandora Codex (hardware).',
    target: '[data-onboarding="secret-rooms"]',
    position: 'right',
  },
  {
    id: 'sonic-codex',
    title: 'Sonic Codex',
    description: 'Upload audio, extract from URLs, or record live. Advanced AI processing for transcription and enhancement.',
    target: '[data-onboarding="sonic-codex"]',
    position: 'bottom',
  },
  {
    id: 'ghost-codex',
    title: 'Ghost Codex',
    description: 'Shred metadata, create canary tokens, and generate burner personas for complete anonymity.',
    target: '[data-onboarding="ghost-codex"]',
    position: 'bottom',
  },
  {
    id: 'pandora-codex',
    title: 'Pandora Codex',
    description: 'Hardware manipulation for iOS devices. Enter DFU mode and execute exploits (use only on devices you own).',
    target: '[data-onboarding="pandora-codex"]',
    position: 'bottom',
  },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompleted = localStorage.getItem('bobbys-workshop.onboarding-completed');
    if (hasCompleted === 'true') {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => setCompleted(true), 0);
      return () => clearTimeout(timer);
    }

    // Show onboarding after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setCompleted(true);
    localStorage.setItem('bobbys-workshop.onboarding-completed', 'true');
  };

  if (completed || !isVisible) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" />

      {/* Tooltip */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10">
        <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base text-gray-300">{step.description}</p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min flex-shrink-0"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(((currentStep + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(
                "px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                !isFirstStep && "hover:border-gray-600"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min text-sm"
            >
              Skip Tour
            </button>

            <button
              onClick={handleNext}
              className={cn(
                "px-4 py-2 rounded-lg font-bold transition-colors touch-target-min flex items-center gap-2",
                isLastStep
                  ? "bg-green-500 text-black hover:bg-green-400 active:bg-green-600"
                  : "bg-cyan-500 text-black hover:bg-cyan-400 active:bg-cyan-600"
              )}
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
              {isLastStep && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
