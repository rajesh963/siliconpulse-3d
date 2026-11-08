import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#f97316', npu: '#34d399', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('x4', 'Cortex-X4', 60, 100, 140, 80, 'cpu', { sublabel: 'prime core', color: C.cpu, badges: ['CHI'], specRef: 'Exynos §CPU', moduleId: 'ss_cluster_cpu' }),
  B('a720', 'Cortex-A720 x3', 220, 100, 150, 80, 'cpu', { sublabel: 'performance', color: C.cpu, badges: ['CHI'] }),
  B('a520', 'Cortex-A520 x6', 390, 100, 150, 80, 'cpu', { sublabel: 'efficiency', color: C.cpu, badges: ['CHI'] }),
  B('dsu', 'DSU / L3', 560, 100, 150, 80, 'crossbar', { sublabel: 'DynamIQ', color: C.clock }),
];

const BUS: DiagramBlock[] = [
  B('noc', 'System NoC / Coherent Interconnect   1 GHz', 40, 240, 900, 18, 'bus', { color: C.bus, specRef: 'Exynos §Fabric', details: 'Coherent NoC joining CPU, Xclipse GPU, NPU, modem, ISP and LPDDR5X.' }),
];

const ENGINE: DiagramBlock[] = [
  B('xclipse', 'Xclipse 940 (AMD RDNA 3)', 60, 330, 220, 100, 'accelerator', { sublabel: 'ray tracing · GMU', color: C.gpu, badges: ['AXI'], specRef: 'Exynos §GPU', moduleId: 'ss_cluster_gpu' }),
  B('gmu', 'GMU / GPU power', 60, 450, 220, 44, 'clock', { sublabel: 'scheduler', color: C.clock }),
  B('npu', 'AI NPU (dual core)', 300, 330, 190, 100, 'accelerator', { sublabel: 'vision · language', color: C.npu, badges: ['AXI'], specRef: 'Exynos §NPU', moduleId: 'ss_cluster_npu' }),
  B('npu_sram', 'NPU SRAM', 300, 450, 190, 44, 'memory', { sublabel: 'scratchpad', color: C.mem }),
  B('isp', 'ISP / camera', 510, 330, 190, 100, 'io', { sublabel: 'image signal processor', color: C.video }),
  B('mfc', 'MFC codec', 510, 450, 190, 44, 'io', { sublabel: 'video encode/decode', color: C.video }),
  B('display', 'Display / DPU', 720, 330, 190, 100, 'io', { sublabel: 'MIPI DSI', color: C.video }),
  B('audio', 'Audio DSP', 720, 450, 190, 44, 'io', { sublabel: 'audio', color: C.io }),
  B('modem', '5G NR Modem', 60, 560, 250, 90, 'io', { sublabel: 'sub-6 / mmWave · GNSS', color: C.io, badges: ['AXI'], specRef: 'Exynos §Modem', moduleId: 'ss_cluster_modem' }),
  B('3gpp', 'Modem DSP / RF', 60, 670, 250, 44, 'io', { sublabel: 'baseband', color: C.io }),
  B('ddr', 'LPDDR5X / DMC', 340, 560, 220, 90, 'memory', { sublabel: 'memory controller + PHY', color: C.mem, badges: ['CHI'] }),
  B('slc', 'System L3 / SLC', 340, 670, 220, 44, 'memory', { sublabel: 'system cache', color: C.mem }),
  B('knox', 'Knox Vault / Security', 590, 560, 190, 90, 'security', { sublabel: 'secure enclave', color: C.sec }),
  B('crypto', 'Crypto / TRNG', 590, 670, 190, 44, 'security', { sublabel: 'crypto engine', color: C.sec }),
  B('io', 'UFS / SDIO / PCIe / USB', 810, 560, 180, 90, 'io', { sublabel: 'storage & high-speed IO', color: C.io }),
  B('pmu', 'PMU / Clock / Thermal', 810, 670, 180, 44, 'clock', { sublabel: 'DVFS · thermal', color: C.clock }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'Deca-core CPU complex', x: 45, y: 85, w: 680, h: 110, color: C.cpu },
  { id: 'bus', label: 'System NoC', x: 45, y: 222, w: 900, h: 54, color: C.bus },
  { id: 'engines', label: 'GPU · NPU · multimedia', x: 45, y: 315, w: 880, h: 195, color: C.gpu },
  { id: 'io', label: 'Modem · memory · security · IO', x: 45, y: 545, w: 960, h: 185, color: C.io },
];

const WIRES: DiagramWire[] = [
  W('x4_dsu', [[130, 180], [130, 210], [635, 210], [635, 180]], { from: 'x4', to: 'dsu', busType: 'CHI', width: 128 }),
  W('a720_dsu', [[295, 180], [295, 210], [635, 210], [635, 180]], { from: 'a720', to: 'dsu', busType: 'CHI', width: 128 }),
  W('a520_dsu', [[465, 180], [465, 210], [635, 210], [635, 180]], { from: 'a520', to: 'dsu', busType: 'CHI', width: 128 }),
  W('dsu_noc', [[635, 180], [635, 240]], { from: 'dsu', to: 'noc', busType: 'CHI', width: 256 }),
  W('noc_xclipse', [[350, 258], [170, 330]], { from: 'noc', to: 'xclipse', busType: 'AXI', width: 128 }),
  W('noc_npu', [[430, 258], [395, 330]], { from: 'noc', to: 'npu', busType: 'AXI', width: 128 }),
  W('noc_isp', [[520, 258], [605, 330]], { from: 'noc', to: 'isp', busType: 'AXI', width: 128 }),
  W('noc_display', [[620, 258], [815, 330]], { from: 'noc', to: 'display', busType: 'AXI', width: 64 }),
  W('noc_modem', [[180, 258], [185, 560]], { from: 'noc', to: 'modem', busType: 'AXI', width: 128 }),
  W('noc_ddr', [[250, 258], [440, 560]], { from: 'noc', to: 'ddr', busType: 'CHI', width: 256 }),
  W('noc_knox', [[320, 258], [685, 560]], { from: 'noc', to: 'knox', busType: 'AXI', width: 64 }),
  W('noc_io', [[420, 258], [900, 560]], { from: 'noc', to: 'io', busType: 'AXI', width: 64 }),
  W('xclipse_gmu', [[170, 430], [170, 450]], { from: 'xclipse', to: 'gmu', busType: 'internal' }),
  W('npu_sram_w', [[395, 430], [395, 450]], { from: 'npu', to: 'npu_sram', busType: 'AXI' }),
  W('isp_mfc', [[605, 430], [605, 450]], { from: 'isp', to: 'mfc', busType: 'internal' }),
  W('display_audio', [[815, 430], [815, 450]], { from: 'display', to: 'audio', busType: 'internal' }),
];

export const SAMSUNG_EXYNOS2400_DIAGRAM: ArchitectureDiagram = {
  id: 'exynos2400_arch',
  companyId: 'samsung',
  socId: 'samsung',
  title: 'Samsung Exynos 2400 — block diagram',
  subtitle: 'Cortex-X4/A720/A520 · Xclipse 940 (RDNA 3) · dual-core NPU · 5G modem · LPDDR5X',
  source: 'Samsung Exynos 2400 public product page and press material',
  width: 1020,
  height: 750,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...ENGINE],
  wires: WIRES,
  notes: [
    'Xclipse 940 is publicly stated to be based on AMD RDNA 3.',
    'Block names and the tri-cluster CPU split are public; bus widths and clocks are architectural reference values.',
  ],
};
