import { ModuleNode, InterconnectConnection, ClockDomainInfo, ResetDomainInfo } from '../types/soc';

// Actual Texas Instruments C2000 Clock Domains (TMS320F2838xD / F2837xD Class)
export const CLOCK_DOMAINS: ClockDomainInfo[] = [
  { name: 'SYSCLK_200M', freqMhz: 200, color: '#00f2fe', description: 'Primary 200MHz System Clock for Dual C28x DSP Cores & CLA' },
  { name: 'EPWMCLK_100M', freqMhz: 100, color: '#10b981', description: 'Motor Control Clock for High-Resolution ePWM1-ePWM8 & MEP' },
  { name: 'LSPCLK_50M', freqMhz: 50, color: '#ec4899', description: 'Low-Speed Peripheral Clock (SYSCLK/4) for SCI/UART, SPI, I2C' },
  { name: 'ADCCLK_50M', freqMhz: 50, color: '#eab308', description: 'Analog Subsystem Clock for Quad 16-bit 3.5MSPS SAR ADCs' },
  { name: 'AUXCLK_60M', freqMhz: 60, color: '#8b5cf6', description: 'Auxiliary Clock from Aux PLL for CAN-FD & USB 2.0' },
  { name: 'INTOSC_10M', freqMhz: 10, color: '#f59e0b', description: 'Internal Zero-Pin 10MHz Oscillator (Watchdog & Safe Boot)' },
];

export const RESET_DOMAINS: ResetDomainInfo[] = [
  { name: 'rst_sys_n', type: 'async_assert_sync_deassert', color: '#38bdf8' },
  { name: 'rst_c28x_n', type: 'async_assert_sync_deassert', color: '#818cf8' },
  { name: 'rst_analog_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
  { name: 'rst_por_n', type: 'async', color: '#f87171' },
  { name: 'trip_async', type: 'async', color: '#ef4444' }
];

// Complete Hierarchical TI C2000 SoC Floorplan (Dual C28x + CLA + AXI/AHB Matrix + Bridges + APB Peripherals)
export const SOC_HIERARCHY: ModuleNode = {
  id: 'soc_top',
  name: 'TI_C2000_TMS320F2838xD',
  displayName: 'TI C2000 Real-Time MCU SoC (F2838xD)',
  type: 'subsystem',
  category: 'compute',
  description: 'Texas Instruments Dual-Core C28x 32-bit DSP + Dual CLA Accelerators Real-Time Industrial & Automotive MCU',
  level: 0,
  parentId: null,
  position: [0, 0, 0],
  size: [48, 0.8, 38], // Wide floorplan with clean avenues
  color: '#0e162b',
  clockDomains: CLOCK_DOMAINS.map(c => c.name),
  resetDomains: RESET_DOMAINS.map(r => r.name),
  ports: [],
  children: [
    // 1. DUAL C28x + CLA COMPUTE SUBSYSTEM (Top-Left)
    {
      id: 'subsys_c28x_compute',
      name: 'Dual_C28x_CLA_Cluster',
      displayName: 'Dual C28x DSP Cores + Dual CLA Coprocessors',
      type: 'subsystem',
      category: 'compute',
      description: 'Dual 200MHz 32-bit C28x DSP cores with TMU (Trigonometric Math), VCU-II, and dual Control Law Accelerators',
      level: 1,
      parentId: 'soc_top',
      position: [-15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#00f2fe',
      clockDomains: ['SYSCLK_200M'],
      resetDomains: ['rst_c28x_n', 'rst_sys_n'],
      ports: [
        { id: 'p_c28x_axi_m', name: 'M_AXI_C28X[63:0]', direction: 'out', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_c28x_n', protocol: 'AXI4', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: 0.1 },
        { id: 'p_pie_irq_in', name: 'PIE_VECT_IRQ[95:0]', direction: 'in', width: 96, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_c28x_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, 1], offset: -0.2 },
        { id: 'p_c28x_jtag', name: 'JTAG_EMU_C28X', direction: 'inout', width: 6, clockDomain: 'LSPCLK_50M', resetDomain: 'rst_sys_n', protocol: 'JTAG', cdcStatus: 'clean', normal: [-1, 0, 0], offset: 0 }
      ],
      deliverables: {
        maturity: 'v0.9 Timing Final',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: false,
        jasperGoldVerified: false,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 98.2
      },
      children: [
        {
          id: 'ip_c28x_cpu1',
          name: 'C28x_Core_1',
          displayName: 'TI C28x Core 1 (200MHz FPU64 + TMU)',
          type: 'ip',
          category: 'compute',
          description: 'Primary real-time floating-point DSP engine with Trigonometric Math Unit (TMU0) & Viterbi/Complex Unit (VCU)',
          level: 2,
          parentId: 'subsys_c28x_compute',
          position: [-18, 1.8, -11.5],
          size: [4.6, 1.0, 3.8],
          color: '#38bdf8',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_c28x_n'],
          ports: []
        },
        {
          id: 'ip_c28x_cpu2',
          name: 'C28x_Core_2',
          displayName: 'TI C28x Core 2 (200MHz FPU64 + TMU)',
          type: 'ip',
          category: 'compute',
          description: 'Secondary independent 200MHz DSP core for dedicated control loops and diagnostics',
          level: 2,
          parentId: 'subsys_c28x_compute',
          position: [-12, 1.8, -11.5],
          size: [4.6, 1.0, 3.8],
          color: '#38bdf8',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_c28x_n'],
          ports: []
        },
        {
          id: 'ip_cla_accelerators',
          name: 'Dual_CLA_Coprocessors',
          displayName: 'Control Law Accelerators (CLA1 & CLA2)',
          type: 'ip',
          category: 'compute',
          description: 'Independent 32-bit floating-point math accelerators operating in parallel with CPUs with direct peripheral access',
          level: 2,
          parentId: 'subsys_c28x_compute',
          position: [-15, 1.8, -7.5],
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
      id: 'bridge_axi_ahb_matrix',
      name: 'AXI_AHB_Crossbar_Matrix',
      displayName: 'Multi-Layer AXI/AHB Interconnect & Bridges',
      type: 'fabric',
      category: 'interconnect',
      description: 'TI multi-layer master/slave interconnect crossbar routing 64-bit transactions between CPUs, DMA, and peripheral bridges',
      level: 1,
      parentId: 'soc_top',
      position: [0, 0.8, -1],
      size: [10, 1.8, 9],
      color: '#8b5cf6',
      clockDomains: ['SYSCLK_200M', 'LSPCLK_50M', 'AUXCLK_60M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_matrix_c28x_s', name: 'S_C28X_AXI', direction: 'in', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'same_domain', normal: [-1, 0, 0], offset: -0.3 },
        { id: 'p_matrix_ctrl_bridge', name: 'M_AHB_CTRL_BRIDGE', direction: 'out', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AHB', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: -0.2 },
        { id: 'p_matrix_comm_bridge', name: 'M_AHB_COMM_BRIDGE', direction: 'out', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AHB', cdcStatus: 'clean', normal: [0, 0, 1], offset: 0.2 },
        { id: 'p_matrix_mem_m', name: 'M_FLASH_RAM_BUS', direction: 'out', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AXI4', cdcStatus: 'same_domain', normal: [-1, 0, 0], offset: 0.3 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: true,
        jasperGoldVerified: true,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 99.5
      },
      children: [
        {
          id: 'ip_ahb_matrix_core',
          name: 'Multi_Master_AHB_Arbiter',
          displayName: '6-Master / 10-Slave Crossbar Switch',
          type: 'ip',
          category: 'interconnect',
          description: 'Round-robin & fixed priority hardware arbiter connecting C28x CPUs, DMA, and CLA to peripherals',
          level: 2,
          parentId: 'bridge_axi_ahb_matrix',
          position: [0, 1.8, -1],
          size: [4.5, 1.0, 4.2],
          color: '#a855f7',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_bridge_ahb_to_apb_comm',
          name: 'AHB_to_APB_Bridge_LSPCLK',
          displayName: 'AHB-to-APB Bridge (LSPCLK 50MHz Domain)',
          type: 'bridge',
          category: 'interconnect',
          description: 'Protocol converter bridging 200MHz AHB to 50MHz APB (LSPCLK) with 1:4 synchronous clock divider handshake',
          level: 2,
          parentId: 'bridge_axi_ahb_matrix',
          position: [0, 1.8, 2.2],
          size: [3.4, 0.8, 2.2],
          color: '#ec4899',
          clockDomains: ['SYSCLK_200M', 'LSPCLK_50M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_bridge_canfd_cdc',
          name: 'Async_FIFO_Bridge_CANFD',
          displayName: 'CAN-FD / AUXCLK Async CDC Bridge (200M <-> 60M)',
          type: 'bridge',
          category: 'interconnect',
          description: 'Dual-clock Gray coded FIFO bridge connecting 200MHz System NoC with 60MHz CAN-FD message RAM',
          level: 2,
          parentId: 'bridge_axi_ahb_matrix',
          position: [3.2, 1.8, -2.2],
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
      id: 'subsys_epwm_control',
      name: 'ePWM_Motor_Control_Subsystem',
      displayName: 'High-Resolution ePWM1-ePWM8 & eQEP Fabric',
      type: 'subsystem',
      category: 'peripheral',
      description: 'TI industry-standard 8-channel High-Resolution ePWM with 150ps MEP micro-edge positioning, eCAP, and eQEP encoders',
      level: 1,
      parentId: 'soc_top',
      position: [15, 0.8, -10],
      size: [11, 1.6, 9.5],
      color: '#10b981',
      clockDomains: ['EPWMCLK_100M', 'SYSCLK_200M'],
      resetDomains: ['rst_sys_n', 'trip_async'],
      ports: [
        { id: 'p_epwm_apb_s', name: 'S_APB_EPWM[31:0]', direction: 'in', width: 32, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'APB', cdcStatus: 'same_domain', normal: [-1, 0, 0], offset: 0.1 },
        { id: 'p_epwm_out_pins', name: 'EPWM_A_B_PINS[15:0]', direction: 'out', width: 16, clockDomain: 'EPWMCLK_100M', resetDomain: 'rst_sys_n', protocol: 'Sideband', cdcStatus: 'clean', normal: [1, 0, 0], offset: 0 },
        { id: 'p_epwm_tz_trip', name: 'TZ_TRIP_ASYNC[5:0]', direction: 'in', width: 6, clockDomain: 'ADCCLK_50M', resetDomain: 'trip_async', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, 1], offset: -0.3 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: false,
        jasperGoldVerified: true,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 99.1
      },
      children: [
        {
          id: 'ip_epwm_cluster',
          name: 'ePWM_Modules_1_to_8',
          displayName: '8x ePWM Generator Blocks',
          type: 'ip',
          category: 'peripheral',
          description: 'Time-base counter, counter-compare (CMPA/CMPB), dead-band generator (DB), chopper (PC), and trip-zone (TZ)',
          level: 2,
          parentId: 'subsys_epwm_control',
          position: [13, 1.8, -11.5],
          size: [5.2, 0.9, 4.0],
          color: '#059669',
          clockDomains: ['EPWMCLK_100M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_hrpwm_mep',
          name: 'HRPWM_Micro_Edge_Positioner',
          displayName: 'High-Resolution MEP Extension',
          type: 'macro',
          category: 'analog',
          description: 'Calibrated delay line (MEP) providing picosecond duty cycle and phase resolution',
          level: 2,
          parentId: 'subsys_epwm_control',
          position: [18, 1.8, -11.5],
          size: [3.8, 1.0, 4.0],
          color: '#047857',
          clockDomains: ['EPWMCLK_100M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_eqep_ecap',
          name: 'eQEP_eCAP_Motion_Units',
          displayName: 'Quadrature Encoder (eQEP) & Capture (eCAP)',
          type: 'ip',
          category: 'peripheral',
          description: 'High-speed motor shaft optical encoder decoder and time-stamp capture engines',
          level: 2,
          parentId: 'subsys_epwm_control',
          position: [15, 1.8, -7.5],
          size: [10.0, 0.9, 3.2],
          color: '#34d399',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        }
      ]
    },

    // 4. HIGH-SPEED ANALOG SUBSYSTEM (Bottom-Right)
    {
      id: 'macro_analog_subsys',
      name: 'HighSpeed_Analog_Subsystem',
      displayName: 'Quad 16-bit 3.5MSPS ADC + CMPSS Comparators',
      type: 'macro',
      category: 'analog',
      description: 'Four independent 16-bit/12-bit differential SAR ADCs (ADC-A/B/C/D), 7 windowed analog comparators (CMPSS), and 3 12-bit DACs',
      level: 1,
      parentId: 'soc_top',
      position: [15, 0.8, 9.5],
      size: [11, 1.7, 10],
      color: '#eab308',
      clockDomains: ['ADCCLK_50M', 'SYSCLK_200M'],
      resetDomains: ['rst_analog_n'],
      ports: [
        { id: 'p_adc_eoc_pulse', name: 'ADC_EOC_INT_PULSE[3:0]', direction: 'out', width: 4, clockDomain: 'ADCCLK_50M', resetDomain: 'rst_analog_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [-1, 0, 0], offset: -0.2 },
        { id: 'p_cmpss_trip_out', name: 'CMPSS_TRIP_OUT[6:0]', direction: 'out', width: 7, clockDomain: 'ADCCLK_50M', resetDomain: 'rst_analog_n', protocol: 'Sideband', cdcStatus: 'violation', normal: [0, 0, -1], offset: 0.2 },
        { id: 'p_analog_pin_in', name: 'ANALOG_IN_CHANNELS[23:0]', direction: 'in', width: 24, clockDomain: 'ADCCLK_50M', resetDomain: 'rst_analog_n', protocol: 'Sideband', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: 0 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: false,
        jasperGoldVerified: false,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 99.8
      },
      children: [
        {
          id: 'ip_quad_adc_cores',
          name: 'Quad_SAR_ADC_Cores_A_B_C_D',
          displayName: 'Four 16-bit 3.5MSPS Differential SAR ADCs',
          type: 'macro',
          category: 'analog',
          description: 'Parallel simultaneous sampling converters with post-processing offset/gain correction',
          level: 2,
          parentId: 'macro_analog_subsys',
          position: [13, 1.8, 9.5],
          size: [5.6, 1.1, 8.2],
          color: '#ca8a04',
          clockDomains: ['ADCCLK_50M'],
          resetDomains: ['rst_analog_n'],
          ports: []
        },
        {
          id: 'ip_cmpss_comparators',
          name: 'CMPSS_Window_Comparators',
          displayName: '7x CMPSS Windowed Fast Comparators',
          type: 'macro',
          category: 'analog',
          description: 'Sub-25ns analog over-current and over-voltage trip comparators with integrated 12-bit DAC references',
          level: 2,
          parentId: 'macro_analog_subsys',
          position: [18, 1.8, 9.5],
          size: [3.8, 1.0, 8.2],
          color: '#d97706',
          clockDomains: ['ADCCLK_50M'],
          resetDomains: ['rst_analog_n'],
          ports: []
        }
      ]
    },

    // 5. LOW-SPEED COMMUNICATION & PERIPHERAL APB SUBSYSTEM (Bottom-Center)
    {
      id: 'subsys_comm_periph',
      name: 'Communications_APB_Subsystem',
      displayName: 'SCI (UART), SPI, I2C & Bosch CAN-FD Fabric',
      type: 'subsystem',
      category: 'peripheral',
      description: 'TI Serial Communications Interface (SCI/UART), multi-channel SPI, I2C, and ISO 11898-1:2015 CAN-FD controller',
      level: 1,
      parentId: 'soc_top',
      position: [0, 0.8, 12],
      size: [11, 1.5, 7],
      color: '#ec4899',
      clockDomains: ['LSPCLK_50M', 'AUXCLK_60M', 'SYSCLK_200M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_apb_comm_s', name: 'S_APB_LSPCLK[31:0]', direction: 'in', width: 32, clockDomain: 'LSPCLK_50M', resetDomain: 'rst_sys_n', protocol: 'APB', cdcStatus: 'clean', normal: [0, 0, -1], offset: -0.2 },
        { id: 'p_canfd_aux_s', name: 'S_CANFD_AUX_BUS', direction: 'in', width: 32, clockDomain: 'AUXCLK_60M', resetDomain: 'rst_sys_n', protocol: 'APB', cdcStatus: 'clean', normal: [0, 0, -1], offset: 0.3 },
        { id: 'p_ext_comm_io', name: 'TX_RX_EXT_PINS[15:0]', direction: 'inout', width: 16, clockDomain: 'LSPCLK_50M', resetDomain: 'rst_sys_n', protocol: 'Sideband', cdcStatus: 'same_domain', normal: [0, 0, 1], offset: 0 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: true,
        jasperGoldVerified: true,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 99.4
      },
      children: [
        {
          id: 'ip_sci_uart_blocks',
          name: 'SCI_UART_Modules_A_B',
          displayName: 'Dual SCI (UART) Controllers',
          type: 'ip',
          category: 'peripheral',
          description: 'Standard 16-level FIFO serial communication interface supporting up to 10Mbps',
          level: 2,
          parentId: 'subsys_comm_periph',
          position: [-3.2, 1.8, 12],
          size: [3.4, 0.8, 4.4],
          color: '#db2777',
          clockDomains: ['LSPCLK_50M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_spi_i2c_blocks',
          name: 'SPI_I2C_Controllers',
          displayName: 'SPI A/B/C & Multi-Master I2C',
          type: 'ip',
          category: 'peripheral',
          description: 'High-speed 50MHz SPI serial interfaces with 16-level TX/RX FIFO and standard I2C/SMBus',
          level: 2,
          parentId: 'subsys_comm_periph',
          position: [0.8, 1.8, 12],
          size: [3.4, 0.8, 4.4],
          color: '#db2777',
          clockDomains: ['LSPCLK_50M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_bosch_canfd',
          name: 'Bosch_M_CAN_FD_Controller',
          displayName: 'Bosch M_CAN CAN-FD Engine',
          type: 'ip',
          category: 'peripheral',
          description: 'ISO 11898-1:2015 CAN-FD protocol controller with dedicated 2KB message RAM',
          level: 2,
          parentId: 'subsys_comm_periph',
          position: [4.4, 1.8, 12],
          size: [2.8, 0.9, 4.4],
          color: '#8b5cf6',
          clockDomains: ['AUXCLK_60M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        }
      ]
    },

    // 6. FLASH & SARAM MEMORY WITH SECURITY MODULE (Bottom-Left)
    {
      id: 'subsys_flash_saram',
      name: 'Memory_Security_Subsystem',
      displayName: 'Dual-Bank 1MB Flash + 204KB SARAM (ECC)',
      type: 'subsystem',
      category: 'memory',
      description: 'Zero wait-state 204KB single-cycle shared RAM, 1MB dual-bank Flash with ECC, and Dual-Zone Code Security Module (DCSM)',
      level: 1,
      parentId: 'soc_top',
      position: [-15, 0.8, 9.5],
      size: [10, 1.5, 9],
      color: '#3b82f6',
      clockDomains: ['SYSCLK_200M'],
      resetDomains: ['rst_sys_n'],
      ports: [
        { id: 'p_mem_matrix_s', name: 'S_MEM_AHB[63:0]', direction: 'in', width: 64, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'AHB', cdcStatus: 'same_domain', normal: [1, 0, 0], offset: 0.1 },
        { id: 'p_dcsm_lock', name: 'DCSM_SECURITY_LOCK', direction: 'out', width: 1, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_sys_n', protocol: 'Sideband', cdcStatus: 'clean', normal: [0, 0, -1], offset: -0.2 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: true,
        jasperGoldVerified: true,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 100.0
      },
      children: [
        {
          id: 'ip_flash_ecc_bank',
          name: '1MB_DualBank_Flash_ECC',
          displayName: '1MB Flash with Inline 64b ECC',
          type: 'macro',
          category: 'memory',
          description: 'Dual bank embedded flash allowing Read-While-Write (RWW) with Single-Error Correction, Double-Error Detection (SECDED)',
          level: 2,
          parentId: 'subsys_flash_saram',
          position: [-17, 1.8, 9.5],
          size: [4.4, 0.9, 7.2],
          color: '#1d4ed8',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        },
        {
          id: 'ip_saram_shared_blocks',
          name: '204KB_SingleCycle_SARAM',
          displayName: '204KB Parity/ECC SARAM',
          type: 'ip',
          category: 'memory',
          description: 'Zero wait-state shared memory partitioned across C28x CPUs, CLA, and DMA',
          level: 2,
          parentId: 'subsys_flash_saram',
          position: [-12.2, 1.8, 9.5],
          size: [4.4, 0.9, 7.2],
          color: '#2563eb',
          clockDomains: ['SYSCLK_200M'],
          resetDomains: ['rst_sys_n'],
          ports: []
        }
      ]
    },

    // 7. SYSTEM CONTROL, DUAL PLL & WATCHDOG MACRO (Top-Center)
    {
      id: 'macro_pll_sysctl',
      name: 'System_Control_Dual_PLL_Macro',
      displayName: 'Dual PLL Macro, Watchdog & Clock Detect',
      type: 'macro',
      category: 'analog',
      description: 'System PLL (200MHz), Aux PLL (60MHz), Missing Clock Detect (MCD), Windowed Watchdog (WDT), and Power-On Reset logic',
      level: 1,
      parentId: 'soc_top',
      position: [0, 0.8, -13],
      size: [8, 1.4, 5.5],
      color: '#f59e0b',
      clockDomains: ['SYSCLK_200M', 'AUXCLK_60M', 'INTOSC_10M'],
      resetDomains: ['rst_por_n'],
      ports: [
        { id: 'p_sysclk_dist', name: 'SYSCLK_OUT[3:0]', direction: 'out', width: 4, clockDomain: 'SYSCLK_200M', resetDomain: 'rst_por_n', protocol: 'Sideband', cdcStatus: 'same_domain', normal: [0, 0, 1], offset: 0 }
      ],
      deliverables: {
        maturity: 'v1.0 Tapeout',
        rtlFrozen: true,
        lintClean: true,
        spyglassCdcClean: true,
        jasperGoldVerified: true,
        upfPowerIntent: true,
        timingClosed: true,
        uvmCoveragePercent: 100.0
      }
    }
  ]
};

// 3D Interconnect Highway & Real TI C2000 CDC/RDC Crossings
export const INTERCONNECT_CONNECTIONS: InterconnectConnection[] = [
  // 1. C28x DSP CPU to AXI/AHB Crossbar Matrix (Primary System Bus)
  {
    id: 'conn_c28x_axi_matrix',
    name: 'C28x_CPU_to_AXI_Matrix',
    srcModuleId: 'subsys_c28x_compute',
    srcPortId: 'p_c28x_axi_m',
    dstModuleId: 'bridge_axi_ahb_matrix',
    dstPortId: 'p_matrix_c28x_s',
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
    details: 'Primary 200MHz synchronous bus connecting C28x CPUs with the crossbar switch. Zero CDC risk.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 2. AXI/AHB Matrix to High-Resolution ePWM Control Bridge
  {
    id: 'conn_matrix_to_epwm',
    name: 'AHB_to_ePWM_Control_Bus',
    srcModuleId: 'bridge_axi_ahb_matrix',
    srcPortId: 'p_matrix_ctrl_bridge',
    dstModuleId: 'subsys_epwm_control',
    dstPortId: 'p_epwm_apb_s',
    busType: 'APB3 Control Bus (32-bit)',
    width: 32,
    srcClock: 'SYSCLK_200M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: false,
    cdcStatus: 'same_domain',
    rdcStatus: 'clean',
    syncScheme: 'Synchronous Peripheral Bridge (SYSCLK to EPWM Interface Registers)',
    reportSource: 'cadence_jaspergold',
    edaCheckId: 'CDC_PROVEN_CLEAN',
    details: 'Register configuration interface for ePWM time-base counters, action qualifiers, and dead-band units.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 3. CLEAN: AXI/AHB Matrix to Comm APB Bridge (SYSCLK 200MHz -> LSPCLK 50MHz Synchronous Divider)
  {
    id: 'conn_ahb_to_apb_comm',
    name: 'AHB_to_Comm_APB_Bridge_LSPCLK',
    srcModuleId: 'bridge_axi_ahb_matrix',
    srcPortId: 'p_matrix_comm_bridge',
    dstModuleId: 'subsys_comm_periph',
    dstPortId: 'p_apb_comm_s',
    busType: 'APB v2.0 Bus (32-bit)',
    width: 32,
    srcClock: 'SYSCLK_200M',
    dstClock: 'LSPCLK_50M',
    isCrossClock: false,
    cdcStatus: 'same_domain',
    rdcStatus: 'clean',
    syncScheme: 'Synchronous Integer 1:4 Clock Divider Handshake (LSPCLK = SYSCLK / 4)',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Clock_Check01 (Synchronous Derived)',
    details: 'LSPCLK is derived synchronously from SYSCLK using TI system clock divider. Both clocks share phase relationship; timing closed.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 4. CLEAN ASYNC CDC: CAN-FD Controller to Crossbar Matrix (60MHz AUXCLK <-> 200MHz SYSCLK)
  {
    id: 'conn_canfd_cross',
    name: 'CANFD_MessageRAM_to_Crossbar',
    srcModuleId: 'subsys_comm_periph',
    srcPortId: 'p_canfd_aux_s',
    dstModuleId: 'bridge_axi_ahb_matrix',
    dstPortId: 'p_matrix_comm_bridge',
    busType: 'Dual-Clock Message Buffer FIFO',
    width: 32,
    srcClock: 'AUXCLK_60M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: true,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'Dual-Clock Async FIFO (Depth 16) with Gray Coded Pointers & 2-FF Sync',
    reportSource: 'both',
    edaCheckId: 'Ac_fifo01 / CDC_VALID_FIFO',
    details: 'Verified by Synopsys SpyGlass and Cadence JasperGold. Bosch M_CAN message RAM crossing operates reliably with MTBF > 100,000 years.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 5. VIOLATION: ADC End-of-Conversion Interrupt to C28x CPU PIE Controller (50MHz -> 200MHz)
  {
    id: 'conn_adc_eoc_irq',
    name: 'ADC_EOC_Pulse_to_C28x_PIE',
    srcModuleId: 'macro_analog_subsys',
    srcPortId: 'p_adc_eoc_pulse',
    dstModuleId: 'subsys_c28x_compute',
    dstPortId: 'p_pie_irq_in',
    busType: 'Asynchronous ADC EOC Interrupt Pulse',
    width: 4,
    srcClock: 'ADCCLK_50M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: true,
    cdcStatus: 'violation',
    rdcStatus: 'clean',
    syncScheme: 'Missing Pulse Stretcher / Toggle Synchronizer!',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Ac_unsync01 (SpyGlass Error)',
    details: '1-cycle ADC conversion complete pulse generated in 50MHz ADCCLK domain directly sampled by 200MHz CPU PIE without synchronizer. Risk of missed ADC interrupt or double-triggering in motor current control loop.',
    waiverNote: 'CRITICAL BUG HW-201: Must insert 2-stage toggle pulse synchronizer cell in ADC wrapper.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 6. VIOLATION / RDC HAZARD: CMPSS Analog Over-Current Trip to ePWM Trip-Zone (Sub-25ns Async Trip)
  {
    id: 'conn_cmpss_epwm_trip',
    name: 'CMPSS_Analog_Trip_to_ePWM_TZ',
    srcModuleId: 'macro_analog_subsys',
    srcPortId: 'p_cmpss_trip_out',
    dstModuleId: 'subsys_epwm_control',
    dstPortId: 'p_epwm_tz_trip',
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
    details: 'CMPSS comparator trip output directly drives asynchronous ePWM power stage shutdown. An analog glitch on high-voltage IGBT switching causes spurious motor drive trip.',
    waiverNote: 'OPEN BUG HW-204: Add 3-sample digital qualification window filter in ePWM Trip-Zone.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 7. WAIVER: Flash/SARAM Dual-Code Security Lock (Static Boot Configuration)
  {
    id: 'conn_dcsm_security_lock',
    name: 'DCSM_Zone_Security_Lock',
    srcModuleId: 'subsys_flash_saram',
    srcPortId: 'p_dcsm_lock',
    dstModuleId: 'bridge_axi_ahb_matrix',
    dstPortId: 'p_matrix_mem_m',
    busType: 'Static OTP Security Fuses',
    width: 1,
    srcClock: 'SYSCLK_200M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: false,
    cdcStatus: 'waiver',
    rdcStatus: 'clean',
    syncScheme: 'Quasi-Static Configuration Register (Read once during Boot ROM sequence)',
    reportSource: 'synopsys_spyglass',
    edaCheckId: 'Ac_unsync01 (Waived)',
    details: 'Dual-Zone Code Security Module locks memory partitions during boot. Validated static signal; zero dynamic switching hazard.',
    waiverNote: 'Waiver ticket TI-C2000-W-04 approved by Lead MCU Architect.',
    hierarchicalLevelScope: 'soc_top'
  },

  // 8. PLL Clock Distribution to C28x and Analog
  {
    id: 'conn_pll_sysclk_dist',
    name: 'SYSCLK_Tree_Distribution',
    srcModuleId: 'macro_pll_sysctl',
    srcPortId: 'p_sysclk_dist',
    dstModuleId: 'subsys_c28x_compute',
    dstPortId: 'p_pie_irq_in',
    busType: 'Balanced H-Tree Clock Trunk',
    width: 4,
    srcClock: 'SYSCLK_200M',
    dstClock: 'SYSCLK_200M',
    isCrossClock: false,
    cdcStatus: 'same_domain',
    rdcStatus: 'clean',
    syncScheme: 'Balanced CTS Tree with On-Chip Dynamic Clock Gating',
    reportSource: 'system_check',
    edaCheckId: 'Clock_Tree_Clean',
    details: 'Max on-chip clock skew < 22ps across -40C to 125C automotive grade range.',
    hierarchicalLevelScope: 'soc_top'
  }
];
