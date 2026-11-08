import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#76b900', npu: '#34d399', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', debug: '#c084fc' };

const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const BUS_Y = 300;
const BUS_H = 18;

const CPU_BLOCKS: DiagramBlock[] = [
  B('x4', 'Cortex-X4 (#0)', 60, 120, 150, 80, 'cpu', { sublabel: 'Armv9.2 · L2', color: C.cpu, badges: ['CHI'], specRef: 'TCS24 §X4' }),
  B('x4_1', 'Cortex-X4 (#1)', 230, 120, 150, 80, 'cpu', { sublabel: 'Armv9.2 · L2', color: C.cpu, badges: ['CHI'] }),
  B('a720_0', 'Cortex-A720 (#2-4)', 400, 120, 150, 80, 'cpu', { sublabel: 'Armv9.2', color: C.cpu, badges: ['CHI'] }),
  B('a520_0', 'Cortex-A520 (#5-8)', 570, 120, 150, 80, 'cpu', { sublabel: 'Armv9.2 · 4 cores', color: C.cpu, badges: ['CHI'] }),
  B('dsu', 'DSU-120', 740, 120, 140, 80, 'crossbar', { sublabel: 'DynamIQ L3', color: C.clock, specRef: 'TCS24 §DSU' }),
  B('cmn', 'CMN-700 Coherent Mesh', 900, 120, 230, 80, 'crossbar', { sublabel: 'CHI · GIC-700 · MMU-700', color: C.bus, specRef: 'TCS24 §CMN' }),
];

const ENGINE_BLOCKS: DiagramBlock[] = [
  B('mali', 'Mali-G720', 60, 400, 190, 90, 'accelerator', { sublabel: '5th-gen GPU · ray tracing', color: C.gpu, badges: ['CHI'], specRef: 'TCS24 §G720' }),
  B('gpu_mmu', 'GPU MMU-700', 60, 510, 190, 44, 'io', { sublabel: 'SMMU', color: C.gpu }),
  B('ethos', 'Ethos-U85', 270, 400, 170, 90, 'accelerator', { sublabel: 'MicroNPU · INT8/16', color: C.npu, badges: ['AXI'], specRef: 'TCS24 §U85' }),
  B('npu_sram', 'NPU SRAM', 270, 510, 170, 44, 'memory', { sublabel: 'local scratchpad', color: C.mem }),
  B('dpu', 'DPU / Display', 460, 400, 150, 90, 'io', { sublabel: 'DP650 · 4K', color: C.io }),
  B('isp', 'ISP', 460, 510, 150, 44, 'io', { sublabel: 'camera pipeline', color: C.io }),
  B('vpu', 'VPU / MFC', 630, 400, 150, 90, 'io', { sublabel: 'video codec', color: C.io }),
  B('audio', 'Audio DSP', 630, 510, 150, 44, 'io', { sublabel: 'audio', color: C.io }),
  B('sec', 'Security Enclave', 800, 400, 150, 90, 'security', { sublabel: 'CryptoCell · TRNG', color: C.sec }),
  B('smmu', 'SMMU-700', 800, 510, 150, 44, 'io', { sublabel: 'system MMU', color: C.sec }),
  B('gic', 'GIC-700', 970, 400, 170, 90, 'peripheral', { sublabel: 'interrupt controller', color: C.clock }),
  B('onchip', 'On-chip SRAM', 970, 510, 170, 44, 'memory', { sublabel: 'SLC / SRAM', color: C.mem }),
];

const IO_BLOCKS: DiagramBlock[] = [
  B('ddr', 'LPDDR5X / DDR PHY', 60, 640, 210, 90, 'memory', { sublabel: 'DMC-700 + PHY', color: C.mem, badges: ['CHI'], specRef: 'TCS24 §DMC' }),
  B('pcie', 'PCIe Gen4', 290, 640, 150, 90, 'io', { sublabel: 'x2/x4 root complex', color: C.io }),
  B('usb', 'USB 3.x', 460, 640, 120, 90, 'io', { sublabel: 'USB 3.2', color: C.io }),
  B('eth', 'Ethernet 10G', 600, 640, 140, 90, 'io', { sublabel: 'TSN MAC', color: C.io }),
  B('aes', 'AES / Crypto', 760, 640, 140, 90, 'security', { sublabel: 'inline crypto', color: C.sec }),
  B('ts', 'Temp / PVT', 920, 640, 110, 90, 'clock', { sublabel: 'sensors', color: C.clock }),
  B('debug', 'Debug & Trace', 1050, 640, 140, 90, 'debug', { sublabel: 'ETM · CoreSight', color: C.debug }),
];

const BUS_BLOCKS: DiagramBlock[] = [
  B('chi_noc', 'Coherent NoC — CMN-700 (CHI 4)   3 GHz', 40, BUS_Y, 1150, BUS_H, 'bus', { color: C.bus, moduleId: 'arm_cluster_noc', specRef: 'TCS24 §CMN', details: 'Coherent mesh that joins CPU clusters, GPU, NPU, DMC and IO.' }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'CPU complex — DynamIQ', x: 45, y: 100, w: 850, h: 120, color: C.cpu },
  { id: 'nochub', label: 'Coherent mesh', x: 895, y: 100, w: 245, h: 120, color: C.bus },
  { id: 'engines', label: 'Accelerators & multimedia', x: 45, y: 380, w: 1110, h: 190, color: C.gpu },
  { id: 'io', label: 'Memory / IO / security / debug', x: 45, y: 620, w: 1155, h: 130, color: C.io },
];

const WIRES: DiagramWire[] = [
  ...['x4', 'x4_1', 'a720_0', 'a520_0'].map(id => W(`${id}_dsu`, [[135 + (['x4', 'x4_1', 'a720_0', 'a520_0'].indexOf(id)) * 170, 200], [135 + (['x4', 'x4_1', 'a720_0', 'a520_0'].indexOf(id)) * 170, 240], [810, 240]], { from: id, to: 'dsu', busType: 'AXI / DSU', width: 128 })),
  W('dsu_cmn', [[810, 200], [810, 260], [1015, 260], [1015, 200]], { from: 'dsu', to: 'cmn', busType: 'CHI', width: 256 }),
  W('cmn_noc', [[1015, 200], [1015, BUS_Y]], { from: 'cmn', to: 'chi_noc', busType: 'CHI 4', width: 256 }),
  W('noc_mali', [[300, BUS_Y + BUS_H], [155, 400]], { from: 'chi_noc', to: 'mali', busType: 'CHI', width: 128 }),
  W('noc_ethos', [[450, BUS_Y + BUS_H], [355, 400]], { from: 'chi_noc', to: 'ethos', busType: 'AXI4', width: 128 }),
  W('noc_dpu', [[560, BUS_Y + BUS_H], [535, 400]], { from: 'chi_noc', to: 'dpu', busType: 'AXI4', width: 64 }),
  W('noc_vpu', [[650, BUS_Y + BUS_H], [705, 400]], { from: 'chi_noc', to: 'vpu', busType: 'AXI4', width: 64 }),
  W('noc_sec', [[760, BUS_Y + BUS_H], [875, 400]], { from: 'chi_noc', to: 'sec', busType: 'AXI4', width: 64 }),
  W('noc_gic', [[860, BUS_Y + BUS_H], [1055, 400]], { from: 'chi_noc', to: 'gic', busType: 'AXI4', width: 32 }),
  W('noc_ddr', [[200, BUS_Y + BUS_H], [165, 640]], { from: 'chi_noc', to: 'ddr', busType: 'CHI', width: 256 }),
  W('noc_pcie', [[400, BUS_Y + BUS_H], [365, 640]], { from: 'chi_noc', to: 'pcie', busType: 'AXI4', width: 128 }),
  W('noc_usb', [[520, BUS_Y + BUS_H], [520, 640]], { from: 'chi_noc', to: 'usb', busType: 'AXI4', width: 64 }),
  W('noc_eth', [[680, BUS_Y + BUS_H], [670, 640]], { from: 'chi_noc', to: 'eth', busType: 'AXI4', width: 64 }),
  W('noc_aes', [[780, BUS_Y + BUS_H], [830, 640]], { from: 'chi_noc', to: 'aes', busType: 'AXI4', width: 64 }),
  W('noc_dbg', [[900, BUS_Y + BUS_H], [1120, 640]], { from: 'chi_noc', to: 'debug', busType: 'AXI4', width: 32 }),
  W('mali_mmu', [[155, 490], [155, 510]], { from: 'mali', to: 'gpu_mmu', busType: 'SMMU' }),
  W('ethos_sram', [[355, 490], [355, 510]], { from: 'ethos', to: 'npu_sram', busType: 'AXI4' }),
  W('isp_node', [[535, 510], [535, 490]], { from: 'isp', to: 'dpu', busType: 'AXI4' }),
];

export const ARM_TCS24_DIAGRAM: ArchitectureDiagram = {
  id: 'arm_tcs24_arch',
  companyId: 'arm',
  socId: 'arm',
  title: 'Arm Total Compute 2024 — reference platform block diagram',
  subtitle: 'Cortex-X4/A720/A520 · DSU · CMN-700 · Mali-G720 · Ethos-U85 · DMC-700',
  source: 'Arm Total Compute Solutions 2024 public material (CSS reference; not a shipped die)',
  width: 1240,
  height: 790,
  groups: GROUPS,
  blocks: [...CPU_BLOCKS, ...BUS_BLOCKS, ...ENGINE_BLOCKS, ...IO_BLOCKS],
  wires: WIRES,
  notes: [
    'Arm TCS24 is a licensable reference solution, not a fabricated SoC.',
    'CMN-700 is the coherent central fabric; CPU, GPU, NPU and DMC all attach with CHI/AXI.',
    'Block names and interface classes are public; exact widths and frequencies are illustrative reference values.',
  ],
};
