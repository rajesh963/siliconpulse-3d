import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#76b900', apu: '#f59e0b', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('x925', 'Cortex-X925', 60, 100, 160, 80, 'cpu', { sublabel: '3.62 GHz prime', color: C.cpu, badges: ['CHI'], specRef: 'D9400 §CPU', moduleId: 'mtk_cluster_cpu' }),
  B('x4', 'Cortex-X4', 240, 100, 150, 80, 'cpu', { sublabel: 'performance', color: C.cpu, badges: ['CHI'] }),
  B('a720', 'Cortex-A720 x3', 410, 100, 160, 80, 'cpu', { sublabel: 'balanced', color: C.cpu, badges: ['CHI'] }),
  B('dsu', 'DSU / L2-L3', 590, 100, 160, 80, 'crossbar', { sublabel: 'DynamIQ', color: C.clock }),
];

const BUS: DiagramBlock[] = [
  B('noc', 'Coherent NoC / System fabric   1 GHz', 40, 240, 940, 18, 'bus', { color: C.bus, specRef: 'D9400 §Fabric', details: 'Coherent fabric joining CPU, Immortalis GPU, APU 890, modem, ISP and LPDDR5X.' }),
];

const ENGINE: DiagramBlock[] = [
  B('g925', 'Immortalis-G925', 60, 330, 230, 100, 'accelerator', { sublabel: '12-core · ray tracing', color: C.gpu, badges: ['AXI'], specRef: 'D9400 §GPU', moduleId: 'mtk_cluster_gpu' }),
  B('gpu_mmu', 'GPU MMU', 60, 450, 230, 44, 'io', { sublabel: 'SMMU', color: C.gpu }),
  B('apu', 'APU 890', 310, 330, 200, 100, 'accelerator', { sublabel: 'generative AI NPU', color: C.apu, badges: ['AXI'], specRef: 'D9400 §APU', moduleId: 'mtk_cluster_apu' }),
  B('apu_sram', 'APU SRAM', 310, 450, 200, 44, 'memory', { sublabel: 'tensor scratchpad', color: C.mem }),
  B('isp', 'ISP', 530, 330, 190, 100, 'io', { sublabel: 'camera pipeline', color: C.video }),
  B('mfc', 'MFC codec', 530, 450, 190, 44, 'io', { sublabel: 'video', color: C.video }),
  B('display', 'Display / DPU', 740, 330, 180, 100, 'io', { sublabel: 'MIPI DSI', color: C.video }),
  B('audio', 'Audio DSP', 740, 450, 180, 44, 'io', { sublabel: 'audio', color: C.io }),
  B('5g', '5G NR Modem', 60, 560, 250, 90, 'io', { sublabel: 'sub-6 / mmWave · GNSS', color: C.io, badges: ['AXI'], specRef: 'D9400 §Modem', moduleId: 'mtk_cluster_modem' }),
  B('mdsp', 'Modem DSP / RF', 60, 670, 250, 44, 'io', { sublabel: 'baseband', color: C.io }),
  B('ddr', 'LPDDR5X / DMC', 340, 560, 220, 90, 'memory', { sublabel: 'memory controller + PHY', color: C.mem, badges: ['CHI'] }),
  B('slc', 'System L3 / SLC', 340, 670, 220, 44, 'memory', { sublabel: 'system cache', color: C.mem }),
  B('sec', 'Secure boot / TEE', 590, 560, 180, 90, 'security', { sublabel: 'key store · crypto', color: C.sec }),
  B('crypto', 'Crypto engine', 590, 670, 180, 44, 'security', { sublabel: 'TRNG', color: C.sec }),
  B('io', 'UFS / SDIO / USB / PCIe', 800, 560, 180, 90, 'io', { sublabel: 'storage & high-speed IO', color: C.io }),
  B('pmu', 'PMU / Clock / Thermal', 800, 670, 180, 44, 'clock', { sublabel: 'DVFS', color: C.clock }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'Second-gen all-big-core CPU', x: 45, y: 85, w: 720, h: 110, color: C.cpu },
  { id: 'bus', label: 'Coherent NoC', x: 45, y: 222, w: 940, h: 54, color: C.bus },
  { id: 'engines', label: 'GPU · APU · multimedia', x: 45, y: 315, w: 890, h: 195, color: C.gpu },
  { id: 'io', label: 'Modem · memory · security · IO', x: 45, y: 545, w: 950, h: 185, color: C.io },
];

const WIRES: DiagramWire[] = [
  W('x925_dsu', [[140, 180], [140, 210], [670, 210], [670, 180]], { from: 'x925', to: 'dsu', busType: 'CHI', width: 128 }),
  W('x4_dsu', [[315, 180], [315, 210], [670, 210], [670, 180]], { from: 'x4', to: 'dsu', busType: 'CHI', width: 128 }),
  W('a720_dsu', [[490, 180], [490, 210], [670, 210], [670, 180]], { from: 'a720', to: 'dsu', busType: 'CHI', width: 128 }),
  W('dsu_noc', [[670, 180], [670, 240]], { from: 'dsu', to: 'noc', busType: 'CHI', width: 256 }),
  W('noc_g925', [[380, 258], [175, 330]], { from: 'noc', to: 'g925', busType: 'AXI', width: 128 }),
  W('noc_apu', [[450, 258], [410, 330]], { from: 'noc', to: 'apu', busType: 'AXI', width: 128 }),
  W('noc_isp', [[540, 258], [625, 330]], { from: 'noc', to: 'isp', busType: 'AXI', width: 128 }),
  W('noc_display', [[640, 258], [830, 330]], { from: 'noc', to: 'display', busType: 'AXI', width: 64 }),
  W('noc_5g', [[180, 258], [185, 560]], { from: 'noc', to: '5g', busType: 'AXI', width: 128 }),
  W('noc_ddr', [[250, 258], [450, 560]], { from: 'noc', to: 'ddr', busType: 'CHI', width: 256 }),
  W('noc_sec', [[330, 258], [680, 560]], { from: 'noc', to: 'sec', busType: 'AXI', width: 64 }),
  W('noc_io', [[420, 258], [890, 560]], { from: 'noc', to: 'io', busType: 'AXI', width: 64 }),
  W('g925_mmu', [[175, 430], [175, 450]], { from: 'g925', to: 'gpu_mmu', busType: 'internal' }),
  W('apu_sram_w', [[410, 430], [410, 450]], { from: 'apu', to: 'apu_sram', busType: 'AXI' }),
  W('isp_mfc', [[625, 430], [625, 450]], { from: 'isp', to: 'mfc', busType: 'internal' }),
  W('display_audio', [[830, 430], [830, 450]], { from: 'display', to: 'audio', busType: 'internal' }),
];

export const MEDIATEK_D9400_DIAGRAM: ArchitectureDiagram = {
  id: 'd9400_arch',
  companyId: 'mediatek',
  socId: 'mediatek',
  title: 'MediaTek Dimensity 9400 — block diagram',
  subtitle: 'Cortex-X925/X4/A720 · Immortalis-G925 · APU 890 · 5G NR · LPDDR5X',
  source: 'MediaTek Dimensity 9400 public product brief',
  width: 1060,
  height: 750,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...ENGINE],
  wires: WIRES,
  notes: [
    'CPU/GPU/APU/modem block names are public.',
    'Internal bus widths, fabric topology and clocks are architectural reference values.',
  ],
};
