export type HierarchyLevel = 'soc' | 'subsystem' | 'ip' | 'submodule';

export type CDCStatus = 'clean' | 'violation' | 'waiver' | 'same_domain' | 'unverified';
export type RDCStatus = 'clean' | 'hazard' | 'na';

export interface Port {
  id: string;
  name: string;
  direction: 'in' | 'out' | 'inout';
  width: number;
  clockDomain: string;
  resetDomain: string;
  protocol: 'AXI4' | 'AHB' | 'APB' | 'DFI' | 'PCIe' | 'UART' | 'I2C' | 'JTAG' | 'Sideband';
  cdcStatus: CDCStatus;
  description?: string;
  // Local port coordinate on block perimeter [-1 to 1]
  normal: [number, number, number]; // face normal
  offset: number; // offset along edge
}

export interface IPDeliverables {
  rtlFrozen: boolean;
  lintClean: boolean;
  spyglassCdcClean: boolean;
  jasperGoldVerified: boolean;
  upfPowerIntent: boolean;
  timingClosed: boolean;
  uvmCoveragePercent: number;
  maturity: 'v0.1 Arch' | 'v0.5 RTL Freeze' | 'v0.8 DV Ready' | 'v0.9 Timing Final' | 'v1.0 Tapeout';
}

export interface MemoryMapRange {
  region: string;
  startAddr: string;
  endAddr: string;
  size: string;
  busMaster: string;
  description: string;
}

export interface ModuleNode {
  id: string;
  name: string;
  displayName: string;
  type: 'subsystem' | 'bridge' | 'ip' | 'macro' | 'submodule' | 'fabric';
  category: 'compute' | 'memory' | 'interconnect' | 'peripheral' | 'security' | 'analog';
  description: string;
  level: number; // 0 = SoC, 1 = Subsystem, 2 = IP, 3 = Submodule
  parentId: string | null;
  // 3D positioning — LOCAL to the parent module (drill-down levels are re-centred automatically)
  // y is the block centre; helpers place it at height/2 so the block sits on the die surface.
  position: [number, number, number];
  size: [number, number, number]; // [width, height, depth]
  color: string;
  clockDomains: string[];
  resetDomains: string[];
  powerDomains?: string[];
  /** Concrete instances represented by this block (e.g. SRI0/SRI1, LMU0..9). */
  instances?: string[];
  ports: Port[];
  deliverables?: IPDeliverables;
  /** Short die-marking label (e.g. CPU, SRI, NVM) shown on the top-level floorplan. */
  shortLabel?: string;
  /** Short role subtitle shown under the die marking. */
  subtitle?: string;
  /** Architectural role used by the interaction views. */
  role?: 'master' | 'slave' | 'fabric' | 'memory' | 'bridge' | 'accelerator' | 'control' | 'io';
  /** TRM / PDF section reference used as the source of truth for this block. */
  docRef?: string;
  children?: ModuleNode[];
}

export interface InterconnectConnection {
  id: string;
  name: string;
  srcModuleId: string;
  srcPortId: string;
  dstModuleId: string;
  dstPortId: string;
  busType: string;
  width: number;
  srcClock: string;
  dstClock: string;
  isCrossClock: boolean;
  cdcStatus: CDCStatus;
  rdcStatus: RDCStatus;
  syncScheme: string; // e.g. "2-FF Synchronizer", "Async FIFO Depth=16", "Unsynchronized", "Handshake FSM"
  reportSource: 'synopsys_spyglass' | 'cadence_jaspergold' | 'both' | 'system_check';
  edaCheckId: string; // e.g. "Ac_unsync01" or "CDC_STRUCTURAL_UNSYNC"
  details: string;
  waiverNote?: string;
  hierarchicalLevelScope: string; // Which level this connection belongs to e.g. 'soc' or 'memory_subsystem'
}

export type DomainKind = 'clock' | 'reset' | 'power' | 'cdc';

export interface DomainLens {
  kind: DomainKind;
  name: string;
}

export interface PowerDomainInfo {
  name: string;
  voltage: string;
  color: string;
  description: string;
  alwaysOn?: boolean;
}

export interface ClockDomainInfo {
  name: string;
  freqMhz: number;
  color: string;
  description: string;
}

export interface ResetDomainInfo {
  name: string;
  type: 'async_assert_sync_deassert' | 'async' | 'sync';
  color: string;
  description?: string;
}
