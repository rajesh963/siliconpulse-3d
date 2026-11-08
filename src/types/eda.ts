export interface SpyglassCdcEntry {
  id: string;
  ruleName: 'Ac_unsync01' | 'Ac_conv01' | 'Ac_fifo01' | 'Ac_handshake01' | 'Clock_Check01' | 'Reset_Check01' | string;
  severity: 'Error' | 'Warning' | 'Info';
  srcFlopOrPort: string;
  dstFlopOrPort: string;
  srcClock: string;
  dstClock: string;
  status: 'VIOLATION' | 'VERIFIED' | 'WAIVED';
  message: string;
  remedy?: string;
}

export interface JasperGoldCdcEntry {
  id: string;
  checkType: 'CDC_STRUCTURAL_UNSYNC' | 'CDC_FUNCTIONAL_METASTABLE' | 'CDC_VALID_SYNC_2FF' | 'CDC_VALID_FIFO' | 'CDC_VALID_HANDSHAKE' | 'CDC_WAIVER_USER';
  status: 'VIOLATION' | 'PROVEN_CLEAN' | 'ASSUMED' | 'WAIVED';
  srcDomain: string;
  dstDomain: string;
  txPath: string;
  rxPath: string;
  syncType: string;
  mtbfYears?: number;
  comments: string;
}

export interface ParsedEdaReportSummary {
  tool: 'synopsys_spyglass' | 'cadence_jaspergold' | 'custom';
  timestamp: string;
  totalChecks: number;
  cleanCount: number;
  violationCount: number;
  waiverCount: number;
  entries: (SpyglassCdcEntry | JasperGoldCdcEntry)[];
}
