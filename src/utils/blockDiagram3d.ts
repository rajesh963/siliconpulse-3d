import type { ArchitectureDiagram, DiagramBlock } from '../types/diagram';
import type { Block3DNode, Block3DPositioned, BlockShape, Line3D } from '../types/block3d';

type Pt = [number, number];

const BUS_HEIGHT = 0.5;
const BUS_THICKNESS = 0.62;
const BRIDGE_HEIGHT = 1.5;

const SHAPE_BY_KIND: Record<DiagramBlock['kind'], BlockShape> = {
  cpu: 'cpu',
  bus: 'bus',
  crossbar: 'crossbar',
  bridge: 'bridge',
  memory: 'memory',
  peripheral: 'box',
  accelerator: 'accelerator',
  io: 'io',
  security: 'security',
  clock: 'io',
  debug: 'io',
  group: 'box',
};

const isBus = (block: DiagramBlock) => block.kind === 'bus';

/**
 * Segment a wire at bus/to/from edges: the bus axis is a "busbar" in 3D, so
 * vertical taps land on the block edge (or bus edge) instead of vanishing underneath.
 */
const splitWire = (points: Pt[], edges: Set<string>): Pt[][] => {
  const segments: Pt[][] = [];
  let current: Pt[] = [[points[0][0], points[0][1]]];
  for (let i = 1; i < points.length; i++) {
    const [x, z] = points[i];
    const prev = points[i - 1];
    const edgeKey = `${x}:${z}`;
    const dx = x - prev[0];
    const dz = z - prev[1];
    const horizontal = Math.abs(dx) > Math.abs(dz);
    const edge = edges.has(edgeKey) || (horizontal ? edges.has(`H${x}:${z}`) : edges.has(`V${x}:${z}`));
    current.push([x, z]);
    if (edge) {
      segments.push(current);
      current = [[x, z]];
    }
  }
  if (current.length > 1) segments.push(current);
  return segments.filter(seg => seg.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])));
};

export const buildBlockDiagram3D = (diagram: ArchitectureDiagram): Block3DPositioned => {
  const edgeKeys = new Set<string>();
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const block of diagram.blocks) {
    if (isBus(block)) continue;
    const cx = block.x + block.w / 2;
    const cz = block.y + block.h / 2;
    for (const s of [-1, 1]) {
      edgeKeys.add(`${cx}:${block.y + (s < 0 ? 0 : block.h)}`);
      edgeKeys.add(`H${cx + s * block.w / 2}:${cz}`);
      edgeKeys.add(`V${cx}:${block.y + (s < 0 ? 0 : block.h)}`);
    }
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x + block.w);
    minZ = Math.min(minZ, block.y);
    maxZ = Math.max(maxZ, block.y + block.h);
  }
  for (const block of diagram.blocks) {
    if (!isBus(block)) continue;
    edgeKeys.add(`V${block.x}:${block.y}`);
    edgeKeys.add(`V${block.x + block.w}:${block.y}`);
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x + block.w);
    minZ = Math.min(minZ, block.y);
    maxZ = Math.max(maxZ, block.y + block.h);
  }

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const toX = (x: number) => (x - centerX) / 10;
  const toZ = (z: number) => (z - centerZ) / 10;

  const nodes: Block3DNode[] = diagram.blocks
    .filter(block => block.kind !== 'group')
    .map(block => {
      const shape = SHAPE_BY_KIND[block.kind];
      const bus = isBus(block);
      const w = Math.max(0.7, block.w / 10);
      const d = Math.max(0.6, block.h / 10);
      const h = bus ? BUS_HEIGHT : shape === 'bridge' ? BRIDGE_HEIGHT : shape === 'cpu' ? 0.95 : shape === 'memory' ? 0.8 : 0.9;
      return {
        id: block.id,
        block,
        w,
        d,
        h,
        x: toX(block.x + block.w / 2),
        z: toZ(block.y + block.h / 2),
        shape,
      };
    });

  const colorByBlock = new Map<string, string>(diagram.blocks.map(block => [block.id, block.color ?? '#94a3b8']));
  const lines: Line3D[] = [];
  for (const wire of diagram.wires) {
    const segments = splitWire(wire.points, edgeKeys);
    const color = wire.color
      ?? colorByBlock.get(wire.from ?? '')
      ?? colorByBlock.get(wire.to ?? '')
      ?? '#64748b';
    segments.forEach((segment, index) => {
      lines.push({
        id: `${wire.id}__${index}`,
        segments: [segment.map(point => ({ x: toX(point[0]), z: toZ(point[1]) }))],
        y: wire.width && wire.width >= 64 ? 0.72 : 0.6,
        color,
        width: wire.width && wire.width >= 64 ? 0.075 : 0.055,
        wireId: wire.id,
      });
    });
  }

  return { nodes, lines, width: (maxX - minX) / 10, depth: (maxZ - minZ) / 10 };
};

export { BUS_THICKNESS };
