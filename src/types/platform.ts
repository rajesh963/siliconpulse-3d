export type SourceType = 'trm' | 'datasheet' | 'whitepaper' | 'vendor' | 'community' | 'estimate';

export interface SourceRef {
  title: string;
  url?: string;
  section?: string;
  type: SourceType;
  note?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  kind: 'semiconductor' | 'fabless' | 'ip-vendor' | 'systems' | 'foundry';
  hq: string;
  founded: string;
  website: string;
  summary: string;
  architectures: string[];
  sources: SourceRef[];
}

export interface SocProfile {
  id: string;
  companyId: string;
  name: string;
  year: string;
  process: string;
  summary: string;
  source: SourceRef;
  publiclyDocumented: 'high' | 'medium' | 'low';
}

export interface SpecSection {
  id: string;
  companyId: string;
  socId: string;
  moduleId?: string;
  section: string;
  title: string;
  summary: string;
  keywords: string[];
  source: SourceRef;
}

export interface IpRegistryEntry {
  id: string;
  name: string;
  vendor: string;
  category: 'cpu' | 'gpu' | 'npu' | 'interconnect' | 'memory' | 'io' | 'security' | 'analog' | 'dsp' | 'power';
  description: string;
  usedBy: { companyId: string; socId: string; moduleId: string }[];
  source: SourceRef;
  openSpec?: string;
}

export interface CrossVendorBinding {
  id: string;
  companyId: string;
  socId: string;
  blockId: string;
  vendor: string;
  macro: string;
  role: string;
  verified: boolean;
  note: string;
  source?: SourceRef;
}

export type TrackerDiscipline = 'arch' | 'rtl' | 'dv' | 'pd' | 'safety' | 'fw';
export type TrackerStatus = 'open' | 'triage' | 'in_progress' | 'resolved' | 'closed';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  companyId: string;
  targetModuleId: string;
  discipline: TrackerDiscipline;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: TrackerStatus;
  owner: string;
  linkedSpecId?: string;
  createdAt: string;
  updatedAt: string;
  history: { at: string; by: string; action: string }[];
}

export interface ArchitectureDecision {
  id: string;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: 'proposed' | 'accepted' | 'superseded' | 'rejected';
  companyId: string;
  linkedModuleIds: string[];
  linkedSpecIds: string[];
  owner: string;
  date: string;
  supersedes?: string;
}
