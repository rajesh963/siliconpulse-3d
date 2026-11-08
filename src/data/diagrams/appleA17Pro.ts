import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#f97316', ane: '#34d399', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('p0', 'Performance core #0', 60, 100, 190, 80, 'cpu', { sublabel: 'Apple custom core', color: C.cpu, badges: ['PUBLIC'], specRef: 'A17 public summary', moduleId: 'apple_cluster_cpu' }),
  B('p1', 'Performance core #1', 260, 100, 190, 80, 'cpu', { sublabel: 'Apple custom core', color: C.cpu, badges: ['PUBLIC'] }),
  B('e0', 'Efficiency core x4', 460, 100, 190, 80, 'cpu', { sublabel: 'efficiency cluster', color: C.cpu, badges: ['PUBLIC'] }),
  B('slc', 'System Level Cache', 660, 100, 170, 80, 'memory', { sublabel: 'shared cache', color: C.mem }),
];

const BUS: DiagramBlock[] = [
  B('noc', 'Apple coherent fabric    (public block names only)', 40, 240, 900, 18, 'bus', { color: C.bus, details: 'Apple does not publish the internal bus. Shown as a coherent fabric so public blocks can be reasoned about.' }),
];

const ENGINE: DiagramBlock[] = [
  B('gpu', '6-core GPU', 60, 330, 210, 100, 'accelerator', { sublabel: 'ray tracing · mesh shading', color: C.gpu, badges: ['PUBLIC'], specRef: 'A17 public summary', moduleId: 'apple_cluster_gpu' }),
  B('display', 'Display engine', 60, 450, 210, 44, 'io', { sublabel: 'ProMotion', color: C.video }),
  B('ane', '16-core Neural Engine', 300, 330, 200, 100, 'accelerator', { sublabel: '~35 TOPS · on-device AI', color: C.ane, badges: ['PUBLIC'], specRef: 'A17 public summary', moduleId: 'apple_cluster_neural' }),
  B('ane_sram', 'Neural SRAM', 300, 450, 200, 44, 'memory', { sublabel: 'scratchpad (summary)', color: C.mem }),
  B('media', 'Media engine', 530, 330, 190, 100, 'io', { sublabel: 'ProRes · AV1/HEVC', color: C.video }),
  B('isp', 'Image Signal Processor', 530, 450, 190, 44, 'io', { sublabel: 'Photonic Engine', color: C.video }),
  B('sep', 'Secure Enclave', 750, 330, 150, 100, 'security', { sublabel: 'isolated security', color: C.sec, badges: ['PUBLIC'], specRef: 'Apple Platform Security', moduleId: 'apple_cluster_security' }),
  B('crypto', 'Crypto engine', 750, 450, 150, 44, 'security', { sublabel: 'key handling', color: C.sec }),
  B('ddr', 'LPDDR5X / memory controller', 60, 560, 230, 90, 'memory', { sublabel: 'memory interface', color: C.mem }),
  B('usb', 'USB-C / DisplayPort', 320, 560, 200, 90, 'io', { sublabel: 'USB4', color: C.io }),
  B('pcie', 'PCIe / interconnect', 550, 560, 180, 90, 'io', { sublabel: 'external IO', color: C.io }),
  B('pmu', 'PMU / clock / thermal', 760, 560, 140, 90, 'clock', { sublabel: 'DVFS', color: C.clock }),
  B('wireless', 'Wireless / modem interface', 60, 670, 230, 44, 'io', { sublabel: 'external modem', color: C.io }),
  B('debug', 'Debug / trace', 320, 670, 200, 44, 'debug', { sublabel: 'CoreSight-like', color: C.clock }),
  B('display_io', 'Camera / sensor IO', 550, 670, 180, 44, 'io', { sublabel: 'MIPI', color: C.video }),
  B('boot', 'Secure boot ROM', 760, 670, 140, 44, 'security', { sublabel: 'boot chain', color: C.sec }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'CPU complex (2P + 4E)', x: 45, y: 85, w: 800, h: 110, color: C.cpu },
  { id: 'bus', label: 'Coherent fabric (public summary)', x: 45, y: 222, w: 905, h: 54, color: C.bus },
  { id: 'engines', label: 'GPU · Neural Engine · media · security', x: 45, y: 315, w: 870, h: 195, color: C.gpu },
  { id: 'io', label: 'Memory · IO · platform', x: 45, y: 545, w: 870, h: 185, color: C.io },
];

const WIRES: DiagramWire[] = [
  W('p0_slc', [[155, 180], [155, 210], [745, 210], [745, 180]], { from: 'p0', to: 'slc', busType: 'fabric', width: 128 }),
  W('p1_slc', [[355, 180], [355, 210], [745, 210], [745, 180]], { from: 'p1', to: 'slc', busType: 'fabric', width: 128 }),
  W('e0_slc', [[555, 180], [555, 210], [745, 210], [745, 180]], { from: 'e0', to: 'slc', busType: 'fabric', width: 128 }),
  W('slc_noc', [[745, 180], [745, 240]], { from: 'slc', to: 'noc', busType: 'fabric', width: 256 }),
  W('noc_gpu', [[330, 258], [165, 330]], { from: 'noc', to: 'gpu', busType: 'fabric', width: 128 }),
  W('noc_ane', [[420, 258], [400, 330]], { from: 'noc', to: 'ane', busType: 'fabric', width: 128 }),
  W('noc_media', [[520, 258], [625, 330]], { from: 'noc', to: 'media', busType: 'fabric', width: 128 }),
  W('noc_sep', [[620, 258], [825, 330]], { from: 'noc', to: 'sep', busType: 'fabric', width: 64 }),
  W('noc_ddr', [[180, 258], [175, 560]], { from: 'noc', to: 'ddr', busType: 'fabric', width: 256 }),
  W('noc_usb', [[300, 258], [420, 560]], { from: 'noc', to: 'usb', busType: 'fabric', width: 64 }),
  W('noc_pcie', [[400, 258], [640, 560]], { from: 'noc', to: 'pcie', busType: 'fabric', width: 64 }),
  W('noc_pmu', [[500, 258], [830, 560]], { from: 'noc', to: 'pmu', busType: 'fabric', width: 32 }),
  W('gpu_display', [[165, 430], [165, 450]], { from: 'gpu', to: 'display', busType: 'internal' }),
  W('ane_sram', [[400, 430], [400, 450]], { from: 'ane', to: 'ane_sram', busType: 'fabric' }),
  W('media_isp', [[625, 430], [625, 450]], { from: 'media', to: 'isp', busType: 'internal' }),
  W('sep_crypto', [[825, 430], [825, 450]], { from: 'sep', to: 'crypto', busType: 'internal' }),
];

export const APPLE_A17PRO_DIAGRAM: ArchitectureDiagram = {
  id: 'a17pro_arch',
  companyId: 'apple',
  socId: 'apple',
  title: 'Apple A17 Pro — public-summary block diagram',
  subtitle: '2P + 4E CPU · 6-core GPU · 16-core Neural Engine · Secure Enclave (block names only)',
  source: 'Apple A17 Pro public announcement and platform security guide',
  width: 960,
  height: 750,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...ENGINE],
  wires: WIRES,
  notes: [
    'Apple does not publish a block-level TRM. This diagram uses only public block names and counts.',
    'The fabric, bus widths and internal interfaces are labels for reasoning, not disclosed facts.',
    'Every block is marked PUBLIC to prevent it from being mistaken for verified microarchitecture.',
  ],
};
