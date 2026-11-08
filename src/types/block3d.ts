import type { DiagramBlock } from './diagram';

export type BlockShape = 'box' | 'cpu' | 'bus' | 'bridge' | 'memory' | 'crossbar' | 'security' | 'accelerator' | 'io';

export interface Block3DNode {
  id: string;
  block: DiagramBlock;
  w: number;
  d: number;
  h: number;
  x: number;
  z: number;
  shape: BlockShape;
}

export interface Line3D {
  id: string;
  /** Contiguous segments in block space; each segment renders as a thin beam. */
  segments: { x: number; z: number }[][];
  y: number;
  color: string;
  width: number;
  wireId: string;
}

export interface Block3DPositioned {
  nodes: Block3DNode[];
  lines: Line3D[];
  width: number;
  depth: number;
}
