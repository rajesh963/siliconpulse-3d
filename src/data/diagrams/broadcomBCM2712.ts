import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', gpu: '#f97316', bus: '#fbbf24', mem: '#3b82f6', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b', video: '#a78bfa' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [0, 1, 2, 3].map(i => B(
  `a76_${i}`, `Cortex-A76 (#${i})`, 60 + i * 160, 110, 140, 80, 'cpu',
  { sublabel: '2.4 GHz · 512 KB L2', color: C.cpu, badges: ['AXI'], specRef: 'BCM2712 §CPU', moduleId: 'bcm_cluster_cpu' }
));

const BUS: DiagramBlock[] = [
  B('l2', 'L3 / System Cache', 740, 110, 160, 80, 'memory', { sublabel: 'shared cache', color: C.mem }),
  B('axi', 'AMBA AXI / NOC   1 GHz', 40, 250, 860, 18, 'bus', { color: C.bus, specRef: 'BCM2712 §Fabric', details: 'Central AXI fabric connecting CPU, GPU, VideoCore, PCIe, USB, memory and HDMI.' }),
];

const ENGINES: DiagramBlock[] = [
  B('vc7', 'VideoCore VII', 60, 340, 220, 100, 'accelerator', { sublabel: 'OpenGL ES 3.1 · Vulkan 1.2', color: C.gpu, badges: ['AXI'], specRef: 'BCM2712 §GPU', moduleId: 'bcm_cluster_gpu' }),
  B('isp', 'ISP', 60, 460, 220, 44, 'io', { sublabel: 'camera pipeline', color: C.video }),
  B('hvs', 'HVS / Pixel Valve', 300, 340, 200, 100, 'io', { sublabel: 'display composition', color: C.video }),
  B('hdmi0', 'HDMI0 (4Kp60)', 300, 460, 200, 44, 'io', { sublabel: 'pixel output', color: C.video }),
  B('hdmi1', 'HDMI1 (4Kp60)', 520, 460, 200, 44, 'io', { sublabel: 'pixel output', color: C.video }),
  B('hevc', 'HEVC Decode', 520, 340, 200, 100, 'io', { sublabel: '4K decode', color: C.video }),
  B('codec', 'Audio / PWM / GPIO', 740, 340, 160, 100, 'io', { sublabel: 'low-speed IO', color: C.io }),
];

const IO: DiagramBlock[] = [
  B('ddr', 'LPDDR4X-4267 (2ch)', 60, 590, 220, 90, 'memory', { sublabel: 'DDR controller + PHY', color: C.mem, badges: ['AXI'], specRef: 'BCM2712 §DRAM' }),
  B('pcie', 'PCIe 2.0 x4', 300, 590, 160, 90, 'io', { sublabel: 'NVMe / endpoint', color: C.io, specRef: 'BCM2712 §PCIe', moduleId: 'bcm_cluster_pcie' }),
  B('usb', 'USB 3.0 x2 + USB 2.0', 480, 590, 180, 90, 'io', { sublabel: 'host controller', color: C.io }),
  B('sdio', 'SDIO / eMMC', 680, 590, 130, 90, 'io', { sublabel: 'storage', color: C.io }),
  B('eth', 'Ethernet MAC', 830, 590, 120, 90, 'io', { sublabel: 'GMII / RGMII', color: C.io }),
  B('crypto', 'Crypto / RNG', 60, 700, 220, 70, 'security', { sublabel: 'secure boot', color: C.sec }),
  B('timer', 'Timers / Watchdog / RTC', 300, 700, 180, 70, 'clock', { sublabel: 'system control', color: C.clock }),
  B('csi', 'CSI-2 (camera)', 500, 700, 160, 70, 'io', { sublabel: 'MIPI', color: C.video }),
  B('gpio', 'SPI / I2C / UART / PWM', 680, 700, 270, 70, 'io', { sublabel: 'low-speed peripherals', color: C.io }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'Cortex-A76 quad cluster', x: 45, y: 90, w: 640, h: 115, color: C.cpu },
  { id: 'bus', label: 'Central AXI fabric', x: 45, y: 230, w: 870, h: 55, color: C.bus },
  { id: 'gpu', label: 'VideoCore VII & video pipeline', x: 45, y: 320, w: 870, h: 200, color: C.gpu },
  { id: 'io', label: 'Memory, high-speed & peripheral IO', x: 45, y: 570, w: 920, h: 220, color: C.io },
];

const WIRES: DiagramWire[] = [
  ...CPU.map((block, i) => W(`${block.id}_l2`, [[130 + i * 160, 190], [130 + i * 160, 220], [820, 220], [820, 190]], { from: block.id, to: 'l2', busType: 'AXI', width: 64 })),
  W('l2_axi', [[820, 190], [820, 250]], { from: 'l2', to: 'axi', busType: 'AXI', width: 128 }),
  W('axi_vc7', [[350, 268], [170, 340]], { from: 'axi', to: 'vc7', busType: 'AXI', width: 128 }),
  W('axi_hvs', [[400, 268], [400, 340]], { from: 'axi', to: 'hvs', busType: 'AXI', width: 64 }),
  W('axi_hevc', [[500, 268], [620, 340]], { from: 'axi', to: 'hevc', busType: 'AXI', width: 64 }),
  W('axi_ddr', [[180, 268], [170, 590]], { from: 'axi', to: 'ddr', busType: 'AXI', width: 128 }),
  W('axi_pcie', [[330, 268], [380, 590]], { from: 'axi', to: 'pcie', busType: 'AXI', width: 128 }),
  W('axi_usb', [[480, 268], [570, 590]], { from: 'axi', to: 'usb', busType: 'AXI', width: 64 }),
  W('axi_sdio', [[600, 268], [745, 590]], { from: 'axi', to: 'sdio', busType: 'AXI', width: 64 }),
  W('axi_eth', [[650, 268], [890, 590]], { from: 'axi', to: 'eth', busType: 'AXI', width: 64 }),
  W('vc7_isp', [[170, 440], [170, 460]], { from: 'vc7', to: 'isp', busType: 'internal' }),
  W('hvs_hdmi0', [[400, 440], [400, 460]], { from: 'hvs', to: 'hdmi0', busType: 'pixel' }),
  W('hevc_hdmi1', [[620, 440], [620, 460]], { from: 'hevc', to: 'hdmi1', busType: 'pixel' }),
];

export const BROADCOM_BCM2712_DIAGRAM: ArchitectureDiagram = {
  id: 'bcm2712_arch',
  companyId: 'broadcom',
  socId: 'broadcom',
  title: 'Broadcom BCM2712 — block diagram',
  subtitle: '4x Cortex-A76 · VideoCore VII · AXI fabric · LPDDR4X · PCIe 2.0 x4 · dual HDMI',
  source: 'Raspberry Pi BCM2712 documentation and public datasheet summaries',
  width: 1000,
  height: 810,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...ENGINES, ...IO],
  wires: WIRES,
  notes: [
    'Public Raspberry Pi documentation describes the A76 cluster, VideoCore VII and PCIe 2.0 x4.',
    'Fabric width, clock and peripheral grouping are architectural reference values.',
  ],
};
