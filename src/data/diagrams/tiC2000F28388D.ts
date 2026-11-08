import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { cpu: '#22d3ee', dma: '#a78bfa', bus: '#fbbf24', mem: '#3b82f6', pwm: '#34d399', adc: '#eab308', io: '#f472b6', sec: '#fb7185', clock: '#f59e0b' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const CPU: DiagramBlock[] = [
  B('c28x_a', 'C28x CPU (CPU1)', 60, 100, 210, 90, 'cpu', { sublabel: '200 MHz DSP', color: C.cpu, badges: ['MCA'], specRef: 'SPRUHM8 §C28x', moduleId: 'ti_subsys_c28x' }),
  B('c28x_b', 'C28x CPU (CPU2)', 290, 100, 210, 90, 'cpu', { sublabel: '200 MHz DSP', color: C.cpu, badges: ['MCA'] }),
  B('cla_a', 'CLA (CPU1)', 60, 210, 210, 44, 'accelerator', { sublabel: 'control law accel', color: C.pwm, moduleId: 'ti_ip_cla_accelerators' }),
  B('cla_b', 'CLA (CPU2)', 290, 210, 210, 44, 'accelerator', { sublabel: 'control law accel', color: C.pwm }),
  B('cm4', 'Cortex-M4F', 520, 100, 170, 90, 'cpu', { sublabel: 'connectivity manager', color: C.cpu }),
  B('dma', 'DMA + CLA DMA', 710, 100, 170, 90, 'accelerator', { sublabel: 'transfer controllers', color: C.dma }),
  B('flash', 'Flash + ECC', 900, 100, 150, 90, 'memory', { sublabel: '1 MB', color: C.mem }),
  B('sram', 'SRAM / LS RAM', 520, 210, 170, 44, 'memory', { sublabel: 'data banks', color: C.mem }),
  B('rom', 'Boot ROM', 710, 210, 170, 44, 'memory', { sublabel: 'startup', color: C.mem }),
];

const BUS: DiagramBlock[] = [
  B('mca', 'Multi-controller bus (MCA) / AXI   200 MHz', 40, 300, 1010, 18, 'bus', { color: C.bus, specRef: 'SPRUHM8 §Bus', details: 'Central 6-master/10-slave interconnect linking CPUs, DMA, memory and peripherals.' }),
  B('apb', 'APB peripherals   100 MHz', 40, 600, 1010, 18, 'bus', { color: C.io, details: 'Peripheral register bus behind the AXI/APB bridge.' }),
];

const BRIDGES: DiagramBlock[] = [
  B('bridge', 'AXI→APB Bridge', 470, 480, 160, 60, 'bridge', { sublabel: 'peripheral bridge', color: '#fb923c', specRef: 'SPRUHM8 §Bus' }),
];

const PERIPH: DiagramBlock[] = [
  B('epwm', 'ePWM x8', 60, 660, 160, 80, 'peripheral', { sublabel: 'HRPWM · 150 ps', color: C.pwm, specRef: 'SPRUHM8 §ePWM', moduleId: 'ti_subsys_epwm' }),
  B('ecap', 'eCAP / eQEP', 240, 660, 160, 80, 'peripheral', { sublabel: 'capture · encoder', color: C.pwm }),
  B('adc', 'ADC x4', 420, 660, 150, 80, 'peripheral', { sublabel: '16-bit 3.5 MSPS', color: C.adc, specRef: 'SPRUHM8 §ADC', moduleId: 'ti_macro_analog' }),
  B('cmpss', 'CMPSS / DAC', 590, 660, 150, 80, 'peripheral', { sublabel: 'comparators', color: C.adc }),
  B('cmcan', 'CAN-FD', 60, 760, 160, 70, 'io', { sublabel: 'automotive', color: C.io }),
  B('fsi', 'FSI', 240, 760, 160, 70, 'io', { sublabel: 'isolated link', color: C.io }),
  B('eth', 'Ethernet (M4)', 420, 760, 150, 70, 'io', { sublabel: 'via CM core', color: C.io }),
  B('serial', 'SPI / SCI / I2C / PMBus', 590, 760, 200, 70, 'io', { sublabel: 'serial', color: C.io }),
  B('safety', 'Lockstep / ECC / WDT', 810, 660, 220, 80, 'security', { sublabel: 'safety diagnostics', color: C.sec }),
  B('clock', 'Clock / PMU', 810, 760, 220, 70, 'clock', { sublabel: 'PLL · thermal', color: C.clock }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'Dual C28x + CLA + Cortex-M4', x: 45, y: 85, w: 1020, h: 180, color: C.cpu },
  { id: 'bus', label: 'Central interconnect', x: 45, y: 280, w: 1020, h: 120, color: C.bus },
  { id: 'periph', label: 'Control & analog peripherals', x: 45, y: 645, w: 1020, h: 200, color: C.pwm },
];

const WIRES: DiagramWire[] = [
  W('a_mca', [[165, 190], [165, 300]], { from: 'c28x_a', to: 'mca', busType: 'MCA', width: 32 }),
  W('b_mca', [[395, 190], [395, 300]], { from: 'c28x_b', to: 'mca', busType: 'MCA', width: 32 }),
  W('cm4_mca', [[605, 190], [605, 300]], { from: 'cm4', to: 'mca', busType: 'AXI', width: 32 }),
  W('dma_mca', [[795, 190], [795, 300]], { from: 'dma', to: 'mca', busType: 'MCA', width: 32 }),
  W('flash_mca', [[975, 190], [975, 300]], { from: 'flash', to: 'mca', busType: 'MCA', width: 32 }),
  W('cla_a_sram', [[165, 254], [165, 268], [605, 268], [605, 210]], { from: 'cla_a', to: 'sram', busType: 'internal' }),
  W('mca_bridge', [[550, 318], [550, 480]], { from: 'mca', to: 'bridge', busType: 'AXI', width: 32 }),
  W('bridge_apb', [[550, 540], [550, 600]], { from: 'bridge', to: 'apb', busType: 'APB', width: 32 }),
  W('apb_epwm', [[140, 618], [140, 660]], { from: 'apb', to: 'epwm', busType: 'APB', width: 32 }),
  W('apb_ecap', [[320, 618], [320, 660]], { from: 'apb', to: 'ecap', busType: 'APB', width: 32 }),
  W('apb_adc', [[495, 618], [495, 660]], { from: 'apb', to: 'adc', busType: 'APB', width: 32 }),
  W('apb_cmpss', [[665, 618], [665, 660]], { from: 'apb', to: 'cmpss', busType: 'APB', width: 32 }),
  W('apb_can', [[140, 618], [140, 760]], { from: 'apb', to: 'cmcan', busType: 'APB', width: 32 }),
  W('apb_fsi', [[320, 618], [320, 760]], { from: 'apb', to: 'fsi', busType: 'APB', width: 32 }),
  W('apb_eth', [[495, 618], [495, 760]], { from: 'apb', to: 'eth', busType: 'APB', width: 32 }),
  W('apb_serial', [[690, 618], [690, 760]], { from: 'apb', to: 'serial', busType: 'APB', width: 32 }),
];

export const TI_C2000_F28388D_DIAGRAM: ArchitectureDiagram = {
  id: 'ti_c2000_arch',
  companyId: 'ti',
  socId: 'ti',
  title: 'TI TMS320F28388D (C2000) — block diagram',
  subtitle: 'Dual C28x + CLA · Cortex-M4F · MCA interconnect · ePWM/eCAP · quad ADC · CAN-FD',
  source: 'TI TMS320F28388D datasheet and TRM (SPRUHM8 / SPRUI33)',
  width: 1090,
  height: 870,
  groups: GROUPS,
  blocks: [...CPU, ...BUS, ...BRIDGES, ...PERIPH],
  wires: WIRES,
  notes: [
    'The C2000 has a dual-CPU + CLA + Cortex-M4 architecture with a central MCA bus.',
    'Exact bus widths and peripheral instances are architectural reference values.',
  ],
};
