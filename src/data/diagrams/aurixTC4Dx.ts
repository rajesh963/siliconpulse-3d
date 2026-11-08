import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = {
  cpu: '#22d3ee',
  bus: '#fbbf24',
  crossbar: '#a78bfa',
  bridge: '#fb923c',
  memory: '#3b82f6',
  peripheral: '#94a3b8',
  accelerator: '#34d399',
  io: '#f472b6',
  security: '#fb7185',
  clock: '#f59e0b',
  debug: '#c084fc',
};

const B = (
  id: string, label: string, x: number, y: number, w: number, h: number,
  kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}
): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });

const W = (
  id: string, points: [number, number][], opts: Partial<DiagramWire> = {}
): DiagramWire => ({ id, points, ...opts });

const CPU_BLOCKS: DiagramBlock[] = [0, 1, 2, 3, 4, 5].map(index => B(
  `cpu${index}`, `CPU${index}`, 50 + index * 140, 55, 110, 90, 'cpu', {
    sublabel: index < 3 ? 'TC1.8 LS · PMI/DMI' : 'TC1.8 · PMI/DMI',
    badges: ['SPB', 'COMPB'],
    moduleId: `inf_cpu${index}`,
    specRef: '§4',
    details: `TriCore 1.8 CPU${index}, lockstep-capable cluster with STM, PMI/DMI, DSPR/PSPR and separate SPB/COMPB ports.`,
  }
));

const SRI_BLOCKS: DiagramBlock[] = [
  B('sri0', 'SRI0  500 MHz', 40, 215, 1410, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_compute', specRef: '§6.1', details: 'SRI0 read/command crossbar domain.' }),
  B('sri1', 'SRI1  500 MHz', 40, 238, 1410, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_compute', specRef: '§6.1', details: 'SRI1 write/data crossbar domain.' }),
  B('sri4', 'SRI4  500 MHz', 1510, 215, 300, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_system', specRef: '§6.2', details: 'SRI4 system/security crossbar.' }),
  B('sri7', 'SRI7  500 MHz', 40, 340, 250, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_periph', specRef: '§6.2', details: 'SRI7 peripheral crossbar feeding FPI0/SPB.' }),
  B('sri6', 'SRI6  500 MHz', 320, 340, 270, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_periph', specRef: '§6.2', details: 'SRI6 peripheral crossbar feeding FPI1/COMPB and high-speed IO.' }),
  B('sri2', 'SRI2  500 MHz', 620, 340, 270, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_memory', specRef: '§6.2', details: 'SRI2 memory crossbar for LMU/NVM.' }),
  B('sri5', 'SRI5  500 MHz', 920, 340, 270, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_system', specRef: '§6.2', details: 'SRI5 system crossbar for GTM/PPU/IO.' }),
  B('sri3', 'SRI3  500 MHz', 1220, 340, 270, 16, 'bus', { color: C.bus, moduleId: 'inf_sri_memory', specRef: '§6.2', details: 'SRI3 memory crossbar for LMU4-9.' }),
  B('fpi0', 'FPI0 SPB  100 MHz', 40, 700, 330, 16, 'bus', { color: '#38bdf8', moduleId: 'inf_fpi0_spb', specRef: '§7', details: 'System Peripheral Bus: SCU, SMU, IR, WTU, FCE, clock, PMS, ports, test.' }),
  B('fpi1', 'FPI1 COMPB  100 MHz', 520, 700, 430, 16, 'bus', { color: '#06b6d4', moduleId: 'inf_fpi1_compb', specRef: '§7', details: 'Communication Peripheral Bus: CAN, CAN-XL, ERAY, ASCLIN, QSPI, SENT, PSI5, MSC, ADC.' }),
];

const BRIDGE_BLOCKS: DiagramBlock[] = [
  B('s2s0', 'S2S', 1456, 215, 40, 52, 'bridge', { color: C.bridge, moduleId: 'inf_bridge_s2s_01_23', specRef: '§6.2', details: 'SRI0/1 → SRI2/3 synchronous S2S bridge.' }),
  B('s2s1', 'S2S', 292, 300, 22, 40, 'bridge', { color: C.bridge, moduleId: 'inf_bridge_s2s_45_67', specRef: '§6.2', details: 'SRI4/5 → SRI6/7 S2S bridge.' }),
  B('s2f', 'S2F', 292, 640, 44, 56, 'bridge', { color: C.bridge, moduleId: 'inf_bridge_s2f_spb', specRef: '§6.2 / §7', details: 'SRI → FPI0/SPB S2F bridge, 5:1 clock ratio.' }),
  B('s2c', 'S2C', 450, 640, 44, 56, 'bridge', { color: C.bridge, moduleId: 'inf_bridge_s2c_compb', specRef: '§6.2 / §7', details: 'SRI → FPI1/COMPB S2C bridge, 5:1 clock ratio.' }),
];

const MID_BLOCKS: DiagramBlock[] = [
  B('geth0', 'GETH0', 62, 278, 86, 42, 'io', { color: C.io, moduleId: 'inf_geth0', specRef: '§14', details: '5 Gbps Gigabit Ethernet MAC 0.' }),
  B('sdma0', 'SDMA0', 600, 278, 90, 42, 'accelerator', { color: C.accelerator, moduleId: 'inf_sdma0', specRef: '§9', details: 'System DMA controller 0.' }),
  B('sdma1', 'SDMA1', 702, 278, 90, 42, 'accelerator', { color: C.accelerator, moduleId: 'inf_sdma1', specRef: '§9', details: 'System DMA controller 1.' }),
  B('hssl', 'HSSL/HSCT', 822, 278, 82, 42, 'io', { color: C.io, moduleId: 'inf_hssl', specRef: '§17', details: 'High-speed serial link, 320 MBaud.' }),
  B('pcie0', 'PCIe0', 916, 278, 66, 42, 'io', { color: C.io, moduleId: 'inf_pcie0', specRef: '§19', details: 'PCIe Gen3 x1 controller 0.' }),
  B('pcie1', 'PCIe1', 992, 278, 66, 42, 'io', { color: C.io, moduleId: 'inf_pcie1', specRef: '§19', details: 'PCIe Gen3 x1 controller 1.' }),
  B('dre', 'DRE', 1070, 278, 76, 42, 'io', { color: C.io, moduleId: 'inf_dre', specRef: '§20', details: 'Data routing engine for inter-peripheral routing.' }),
  B('sram_geth', 'GETH SRAM\n0/1', 1160, 278, 100, 42, 'memory', { color: C.memory, specRef: '§14', details: 'Dedicated GETH packet SRAM.' }),

  B('lmu01', 'LMU0/1', 62, 430, 100, 44, 'memory', { color: C.memory, moduleId: 'inf_lmu_01', specRef: '§10', details: '1 MB shared LMU SRAM, ECC + protection.' }),
  B('lmu23', 'LMU2/3', 172, 430, 100, 44, 'memory', { color: C.memory, moduleId: 'inf_lmu_23', specRef: '§10', details: '1 MB shared LMU SRAM for CPU/SDMA.' }),
  B('lmu46', 'LMU4-6', 282, 430, 100, 44, 'memory', { color: C.memory, moduleId: 'inf_lmu_46', specRef: '§10', details: '1.5 MB shared LMU SRAM.' }),
  B('lmu79', 'LMU7-9', 392, 430, 100, 44, 'memory', { color: C.memory, moduleId: 'inf_lmu_79', specRef: '§10', details: '1.5 MB shared LMU SRAM.' }),
  B('dflash', 'DFLASH/EEPROM', 62, 520, 112, 44, 'memory', { color: C.memory, moduleId: 'inf_dflash', specRef: '§5', details: 'DFLASH0/1 + EEPROM emulation, 1.1 MB.' }),
  B('dmu', 'DMU / PFI', 184, 520, 104, 44, 'memory', { color: C.memory, moduleId: 'inf_dmu', specRef: '§5', details: 'Flash command unit and program flash interface.' }),
  B('pflash', 'PFLASH 0-5', 298, 520, 120, 44, 'memory', { color: C.memory, moduleId: 'inf_pflash_low', specRef: '§5', details: '21 MB program flash with ECC and RWW.' }),
  B('brom', 'BROM', 428, 520, 78, 44, 'memory', { color: C.memory, moduleId: 'inf_brom', specRef: '§5', details: 'Boot ROM / startup software.' }),

  B('gtm', 'eGTM v4.1', 1178, 430, 150, 90, 'accelerator', { color: C.accelerator, moduleId: 'inf_cluster_gtm', specRef: '§44', details: 'ATOM/TOM/TIM/DTM/CMU timer cluster.' }),
  B('ppu', 'PPU', 1340, 430, 120, 90, 'accelerator', { color: C.accelerator, moduleId: 'inf_ppu', specRef: '§13', details: 'Parallel processing unit / vector AI accelerator.' }),

  B('leth', 'LETH', 700, 520, 86, 40, 'io', { color: C.io, specRef: '§15', details: 'Low-power Ethernet MAC (NDA details).' }),
  B('canxl', 'CAN-XL', 798, 520, 86, 40, 'io', { color: C.io, moduleId: 'inf_canxl', specRef: '§22', details: 'CAN-XL 20 Mbit/s controller.' }),
  B('xspi', 'xSPI', 896, 520, 86, 40, 'io', { color: C.io, specRef: '§18', details: 'Expanded serial peripheral interface / external flash.' }),
  B('sdmmc', 'SDMMC', 994, 520, 86, 40, 'io', { color: C.io, specRef: '§29', details: 'Secure Digital / eMMC controller.' }),
  B('geth1', 'GETH1', 1092, 520, 76, 40, 'io', { color: C.io, moduleId: 'inf_geth1', specRef: '§14', details: 'Second 5 Gbps Ethernet MAC.' }),
];

const SECURITY_BLOCKS: DiagramBlock[] = [
  B('csbcu', 'CSBCU', 1510, 300, 70, 34, 'security', { color: C.security, specRef: '§11', details: 'Cyber-security bus control unit (NDA details).' }),
  B('cscu', 'CSCU', 1590, 300, 70, 34, 'security', { color: C.security, specRef: '§12', details: 'Cyber-security control unit (NDA details).' }),
  B('rng', 'RNG', 1670, 300, 52, 34, 'security', { color: C.security, specRef: '§12', details: 'Random number generator.' }),
  B('pkc', 'PKC', 1732, 300, 52, 34, 'security', { color: C.security, specRef: '§12', details: 'Public key crypto accelerator.' }),
  B('csrom', 'CSROM', 1510, 345, 70, 34, 'security', { color: C.security, specRef: '§11', details: 'Cyber-security boot ROM.' }),
  B('css', 'CSS / CSRM', 1590, 345, 132, 34, 'security', { color: C.security, specRef: '§11 / §12', details: 'Cyber-security subsystem and secure resource manager (NDA details).' }),
];

const FPI0_BLOCKS: DiagramBlock[] = [
  B('scu', 'SCU/ERU', 50, 760, 82, 36, 'peripheral', { moduleId: 'inf_scu', specRef: '§35', details: 'System control unit + external request unit.' }),
  B('sbcu', 'SBCU', 142, 760, 82, 36, 'peripheral', { specRef: '§35', details: 'System bus control unit.' }),
  B('smu', 'SMU', 234, 760, 82, 36, 'security', { moduleId: 'inf_smu', specRef: '§42', details: 'Safety and security alarm management unit.' }),
  B('scr', 'SCR', 50, 820, 82, 36, 'clock', { specRef: '§39', details: 'Standby controller.' }),
  B('pms', 'PMS', 142, 820, 82, 36, 'clock', { moduleId: 'inf_pms_smm', specRef: '§36 / §37', details: 'Power management + system mode management.' }),
  B('clock', 'Clock / CCU', 234, 820, 82, 36, 'clock', { specRef: '§32', details: 'PLL, CCU and clock distribution.' }),
  B('smim', 'SMIM', 50, 880, 82, 36, 'peripheral', { specRef: '§35', details: 'System memory interface module.' }),
  B('hsphy', 'HSPHY', 142, 880, 82, 36, 'io', { specRef: '§16', details: 'High-speed PHY logic (NDA details).' }),
  B('vmt', 'VMT', 234, 880, 82, 36, 'debug', { specRef: '§34', details: 'Volatile memory test.' }),
  B('wtu', 'WTU', 50, 940, 82, 36, 'peripheral', { moduleId: 'inf_wtu', specRef: '§41', details: 'Watchdog timer unit.' }),
  B('ports', 'Ports', 142, 940, 82, 36, 'peripheral', { specRef: '§35', details: 'GPIO / port control.' }),
  B('tri', 'TRI', 234, 940, 82, 36, 'debug', { specRef: '§33', details: 'Logic test interface.' }),
];

const FPI1_BLOCKS: DiagramBlock[] = [
  B('ir', 'IR', 50, 1000, 82, 36, 'peripheral', { moduleId: 'inf_ir', specRef: '§40', details: 'Interrupt router, 2048 service requests.' }),
  B('fce', 'FCE', 142, 1000, 82, 36, 'peripheral', { moduleId: 'inf_fce', specRef: '§43', details: 'Flexible CRC engine.' }),
  B('adc', 'ADC / TMADC', 234, 1000, 82, 36, 'peripheral', { moduleId: 'inf_cluster_adc', specRef: '§45', details: 'TMADC, DSADC, FCC and CDSP cluster.' }),
  B('eray', 'ERAY', 326, 1000, 82, 36, 'io', { moduleId: 'inf_eray', specRef: '§23', details: 'FlexRay 2.1 controller.' }),
  B('qspi', 'QSPI', 50, 1060, 82, 36, 'io', { specRef: '§30', details: 'Queued synchronous peripheral interface.' }),
  B('asclin', 'ASCLIN', 142, 1060, 82, 36, 'io', { moduleId: 'inf_asclin', specRef: '§24', details: 'ASCLIN/LIN/SPI channels.' }),
  B('i2c', 'I2C', 234, 1060, 82, 36, 'io', { specRef: '§31', details: 'Inter-integrated circuit controller.' }),
  B('mcmcan', 'MCMCAN', 326, 1060, 82, 36, 'io', { moduleId: 'inf_mcmcan', specRef: '§21', details: 'MCMCAN with 6 CAN FD nodes.' }),
  B('sent', 'SENT', 50, 1120, 82, 36, 'io', { specRef: '§25', details: 'Single edge nibble transmission.' }),
  B('psi5', 'PSI5', 142, 1120, 82, 36, 'io', { specRef: '§26', details: 'Peripheral sensor interface.' }),
  B('psi5s', 'PSI5-S', 234, 1120, 82, 36, 'io', { specRef: '§27', details: 'PSI5 with serial PHY interface.' }),
  B('msc', 'MSC', 326, 1120, 82, 36, 'io', { specRef: '§28', details: 'Micro second channel.' }),
  B('combcu', 'COMBCU', 142, 1180, 82, 36, 'peripheral', { specRef: '§7', details: 'Communication bus control unit.' }),
];

const CPU_WIRES: DiagramWire[] = [0, 1, 2, 3, 4, 5].map(index => W(
  `cpu${index}_sri`, [[105 + index * 140, 145], [105 + index * 140, 215]], {
    from: `cpu${index}`, to: 'sri0', busType: 'SRI 64-bit', width: 64, clock: 'F_SRI_500M',
  }
));
CPU_WIRES.push(W('cpucs_sri4', [[1745, 145], [1745, 215]], { from: 'cpucs', to: 'sri4', busType: 'SRI 64-bit', width: 64, clock: 'F_SRI_500M' }));

const MID_WIRES: DiagramWire[] = [
  W('sri_sdma0', [[645, 254], [645, 278]], { from: 'sri0', to: 'sdma0', width: 64 }),
  W('sri_sdma1', [[747, 254], [747, 278]], { from: 'sri0', to: 'sdma1', width: 64 }),
  W('sri_hssl', [[863, 254], [863, 278]], { from: 'sri1', to: 'hssl', width: 64 }),
  W('sri_pcie0', [[949, 254], [949, 278]], { from: 'sri1', to: 'pcie0', width: 64 }),
  W('sri_pcie1', [[1025, 254], [1025, 278]], { from: 'sri1', to: 'pcie1', width: 64 }),
  W('sri_dre', [[1108, 254], [1108, 278]], { from: 'sri0', to: 'dre', width: 64 }),
  W('sri_sram_geth', [[1210, 254], [1210, 278]], { from: 'sri1', to: 'sram_geth', width: 64 }),
  W('sri_s2s0', [[1450, 223], [1456, 223]], { from: 'sri0', to: 's2s0', width: 64 }),
  W('s2s0_sri4', [[1496, 223], [1510, 223]], { from: 's2s0', to: 'sri4', width: 64 }),

  W('sri7_geth', [[105, 340], [105, 320]], { from: 'sri7', to: 'geth0', width: 64 }),
  W('sri7_s2s1', [[250, 340], [303, 340]], { from: 'sri7', to: 's2s1', width: 64 }),
  W('s2s1_sri6', [[314, 340], [320, 340]], { from: 's2s1', to: 'sri6', width: 64 }),

  W('sri2_lmu01', [[650, 356], [650, 404], [112, 404], [112, 430]], { from: 'sri2', to: 'lmu01', width: 64 }),
  W('sri2_lmu23', [[670, 356], [670, 404], [222, 404], [222, 430]], { from: 'sri2', to: 'lmu23', width: 64 }),
  W('sri2_lmu46', [[690, 356], [690, 404], [332, 404], [332, 430]], { from: 'sri2', to: 'lmu46', width: 64 }),
  W('sri2_lmu79', [[710, 356], [710, 404], [442, 404], [442, 430]], { from: 'sri2', to: 'lmu79', width: 64 }),
  W('sri2_dflash', [[650, 356], [650, 500], [118, 500], [118, 520]], { from: 'sri2', to: 'dflash', width: 64 }),
  W('sri2_dmu', [[670, 356], [670, 500], [236, 500], [236, 520]], { from: 'sri2', to: 'dmu', width: 64 }),
  W('sri2_pflash', [[690, 356], [690, 500], [358, 500], [358, 520]], { from: 'sri2', to: 'pflash', width: 64 }),
  W('sri2_brom', [[710, 356], [710, 500], [467, 500], [467, 520]], { from: 'sri2', to: 'brom', width: 64 }),

  W('sri5_gtm', [[1055, 356], [1055, 404], [1253, 404], [1253, 430]], { from: 'sri5', to: 'gtm', width: 64 }),
  W('sri5_ppu', [[1075, 356], [1075, 404], [1400, 404], [1400, 430]], { from: 'sri5', to: 'ppu', width: 64 }),
  W('sri5_leth', [[980, 356], [980, 500], [743, 500], [743, 520]], { from: 'sri5', to: 'leth', width: 64 }),
  W('sri5_canxl', [[1000, 356], [1000, 500], [841, 500], [841, 520]], { from: 'sri5', to: 'canxl', width: 64 }),
  W('sri5_xspi', [[1020, 356], [1020, 500], [939, 500], [939, 520]], { from: 'sri5', to: 'xspi', width: 64 }),
  W('sri5_sdmmc', [[1040, 356], [1040, 500], [1037, 500], [1037, 520]], { from: 'sri5', to: 'sdmmc', width: 64 }),
  W('sri5_geth1', [[1060, 356], [1060, 500], [1130, 500], [1130, 520]], { from: 'sri5', to: 'geth1', width: 64 }),

  W('sri7_s2f', [[165, 356], [165, 640], [292, 640]], { from: 'sri7', to: 's2f', width: 64 }),
  W('s2f_fpi0', [[336, 668], [336, 700]], { from: 's2f', to: 'fpi0', width: 32, clock: 'F_SPB_100M' }),
  W('sri6_s2c', [[455, 356], [455, 640], [450, 640]], { from: 'sri6', to: 's2c', width: 64 }),
  W('s2c_fpi1', [[494, 668], [520, 668], [520, 700]], { from: 's2c', to: 'fpi1', width: 32, clock: 'F_COMPB_100M' }),

  W('sri4_csbcu', [[1545, 231], [1545, 300]], { from: 'sri4', to: 'csbcu', width: 64 }),
  W('sri4_cscu', [[1625, 231], [1625, 300]], { from: 'sri4', to: 'cscu', width: 64 }),
  W('sri4_rng', [[1696, 231], [1696, 300]], { from: 'sri4', to: 'rng', width: 64 }),
  W('sri4_pkc', [[1758, 231], [1758, 300]], { from: 'sri4', to: 'pkc', width: 64 }),
];

// FPI1 is laid out as a second column for the peripheral-bus layer.
for (const block of FPI1_BLOCKS) {
  block.x += 520;
  block.y -= 240;
}
const fpi1Bus = SRI_BLOCKS.find(block => block.id === 'fpi1');
if (fpi1Bus) { fpi1Bus.x = 520; fpi1Bus.y = 700; fpi1Bus.w = 430; }

const FPI_WIRES: DiagramWire[] = [];
FPI0_BLOCKS.forEach((block, index) => {
  const x = block.x + block.w / 2;
  const y = block.y;
  FPI_WIRES.push(W(`fpi0_${block.id}`, [[x, 716], [x, y]], { from: 'fpi0', to: block.id, width: 32, clock: 'F_SPB_100M' }));
});
FPI1_BLOCKS.forEach(block => {
  const x = block.x + block.w / 2;
  const y = block.y;
  FPI_WIRES.push(W(`fpi1_${block.id}`, [[x, 716], [x, y]], { from: 'fpi1', to: block.id, width: 32, clock: 'F_COMPB_100M' }));
});

const GROUPS: DiagramGroup[] = [
  { id: 'cpu', label: 'TriCore CPU complex — SPB / COMPB', x: 30, y: 25, w: 1420, h: 140, color: '#22d3ee' },
  { id: 'sri', label: 'SRI crossbar fabric', x: 30, y: 195, w: 1800, h: 180, color: '#a78bfa' },
  { id: 'mem', label: 'NVM / LMU memory', x: 30, y: 405, w: 500, h: 180, color: '#3b82f6' },
  { id: 'fpi0', label: 'FPI0 system peripheral bus', x: 30, y: 640, w: 350, h: 350, color: '#38bdf8' },
  { id: 'fpi1', label: 'FPI1 communication peripheral bus', x: 505, y: 640, w: 465, h: 350, color: '#06b6d4' },
  { id: 'gtm', label: 'eGTM / PPU', x: 1160, y: 405, w: 330, h: 165, color: '#34d399' },
  { id: 'security', label: 'Security / HSM', x: 1490, y: 285, w: 310, h: 110, color: '#fb7185' },
  { id: 'hsio', label: 'High-speed IO / DMA', x: 680, y: 500, w: 500, h: 85, color: '#f472b6' },
];

export const AURIX_TC4DX_DIAGRAM: ArchitectureDiagram = {
  id: 'aurix_tc4dx_arch',
  companyId: 'infineon',
  socId: 'infineon',
  title: 'AURIX TC4Dx — architectural block diagram',
  subtitle: 'TriCore CPU · SRI/FPI fabric · NVM/LMU · eGTM/PPU · security · high-speed IO',
  source: 'Infineon AURIX TC4Dx user manual v1.1, Figure 5 / chapters 1–46',
  width: 1850,
  height: 1250,
  groups: GROUPS,
  blocks: [...CPU_BLOCKS, B('cpucs', 'CPUcs', 1680, 55, 130, 90, 'cpu', { sublabel: 'CS TriCore · CSROM', badges: ['SPB', 'COMPB'], moduleId: 'inf_cpucs', specRef: '§4', details: 'Cyber-security TriCore CPUcs with CSROM and security bus.' }), ...SRI_BLOCKS, ...BRIDGE_BLOCKS, ...MID_BLOCKS, ...SECURITY_BLOCKS, ...FPI0_BLOCKS, ...FPI1_BLOCKS],
  wires: [...CPU_WIRES, ...MID_WIRES, ...FPI_WIRES],
  notes: [
    'SPB / COMPB badges mark the two peripheral bus views of each CPU; FPI0 and FPI1 run at 100 MHz (fSRI/5).',
    'S2S = SRI-to-SRI bridge; S2F = SRI-to-FPI0/SPB; S2C = SRI-to-FPI1/COMPB.',
    'Security blocks (CSBCU/CSCU/CSS/CSRM) are marked NDA-only in the public TRM; labels only, no invented programming model.',
  ],
};
