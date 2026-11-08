import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { core: '#22d3ee', mem: '#3b82f6', mesh: '#fbbf24', ctrl: '#f472b6', io: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const NODES: DiagramBlock[] = [];
const N = 4;
for (let row = 0; row < N; row++) {
  for (let col = 0; col < N; col++) {
    NODES.push(B(
      `node_${row}_${col}`,
      `SLAC ${row}-${col}`,
      80 + col * 150,
      110 + row * 130,
      120,
      90,
      'cpu',
      { sublabel: 'sparse linear algebra core', color: C.core, badges: ['MESH'], specRef: 'WSE-3 §SLAC', moduleId: 'cer_subsys_slac_nw' }
    ));
  }
}

const BUS: DiagramBlock[] = [
  B('mesh_h', '2D switched mesh — horizontal', 60, 620, 600, 16, 'bus', { color: C.mesh, specRef: 'WSE-3 §Mesh', details: 'Wafer-scale 2D switched mesh, 21 PB/s aggregate bandwidth.', moduleId: 'cer_subsys_2d_mesh' }),
  B('mesh_v', '2D switched mesh — vertical', 700, 90, 16, 560, 'bus', { color: C.mesh }),
];

const IO: DiagramBlock[] = [
  B('sram', '44 GB on-wafer SRAM', 60, 670, 240, 80, 'memory', { sublabel: 'distributed memory', color: C.mem }),
  B('swarm', 'SwarmX I/O', 320, 670, 180, 80, 'io', { sublabel: 'host / fabric', color: C.io }),
  B('ctrl', 'Control / debug', 520, 670, 160, 80, 'peripheral', { sublabel: 'wafer control', color: C.ctrl }),
  B('power', 'Power delivery / thermal', 700, 670, 180, 80, 'clock', { sublabel: 'wafer-scale', color: C.ctrl }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'wafer', label: 'Wafer-scale compute array (900,000 SLAC cores)', x: 45, y: 90, w: 700, h: 580, color: C.core },
  { id: 'mesh', label: 'On-wafer 2D mesh', x: 45, y: 600, w: 700, h: 50, color: C.mesh },
  { id: 'io', label: 'Memory / I/O / platform', x: 45, y: 655, w: 850, h: 105, color: C.io },
];

const WIRES: DiagramWire[] = [];
for (let row = 0; row < N; row++) {
  for (let col = 0; col < N - 1; col++) {
    WIRES.push(W(`h_${row}_${col}`, [[200 + col * 150, 155 + row * 130], [230 + col * 150, 155 + row * 130]], { from: `node_${row}_${col}`, to: `node_${row}_${col + 1}`, busType: 'mesh', color: C.mesh }));
  }
}
for (let col = 0; col < N; col++) {
  for (let row = 0; row < N - 1; row++) {
    WIRES.push(W(`v_${row}_${col}`, [[140 + col * 150, 200 + row * 130], [140 + col * 150, 240 + row * 130]], { from: `node_${row}_${col}`, to: `node_${row + 1}_${col}`, busType: 'mesh', color: C.mesh }));
  }
}
WIRES.push(W('arr_mesh', [[380, 610], [380, 620]], { from: 'node_3_1', to: 'mesh_h', busType: 'mesh' }));
WIRES.push(W('mesh_sram', [[380, 636], [380, 670]], { from: 'mesh_h', to: 'sram', busType: 'mesh' }));
WIRES.push(W('mesh_swarm', [[620, 636], [620, 660], [410, 660], [410, 670]], { from: 'mesh_h', to: 'swarm', busType: 'mesh' }));

export const CEREBRAS_WSE3_DIAGRAM: ArchitectureDiagram = {
  id: 'wse3_arch',
  companyId: 'cerebras',
  socId: 'cerebras',
  title: 'Cerebras WSE-3 — wafer-scale block diagram',
  subtitle: '900,000 SLAC cores · 44 GB on-wafer SRAM · 2D switched mesh · 21 PB/s',
  source: 'Cerebras WSE-3 public product documentation',
  width: 900,
  height: 770,
  groups: GROUPS,
  blocks: [...NODES, ...BUS, ...IO],
  wires: WIRES,
  notes: [
    'The array shows a 4x4 representative tile of the full wafer; the full device has 900,000 SLAC cores.',
    'Public Cerebras material describes the SLAC core count, SRAM size and aggregate bandwidth.',
  ],
};
