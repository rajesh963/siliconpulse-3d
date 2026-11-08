import { ModuleNode, InterconnectConnection, ClockDomainInfo, ResetDomainInfo, MemoryMapRange, PowerDomainInfo } from '../types/soc';
import { INF_CLOCKS, INF_CONNECTIONS, INF_HIERARCHY, INF_MEMORY_MAP, INF_POWER, INF_RESETS } from './infineonAurix';
import { AMD_SOC, APPLE_SOC, ARM_SOC, BROADCOM_SOC, MEDIATEK_SOC, SAMSUNG_SOC, TI_C29X_SOC } from './extendedCompanies';
export type { MemoryMapRange };

export interface CompanySoCEntry {
  id: 'ti' | 'nvidia' | 'infineon' | 'cerebras' | 'qualcomm' | 'arm' | 'broadcom' | 'samsung' | 'apple' | 'mediatek' | 'ti_c29x' | 'amd' | 'custom';
  companyName: string;
  chipModel: string;
  trmDocumentId: string;
  tagline: string;
  processNode: string;
  primaryApp: string;
  brandColor: string;
  badgeSymbol: string;
  memoryMap: MemoryMapRange[];
  hierarchy: ModuleNode;
  connections: InterconnectConnection[];
  clockDomains: ClockDomainInfo[];
  resetDomains: ResetDomainInfo[];
  powerDomains?: PowerDomainInfo[];
}

// ============================================================================
// 1. TEXAS INSTRUMENTS - C2000 TMS320F28388D / F28379D TRM SPRUHM8 / SPRUI33
// ============================================================================
const TI_CLOCKS: ClockDomainInfo[] = [
  { name: 'SYSCLK_200M', freqMhz: 200, color: '#00f2fe', description: 'Dual C28x DSP Cores, Dual CLA, AXI/AHB Crossbar Matrix' },
  { name: 'EPWMCLK_100M', freqMhz: 100, color: '#10b981', description: 'Motor Control Clock for 8x ePWM Modules & MEP Delay Lines' },
  { name: 'LSPCLK_50M', freqMhz: 50, color: '#ec4899', description: 'Low-Speed Peripheral Clock (SYSCLK/4) for SCI/UART, SPI, I2C' },
  { name: 'ADCCLK_50M', freqMhz: 50, color: '#eab308', description: 'Analog Subsystem Clock for Quad 16-bit 3.5MSPS SAR ADCs' },
  { name: 'AUXCLK_60M', freqMhz: 60, color: '#8b5cf6', description: 'Auxiliary Clock from Aux PLL for Bosch M_CAN CAN-FD & USB 2.0' },
  { name: 'INTOSC_10M', freqMhz: 10, color: '#f59e0b', description: 'Internal Zero-Pin 10MHz Oscillator (Watchdog & Safe Boot)' },
];

const TI_RESETS: ResetDomainInfo[] = [
  { name: 'rst_sys_n', type: 'async_assert_sync_deassert', color: '#38bdf8' },
  { name: 'rst_c28x_n', type: 'async_assert_sync_deassert', color: '#818cf8' },
  { name: 'rst_analog_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
  { name: 'trip_async', type: 'async', color: '#ef4444' }
];

const TI_MEMORY_MAP: MemoryMapRange[] = [
  { region: 'M0/M1 Dedicated SARAM', startAddr: '0x0000_0000', endAddr: '0x0000_07FF', size: '2 KB', busMaster: 'C28x CPU1 / CPU2', description: 'Zero wait-state CPU stack and local variable storage' },
  { region: 'Peripheral Frame 1 (PBIST, WDT, PIE)', startAddr: '0x0000_0800', endAddr: '0x0000_0FFF', size: '2 KB', busMaster: 'AHB Master', description: 'System control registers and interrupt expansion table' },
  { region: 'Peripheral Frame 2 (ePWM, eCAP, eQEP)', startAddr: '0x0000_4000', endAddr: '0x0000_6FFF', size: '12 KB', busMaster: 'AHB-to-APB Control Bridge', description: 'Motor control pulse-width modulators and encoder decoders' },
  { region: 'Peripheral Frame 3 (SCI, SPI, I2C, CAN)', startAddr: '0x0000_7000', endAddr: '0x0000_8FFF', size: '8 KB', busMaster: 'AHB-to-APB Comm Bridge (LSPCLK)', description: 'Low-speed communication interface register maps' },
  { region: 'GS0-GS15 Global Shared SARAM', startAddr: '0x0000_C000', endAddr: '0x0001_BFFF', size: '64 KB', busMaster: 'C28x CPU1/2, CLA1/2, DMA', description: 'Multi-master shared data memory with hardware semaphore arbiters' },
  { region: 'Bank 0 / Bank 1 Embedded Flash (ECC)', startAddr: '0x0008_0000', endAddr: '0x0017_FFFF', size: '1 MB', busMaster: 'Flash Wrapper (SECDED)', description: 'Read-While-Write dual-bank program flash with 64-bit ECC' },
];

const TI_HIERARCHY: ModuleNode = {
  id: 'ti_soc_top',
  name: 'TI_C2000_TMS320F28388D',
  displayName: 'TI C2000 Real-Time MCU (TMS320F28388D TRM SPRUHM8)',
  type: 'subsystem',
  category: 'compute',
  description: 'Texas Instruments Dual-Core C28x 32-bit DSP (200MHz) + Dual CLA Coprocessors + ePWM + Quad 16-bit ADC',
  level: 0,
  parentId: null,
  position: [0, 0, 0],
  size: [48, 0.8, 38],
  color: '#0e162b',
  clockDomains: TI_CLOCKS.map(c => c.name),
  resetDomains: TI_RESETS.map(r => r.name),
  ports: [],
  children: [
    // 1. DUAL C28x + CLA COMPUTE SUBSYSTEM (Top-Left)
    {
      id: 'ti_subsys_c28x',
      name: 'Dual_C28x_CLA_Cluster',
      displayName: 'Dual C28x DSP Cores (200MHz) + Dual CLA Coprocessors',
      type: 'subsystem',
      category: 'compute',
      description: 'Dual 200MHz C28x DSPs with 64-bit FPU, TMU (Trigonometric Math Unit), VCU-II, and dual Control Law Accelerators',
      level: 1,
      parentId: 'ti_soc_top',
      position: [-15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#00f2fe',
      clockDomains: ['SYSCLK_200M'],
      resetDomains: ['rst_c28x_n', 'rst_sys_n'],
      ports: [
        { id: 'p_ti_c28x_axi_m', name: 'M_C28X_MEM_BUS[63:0]', direction: 'out', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_c28x_n', protocol: 'AXI4', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: 0.1 },
        { id: 'p_ti_pie_irq_in', name: 'PIE_VECT_IRQ[95:0]', direction: 'in', width: 96, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_c28x_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, 1], offset: -0.2 }
      ],
      children: [
        {
          id: 'ti_ip_c28x_core1',
          name: 'C28x_Core_1',
          displayName: 'TI C28x Core 1 (200MHz FPU64 + TMU0)',
          type: 'ip',
          category: 'compute',
          description: 'Primary real-time floating-point DSP engine with Trigonometric Math Unit (TMU0) & VCU-II',
          level: 2,
          parentId: 'ti_subsys_c28x',
          position: [-3, 0.5, -1.5],
          size: [4.6, 1.0, 3.8],
          color: '#38bdf8',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_c28x_n'],
          ports: []
        },
        {
          id: 'ti_ip_c28x_core2',
          name: 'C28x_Core_2',
          displayName: 'TI C28x Core 2 (200MHz FPU64 + TMU0)',
          type: 'ip',
          category: 'compute',
          description: 'Secondary independent 200MHz DSP core for dedicated control loops and diagnostics',
          level: 2,
          parentId: 'ti_subsys_c28x',
          position: [3, 0.5, -1.5],
          size: [4.6, 1.0, 3.8],
          color: '#38bdf8',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_c28x_n'],
          ports: []
        },
        {
          id: 'ti_ip_cla_accelerators',
          name: 'Dual_CLA_Coprocessors',
          displayName: 'Control Law Accelerators (CLA1 & CLA2)',
          type: 'ip',
          category: 'compute',
          description: 'Independent 32-bit floating-point math accelerators operating in parallel with CPUs with direct peripheral access',
          level: 2,
          parentId: 'ti_subsys_c28x',
          position: [0, 0.45, 2.5],
          size: [10.2, 0.9, 3.2],
          color: '#0284c7',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_c28x_n'],
          ports: []
        }
      ]
    },

    // 2. CENTRAL AXI/AHB BUS MATRIX & BRIDGES (Center Hub)
    {
      id: 'ti_bridge_matrix',
      name: 'AXI_AHB_Crossbar_Matrix',
      displayName: 'Multi-Layer Master/Slave Interconnect & Bridges',
      type: 'fabric',
      category: 'interconnect',
      description: 'TI 6-Master / 10-Slave multi-layer parallel interconnect matrix with synchronous APB bridges',
      level: 1,
      parentId: 'ti_soc_top',
      position: [0, 0.8, -1],
      size: [10, 1.8, 9],
      color: '#8b5cf6',
      clockDomains: ['SYSCLK_200M', 'LSPCLK_50M', 'AUXCLK_60M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_ti_matrix_c28x_s', name: 'S_C28X_AXI', direction: 'in', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'same_domain', normal: [-1, 0, 0], offset: -0.3 },
        { id: 'p_ti_matrix_epwm_m', name: 'M_APB_CTRL_BRIDGE', direction: 'out', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AHB', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: -0.2 },
        { id: 'p_ti_matrix_comm_m', name: 'M_APB_COMM_BRIDGE', direction: 'out', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AHB', cdcStatus: 'clean', normal: [0, 0, 1], offset: 0.2 }
      ],
      children: [
        {
          id: 'ti_ip_bridge_lspclk',
          name: 'AHB_to_APB_Bridge_LSPCLK',
          displayName: 'AHB-to-APB Bridge (LSPCLK 50MHz Domain)',
          type: 'bridge',
          category: 'interconnect',
          description: 'Protocol converter bridging 200MHz AHB to 50MHz APB (LSPCLK) with 1:4 synchronous divider handshake',
          level: 2,
          parentId: 'ti_bridge_matrix',
          position: [0, 0.4, 3.2],
          size: [3.4, 0.8, 2.2],
          color: '#ec4899',
          clockDomains: ['SYSCLK_200M', 'LSPCLK_50M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ti_ip_bridge_canfd',
          name: 'Async_FIFO_Bridge_CANFD',
          displayName: 'CAN-FD / AUXCLK Async CDC Bridge (200M <-> 60M)',
          type: 'bridge',
          category: 'interconnect',
          description: 'Dual-clock Gray-pointer FIFO bridging 200MHz System NoC with 60MHz CAN-FD message RAM',
          level: 2,
          parentId: 'ti_bridge_matrix',
          position: [3.2, 0.4, -1.2],
          size: [3.0, 0.8, 2.2],
          color: '#8b5cf6',
          clockDomains: ['SYSCLK_200M', 'AUXCLK_60M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        }
      ]
    },

    // 3. MOTOR CONTROL & HIGH-RESOLUTION ePWM SUBSYSTEM (Top-Right)
    {
      id: 'ti_subsys_epwm',
      name: 'ePWM_Motor_Control_Subsystem',
      displayName: 'High-Resolution ePWM1-ePWM8 & eQEP Fabric',
      type: 'subsystem',
      category: 'peripheral',
      description: 'TI 8-channel High-Resolution ePWM with 150ps MEP micro-edge positioning, eCAP, and eQEP encoders',
      level: 1,
      parentId: 'ti_soc_top',
      position: [15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#10b981',
      clockDomains: ['EPWMCLK_100M', 'SYSCLK_200M'],
      resetDomains: ['rst_sys_n', 'trip_async'],
      ports: [
        { id: 'p_ti_epwm_apb_s', name: 'S_APB_EPWM[31:0]', direction: 'in', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'APB', cdcStatus: 'same_domain', normal: [-1, 0, 0], offset: 0.1 },
        { id: 'p_ti_epwm_tz_in', name: 'TZ_TRIP_ASYNC[5:0]', direction: 'in', width: 6, clockDomain: 'ADCCLK_50M', resetDomain: 'trip_async', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, 1], offset: -0.3 }
      ]
    },

    // 4. HIGH-SPEED ANALOG SUBSYSTEM (Bottom-Right)
    {
      id: 'ti_macro_analog',
      name: 'HighSpeed_Analog_Subsystem',
      displayName: 'Quad 16-bit 3.5MSPS SAR ADC + CMPSS Comparators',
      type: 'macro',
      category: 'analog',
      description: 'Four independent 16-bit SAR ADCs (ADC-A/B/C/D), 7 windowed analog comparators (CMPSS), and 3 DACs',
      level: 1,
      parentId: 'ti_soc_top',
      position: [15, 0.8, 9.5],
      size: [11, 1.7, 10],
      color: '#eab308',
      clockDomains: ['ADCCLK_50M', 'SYSCLK_200M'],
      resetDomains: ['rst_analog_n'],
      ports: [
        { id: 'p_ti_adc_eoc_out', name: 'ADC_EOC_INT_PULSE[3:0]', direction: 'out', width: 4, clockDomain: 'ADCCLK_50M', resetDomain: 'rst_analog_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [-1, 0, 0], offset: -0.2 },
        { id: 'p_ti_cmpss_trip_out', name: 'CMPSS_TRIP_OUT[6:0]', direction: 'out', width: 7, clockDomain: 'ADCCLK_50M', resetDomain: 'rst_analog_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, -1], offset: 0.2 }
      ]
    },

    // 5. APB COMMUNICATIONS SUBSYSTEM (Bottom-Center)
    {
      id: 'ti_subsys_comm',
      name: 'Communications_APB_Subsystem',
      displayName: 'Dual SCI (UART), SPI, I2C & Bosch CAN-FD',
      type: 'subsystem',
      category: 'peripheral',
      description: 'TI Serial Communications Interface (SCI/UART), multi-channel SPI, I2C, and ISO 11898-1:2015 CAN-FD',
      level: 1,
      parentId: 'ti_soc_top',
      position: [0, 0.8, 12],
      size: [11, 1.5, 7],
      color: '#ec4899',
      clockDomains: ['LSPCLK_50M', 'AUXCLK_60M', 'SYSCLK_200M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_ti_apb_comm_s', name: 'S_APB_LSPCLK[31:0]', direction: 'in', width: 32, clockDomain: 'LSPCLK_50M', resetDomain: 'rst_sys_n', protocol: 'APB', cdcStatus: 'clean', normal: [0, 0, -1], offset: -0.2 }
      ]
    },

    // 6. FLASH & SARAM MEMORY WITH SECURITY MODULE (Bottom-Left)
    {
      id: 'ti_subsys_mem',
      name: 'Memory_Security_Subsystem',
      displayName: '1MB Dual-Bank Flash + 204KB SARAM (ECC)',
      type: 'subsystem',
      category: 'memory',
      description: 'Zero wait-state 204KB single-cycle shared RAM, 1MB dual-bank Flash with ECC, and Dual-Zone Code Security Module (DCSM)',
      level: 1,
      parentId: 'ti_soc_top',
      position: [-15, 0.8, 9.5],
      size: [10, 1.5, 9],
      color: '#3b82f6',
      clockDomains: ['SYSCLK_200M'],
      resetDomains: ['rst_sys_n'],
      ports: []
    },

    // 7. SYSTEM CONTROL, DUAL PLL & WATCHDOG MACRO (Top-Center)
    {
      id: 'ti_macro_sysctl',
      name: 'System_Control_Dual_PLL_Macro',
      displayName: 'Dual PLL Macro, Missing Clock Detect & Watchdog',
      type: 'macro',
      category: 'analog',
      description: 'System PLL (200MHz), Aux PLL (60MHz), Missing Clock Detect (MCD), Windowed Watchdog (WDT), and Power-On Reset',
      level: 1,
      parentId: 'ti_soc_top',
      position: [0, 0.8, -13],
      size: [8, 1.4, 5.5],
      color: '#f59e0b',
      clockDomains: ['SYSCLK_200M', 'AUXCLK_60M', 'INTOSC_10M'],
      resetDomains: ['rst_por_n'],
      ports: []
    }
  ]
};

const TI_CONNECTIONS: InterconnectConnection[] = [
  {
    id: 'conn_ti_c28x_matrix',
    name: 'C28x_CPU_to_AXI_Matrix',
    srcModuleId: 'ti_subsys_c28x',
    srcPortId: 'p_ti_c28x_axi_m',
    dstModuleId: 'ti_bridge_matrix',
    dstPortId: 'p_ti_matrix_c28x_s',
    busType: 'AXI4 Master Bus (64-bit)',
    width: 64,
    srcClock: 'SYSCLK_200M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: false,
    cdcStatus: 'same_domain',
    rdcStatus: 'clean',
    syncScheme: 'Synchronous Single-Cycle Bus (Zero Wait-State)',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Intra_Domain_Clean',
    details: 'Primary 200MHz synchronous bus connecting C28x CPUs with crossbar switch.',
    hierarchicalLevelScope: 'soc_top'
  },
  {
    id: 'conn_ti_matrix_epwm',
    name: 'AHB_to_ePWM_Control_Bus',
    srcModuleId: 'ti_bridge_matrix',
    srcPortId: 'p_ti_matrix_epwm_m',
    dstModuleId: 'ti_subsys_epwm',
    dstPortId: 'p_ti_epwm_apb_s',
    busType: 'APB3 Control Bus (32-bit)',
    width: 32,
    srcClock: 'SYSCLK_200M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: false,
    cdcStatus: 'same_domain',
    rdcStatus: 'clean',
    syncScheme: 'Synchronous Peripheral Bridge',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_PROVEN_CLEAN',
    details: 'Register configuration interface for ePWM time-base counters and action qualifiers.',
    hierarchicalLevelScope: 'soc_top'
  },
  {
    id: 'conn_ti_adc_eoc',
    name: 'ADC_EOC_Pulse_to_C28x_PIE',
    srcModuleId: 'ti_macro_analog',
    srcPortId: 'p_ti_adc_eoc_out',
    dstModuleId: 'ti_subsys_c28x',
    dstPortId: 'p_ti_pie_irq_in',
    busType: 'Asynchronous ADC EOC Interrupt Pulse',
    width: 4,
    srcClock: 'ADCCLK_50M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: true,
    cdcStatus: 'violation',
    rdcStatus: 'clean',
    syncScheme: 'Missing Toggle Pulse Synchronizer!',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Ac_unsync01 (SpyGlass Error)',
    details: 'Single-cycle 50MHz pulse directly sampled by 200MHz CPU PIE. Risk of missed motor FOC current interrupt.',
    hierarchicalLevelScope: 'soc_top'
  },
  {
    id: 'conn_ti_cmpss_trip',
    name: 'CMPSS_Analog_Trip_to_ePWM_TZ',
    srcModuleId: 'ti_macro_analog',
    srcPortId: 'p_ti_cmpss_trip_out',
    dstModuleId: 'ti_subsys_epwm',
    dstPortId: 'p_ti_epwm_tz_in',
    busType: 'Asynchronous Overcurrent Trip Wire',
    width: 7,
    srcClock: 'ADCCLK_50M',
    dstClock: 'EPWMCLK_100M',
    isCrossClock: true,
    cdcStatus: 'violation',
    rdcStatus: 'hazard',
    syncScheme: 'Asynchronous Fast Trip Wire without Digital Glitch Filter',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_STRUCTURAL_UNSYNC / Reset_Check01',
    details: 'CMPSS comparator trip output directly drives asynchronous ePWM power stage shutdown. Analog glitch on IGBT causes false motor trip.',
    hierarchicalLevelScope: 'soc_top'
  }
];

// ============================================================================
// 2. NVIDIA - DRIVE ORIN / THOR (Tegra234 TRM / Architecture Whitepaper)
// ============================================================================
const NV_CLOCKS: ClockDomainInfo[] = [
  { name: 'CLK_CPU_2200M', freqMhz: 2200, color: '#76b900', description: '12-Core ARM Cortex-A78AE Application Cluster' },
  { name: 'CLK_GPU_1300M', freqMhz: 1300, color: '#84cc16', description: 'Ampere 2048-Core GPU & 64 Tensor Cores' },
  { name: 'CLK_DLA_1000M', freqMhz: 1000, color: '#00f2fe', description: 'Dual Deep Learning Accelerators (DLA 2.0 @ 100+ TOPS)' },
  { name: 'CLK_SCF_NOC_800M', freqMhz: 800, color: '#8b5cf6', description: 'System Coherent Fabric (SCF) Crossbar & NVLink-C2C' },
  { name: 'CLK_LPDDR5_1600M', freqMhz: 1600, color: '#06b6d4', description: '256-bit LPDDR5-6400 (204.8 GB/s) Memory Interface' },
  { name: 'CLK_SAFETY_400M', freqMhz: 400, color: '#f59e0b', description: 'ASIL-D Dual Lockstep Cortex-R52 Functional Safety Island' },
];

const NV_RESETS: ResetDomainInfo[] = [
  { name: 'rst_sys_n', type: 'async_assert_sync_deassert', color: '#84cc16' },
  { name: 'rst_gpu_n', type: 'async_assert_sync_deassert', color: '#10b981' },
  { name: 'rst_safety_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
];

const NV_MEMORY_MAP: MemoryMapRange[] = [
  { region: 'LPDDR5 System Unified Memory', startAddr: '0x0080_0000_0000', endAddr: '0x008F_FFFF_FFFF', size: '64 GB', busMaster: 'SCF Coherent Mesh Fabric', description: 'Unified memory space shared by Ampere GPU, NVDLA, and Cortex-A78AE' },
  { region: 'GPU Memory Mapped I/O (MMIO)', startAddr: '0x0017_0000_0000', endAddr: '0x0017_FFFF_FFFF', size: '4 GB', busMaster: 'NVLink-C2C Bridge', description: 'Ampere GPU command queue, paging registers, and BAR1 space' },
  { region: 'DLA0 / DLA1 Local SRAM Buffer', startAddr: '0x000F_0000_0000', endAddr: '0x000F_03FF_FFFF', size: '64 MB', busMaster: 'DLA DMA Controller', description: 'High-speed scratchpad memory for convolution weights and feature maps' },
  { region: 'Safety Island Cortex-R52 TCM', startAddr: '0x0000_0000_0000', endAddr: '0x0000_00FF_FFFF', size: '16 MB', busMaster: 'Lockstep Cortex-R52', description: 'Isolated tightly-coupled memory for ASIL-D vehicle control firmware' },
];

const NV_HIERARCHY: ModuleNode = {
  id: 'nv_soc_top',
  name: 'NVIDIA_Drive_Orin',
  displayName: 'NVIDIA Drive Orin AI Autonomous Driving SoC (Tegra234 TRM)',
  type: 'subsystem',
  category: 'compute',
  description: 'NVIDIA 254 TOPS High-Performance Autonomous Driving & Robotics SoC (8nm TSMC / Samsung)',
  level: 0,
  parentId: null,
  position: [0, 0, 0],
  size: [48, 0.8, 38],
  color: '#0e162b',
  clockDomains: NV_CLOCKS.map(c => c.name),
  resetDomains: NV_RESETS.map(r => r.name),
  ports: [],
  children: [
    // 1. AMPERE GPU WITH TENSOR CORES (Top-Left)
    {
      id: 'nv_subsys_gpu',
      name: 'Ampere_GPU_Tensor_Cluster',
      displayName: 'Ampere GPU (2048 CUDA Cores + 64 Tensor Cores)',
      type: 'subsystem',
      category: 'compute',
      description: 'Massive parallel compute engine executing neural network training & real-time inference at 1.3GHz',
      level: 1,
      parentId: 'nv_soc_top',
      position: [-15, 0.8, -10],
      size: [11, 1.8, 9.5],
      color: '#76b900',
      clockDomains: ['CLK_GPU_1300M'],
      resetDomains: ['rst_gpu_n'],
      ports: [
        { id: 'p_nv_gpu_axi_m', name: 'M_GPU_NVLINK[512:0]', direction: 'out', width: 512, clockDomain: 'CLK_GPU_1300M', resetDomain: 'rst_gpu_n', protocol: 'AXI4', cdcStatus: 'violation', normal: [1, 0, 0], offset: 0.1 }
      ],
      children: [
        {
          id: 'nv_ip_sm_clusters',
          name: '16x_Streaming_Multiprocessors',
          displayName: '16x SM Compute Units',
          type: 'ip',
          category: 'compute',
          description: 'FP32/INT32 execution pipelines with 64KB L1 cache per SM and hardware ray tracing cores',
          level: 2,
          parentId: 'nv_subsys_gpu',
          position: [0, 0.5, 0],
          size: [8.5, 1.0, 6.5],
          color: '#84cc16',
          clockDomains: ['CLK_GPU_1300M'],
          resetDomains: ['rst_gpu_n'],
          ports: []
        }
      ]
    },

    // 2. SYSTEM COHERENT FABRIC (SCF) CROSSBAR & NVLINK (Center Hub)
    {
      id: 'nv_bridge_scf_noc',
      name: 'System_Coherent_Fabric_SCF',
      displayName: 'System Coherent Fabric (SCF) Crossbar & NVLink-C2C',
      type: 'fabric',
      category: 'interconnect',
      description: '1.2 TB/s bidirectional coherent mesh crossbar interconnecting GPU, DLA, CPU, and LPDDR5 controllers',
      level: 1,
      parentId: 'nv_soc_top',
      position: [0, 0.8, -1],
      size: [10, 1.8, 9],
      color: '#8b5cf6',
      clockDomains: ['CLK_SCF_NOC_800M', 'CLK_GPU_1300M', 'CLK_DLA_1000M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_nv_scf_gpu_s', name: 'S_GPU_NVLINK[512:0]', direction: 'in', width: 512, clockDomain: 'CLK_SCF_NOC_800M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'violation', normal: [-1, 0, 0], offset: -0.2 },
        { id: 'p_nv_scf_dla_s', name: 'S_DLA_STREAM[256:0]', direction: 'in', width: 256, clockDomain: 'CLK_SCF_NOC_800M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [1, 0, 0], offset: -0.2 }
      ]
    },

    // 3. DUAL DEEP LEARNING ACCELERATORS (DLA 2.0) (Top-Right)
    {
      id: 'nv_subsys_dla',
      name: 'Dual_NVDLA_2_0_Engines',
      displayName: 'Dual Deep Learning Accelerators (DLA 2.0 @ 100+ TOPS)',
      type: 'subsystem',
      category: 'compute',
      description: 'Dedicated low-power deep learning inference engines with dedicated MAC array and planar SRAM buffers',
      level: 1,
      parentId: 'nv_soc_top',
      position: [15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#00f2fe',
      clockDomains: ['CLK_DLA_1000M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_nv_dla_stream_m', name: 'M_DLA_STREAM[256:0]', direction: 'out', width: 256, clockDomain: 'CLK_DLA_1000M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [-1, 0, 0], offset: 0.1 }
      ]
    },

    // 4. 256-BIT LPDDR5 MEMORY CONTROLLER (Bottom-Right)
    {
      id: 'nv_subsys_lpddr5',
      name: '256b_LPDDR5_Memory_Subsystem',
      displayName: '256-bit LPDDR5-6400 Controller (204.8 GB/s)',
      type: 'subsystem',
      category: 'memory',
      description: '16-channel 256-bit LPDDR5-6400 memory controller providing ultra-high bandwidth for autonomous perception',
      level: 1,
      parentId: 'nv_soc_top',
      position: [15, 0.8, 9.5],
      size: [11, 1.7, 10],
      color: '#10b981',
      clockDomains: ['CLK_LPDDR5_1600M', 'CLK_SCF_NOC_800M'],
      resetDomains: ['rst_sys_n'],
      ports: []
    },

    // 5. 12-CORE ARM CORTEX-A78AE CLUSTER (Bottom-Left)
    {
      id: 'nv_subsys_cpu',
      name: '12Core_Cortex_A78AE_Cluster',
      displayName: '12-Core ARM Cortex-A78AE Cluster (2.2GHz)',
      type: 'subsystem',
      category: 'compute',
      description: 'Three quad-core clusters with 2MB L2 per cluster and 6MB shared L3 with Split-Lock ASIL-D capability',
      level: 1,
      parentId: 'nv_soc_top',
      position: [-15, 0.8, 9.5],
      size: [10, 1.5, 9],
      color: '#3b82f6',
      clockDomains: ['CLK_CPU_2200M'],
      resetDomains: ['rst_sys_n'],
      ports: []
    },

    // 6. ASIL-D SAFETY ISLAND (Bottom-Center)
    {
      id: 'nv_subsys_safety',
      name: 'ASIL_D_Safety_Island_R52',
      displayName: 'Dual Lockstep Cortex-R52 Safety Island',
      type: 'subsystem',
      category: 'security',
      description: 'ISO 26262 ASIL-D watchdog supervisor overseeing vehicle steering and brake control',
      level: 1,
      parentId: 'nv_soc_top',
      position: [0, 0.8, 12],
      size: [11, 1.5, 7],
      color: '#f59e0b',
      clockDomains: ['CLK_SAFETY_400M'],
      resetDomains: ['rst_safety_n'],
      ports: []
    }
  ]
};

const NV_CONNECTIONS: InterconnectConnection[] = [
  {
    id: 'conn_nv_gpu_scf',
    name: 'Ampere_GPU_to_SCF_Crossbar',
    srcModuleId: 'nv_subsys_gpu',
    srcPortId: 'p_nv_gpu_axi_m',
    dstModuleId: 'nv_bridge_scf_noc',
    dstPortId: 'p_nv_scf_gpu_s',
    busType: 'Coherent NVLink-C2C Bus (512-bit)',
    width: 512,
    srcClock: 'CLK_GPU_1300M',
    dstClock: 'CLK_SCF_NOC_800M',
    isCrossClock: true,
    cdcStatus: 'violation',
    rdcStatus: 'clean',
    syncScheme: 'Direct Asynchronous High-Speed Interface (Missing Credit FIFO)',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Ac_unsync01 / CDC_STRUCTURAL_UNSYNC',
    details: 'GPU 1.3GHz domain directly issuing burst read/writes to 800MHz SCF crossbar without Gray pointer async FIFO.',
    hierarchicalLevelScope: 'soc_top'
  },
  {
    id: 'conn_nv_dla_scf',
    name: 'DLA_Streaming_to_SCF_Crossbar',
    srcModuleId: 'nv_subsys_dla',
    srcPortId: 'p_nv_dla_stream_m',
    dstModuleId: 'nv_bridge_scf_noc',
    dstPortId: 'p_nv_scf_dla_s',
    busType: 'AXI4 Streaming Tensor Bus (256-bit)',
    width: 256,
    srcClock: 'CLK_DLA_1000M',
    dstClock: 'CLK_SCF_NOC_800M',
    isCrossClock: true,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'Dual-Clock Async FIFO (Depth 32) with 2-FF Meta Synchronizers',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_VALID_FIFO (Proven Clean)',
    details: 'Cadence JasperGold formal verified: zero metastability hazards on DLA convolution weight streams.',
    hierarchicalLevelScope: 'soc_top'
  }
];

// 3. INFINEON - AURIX TC4Dx (TC4Dx user manual v1.1, 2025-06-26)
// Hierarchy, ports, clocks and CDC connections live in ./infineonAurix.ts
// ============================================================================
// 4. CEREBRAS - WAFER-SCALE ENGINE (WSE-3 Architecture Whitepaper)
// ============================================================================
const CER_CLOCKS: ClockDomainInfo[] = [
  { name: 'CLK_CORE_1100M', freqMhz: 1100, color: '#f59e0b', description: '900,000 Sparse Linear Algebra Cores (SLAC)' },
  { name: 'CLK_FABRIC_1100M', freqMhz: 1100, color: '#00f2fe', description: '2D Switched Mesh Routing Fabric (21 PB/s)' },
  { name: 'CLK_SRAM_1100M', freqMhz: 1100, color: '#10b981', description: 'Distributed 44 GB On-Wafer SRAM Banks' },
  { name: 'CLK_SERDES_800M', freqMhz: 800, color: '#8b5cf6', description: 'Off-Wafer 100GbE / PCIe Gen5 Optical IO' },
];

const CER_RESETS: ResetDomainInfo[] = [
  { name: 'rst_wafer_n', type: 'async_assert_sync_deassert', color: '#f59e0b' },
];

const CER_MEMORY_MAP: MemoryMapRange[] = [
  { region: 'Core Local SRAM Array (48KB x 900,000)', startAddr: '0x0000_0000_0000', endAddr: '0x000A_FFFF_FFFF', size: '44 GB', busMaster: 'SLAC Core Compute Unit', description: 'Pure on-wafer memory fabric; 19 petabytes/sec aggregate memory bandwidth' },
  { region: '2D Mesh Virtual Channel Flit Routing Table', startAddr: '0x000B_0000_0000', endAddr: '0x000B_00FF_FFFF', size: '16 MB', busMaster: 'Switched 2D Mesh Fabric', description: 'Hardware flit routing registers for North, South, East, West wormhole channels' },
  { region: 'Off-Wafer Optical IO Buffer Windows', startAddr: '0x000C_0000_0000', endAddr: '0x000C_0FFF_FFFF', size: '256 MB', busMaster: 'SwarmX Scale-Out SerDes', description: 'Optical transceivers streaming weights and activations to external host nodes' },
];

const CER_HIERARCHY: ModuleNode = {
  id: 'cer_soc_top',
  name: 'Cerebras_WSE_3',
  displayName: 'Cerebras Wafer-Scale Engine (WSE-3 Whitepaper Architecture)',
  type: 'subsystem',
  category: 'compute',
  description: 'World Largest AI Accelerator (900,000 Cores, 44 GB On-Chip SRAM, 21 PB/s Mesh Bandwidth, TSMC 5nm)',
  level: 0,
  parentId: null,
  position: [0, 0, 0],
  size: [48, 0.8, 38],
  color: '#0e162b',
  clockDomains: CER_CLOCKS.map(c => c.name),
  resetDomains: CER_RESETS.map(r => r.name),
  ports: [],
  children: [
    {
      id: 'cer_subsys_slac_nw',
      name: 'SLAC_Tensor_Quadrant_NorthWest',
      displayName: 'Sparse Linear Algebra Cores (225k Cores NW)',
      type: 'subsystem',
      category: 'compute',
      description: '225,000 tensor processing cores with native sparsity acceleration and hardware dataflow execution',
      level: 1,
      parentId: 'cer_soc_top',
      position: [-15, 0.8, -10],
      size: [11, 1.8, 9.5],
      color: '#f59e0b',
      clockDomains: ['CLK_CORE_1100M'],
      resetDomains: ['rst_wafer_n'],
      ports: []
    },
    {
      id: 'cer_subsys_2d_mesh',
      name: '2D_Switched_Mesh_Fabric',
      displayName: 'Ultra-High Bandwidth 2D Switched Mesh Fabric',
      type: 'fabric',
      category: 'interconnect',
      description: 'Single-cycle cut-through routing fabric connecting all cores across the entire wafer with 21 Petabits/sec',
      level: 1,
      parentId: 'cer_soc_top',
      position: [0, 0.8, -1],
      size: [10, 1.8, 9],
      color: '#00f2fe',
      clockDomains: ['CLK_FABRIC_1100M'],
      resetDomains: ['rst_wafer_n'],
      ports: [
        { id: 'p_cer_mesh_io', name: 'M_FLIT_STREAM[255:0]', direction: 'out', width: 256, clockDomain: 'CLK_FABRIC_1100M', resetDomain: 'rst_wafer_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [0, 0, 1], offset: 0 }
      ]
    },
    {
      id: 'cer_subsys_slac_ne',
      name: 'SLAC_Tensor_Quadrant_NorthEast',
      displayName: 'Sparse Linear Algebra Cores (225k Cores NE)',
      type: 'subsystem',
      category: 'compute',
      description: '225,000 tensor processing cores with distributed memory and hardware accumulator trees',
      level: 1,
      parentId: 'cer_soc_top',
      position: [15, 0.8, -10],
      size: [11, 1.8, 9.5],
      color: '#f59e0b',
      clockDomains: ['CLK_CORE_1100M'],
      resetDomains: ['rst_wafer_n'],
      ports: []
    },
    {
      id: 'cer_subsys_sram',
      name: 'Distributed_44GB_SRAM_Banks',
      displayName: 'Distributed On-Wafer SRAM (44 GB Total)',
      type: 'subsystem',
      category: 'memory',
      description: 'Pure on-chip memory with 19 petabytes/sec aggregate memory bandwidth; zero external DRAM bottleneck',
      level: 1,
      parentId: 'cer_soc_top',
      position: [15, 0.8, 9.5],
      size: [11, 1.7, 10],
      color: '#10b981',
      clockDomains: ['CLK_SRAM_1100M'],
      resetDomains: ['rst_wafer_n'],
      ports: []
    },
    {
      id: 'cer_subsys_slac_sw',
      name: 'SLAC_Tensor_Quadrant_SouthWest',
      displayName: 'Sparse Linear Algebra Cores (225k Cores SW)',
      type: 'subsystem',
      category: 'compute',
      description: 'High-density AI datapath executing transformer attention heads and matrix convolutions',
      level: 1,
      parentId: 'cer_soc_top',
      position: [-15, 0.8, 9.5],
      size: [10, 1.5, 9],
      color: '#f59e0b',
      clockDomains: ['CLK_CORE_1100M'],
      resetDomains: ['rst_wafer_n'],
      ports: []
    },
    {
      id: 'cer_subsys_offwafer',
      name: 'Off_Wafer_SerDes_100GbE_Bridge',
      displayName: '1.2 Tbps Off-Wafer Optical IO / PCIe Gen5',
      type: 'subsystem',
      category: 'peripheral',
      description: 'High-speed edge transceivers interfacing the wafer to host servers and SwarmX scale-out fabrics',
      level: 1,
      parentId: 'cer_soc_top',
      position: [0, 0.8, 12],
      size: [11, 1.5, 7],
      color: '#8b5cf6',
      clockDomains: ['CLK_SERDES_800M'],
      resetDomains: ['rst_wafer_n'],
      ports: [
        { id: 'p_cer_serdes_in', name: 'S_SERDES_FLIT[255:0]', direction: 'in', width: 256, clockDomain: 'CLK_SERDES_800M', resetDomain: 'rst_wafer_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [0, 0, -1], offset: 0 }
      ]
    }
  ]
};

const CER_CONNECTIONS: InterconnectConnection[] = [
  {
    id: 'conn_cer_mesh_serdes',
    name: '2D_Mesh_to_OffWafer_SerDes',
    srcModuleId: 'cer_subsys_2d_mesh',
    srcPortId: 'p_cer_mesh_io',
    dstModuleId: 'cer_subsys_offwafer',
    dstPortId: 'p_cer_serdes_in',
    busType: 'High-Speed 2D Switched Flit Stream (256-bit)',
    width: 256,
    srcClock: 'CLK_FABRIC_1100M',
    dstClock: 'CLK_SERDES_800M',
    isCrossClock: true,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'Asynchronous Flit FIFO with Gray Pointer Synchronizer',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_VALID_FIFO',
    details: 'Proven clean across 1.1GHz wafer mesh to 800MHz off-wafer transceivers.',
    hierarchicalLevelScope: 'soc_top'
  }
];

// ============================================================================
// 5. QUALCOMM - SNAPDRAGON 8 GEN 3 / GEN 4 (SM8650 Hardware TRM)
// ============================================================================
const QC_CLOCKS: ClockDomainInfo[] = [
  { name: 'CLK_PRIME_3300M', freqMhz: 3300, color: '#ef4444', description: 'Cortex-X4 Prime Core @ 3.3GHz' },
  { name: 'CLK_GOLD_3000M', freqMhz: 3000, color: '#f59e0b', description: '5x Cortex-A720 Performance Cores @ 3.0GHz' },
  { name: 'CLK_GPU_900M', freqMhz: 900, color: '#ec4899', description: 'Adreno 750 Ray-Tracing GPU' },
  { name: 'CLK_NPU_1200M', freqMhz: 1200, color: '#00f2fe', description: 'Hexagon NPU Vector & Tensor Engine' },
  { name: 'CLK_NOC_1000M', freqMhz: 1000, color: '#8b5cf6', description: 'System Coherent Interconnect & Memory Bus' },
  { name: 'CLK_MODEM_600M', freqMhz: 600, color: '#10b981', description: 'Snapdragon X75 5G Sub-6 / mmWave Baseband' },
];

const QC_RESETS: ResetDomainInfo[] = [
  { name: 'rst_snap_n', type: 'async_assert_sync_deassert', color: '#ef4444' },
];

const QC_MEMORY_MAP: MemoryMapRange[] = [
  { region: 'LPDDR5X System Memory Space', startAddr: '0x0080_0000_0000', endAddr: '0x0083_FFFF_FFFF', size: '16 GB', busMaster: 'Qualcomm System NoC', description: 'High-speed 76.8 GB/s unified memory shared by CPU, Adreno GPU, and NPU' },
  { region: 'Hexagon NPU Tightly-Coupled Memory (TCM)', startAddr: '0x0010_0000_0000', endAddr: '0x0010_03FF_FFFF', size: '4 MB', busMaster: 'Hexagon Vector Engine', description: 'Ultra-low latency vector and tensor scratchpad memory' },
  { region: 'Adreno GPU Control Registers & Command Ring', startAddr: '0x0005_0000_0000', endAddr: '0x0005_00FF_FFFF', size: '16 MB', busMaster: 'System NoC AXI Master', description: 'Graphics pipeline shaders, ray-tracing BVH buffers, and display controller' },
  { region: 'Spectra Cognitive ISP Register Bank', startAddr: '0x000A_0000_0000', endAddr: '0x000A_007F_FFFF', size: '8 MB', busMaster: 'MIPI CSI-2 Bridge', description: 'Real-time semantic segmentation and computational photography hardware' },
];

const QC_HIERARCHY: ModuleNode = {
  id: 'qc_soc_top',
  name: 'Qualcomm_Snapdragon_8_Gen3',
  displayName: 'Qualcomm Snapdragon 8 Gen 3 Flagship SoC (SM8650 TRM)',
  type: 'subsystem',
  category: 'compute',
  description: 'Qualcomm Flagship Mobile & Connected Cockpit AI Processor (TSMC 4nm N4P)',
  level: 0,
  parentId: null,
  position: [0, 0, 0],
  size: [48, 0.8, 38],
  color: '#0e162b',
  clockDomains: QC_CLOCKS.map(c => c.name),
  resetDomains: QC_RESETS.map(r => r.name),
  ports: [],
  children: [
    // 1. KRYO CPU CLUSTER (Top-Left)
    {
      id: 'qc_subsys_kryo_cpu',
      name: 'Kryo_CPU_Cluster_1_plus_5_plus_2',
      displayName: 'Kryo CPU (1x X4 Prime @ 3.3G + 5x A720 + 2x A520)',
      type: 'subsystem',
      category: 'compute',
      description: '1+5+2 CPU microarchitecture with 3.3GHz Cortex-X4 Prime Core and shared 12MB L3 Cache',
      level: 1,
      parentId: 'qc_soc_top',
      position: [-15, 0.8, -10],
      size: [11, 1.8, 9.5],
      color: '#ef4444',
      clockDomains: ['CLK_PRIME_3300M', 'CLK_GOLD_3000M'],
      resetDomains: ['rst_snap_n'],
      ports: []
    },

    // 2. SYSTEM NOC CROSSBAR (Center Hub)
    {
      id: 'qc_bridge_system_noc',
      name: 'Qualcomm_System_NoC_Fabric',
      displayName: 'System NoC Crossbar & QoS Arbiter',
      type: 'fabric',
      category: 'interconnect',
      description: 'Low-latency multi-tier crossbar routing traffic between Kryo CPU, Adreno GPU, Hexagon NPU, and LPDDR5X',
      level: 1,
      parentId: 'qc_soc_top',
      position: [0, 0.8, -1],
      size: [10, 1.8, 9],
      color: '#8b5cf6',
      clockDomains: ['CLK_NOC_1000M'],
      resetDomains: ['rst_snap_n'],
      ports: [
        { id: 'p_qc_noc_npu_s', name: 'S_NPU_AXI[256:0]', direction: 'in', width: 256, clockDomain: 'CLK_NOC_1000M', resetDomain: 'rst_snap_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [1, 0, 0], offset: 0 }
      ]
    },

    // 3. ADRENO 750 GPU (Top-Right)
    {
      id: 'qc_subsys_adreno_gpu',
      name: 'Adreno_750_RayTracing_GPU',
      displayName: 'Adreno 750 GPU (Hardware Ray Tracing)',
      type: 'subsystem',
      category: 'compute',
      description: 'Hardware-accelerated real-time ray tracing and Global Illumination graphics processor @ 900MHz',
      level: 1,
      parentId: 'qc_soc_top',
      position: [15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#ec4899',
      clockDomains: ['CLK_GPU_900M'],
      resetDomains: ['rst_snap_n'],
      ports: []
    },

    // 4. HEXAGON NPU GENERATIVE AI ENGINE (Bottom-Right)
    {
      id: 'qc_subsys_hexagon_npu',
      name: 'Hexagon_NPU_Fused_AI_Engine',
      displayName: 'Hexagon NPU (Fused Vector & Tensor Accelerators)',
      type: 'subsystem',
      category: 'compute',
      description: 'Generative AI engine executing on-device LLMs (e.g. Llama-3 8B) at up to 20 tokens/second @ 1.2GHz',
      level: 1,
      parentId: 'qc_soc_top',
      position: [15, 0.8, 9.5],
      size: [11, 1.7, 10],
      color: '#00f2fe',
      clockDomains: ['CLK_NPU_1200M'],
      resetDomains: ['rst_snap_n'],
      ports: [
        { id: 'p_qc_npu_axi_m', name: 'M_NPU_AXI[256:0]', direction: 'out', width: 256, clockDomain: 'CLK_NPU_1200M', resetDomain: 'rst_snap_n', protocol: 'AXI4', cdcStatus: 'clean', normal: [-1, 0, 0], offset: 0 }
      ]
    },

    // 5. SPECTRA COGNITIVE TRIPLE 18-BIT ISP (Bottom-Left)
    {
      id: 'qc_subsys_spectra_isp',
      name: 'Spectra_Cognitive_18b_ISP',
      displayName: 'Spectra Cognitive Triple 18-bit ISP',
      type: 'subsystem',
      category: 'peripheral',
      description: 'Triple 18-bit image signal processor supporting real-time semantic segmentation on 200MP camera sensors',
      level: 1,
      parentId: 'qc_soc_top',
      position: [-15, 0.8, 9.5],
      size: [10, 1.5, 9],
      color: '#eab308',
      clockDomains: ['CLK_NOC_1000M'],
      resetDomains: ['rst_snap_n'],
      ports: []
    },

    // 6. SNAPDRAGON X75 5G MODEM-RF (Bottom-Center)
    {
      id: 'qc_subsys_x75_modem',
      name: 'Snapdragon_X75_5G_Modem_RF',
      displayName: 'Snapdragon X75 5G Modem-RF & FastConnect 7800',
      type: 'subsystem',
      category: 'peripheral',
      description: 'World first 5G Advanced modem with AI hardware tensor accelerator and Wi-Fi 7 (5.8 Gbps)',
      level: 1,
      parentId: 'qc_soc_top',
      position: [0, 0.8, 12],
      size: [11, 1.5, 7],
      color: '#10b981',
      clockDomains: ['CLK_MODEM_600M'],
      resetDomains: ['rst_snap_n'],
      ports: []
    }
  ]
};

const QC_CONNECTIONS: InterconnectConnection[] = [
  {
    id: 'conn_qc_npu_noc',
    name: 'Hexagon_NPU_to_System_NoC',
    srcModuleId: 'qc_subsys_hexagon_npu',
    srcPortId: 'p_qc_npu_axi_m',
    dstModuleId: 'qc_bridge_system_noc',
    dstPortId: 'p_qc_noc_npu_s',
    busType: 'High-Bandwidth Coherent AXI5 Bus (256-bit)',
    width: 256,
    srcClock: 'CLK_NPU_1200M',
    dstClock: 'CLK_NOC_1000M',
    isCrossClock: true,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'Asynchronous AXI FIFO Bridge with Gray Coded Pointers',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_VALID_FIFO',
    details: 'Formal verification clean: Hexagon tensor buffer to NoC crossbar.',
    hierarchicalLevelScope: 'soc_top'
  }
];

// ============================================================================
// MASTER CATALOG EXPORT
// ============================================================================
export const SOC_CATALOG: Record<string, CompanySoCEntry> = {
  ti: {
    id: 'ti',
    companyName: 'Texas Instruments',
    chipModel: 'TMS320F28388D (C2000)',
    trmDocumentId: 'TI TRM SPRUHM8 / SPRUI33',
    tagline: 'Dual C28x DSP + CLA Real-Time Industrial & Inverter Control MCU',
    processNode: '65nm / 45nm Embedded Flash',
    primaryApp: 'Motor Drives, Solar Inverters, EV Traction Powertrain',
    brandColor: '#cc0000',
    badgeSymbol: 'TI',
    memoryMap: TI_MEMORY_MAP,
    hierarchy: TI_HIERARCHY,
    connections: TI_CONNECTIONS,
    clockDomains: TI_CLOCKS,
    resetDomains: TI_RESETS
  },
  nvidia: {
    id: 'nvidia',
    companyName: 'NVIDIA',
    chipModel: 'Drive Orin (Tegra234 Architecture)',
    trmDocumentId: 'NVIDIA Tegra234 TRM / Architecture Whitepaper',
    tagline: '254 TOPS Autonomous Driving & Robotics AI Computer-on-Chip',
    processNode: '8nm / 4nm TSMC',
    primaryApp: 'Level 4/5 Autonomous Vehicles, Robotaxis, Edge AI',
    brandColor: '#76b900',
    badgeSymbol: 'NV',
    memoryMap: NV_MEMORY_MAP,
    hierarchy: NV_HIERARCHY,
    connections: NV_CONNECTIONS,
    clockDomains: NV_CLOCKS,
    resetDomains: NV_RESETS
  },
  infineon: {
    id: 'infineon',
    companyName: 'Infineon Technologies',
    chipModel: 'AURIX TC4Dx (TriCore 1.8, 500 MHz)',
    trmDocumentId: 'Infineon AURIX TC4Dx User Manual v1.1 (2025-06-26)',
    tagline: '6x TriCore 1.8 lockstep @500MHz + PPU AI + 5Gbps Ethernet',
    processNode: '28nm eFlash',
    primaryApp: 'Automotive domain/zone controllers, xEV inverter, ADAS fusion',
    brandColor: '#00a3e0',
    badgeSymbol: 'IFX',
    memoryMap: INF_MEMORY_MAP,
    hierarchy: INF_HIERARCHY,
    connections: INF_CONNECTIONS,
    clockDomains: INF_CLOCKS,
    resetDomains: INF_RESETS,
    powerDomains: INF_POWER
  },
  cerebras: {
    id: 'cerebras',
    companyName: 'Cerebras Systems',
    chipModel: 'Wafer-Scale Engine (WSE-3)',
    trmDocumentId: 'Cerebras WSE-3 Architecture Whitepaper (46,225 mm²)',
    tagline: '900,000 AI Cores, 44 GB SRAM, 21 PB/s 2D Switched Mesh',
    processNode: '5nm TSMC (Wafer Scale)',
    primaryApp: 'Frontier AI Foundation Model Training & Extreme Inference',
    brandColor: '#f59e0b',
    badgeSymbol: 'CS',
    memoryMap: CER_MEMORY_MAP,
    hierarchy: CER_HIERARCHY,
    connections: CER_CONNECTIONS,
    clockDomains: CER_CLOCKS,
    resetDomains: CER_RESETS
  },
  qualcomm: {
    id: 'qualcomm',
    companyName: 'Qualcomm',
    chipModel: 'Snapdragon 8 Gen 3 (SM8650)',
    trmDocumentId: 'Qualcomm SM8650 Hardware Architecture TRM',
    tagline: 'Kryo 3.3GHz CPU, Adreno 750, Hexagon NPU & X75 5G Modem-RF',
    processNode: '4nm TSMC (N4P)',
    primaryApp: 'Flagship Smartphones, XR Headsets, Connected Cockpit',
    brandColor: '#ef4444',
    badgeSymbol: 'QC',
    memoryMap: QC_MEMORY_MAP,
    hierarchy: QC_HIERARCHY,
    connections: QC_CONNECTIONS,
    clockDomains: QC_CLOCKS,
    resetDomains: QC_RESETS
  },
  arm: ARM_SOC,
  broadcom: BROADCOM_SOC,
  samsung: SAMSUNG_SOC,
  apple: APPLE_SOC,
  mediatek: MEDIATEK_SOC,
  ti_c29x: TI_C29X_SOC,
  amd: AMD_SOC
};
