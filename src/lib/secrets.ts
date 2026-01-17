/**
 * secrets.ts - Centralized secret room passwords and credentials
 * Single source of truth for all authentication keys
 * 
 * THESE ARE DEVELOPMENT PASSWORDS AND SHOULD BE REPLACED WITH ENVIRONMENT VARIABLES IN PRODUCTION
 */

/**
 * Master password for all secret rooms
 * Used by: Pandora's Room, Bobby's Traproom, and all sub-components
 * 
 * In production: Load from environment variable VITE_SECRET_ROOM_PASSWORD
 */
export const SECRET_ROOM_PASSWORD = process.env.VITE_SECRET_ROOM_PASSWORD || 'BJ0990';

/**
 * Development API key for trapdoor operations
 * Used by: TrapdoorControlPanel, ShadowLogsViewer, WorkflowExecutionConsole
 * 
 * In production: Implement JWT-based authentication instead
 */
export const DEV_ADMIN_API_KEY = process.env.VITE_ADMIN_API_KEY || 'dev-admin-key';

/**
 * Server configuration
 */
export const SERVER_CONFIG = {
  BASE_URL: process.env.VITE_SERVER_URL || 'http://localhost:3001',
  API_PREFIX: '/api',
  TRAPDOOR_PREFIX: '/api/trapdoor'
};

/**
 * Authorization prompts for different operations
 */
export const AUTH_PROMPTS = {
  FRP: 'I OWN THIS DEVICE',
  BOOTLOADER: 'UNLOCK',
  MDM: 'REMOVE MDM',
  ICLOUD: 'BYPASS ICLOUD',
  KNOX: 'BYPASS KNOX',
  OEM: 'GENERATE KEY'
} as const;

/**
 * Verify password is correct
 */
export const verifyPassword = (input: string): boolean => {
  return input === SECRET_ROOM_PASSWORD;
};

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${SERVER_CONFIG.BASE_URL}${endpoint}`;
};
