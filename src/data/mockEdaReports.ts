import { HardwareIssue, TapeoutMilestone } from '../types/project';

export const RAW_SPYGLASS_SAMPLE_REPORT = `################################################################################
# Synopsys SpyGlass CDC Verification Report - TI C2000 MCU SoC
# Tool Version: SpyGlass 2023.12-SP2
# Project: TI_TMS320F2838xD_Top
# Date: 2026-10-25 11:18:42
################################################################################

[CDC Rule Checklist Summary]
Rule: Ac_unsync01    Errors: 1    Warnings: 1    Status: FAIL (Tapeout Blocker)
Rule: Ac_fifo01      Errors: 0    Warnings: 0    Status: PASS (CAN-FD Async FIFO Clean)
Rule: Ac_conv01      Errors: 0    Warnings: 1    Status: PASS (With Warnings)
Rule: Clock_Check01  Errors: 0    Warnings: 0    Status: PASS (6 Clocks Analyzed)
Rule: Reset_Check01  Errors: 1    Warnings: 0    Status: FAIL (RDC Hazard on ePWM Trip)

[Violations Details]
ID: SG-CDC-001 | Rule: Ac_unsync01 | Severity: ERROR | Status: VIOLATION
  Tx Domain: ADCCLK_50M (Analog Subsystem ADC-A/B)
  Rx Domain: SYSCLK_200M (C28x CPU Peripheral Interrupt Expansion - PIE)
  Tx Flop: analog_subsys.u_adc_a.eoc_pulse_reg
  Rx Flop: c28x_cluster.u_pie.irq_adca_eoc_reg
  Reason: Single-cycle 50MHz ADC End-of-Conversion pulse directly sampled by 200MHz CPU domain.
  Impact: Risk of metastability causing missed motor current sampling interrupt or double execution in FOC loop.

ID: SG-CDC-002 | Rule: Reset_Check01 | Severity: ERROR | Status: VIOLATION
  Tx Domain: ADCCLK_50M (CMPSS Fast Analog Comparator)
  Rx Domain: EPWMCLK_100M (ePWM Power Stage Trip-Zone)
  Tx Flop: analog_subsys.u_cmpss1.trip_raw_out
  Rx Flop: epwm_subsys.u_epwm1.tz_trip_latch_reg
  Reason: Asynchronous analog trip signal lacks multi-sample digital qualification window.
  Impact: High-voltage IGBT switching noise causes spurious motor drive inverter trip.

ID: SG-CDC-003 | Rule: Ac_unsync01 | Severity: WARNING | Status: WAIVED
  Tx Domain: SYSCLK_200M (Flash Security Module)
  Rx Domain: SYSCLK_200M (Crossbar Arbiter)
  Tx Flop: flash_saram_subsys.u_dcsm.zone1_lock_reg
  Rx Flop: axi_ahb_matrix.u_arbiter.sec_lock_reg
  Reason: Static OTP fuse bit read once during device boot sequence.
  Waiver: Approved by TI C2000 Lead MCU Architect (Ticket TI-C2000-W-04).
`;

export const RAW_JASPERGOLD_SAMPLE_REPORT = `################################################################################
# Cadence JasperGold CDC Formal Verification App - Results Table
# Version: JasperGold 2024.03
# Design: TI_TMS320F2838xD_DualCore
# Date: 2026-10-27 16:45:10
################################################################################

+------+----------------------------+---------------+-----------------------+----------------------+--------------------------+
| ID   | Check Type                 | Status        | Tx Domain             | Rx Domain            | Synchronizer Type        |
+------+----------------------------+---------------+-----------------------+----------------------+--------------------------+
| JG01 | CDC_STRUCTURAL_UNSYNC      | VIOLATION     | ADCCLK_50M            | SYSCLK_200M          | None (Missing Pulse Sync)|
| JG02 | CDC_FUNCTIONAL_METASTABLE  | VIOLATION     | ADCCLK_50M            | EPWMCLK_100M         | Direct Async Trip Wire   |
| JG03 | CDC_VALID_FIFO             | PROVEN_CLEAN  | AUXCLK_60M            | SYSCLK_200M          | Dual-Clock Async FIFO    |
| JG04 | CDC_VALID_SYNC_2FF         | PROVEN_CLEAN  | SYSCLK_200M           | LSPCLK_50M           | 1:4 Synchronous Divider  |
| JG05 | CDC_WAIVER_USER            | WAIVED        | SYSCLK_200M           | SYSCLK_200M          | Static DCSM Boot Config  |
+------+----------------------------+---------------+-----------------------+----------------------+--------------------------+

[JasperGold Formal Proof Diagnostic for JG01]
Check: CDC_STRUCTURAL_UNSYNC
Source: analog_subsys.u_adc_a.eoc_pulse_reg (50MHz)
Destination: c28x_cluster.u_pie.irq_adca_eoc_reg (200MHz)
Proof Result: FAILED. High probability of pulse truncation or metastability during motor FOC interrupt entry.
Recommendation: Insert 2-stage toggle pulse stretcher cell in ADC digital wrapper.
`;

export const MOCK_HARDWARE_ISSUES: HardwareIssue[] = [
  {
    id: 'HW-201',
    title: 'Metastability on 50MHz ADC End-of-Conversion (EOC) pulse entering 200MHz C28x PIE',
    description: 'Direct sampling of 50MHz ADC-A EOC signal by 200MHz C28x interrupt controller causes missed interrupt in field-oriented motor control loop. Detected by SpyGlass (Ac_unsync01).',
    severity: 'Blocker',
    status: 'In Progress',
    type: 'CDC Metastability',
    linkedModuleId: 'macro_analog_subsys',
    linkedConnectionId: 'conn_adc_eoc_irq',
    edaToolSource: 'Synopsys SpyGlass',
    edaCheckId: 'Ac_unsync01',
    assignee: 'Sarah Patel (Analog/MCU Lead)',
    createdDate: '2026-10-25',
    targetMilestone: 'v0.8 DV Complete'
  },
  {
    id: 'HW-204',
    title: 'ePWM Trip-Zone asynchronous over-current trip glitch hazard without 3-sample qualification',
    description: 'CMPSS analog comparator trip output directly drives ePWM shutdown logic. Noise on inverter switching triggers false over-current trips. Needs 3-stage digital filter.',
    severity: 'Blocker',
    status: 'Open',
    type: 'RDC Glitch',
    linkedModuleId: 'subsys_epwm_control',
    linkedConnectionId: 'conn_cmpss_epwm_trip',
    edaToolSource: 'Cadence JasperGold',
    edaCheckId: 'CDC_FUNCTIONAL_METASTABLE',
    assignee: 'Alex Chen (Motor Control RTL)',
    createdDate: '2026-10-26',
    targetMilestone: 'v0.8 DV Complete'
  },
  {
    id: 'HW-198',
    title: 'Audit Bosch CAN-FD asynchronous FIFO clock domain crossing to 200MHz SYSCLK',
    description: 'Verify 60MHz AUXCLK to 200MHz SYSCLK Gray pointer synchronization cells maintain MTBF > 100,000 years under ISO 26262 ASIL-D automotive corner.',
    severity: 'Minor',
    status: 'Signed Off',
    type: 'CDC Metastability',
    linkedModuleId: 'subsys_comm_periph',
    linkedConnectionId: 'conn_canfd_cross',
    edaToolSource: 'Cadence JasperGold',
    edaCheckId: 'CDC_VALID_FIFO',
    assignee: 'Diana Vance (DV Signoff)',
    createdDate: '2026-10-20',
    targetMilestone: 'v0.8 DV Complete'
  },
  {
    id: 'HW-182',
    title: 'Verify DCSM Dual-Zone Code Security Module OTP fuse boot waiver',
    description: 'Document quasi-static signal waiver ticket TI-C2000-W-04 for flash security lock bits prior to CPU reset release.',
    severity: 'Minor',
    status: 'Signed Off',
    type: 'CDC Metastability',
    linkedModuleId: 'subsys_flash_saram',
    linkedConnectionId: 'conn_dcsm_security_lock',
    edaToolSource: 'Synopsys SpyGlass',
    edaCheckId: 'Ac_unsync01 (Waived)',
    assignee: 'Priya Sharma (Security Arch)',
    createdDate: '2026-10-18',
    targetMilestone: 'v0.9 Timing Closure'
  }
];

export const TAPEOUT_MILESTONES: TapeoutMilestone[] = [
  {
    id: 'm1',
    name: 'TI C2000 Architecture & Spec Freeze',
    code: 'v0.1 Arch',
    targetDate: '2026-06-30',
    status: 'Completed',
    progressPercent: 100,
    description: 'Dual C28x + Dual CLA ratified, 150ps HRPWM spec finalized, Quad ADC architecture locked'
  },
  {
    id: 'm2',
    name: 'RTL Feature Freeze',
    code: 'v0.5 RTL Freeze',
    targetDate: '2026-08-31',
    status: 'Completed',
    progressPercent: 100,
    description: 'Dual C28x cores, AHB/APB bridges, ePWM1-ePWM8, and Bosch CAN-FD RTL integrated'
  },
  {
    id: 'm3',
    name: 'DV Complete & CDC Sign-off',
    code: 'v0.8 DV Ready',
    targetDate: '2026-11-15',
    status: 'Current',
    progressPercent: 82,
    description: 'Zero unresolved CDC violations in SpyGlass & JasperGold. 98%+ UVM functional coverage on ePWM and ADCs'
  },
  {
    id: 'm4',
    name: 'Static Timing Closure & Analog Sign-off',
    code: 'v0.9 Timing Final',
    targetDate: '2026-12-15',
    status: 'Upcoming',
    progressPercent: 55,
    description: 'Zero negative slack at 200MHz across automotive grade -40C to 125C corners'
  },
  {
    id: 'm5',
    name: 'Silicon Tapeout / Foundry Mask Release',
    code: 'v1.0 Tapeout',
    targetDate: '2027-01-30',
    status: 'Upcoming',
    progressPercent: 20,
    description: 'Foundry automotive qualification, AEC-Q100 Grade 1 compliance checklist 100% green'
  }
];
