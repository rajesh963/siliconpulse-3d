import { CustomerRequirement, SpecDeltaEvent } from '../types/requirements';

export const RAW_CUSTOMER_EXCEL_CSV_SAMPLE = `ID,Customer Requirement,Category,Priority,Target Value,Impacted Subsystems,Status
CR-C2000-01,Dual Permanent Magnet Motor FOC Control Loop < 1.0us Execution,Performance & Latency,P0 - Mission Critical,< 1.0 us,subsys_c28x_compute;subsys_epwm_control,CDC Verification
CR-C2000-02,High-Resolution ePWM Micro-Edge Positioning Resolution <= 150ps,Interconnect & Bus,P0 - Mission Critical,<= 150 ps,subsys_epwm_control,Sign-off Clean
CR-C2000-03,Quad 16-bit Differential ADC Simultaneous Sampling Rate >= 3.5 MSPS,Safety & CDC,P0 - Mission Critical,3.5 MSPS,macro_analog_subsys;subsys_c28x_compute,ECO / Delta Pending
CR-C2000-04,Automotive ISO 11898-1:2015 CAN-FD 5Mbps with Asynchronous FIFO Bridge,Interconnect & Bus,P1 - High,5.0 Mbps,subsys_comm_periph;bridge_axi_ahb_matrix,DV Verification
CR-C2000-05,CMPSS Fast Analog Overcurrent Trip to ePWM Power Stage Shutdown < 25ns,Safety & CDC,P0 - Mission Critical,< 25 ns,macro_analog_subsys;subsys_epwm_control,ECO / Delta Pending
CR-C2000-06,Dual-Zone Code Security Module (DCSM) Partition Locking with OTP Fuses,Security & Trust,P1 - High,Zero Leakage,subsys_flash_saram;bridge_axi_ahb_matrix,Sign-off Clean`;

export const MOCK_CUSTOMER_REQUIREMENTS: CustomerRequirement[] = [
  {
    id: 'CR-C2000-01',
    customerSpec: 'Dual PMSM Motor Field-Oriented Control (FOC) Loop Execution Time < 1.0 microsecond',
    category: 'Performance & Latency',
    customerPriority: 'P0 - Mission Critical',
    targetValue: '< 1.0 us',
    currentValue: '0.86 us',
    status: 'CDC Verification',
    impactedModuleIds: ['subsys_c28x_compute', 'subsys_epwm_control'],
    architectImpact: {
      microarchChanges: 'Dual C28x cores with hardware Trigonometric Math Unit (TMU) executing sin/cos/atan in 5 cycles. Control Law Accelerator (CLA1) runs current loop in parallel.',
      clockFrequencies: 'SYSCLK: 200 MHz, EPWMCLK: 100 MHz.',
      areaPowerDelta: '+0.12 mm² silicon area; active power 520mW at full 200MHz load.',
      bottleneckAnalysis: 'ADC EOC interrupt latency to C28x PIE must not exceed 6 clock cycles (30ns).'
    },
    managerImpact: {
      tapeoutMilestone: 'v0.8 DV Complete',
      scheduleRisk: 'High',
      estimatedManWeeks: 4,
      owner: 'Sarah Patel (Motor Control Lead)',
      deliverableGate: 'FOC Benchmark Compliance & Dual-Motor Lab Sign-off'
    },
    rtlImpact: {
      moduleHierarchy: 'subsys_c28x_compute.ip_c28x_cpu1, subsys_c28x_compute.ip_cla_accelerators',
      portSignals: 'pie_irq_adca_eoc, tmu_sin_result[31:0], epwm_cmpa_val[15:0]',
      registerMapChanges: 'Added TMU control registers and direct CLA-to-ePWM peripheral access mirror.',
      cdcSynchronizerRequired: 'Must synchronize 50MHz ADC EOC pulse to 200MHz SYSCLK with 2-stage toggle synchronizer.',
      synthesizabilityNote: 'TMU pipeline adder tree timing path tight at 200MHz SSG corner.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'tb_c2000_foc_closed_loop with Cadence Incisive & real-time motor mathematical model.',
      cornerCases: 'Simultaneous ADC interrupts from all 4 SAR cores during PWM dead-band transition.',
      functionalCoverageGoal: 98.0,
      currentCoverage: 98.2,
      formalAssertions: 'assert property (@(posedge clk_sys) adc_eoc |-> ##[1:6] pie_int_asserted).'
    }
  },

  {
    id: 'CR-C2000-02',
    customerSpec: 'High-Resolution ePWM Micro-Edge Positioning (MEP) Step Resolution <= 150 picoseconds',
    category: 'Interconnect & Bus',
    customerPriority: 'P0 - Mission Critical',
    targetValue: '<= 150 ps',
    currentValue: '142 ps',
    status: 'Sign-off Clean',
    impactedModuleIds: ['subsys_epwm_control'],
    architectImpact: {
      microarchChanges: 'Calibrated delay line architecture with software MEP Scale Factor Optimizer (SFO) tracking VDD and temperature drift.',
      clockFrequencies: 'EPWMCLK: 100 MHz, SYSCLK: 200 MHz.',
      areaPowerDelta: '+0.05 mm² analog delay elements; 45mW dynamic power.',
      bottleneckAnalysis: 'Delay line linearity across -40C to 125C automotive junction temperatures.'
    },
    managerImpact: {
      tapeoutMilestone: 'v0.9 Timing Final',
      scheduleRisk: 'Low',
      estimatedManWeeks: 2,
      owner: 'Alex Chen (ePWM Microarchitecture)',
      deliverableGate: 'Silicon Test Bench MEP Linearity DRC Clean'
    },
    rtlImpact: {
      moduleHierarchy: 'subsys_epwm_control.ip_hrpwm_mep',
      portSignals: 'hrpwm_cmpa_hr[7:0], mep_cal_out[7:0], hr_clk_phase',
      registerMapChanges: 'REG_HRPWM_CTRL (0x0080), REG_HRPWM_MEP_STATUS (0x0084).',
      cdcSynchronizerRequired: 'Synchronous edge phase transfer between 100MHz EPWMCLK and 200MHz SYSCLK.',
      synthesizabilityNote: 'Handcrafted foundry delay cells with set_dont_touch directives in Innovus.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'Analog/Mixed-Signal (AMS) co-simulation with Cadence Spectre & SystemVerilog.',
      cornerCases: '100% duty cycle saturation and 0% duty cycle cutoff transitions.',
      functionalCoverageGoal: 100.0,
      currentCoverage: 99.1,
      formalAssertions: 'Formal property verification of MEP edge monotonic advancement.'
    }
  },

  {
    id: 'CR-C2000-03',
    customerSpec: 'Quad 16-bit Differential SAR ADC Simultaneous Sampling Rate >= 3.5 MSPS (700ns Conversion)',
    category: 'Safety & CDC',
    customerPriority: 'P0 - Mission Critical',
    targetValue: '3.5 MSPS (700ns)',
    currentValue: '3.5 MSPS',
    status: 'ECO / Delta Pending',
    impactedModuleIds: ['macro_analog_subsys', 'subsys_c28x_compute'],
    architectImpact: {
      microarchChanges: 'Four independent SAR ADC converters (ADC-A, B, C, D) sampling all 4 motor phase currents synchronously without phase skew.',
      clockFrequencies: 'ADCCLK: 50 MHz (20ns clock period, 35 cycles per 16-bit conversion).',
      areaPowerDelta: '+0.85 mm² foundry analog macro; 180mW power during continuous conversions.',
      bottleneckAnalysis: 'Conversion complete pulse crosses 50MHz ADCCLK to 200MHz SYSCLK (Metastability Violation SG-CDC-001).'
    },
    managerImpact: {
      tapeoutMilestone: 'v0.8 DV Complete',
      scheduleRisk: 'Blocker',
      estimatedManWeeks: 3,
      owner: 'Sarah Patel (Analog/MCU Lead)',
      deliverableGate: 'Zero CDC Violations on ADC EOC & ENOB >= 12.8 bits'
    },
    rtlImpact: {
      moduleHierarchy: 'macro_analog_subsys.ip_quad_adc_cores',
      portSignals: 'adca_result[15:0], adcb_result[15:0], adc_eoc_int_pulse[3:0]',
      registerMapChanges: 'REG_ADC_CTRL (0x0400), REG_ADC_BURST_TRIGGER (0x0408).',
      cdcSynchronizerRequired: 'BLOCKER: Insert 2-stage pulse stretcher synchronizer in ADC wrapper.',
      synthesizabilityNote: 'Differential analog layout with shielded digital ground guard rings.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'Cadence JasperGold CDC Formal App & Questa CDC simulation regression.',
      cornerCases: 'ADC conversion completion coincident with C28x clock gating entry.',
      functionalCoverageGoal: 100.0,
      currentCoverage: 84.0,
      formalAssertions: 'prove -property <CDC_STRUCTURAL_UNSYNC> -source analog_subsys.u_adc_a.eoc_pulse_reg'
    }
  },

  {
    id: 'CR-C2000-04',
    customerSpec: 'Bosch M_CAN CAN-FD 5.0 Mbps Communication with Dual-Clock Asynchronous FIFO Bridge',
    category: 'Interconnect & Bus',
    customerPriority: 'P1 - High',
    targetValue: '5.0 Mbps',
    currentValue: '5.0 Mbps',
    status: 'DV Verification',
    impactedModuleIds: ['subsys_comm_periph', 'bridge_axi_ahb_matrix'],
    architectImpact: {
      microarchChanges: 'Auxiliary PLL provides clean 60MHz AUXCLK to Bosch M_CAN core. Interconnect bridge handles message RAM transactions.',
      clockFrequencies: 'AUXCLK: 60 MHz, SYSCLK: 200 MHz.',
      areaPowerDelta: '+0.15 mm² silicon area; 65mW active power during 5Mbps CAN-FD transmission.',
      bottleneckAnalysis: 'Zero packet loss during heavy DMA bursts to SRAM.'
    },
    managerImpact: {
      tapeoutMilestone: 'v0.8 DV Complete',
      scheduleRisk: 'Low',
      estimatedManWeeks: 2,
      owner: 'Diana Vance (DV Signoff)',
      deliverableGate: 'CiA 601-1 CAN-FD Physical Layer & Protocol Compliance'
    },
    rtlImpact: {
      moduleHierarchy: 'subsys_comm_periph.ip_bosch_canfd',
      portSignals: 'can_tx_pin, can_rx_pin, m_can_ram_addr[11:0], m_can_ram_data[31:0]',
      registerMapChanges: 'Bosch M_CAN register map: CREL, ENDN, DBTP, CCCR, TEST.',
      cdcSynchronizerRequired: 'Gray-coded dual-clock async FIFO (depth 16) with 2-FF synchronizers (Proven Clean).',
      synthesizabilityNote: 'Standard cell placement adjacent to package I/O pads for low parasitic capacitance.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'Bosch CAN-FD VIP with bit-stuffing error and CRC fault injection.',
      cornerCases: 'Bus-off recovery under extreme clock frequency mismatch (+/- 3%).',
      functionalCoverageGoal: 99.0,
      currentCoverage: 99.4,
      formalAssertions: 'JasperGold proven: CDC_VALID_FIFO between AUXCLK and SYSCLK.'
    }
  },

  {
    id: 'CR-C2000-05',
    customerSpec: 'CMPSS Windowed Analog Overcurrent Trip to ePWM Power Stage Shutdown < 25 Nanoseconds',
    category: 'Safety & CDC',
    customerPriority: 'P0 - Mission Critical',
    targetValue: '< 25 ns',
    currentValue: '18 ns',
    status: 'ECO / Delta Pending',
    impactedModuleIds: ['macro_analog_subsys', 'subsys_epwm_control'],
    architectImpact: {
      microarchChanges: 'Direct analog trip path from CMPSS high-speed comparator to ePWM Trip-Zone (TZ) bypassing CPU software.',
      clockFrequencies: 'ADCCLK: 50 MHz, EPWMCLK: 100 MHz.',
      areaPowerDelta: '+0.08 mm² comparator and reference DAC logic; 25mW power.',
      bottleneckAnalysis: 'Switching noise on inverter IGBT requires 3-sample digital qualification filter.'
    },
    managerImpact: {
      tapeoutMilestone: 'v0.8 DV Complete',
      scheduleRisk: 'Blocker',
      estimatedManWeeks: 3,
      owner: 'Alex Chen (Motor Control RTL)',
      deliverableGate: 'ISO 26262 ASIL-D Functional Safety Hardware Hazard Sign-off'
    },
    rtlImpact: {
      moduleHierarchy: 'subsys_epwm_control.ip_epwm_cluster',
      portSignals: 'cmpss_trip_out[6:0], epwm_tz_trip_latch, pwm_hi_low_shutdown',
      registerMapChanges: 'REG_TZSEL (0x0180), REG_TZCTL (0x0184), REG_CMPSS_RAMP_DEC (0x0188).',
      cdcSynchronizerRequired: 'BLOCKER: Insert 3-sample digital qualification filter window to eliminate RDC glitch.',
      synthesizabilityNote: 'Asynchronous set/reset timing path must be validated in PrimeTime with timing waivers.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'Mixed-signal motor fault simulation with SPICE analog comparator behavioral model.',
      cornerCases: 'Sub-nanosecond glitch injection during dead-band state transitions.',
      functionalCoverageGoal: 100.0,
      currentCoverage: 88.0,
      formalAssertions: 'JasperGold proved violation: CDC_FUNCTIONAL_METASTABLE on unsynchronized trip wire.'
    }
  },

  {
    id: 'CR-C2000-06',
    customerSpec: 'Dual-Zone Code Security Module (DCSM) Partition Locking with One-Time Programmable (OTP) Fuses',
    category: 'Security & Trust',
    customerPriority: 'P1 - High',
    targetValue: 'Zero IP Leakage',
    currentValue: 'Locked & Verified',
    status: 'Sign-off Clean',
    impactedModuleIds: ['subsys_flash_saram', 'bridge_axi_ahb_matrix'],
    architectImpact: {
      microarchChanges: 'Hardware partition firewall dividing Flash and SARAM into Zone 1, Zone 2, and Unsecure areas with 128-bit password authentication.',
      clockFrequencies: 'SYSCLK: 200 MHz.',
      areaPowerDelta: '+0.04 mm² security fuse decoder; zero dynamic power overhead.',
      bottleneckAnalysis: 'JTAG boundary scan lockout when security bits are programmed.'
    },
    managerImpact: {
      tapeoutMilestone: 'v1.0 Tapeout',
      scheduleRisk: 'Low',
      estimatedManWeeks: 1,
      owner: 'Priya Sharma (Security Arch)',
      deliverableGate: 'Automotive Security Pen-Testing & JTAG Lockout Sign-off'
    },
    rtlImpact: {
      moduleHierarchy: 'subsys_flash_saram.ip_saram_shared_blocks',
      portSignals: 'dcsm_zone1_lock, dcsm_zone2_lock, jtag_sec_override_n',
      registerMapChanges: 'DCSM registers: Z1_CR, Z1_GRABSECTR, Z2_CR, Z2_GRABSECTR.',
      cdcSynchronizerRequired: 'Quasi-static configuration waiver approved (TI-C2000-W-04).',
      synthesizabilityNote: 'Anti-fuse macro hardened against physical FIB (Focused Ion Beam) probing.'
    },
    dvImpact: {
      uvmTestbenchEnv: 'Security verification suite probing illegal memory read/write accesses from unauthorized master.',
      cornerCases: 'Concurrent CLA access to locked Zone 1 SARAM while CPU1 attempts password unlock.',
      functionalCoverageGoal: 100.0,
      currentCoverage: 100.0,
      formalAssertions: 'Formal security proof: assert property (zone_locked && !password_match |-> read_data == 0x00000000).'
    }
  }
];

export const MOCK_SPEC_DELTAS: SpecDeltaEvent[] = [
  {
    id: 'ECO-C2000-01',
    title: 'Customer Mandates ISO 26262 ASIL-D Trip-Zone Qualification Filter',
    timestamp: '1 hour ago',
    requestedBy: 'Tier-1 EV Inverter Safety Lead',
    affectedReqId: 'CR-C2000-05',
    fromValue: 'Raw CMPSS Trip Wire (< 25ns)',
    toValue: 'Qualified 3-Sample Filtered Trip (Zero False Glitch)',
    impactSummary: {
      architect: 'Inserted 3-sample digital glitch filter in ePWM Trip-Zone; adds 30ns latency but prevents spurious inverter shutdown.',
      manager: 'Designated as Tape-out Blocker; 3 engineering man-weeks assigned to resolve open hardware issue HW-204.',
      rtl: 'Modifying subsys_epwm_control.ip_epwm_cluster to add REG_TZQSEL qualification mode.',
      dv: 'JasperGold CDC formal assertion updated to prove metastability freedom on qualified trip wire.'
    }
  },
  {
    id: 'ECO-C2000-02',
    title: 'ADC End-of-Conversion (EOC) Pulse Synchronizer Insertion',
    timestamp: 'Yesterday',
    requestedBy: 'TI System Engineering & DV',
    affectedReqId: 'CR-C2000-03',
    fromValue: 'Direct 50MHz to 200MHz Crossing (SpyGlass Ac_unsync01)',
    toValue: '2-Stage Toggle Pulse Stretcher Synchronizer',
    impactSummary: {
      architect: 'Preserves single-cycle interrupt edge across 50MHz ADCCLK to 200MHz SYSCLK boundary.',
      manager: 'Resolves Blocker Issue HW-201; clears path for v0.8 DV Complete milestone.',
      rtl: 'Instantiating SYNC2_HD_X2 foundry synchronizer cell in analog_subsys.ip_quad_adc_cores.',
      dv: 'Formal proof in progress in Cadence JasperGold CDC app.'
    }
  }
];
