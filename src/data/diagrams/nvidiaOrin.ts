import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#76b900', dla: '#34d399', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const COMPUTE: DiagramBlock[] = [
  B('gpu', 'Ampere GPU', 60, 100, 240, 100, 'accelerator', { sublabel: '2048 CUDA · 64 Tensor', color: C.gpu, badges: ['SCF'], specRef: 'Orin §GPU', moduleId: 'nv_subsys_gpu' }),
  B('gpu_cache', 'GPU L2 / SRAM', 60, 210, 240, 44, 'memory', { sublabel: 'local cache', color: C.mem }),
  B('dla0', 'DLA0 (NVDLA)', 320, 100, 170, 100, 'accelerator', { sublabel: 'INT8/FP16 inference', color: C.dla, badges: ['SCF'], specRef: 'Orin §DLA', moduleId: 'nv_subsys_dla' }),
  B('dla1', 'DLA1 (NVDLA)', 510, 100, 170, 100, 'accelerator', { sublabel: 'INT8/FP16 inference', color: C.dla, badges: ['SCF'] }),
  B('pva', 'PVA', 700, 100, 150, 100, 'accelerator', { sublabel: 'programmable vision accel', color: C.dla }),
  B('cpu_a', 'Cortex-A78AE x4', 60, 270, 220, 80, 'cpu', { sublabel: 'application cluster', color: C.cpu, badges: ['SCF'] }),
  B('cpu_b', 'Cortex-A78AE x8', 300, 270, 220, 80, 'cpu', { sublabel: 'application cluster', color: C.cpu, badges: ['SCF'] }),
  B('r52', 'Cortex-R52 x2', 540, 270, 180, 80, 'cpu', { sublabel: 'safety island', color: C.cpu }),
  B('safety', 'Safety Island', 740, 270, 160, 80, 'security', { sublabel: 'ASIL-D monitors', color: C.sec }),
];

const BUS: DiagramBlock[] = [
  B('scf', 'System Coherent Fabric (SCF)   2 GHz', 40, 390, 870, 18, 'bus', { color: C.bus, specRef: 'Orin §SCF', details: 'Coherent mesh joining GPU, CPUs, DLA, PVA, memory and IO.', moduleId: 'nv_bridge_scf_noc' }),
];

const IO: DiagramBlock[] = [
  B('ddr', 'LPDDR5 (2 groups)', 60, 470, 210, 90, 'memory', { sublabel: 'memory controller + PHY', color: C.mem, badges: ['SCF'] }),
  B('pcie', 'PCIe Gen4 x4', 290, 470, 150, 90, 'io', { sublabel: 'root complex', color: C.io }),
  B('nvlink', 'NVLink-C2C', 460, 470, 150, 90, 'io', { sublabel: 'chip-to-chip', color: C.io }),
  B('eth', 'Ethernet 10GbE', 630, 470, 150, 90, 'io', { sublabel: 'network', color: C.io }),
  B('usb', 'USB / UFS', 800, 470, 110, 90, 'io', { sublabel: 'host / storage', color: C.io }),
  B('isp', 'ISP', 60, 580, 210, 80, 'io', { sublabel: 'camera pipeline', color: C.video }),
  B('mfc', 'Video codec', 290, 580, 150, 80, 'io', { sublabel: 'encode/decode', color: C.video }),
  B('display', 'Display', 460, 580, 150, 80, 'io', { sublabel: 'output', color: C.video }),
  B('crypto', 'Crypto / HSM', 630, 580, 150, 80, 'security', { sublabel: 'secure boot', color: C.sec }),
  B('pmu', 'PMU / Clock / Thermal', 800, 580, 110, 80, 'clock', { sublabel: 'DVFS', color: C.clock }),
  B('debug', 'Debug & Trace', 60, 680, 210, 60, 'debug', { sublabel: 'CoreSight', color: C.clock }),
  B('can', 'CAN / SPI / I2C / GPIO', 290, 680, 470, 60, 'io', { sublabel: 'automotive interfaces', color: C.io }),
  B('timer', 'Timers / WDT', 800, 680, 110, 60, 'clock', { sublabel: 'system control', color: C.clock }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'compute', label: 'Compute: Ampere GPU · DLA · PVA · CPU', x: 45, y: 85, w: 820, h: 275, color: C.gpu },
  { id: 'bus', label: 'System Coherent Fabric', x: 45, y: 372, w: 870, h: 54, color: C.bus },
  { id: 'io', label: 'Memory · IO · multimedia · safety', x: 45, y: 455, w: 870, h: 300, color: C.io },
];

const WIRES: DiagramWire[] = [
  W('gpu_scf', [[180, 254], [180, 390]], { from: 'gpu_cache', to: 'scf', busType: 'SCF', width: 256 }),
  W('dla0_scf', [[405, 200], [405, 236], [430, 236], [430, 390]], { from: 'dla0', to: 'scf', busType: 'SCF', width: 128 }),
  W('dla1_scf', [[595, 200], [595, 236], [470, 236], [470, 390]], { from: 'dla1', to: 'scf', busType: 'SCF', width: 128 }),
  W('pva_scf', [[775, 200], [775, 390]], { from: 'pva', to: 'scf', busType: 'SCF', width: 128 }),
  W('cpu_a_scf', [[170, 350], [170, 390]], { from: 'cpu_a', to: 'scf', busType: 'SCF', width: 128 }),
  W('cpu_b_scf', [[410, 350], [410, 390]], { from: 'cpu_b', to: 'scf', busType: 'SCF', width: 128 }),
  W('r52_scf', [[630, 350], [630, 390]], { from: 'r52', to: 'scf', busType: 'SCF', width: 64 }),
  W('safety_scf', [[820, 350], [820, 390]], { from: 'safety', to: 'scf', busType: 'SCF', width: 32 }),
  W('scf_ddr', [[170, 408], [170, 470]], { from: 'scf', to: 'ddr', busType: 'SCF', width: 256 }),
  W('scf_pcie', [[370, 408], [370, 470]], { from: 'scf', to: 'pcie', busType: 'AXI', width: 128 }),
  W('scf_nvlink', [[540, 408], [540, 470]], { from: 'scf', to: 'nvlink', busType: 'NVLink-C2C', width: 256 }),
  W('scf_eth', [[710, 408], [710, 470]], { from: 'scf', to: 'eth', busType: 'AXI', width: 64 }),
  W('scf_usb', [[860, 408], [860, 470]], { from: 'scf', to: 'usb', busType: 'AXI', width: 64 }),
  W('isp_mfc', [[275, 620], [290, 620]], { from: 'isp', to: 'mfc', busType: 'internal' }),
  W('mfc_display', [[445, 620], [460, 620]], { from: 'mfc', to: 'display', busType: 'internal' }),
];

export const NVIDIA_ORIN_DIAGRAM: ArchitectureDiagram = {
  id: 'orin_arch',
  companyId: 'nvidia',
  socId: 'nvidia',
  title: 'NVIDIA DRIVE Orin — block diagram',
  subtitle: 'Ampere GPU · dual NVDLA · PVA · Cortex-A78AE · System Coherent Fabric · LPDDR5',
  source: 'NVIDIA DRIVE Orin and Jetson AGX Orin public documentation',
  width: 900,
  height: 790,
  groups: GROUPS,
  blocks: [...COMPUTE, ...BUS, ...IO],
  wires: WIRES,
  notes: [
    'Public Orin material describes the Ampere GPU, NVDLA, PVA, A78AE CPUs and SCF.',
    'Exact widths, clocks and internal split of the fabric are architectural reference values.',
  ],
};
