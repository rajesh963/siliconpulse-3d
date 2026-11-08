export type StakeholderRole = 'all' | 'architect' | 'manager' | 'rtl' | 'dv';

export type RequirementCategory = 'Performance & Latency' | 'Power & Energy' | 'Safety & CDC' | 'Interconnect & Bus' | 'Security & Trust';
export type RequirementStatus = 'Spec Approved' | 'RTL In Progress' | 'CDC Verification' | 'DV Verification' | 'Sign-off Clean' | 'ECO / Delta Pending';

export interface CustomerRequirement {
  id: string; // e.g. "CR-01"
  customerSpec: string; // e.g. "LPDDR5-6400 Bandwidth >= 50 GB/s"
  category: RequirementCategory;
  customerPriority: 'P0 - Mission Critical' | 'P1 - High' | 'P2 - Desirable';
  targetValue: string;
  currentValue: string;
  status: RequirementStatus;
  impactedModuleIds: string[]; // e.g. ['subsys_memory', 'subsys_noc']
  
  // 🏛️ ARCHITECT VIEW
  architectImpact: {
    microarchChanges: string;
    clockFrequencies: string;
    areaPowerDelta: string;
    bottleneckAnalysis: string;
  };

  // 👔 MANAGEMENT VIEW
  managerImpact: {
    tapeoutMilestone: string;
    scheduleRisk: 'Low' | 'Medium' | 'High' | 'Blocker';
    estimatedManWeeks: number;
    owner: string;
    deliverableGate: string;
  };

  // ⚡ RTL ENGINEERING VIEW
  rtlImpact: {
    moduleHierarchy: string;
    portSignals: string;
    registerMapChanges: string;
    cdcSynchronizerRequired: string;
    synthesizabilityNote: string;
  };

  // 🧪 DV (DESIGN VERIFICATION) VIEW
  dvImpact: {
    uvmTestbenchEnv: string;
    cornerCases: string;
    functionalCoverageGoal: number;
    currentCoverage: number;
    formalAssertions: string;
  };
}

export interface SpecDeltaEvent {
  id: string;
  title: string;
  timestamp: string;
  requestedBy: string;
  fromValue: string;
  toValue: string;
  affectedReqId: string;
  impactSummary: {
    architect: string;
    manager: string;
    rtl: string;
    dv: string;
  };
}
