export type DiagramBlockKind =
  | 'cpu'
  | 'bus'
  | 'crossbar'
  | 'bridge'
  | 'memory'
  | 'peripheral'
  | 'accelerator'
  | 'io'
  | 'security'
  | 'clock'
  | 'debug'
  | 'group';

export interface DiagramBlock {
  id: string;
  label: string;
  sublabel?: string;
  kind: DiagramBlockKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  moduleId?: string;
  specRef?: string;
  badges?: string[];
  details?: string;
  /** Optional nested diagram: click-through into this module. */
  internal?: ArchitectureDiagram;
}

export interface DiagramWire {
  id: string;
  label?: string;
  points: [number, number][];
  from?: string;
  to?: string;
  busType?: string;
  width?: number;
  clock?: string;
  color?: string;
  dashed?: boolean;
  arrow?: 'end' | 'both' | 'none';
  details?: string;
}

export interface DiagramGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

export interface ArchitectureDiagram {
  id: string;
  companyId: string;
  socId: string;
  title: string;
  subtitle?: string;
  source?: string;
  width: number;
  height: number;
  groups: DiagramGroup[];
  blocks: DiagramBlock[];
  wires: DiagramWire[];
  notes?: string[];
}
