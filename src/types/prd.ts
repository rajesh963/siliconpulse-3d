export type FeatureStatus = 'Draft' | 'RTL In Progress' | 'CDC Verification' | 'Timing Closure' | 'Signed Off';
export type FeaturePriority = 'P0 - Must Have' | 'P1 - High' | 'P2 - Desirable';

export interface PRDFeature {
  id: string; // e.g. "PRD-MEM-01"
  title: string;
  category: 'Compute' | 'Memory Subsystem' | 'Interconnect' | 'High-Speed I/O' | 'Security' | 'Power/Clock';
  priority: FeaturePriority;
  status: FeatureStatus;
  targetMaturity: 'v0.5' | 'v0.8' | 'v0.9' | 'v1.0';
  specTarget: string; // e.g. "6400 MT/s with < 45ns Read Latency"
  linkedModuleId: string;
  linkedConnectionIds?: string[];
  owner: string;
  cdcVerified: boolean;
  dvCoveragePercent: number;
  description: string;
}

export interface ArchitectureSpecMetric {
  name: string;
  target: string;
  current: string;
  unit: string;
  status: 'Met' | 'In Progress' | 'At Risk';
  domain: string;
}
