export type IssueSeverity = 'Blocker' | 'Critical' | 'Major' | 'Minor';
export type IssueStatus = 'Open' | 'In Progress' | 'Waiver Requested' | 'Signed Off' | 'Resolved';

export interface HardwareIssue {
  id: string; // e.g. "HW-204"
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  type: 'CDC Metastability' | 'RDC Glitch' | 'Timing Slack' | 'Lint Error' | 'DV Coverage Gap' | 'UPF Power Isolation';
  linkedModuleId: string;
  linkedConnectionId?: string;
  edaToolSource?: 'Synopsys SpyGlass' | 'Cadence JasperGold' | 'Design Compiler' | 'Custom';
  edaCheckId?: string;
  assignee: string;
  createdDate: string;
  targetMilestone: 'v0.5 RTL Freeze' | 'v0.8 DV Complete' | 'v0.9 Timing Closure' | 'v1.0 Tapeout';
}

export interface TapeoutMilestone {
  id: string;
  name: string;
  code: string;
  targetDate: string;
  status: 'Completed' | 'Current' | 'Upcoming';
  progressPercent: number;
  description: string;
}
