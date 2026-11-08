import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', vbus: '#a78bfa', bridge: '#fb923c', mem: '#3b82f6', pwm: '#34d399', adc: '#eab308', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('c29x', 'C29x CPU', 60, 100, 200, 90, 'cpu', { sublabel: 'real-time control core', color: C.cpu, badges: ['C29x'], specRef: 'C29x §CPU', moduleId: 'c29x_cluster_cpu' }),
  B('vpu', 'VPU', 60, 210, 200, 44, 'accelerator', { sublabel: 'vector processing unit', color: C.pwm }),
  B('tmu', 'TMU', 60, 264, 96, 44, 'accelerator', { sublabel: 'trig math', color: C.pwm }),
  B('fpu', 'FPU', 164, 264, 96, 44, 'accelerator', { sublabel: 'floating point', color: C.pwm }),
  B('dma', 'DMA', 280, 100, 140, 90, 'accelerator', { sublabel: 'transfer controller', color: C.pwm }),
  B('flash', 'Flash + ECC', 440, 100, 150, 90, 'memory', { sublabel: 'code / constants', color: C.mem }),
  B('sram', 'SRAM + ECC', 600, 100, 140, 90, 'memory', { sublabel: 'data / stack', color: C.mem }),
  B('rom', 'Boot ROM', 750, 100, 130, 90, 'memory', { sublabel: 'startup', color: C.mem }),
];

const BUS: DiagramBlock[] = [
  B('vbusm', 'VBUSM master port   200 MHz', 40, 350, 520, 18, 'bus', { color: C.vbus, specRef: 'C29x §VBUS', details: 'High-bandwidth VBUS master port from the C29x CPU and DMA.', moduleId: 'c29x_cluster_vbus' }),
  B('vbusp', 'VBUSP peripheral port   100 MHz', 40, 520, 520, 18, 'bus', { color: C.vbus, specRef: 'C29x §VBUS', details: 'VBUS peripheral port for ETG, ADC and IO registers.' }),
  B('axi0', 'AXI-APB Bridge 0   200 MHz', 620, 350, 260, 18, 'bus', { color: C.bridge, specRef: 'C29x §VBUS', details: 'Bridge instance 0: VBUSM/AXI master to APB peripherals (ETG/ePWM).' }),
  B('axi1', 'AXI-APB Bridge 1   200 MHz', 620, 430, 260, 18, 'bus', { color: C.bridge, specRef: 'C29x §VBUS', details: 'Bridge instance 1: VBUSM/AXI master to APB peripherals (ADC/connectivity).' }),
];

const BRIDGES: DiagramBlock[] = [
  B('br0', 'AXI2APB0', 700, 380, 100, 54, 'bridge', { sublabel: 'bridge instance', color: C.bridge, specRef: 'C29x §VBUS', moduleId: 'c29x_cluster_vbus__axi_to_apb_0' }),
  B('br1', 'AXI2APB1', 700, 460, 100, 54, 'bridge', { sublabel: 'bridge instance', color: C.bridge, specRef: 'C29x §VBUS', moduleId: 'c29x_cluster_vbus__axi_to_apb_1' }),
  B('brp', 'VBUSP', 260, 545, 100, 54, 'bridge', { sublabel: 'peripheral decode', color: C.vbus, moduleId: 'c29x_cluster_vbus__vbusp_peripheral' }),
];

const PERIPH: DiagramBlock[] = [
  B('etg', 'ETG', 60, 640, 150, 80, 'peripheral', { sublabel: 'timer global', color: C.pwm, specRef: 'C29x §ETG', moduleId: 'c29x_cluster_etg' }),
  B('epwm', 'ePWM x8', 220, 640, 150, 80, 'peripheral', { sublabel: 'HRPWM', color: C.pwm }),
  B('clb', 'CLB', 380, 640, 130, 80, 'peripheral', { sublabel: 'configurable logic', color: C.pwm }),
  B('adc_a', 'ADC-A', 620, 640, 110, 80, 'peripheral', { sublabel: '16-bit SAR', color: C.adc, moduleId: 'c29x_cluster_adc' }),
  B('adc_b', 'ADC-B', 740, 640, 110, 80, 'peripheral', { sublabel: '16-bit SAR', color: C.adc }),
  B('adc_c', 'ADC-C', 860, 640, 110, 80, 'peripheral', { sublabel: '16-bit SAR', color: C.adc }),
  B('canfd', 'CAN-FD', 60, 740, 170, 70, 'io', { sublabel: 'automotive bus', color: C.io }),
  B('eth', 'Ethernet', 240, 740, 160, 70, 'io', { sublabel: 'MAC', color: C.io }),
  B('usb', 'USB', 410, 740, 130, 70, 'io', { sublabel: 'device/host', color: C.io }),
  B('spi', 'SPI / UART / I2C', 550, 740, 200, 70, 'io', { sublabel: 'serial peripherals', color: C.io }),
  B('lockstep', 'Lockstep', 780, 740, 130, 70, 'security', { sublabel: 'CPU diagnostic', color: C.sec, moduleId: 'c29x_cluster_safety' }),
  B('wdt', 'Watchdog / ERAD', 920, 740, 130, 70, 'security', { sublabel: 'safety', color: C.sec }),
  B('clock', 'Clock / PMU', 920, 640, 130, 80, 'clock', { sublabel: 'PLL · thermal', color: C.clock, moduleId: 'c29x_cluster_pmu' }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'C29x CPU complex', x: 45, y: 85, w: 850, h: 235, color: C.cpu },
  { id: 'vbus', label: 'VBUSM / VBUSP fabric', x: 45, y: 335, w: 850, h: 225, color: C.vbus },
  { id: 'bridge', label: 'AXI-APB bridge instances', x: 605, y: 335, w: 290, h: 190, color: C.bridge },
  { id: 'periph', label: 'Peripheral APB domains', x: 45, y: 625, w: 1020, h: 200, color: C.pwm },
];

const WIRES: DiagramWire[] = [
  W('cpu_vbusm', [[160, 310], [160, 350]], { from: 'c29x', to: 'vbusm', busType: 'VBUSM', width: 64 }),
  W('dma_vbusm', [[350, 190], [350, 350]], { from: 'dma', to: 'vbusm', busType: 'VBUSM', width: 64 }),
  W('flash_vbusm', [[515, 190], [515, 350]], { from: 'flash', to: 'vbusm', busType: 'VBUSM', width: 64 }),
  W('sram_vbusm', [[670, 190], [670, 350]], { from: 'sram', to: 'vbusm', busType: 'VBUSM', width: 64 }),
  W('rom_vbusm', [[815, 190], [815, 350]], { from: 'rom', to: 'vbusm', busType: 'VBUSM', width: 64 }),
  W('vbusm_br0', [[560, 359], [750, 359], [750, 380]], { from: 'vbusm', to: 'br0', busType: 'AXI4', width: 64 }),
  W('vbusm_br1', [[560, 359], [750, 359], [750, 460]], { from: 'vbusm', to: 'br1', busType: 'AXI4', width: 64 }),
  W('br0_etg', [[700, 407], [310, 407], [310, 520], [310, 545]], { from: 'br0', to: 'brp', busType: 'APB', width: 32 }),
  W('brp_etg', [[310, 599], [310, 640]], { from: 'brp', to: 'etg', busType: 'APB', width: 32 }),
  W('etg_epwm', [[210, 680], [220, 680]], { from: 'etg', to: 'epwm', busType: 'internal' }),
  W('epwm_clb', [[370, 680], [380, 680]], { from: 'epwm', to: 'clb', busType: 'internal' }),
  W('br1_adc', [[800, 514], [800, 620], [800, 640]], { from: 'br1', to: 'adc_b', busType: 'APB', width: 32 }),
  W('adc_c', [[800, 640], [915, 640]], { from: 'adc_b', to: 'adc_c', busType: 'internal' }),
  W('adc_a', [[800, 640], [675, 640]], { from: 'adc_b', to: 'adc_a', busType: 'internal' }),
  W('clock_br0', [[985, 640], [985, 407], [900, 407], [800, 407]], { from: 'clock', to: 'br0', busType: 'clock' }),
];

export const TI_C29X_DIAGRAM: ArchitectureDiagram = {
  id: 'ti_c29x_arch',
  companyId: 'ti_c29x',
  socId: 'ti_c29x',
  title: 'TI C29x (F29H85x) — block diagram',
  subtitle: 'C29x + VPU/TMU · VBUSM/VBUSP fabric · AXI-APB bridge instances · ETG/ePWM/CLB · quad ADC',
  source: 'TI C29x public architecture summary and C2000 family documentation',
  width: 1100,
  height: 850,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...BRIDGES, ...PERIPH],
  wires: WIRES,
  notes: [
    'VBUSM/VBUSP and AXI-APB bridge instances are modeled explicitly, per the architecture request.',
    'Public block names are used; register maps and exact widths are not asserted.',
  ],
};
