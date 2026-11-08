import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#f97316', npu: '#34d399', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('prime', 'Oryon prime x1', 60, 100, 170, 80, 'cpu', { sublabel: 'high perf', color: C.cpu, badges: ['CHI'], specRef: 'SM8650 §CPU', moduleId: 'qc_subsys_kryo_cpu' }),
  B('perf', 'Oryon perf x5', 250, 100, 170, 80, 'cpu', { sublabel: 'balanced', color: C.cpu, badges: ['CHI'] }),
  B('eff', 'Efficiency x2', 440, 100, 170, 80, 'cpu', { sublabel: 'efficiency', color: C.cpu, badges: ['CHI'] }),
  B('slc', 'System L3 / SLC', 630, 100, 180, 80, 'memory', { sublabel: 'shared cache', color: C.mem }),
];

const BUS: DiagramBlock[] = [
  B('noc', 'System NoC / coherent interconnect   1 GHz', 40, 240, 900, 18, 'bus', { color: C.bus, specRef: 'SM8650 §Fabric', details: 'Coherent NoC joining GPU, CPU, NPU, modem, ISP and LPDDR5X.' }),
];

const ENGINE: DiagramBlock[] = [
  B('adreno', 'Adreno 750', 60, 330, 210, 100, 'accelerator', { sublabel: 'ray tracing · AFME', color: C.gpu, badges: ['AXI'], specRef: 'SM8650 §Adreno', moduleId: 'qc_subsys_adreno_gpu' }),
  B('hfi', 'HFI / power', 60, 450, 210, 44, 'clock', { sublabel: 'GPU scheduling', color: C.clock }),
  B('hexagon', 'Hexagon NPU', 290, 330, 200, 100, 'accelerator', { sublabel: 'scalar · vector · tensor', color: C.npu, badges: ['AXI'], specRef: 'SM8650 §Hexagon', moduleId: 'qc_subsys_hexagon_npu' }),
  B('npu_sram', 'NPU SRAM', 290, 450, 200, 44, 'memory', { sublabel: 'scratchpad', color: C.mem }),
  B('isp', 'Spectra ISP', 520, 330, 190, 100, 'io', { sublabel: 'camera', color: C.video }),
  B('mfc', 'Video / AV1', 520, 450, 190, 44, 'io', { sublabel: 'codec', color: C.video }),
  B('display', 'Display / DPU', 740, 330, 200, 100, 'io', { sublabel: 'MIPI DSI', color: C.video }),
  B('audio', 'Audio DSP', 740, 450, 200, 44, 'io', { sublabel: 'audio', color: C.io }),
  B('modem', 'Snapdragon X75 5G', 60, 560, 270, 90, 'io', { sublabel: 'sub-6 / mmWave · GNSS', color: C.io, badges: ['AXI'] }),
  B('rf', 'RF / baseband DSP', 60, 670, 270, 44, 'io', { sublabel: 'transceiver', color: C.io }),
  B('ddr', 'LPDDR5X / DMC', 360, 560, 220, 90, 'memory', { sublabel: 'controller + PHY', color: C.mem, badges: ['CHI'] }),
  B('mmu', 'SMMU / SLC', 360, 670, 220, 44, 'memory', { sublabel: 'system MMU', color: C.mem }),
  B('sec', 'Secure Processing Unit', 610, 560, 190, 90, 'security', { sublabel: 'TrustZone · QSEE', color: C.sec }),
  B('crypto', 'Crypto / RNG', 610, 670, 190, 44, 'security', { sublabel: 'inline crypto', color: C.sec }),
  B('io', 'UFS / SDIO / USB / PCIe', 830, 560, 180, 90, 'io', { sublabel: 'storage & high-speed IO', color: C.io }),
  B('pmu', 'PMU / Clock / Thermal', 830, 670, 180, 44, 'clock', { sublabel: 'DVFS', color: C.clock }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'Oryon CPU cluster (1+5+2)', x: 45, y: 85, w: 780, h: 110, color: C.cpu },
  { id: 'bus', label: 'System NoC', x: 45, y: 222, w: 900, h: 54, color: C.bus },
  { id: 'engines', label: 'GPU · NPU · multimedia', x: 45, y: 315, w: 910, h: 195, color: C.gpu },
  { id: 'io', label: 'Modem · memory · security · IO', x: 45, y: 545, w: 980, h: 185, color: C.io },
];

const WIRES: DiagramWire[] = [
  W('prime_slc', [[145, 180], [145, 210], [720, 210], [720, 180]], { from: 'prime', to: 'slc', busType: 'CHI', width: 128 }),
  W('perf_slc', [[335, 180], [335, 210], [720, 210], [720, 180]], { from: 'perf', to: 'slc', busType: 'CHI', width: 128 }),
  W('eff_slc', [[525, 180], [525, 210], [720, 210], [720, 180]], { from: 'eff', to: 'slc', busType: 'CHI', width: 128 }),
  W('slc_noc', [[720, 180], [720, 240]], { from: 'slc', to: 'noc', busType: 'CHI', width: 256 }),
  W('noc_adreno', [[330, 258], [165, 330]], { from: 'noc', to: 'adreno', busType: 'AXI', width: 128 }),
  W('noc_hexagon', [[420, 258], [390, 330]], { from: 'noc', to: 'hexagon', busType: 'AXI', width: 128 }),
  W('noc_isp', [[520, 258], [615, 330]], { from: 'noc', to: 'isp', busType: 'AXI', width: 128 }),
  W('noc_display', [[620, 258], [840, 330]], { from: 'noc', to: 'display', busType: 'AXI', width: 64 }),
  W('noc_modem', [[180, 258], [195, 560]], { from: 'noc', to: 'modem', busType: 'AXI', width: 128 }),
  W('noc_ddr', [[250, 258], [470, 560]], { from: 'noc', to: 'ddr', busType: 'CHI', width: 256 }),
  W('noc_sec', [[330, 258], [705, 560]], { from: 'noc', to: 'sec', busType: 'AXI', width: 64 }),
  W('noc_io', [[420, 258], [920, 560]], { from: 'noc', to: 'io', busType: 'AXI', width: 64 }),
  W('adreno_hfi', [[165, 430], [165, 450]], { from: 'adreno', to: 'hfi', busType: 'internal' }),
  W('hex_npu', [[390, 430], [390, 450]], { from: 'hexagon', to: 'npu_sram', busType: 'AXI' }),
  W('isp_mfc', [[615, 430], [615, 450]], { from: 'isp', to: 'mfc', busType: 'internal' }),
  W('display_audio', [[840, 430], [840, 450]], { from: 'display', to: 'audio', busType: 'internal' }),
];

export const QUALCOMM_SM8650_DIAGRAM: ArchitectureDiagram = {
  id: 'sm8650_arch',
  companyId: 'qualcomm',
  socId: 'qualcomm',
  title: 'Qualcomm Snapdragon 8 Gen 3 — block diagram',
  subtitle: 'Oryon/Kryo 1+5+2 · Adreno 750 · Hexagon NPU · X75 5G · LPDDR5X',
  source: 'Qualcomm Snapdragon 8 Gen 3 public product page',
  width: 1020,
  height: 750,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...ENGINE],
  wires: WIRES,
  notes: [
    'Public Snapdragon material describes Adreno, Hexagon, Spectra ISP and the X75 modem.',
    'Bus widths, clocks and internal topology are architectural reference values.',
  ],
};
