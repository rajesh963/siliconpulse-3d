import { PRDFeature, ArchitectureSpecMetric } from '../types/prd';

export const CHIP_SPEC_METRICS: ArchitectureSpecMetric[] = [
  { name: 'C28x CPU Clock', target: '200.0', current: '200.0', unit: 'MHz', status: 'Met', domain: 'Compute' },
  { name: 'Quad SAR ADC Rate', target: '3.50', current: '3.50', unit: 'MSPS', status: 'Met', domain: 'Analog' },
  { name: 'HRPWM MEP Resolution', target: '150', current: '142', unit: 'ps', status: 'Met', domain: 'Control' },
  { name: 'CAN-FD Bus Rate', target: '5.0', current: '5.0', unit: 'Mbps', status: 'Met', domain: 'Comm' },
  { name: 'Max Silicon Power', target: '1.40', current: '1.25', unit: 'Watts', status: 'Met', domain: 'Power' },
  { name: 'CDC Blocker Violations', target: '0', current: '2', unit: 'Fails', status: 'At Risk', domain: 'Sign-off' },
];

export const MOCK_PRD_FEATURES: PRDFeature[] = [
  {
    id: 'PRD-TI-001',
    title: 'Dual 200MHz 32-bit C28x DSP Floating-Point Cores + TMU0 & VCU-II',
    category: 'Compute',
    priority: 'P0 - Must Have',
    status: 'CDC Verification',
    targetMaturity: 'v0.9',
    specTarget: '200MHz @ 1.2V core, 400 MFLOPS per core, 5-cycle sin/cos in hardware',
    linkedModuleId: 'subsys_c28x_compute',
    linkedConnectionIds: ['conn_c28x_axi_matrix', 'conn_adc_eoc_irq'],
    owner: 'Sarah Patel (MCU Architecture)',
    cdcVerified: false,
    dvCoveragePercent: 98.2,
    description: 'High-performance real-time 32-bit DSP cores with double-precision IEEE-754 FPU and dedicated hardware Trigonometric Math Unit (TMU).'
  },
  {
    id: 'PRD-TI-002',
    title: '8-Channel High-Resolution ePWM with 150ps MEP & Sub-25ns Trip-Zone',
    category: 'Power/Clock',
    priority: 'P0 - Must Have',
    status: 'CDC Verification',
    targetMaturity: 'v0.8',
    specTarget: '150ps micro-edge positioning, dead-band generator, dual-edge trip-zone',
    linkedModuleId: 'subsys_epwm_control',
    linkedConnectionIds: ['conn_matrix_to_epwm', 'conn_cmpss_epwm_trip'],
    owner: 'Alex Chen (Motor Control RTL)',
    cdcVerified: false,
    dvCoveragePercent: 99.1,
    description: 'Industry-standard TI ePWM modules for motor drives and solar inverters with hardware trip-zone protection.'
  },
  {
    id: 'PRD-TI-003',
    title: 'Multi-Layer AXI/AHB Master Crossbar Switch & Synchronous APB Bridges',
    category: 'Interconnect',
    priority: 'P0 - Must Have',
    status: 'Signed Off',
    targetMaturity: 'v1.0',
    specTarget: '6-Master / 10-Slave parallel crossbar with zero wait-state arbitration',
    linkedModuleId: 'bridge_axi_ahb_matrix',
    linkedConnectionIds: ['conn_c28x_axi_matrix', 'conn_ahb_to_apb_comm'],
    owner: 'David Zhang (Interconnect Arch)',
    cdcVerified: true,
    dvCoveragePercent: 99.5,
    description: 'High-bandwidth crossbar matrix bridging C28x CPUs, DMA, and CLA to memory and peripheral sub-busses.'
  },
  {
    id: 'PRD-TI-004',
    title: 'Four Independent 16-bit 3.5 MSPS SAR ADCs with 7x Windowed CMPSS Comparators',
    category: 'High-Speed I/O',
    priority: 'P0 - Must Have',
    status: 'CDC Verification',
    targetMaturity: 'v0.8',
    specTarget: '3.5 MSPS 16-bit differential conversion, ENOB >= 12.8, sub-25ns analog trip',
    linkedModuleId: 'macro_analog_subsys',
    linkedConnectionIds: ['conn_adc_eoc_irq', 'conn_cmpss_epwm_trip'],
    owner: 'Sarah Patel (Analog/MCU Lead)',
    cdcVerified: false,
    dvCoveragePercent: 99.8,
    description: 'High-speed analog front-end for simultaneous sampling of three-phase motor currents and DC bus voltage.'
  },
  {
    id: 'PRD-TI-005',
    title: 'Bosch M_CAN CAN-FD Controller with Dual-Clock Asynchronous FIFO Bridge',
    category: 'High-Speed I/O',
    priority: 'P1 - High',
    status: 'Signed Off',
    targetMaturity: 'v0.9',
    specTarget: 'ISO 11898-1:2015 compliant up to 5.0 Mbps with 2KB message RAM',
    linkedModuleId: 'subsys_comm_periph',
    linkedConnectionIds: ['conn_canfd_cross'],
    owner: 'Diana Vance (DV Signoff)',
    cdcVerified: true,
    dvCoveragePercent: 99.4,
    description: 'Automotive powertrain CAN-FD interface operating on 60MHz AUXCLK with proven asynchronous FIFO clock crossing to 200MHz SYSCLK.'
  },
  {
    id: 'PRD-TI-006',
    title: 'Dual-Zone Code Security Module (DCSM) & 1MB Flash with Inline 64b ECC',
    category: 'Security',
    priority: 'P1 - High',
    status: 'Signed Off',
    targetMaturity: 'v1.0',
    specTarget: 'Zero leakage, SECDED inline ECC, 128-bit password authentication',
    linkedModuleId: 'subsys_flash_saram',
    linkedConnectionIds: ['conn_dcsm_security_lock'],
    owner: 'Priya Sharma (Security Arch)',
    cdcVerified: true,
    dvCoveragePercent: 100.0,
    description: 'Secure memory partitioning allowing third-party algorithms to run in locked zones without reverse-engineering risk.'
  }
];
