// Custodial Closet (Solutions Database) Type Definitions

export type DeviceType = 'windows' | 'linux' | 'mac' | 'android' | 'ios';
export type SolutionCategory = 'hardware' | 'software' | 'boot' | 'recovery' | 'diagnostics' | 'other';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Solution {
  id: string;
  title: string;
  description: string;
  deviceType: DeviceType;
  category: SolutionCategory;
  difficulty: DifficultyLevel;
  problem: string;
  solution: string;
  steps: SolutionStep[];
  verification?: string;
  relatedSolutions?: string[]; // Solution IDs
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SolutionStep {
  number: number;
  title: string;
  description: string;
  code?: string;
  warning?: string;
  image?: string;
}

export interface SolutionSearchParams {
  device_type?: DeviceType;
  category?: SolutionCategory;
  search?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface SolutionListResponse {
  solutions: Solution[];
  total: number;
  limit: number;
  offset: number;
}

export interface SolutionResponse {
  solution: Solution;
  relatedSolutions?: Solution[];
}
