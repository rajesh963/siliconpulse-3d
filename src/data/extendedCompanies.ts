import type {
  ClockDomainInfo,
  InterconnectConnection,
  ModuleNode,
  PowerDomainInfo,
  ResetDomainInfo,
} from '../types/soc';
import type { CompanySoCEntry } from './socCatalog';

type Category = ModuleNode['category'];

interface ChildSpec {
  name: string;
  displayName?: string;
  description: string;
  category?: Category;
  type?: ModuleNode['type'];
}

interface ClusterSpec {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: Category;
  color: string;
  shortLabel: string;
  subtitle: string;
  children: ChildSpec[];
}

interface CompanyBuild {
  id: 'arm' | 'broadcom' | 'samsung' | 'apple' | 'mediatek' | 'ti_c29x' | 'amd';
  companyName: string;
  chipModel: string;
  trmDocumentId: string;
  tagline: string;
  processNode: string;
  primaryApp: string;
  brandColor: string;
  badgeSymbol: string;
  clocks: ClockDomainInfo[];
  resets: ResetDomainInfo[];
  powers: PowerDomainInfo[];
  memoryMap: CompanySoCEntry['memoryMap'];
  clusters: ClusterSpec[];
}

const SLOT_POSITIONS: [number, number][] = [
  [-15, -11.5], [0, -11.5], [15, -11.5],
  [-15, 0], [0, 0], [15, 0],
  [-15, 11.5], [0, 11.5], [15, 11.5],
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const buildHierarchy = (build: CompanyBuild): ModuleNode => {
  const clusterNodes = build.clusters.map((cluster, index) => {
    const cols = cluster.children.length <= 2 ? cluster.children.length : cluster.children.length === 3 ? 3 : 3;
    const rows = Math.ceil(cluster.children.length / cols);
    const childW = cols === 2 ? 5.6 : cols === 3 ? 3.8 : 5.6;
    const childD = rows === 1 ? 3.4 : 3.2;
    const gapX = cols === 2 ? 0.5 : 0.35;
    const gapZ = 0.45;

    const children = cluster.children.map((child, childIndex) => {
      const row = Math.floor(childIndex / cols);
      const col = childIndex % cols;
      const itemsInRow = Math.min(cols, cluster.children.length - row * cols);
      const x = (col - (itemsInRow - 1) / 2) * (childW + gapX);
      const z = (row - (rows - 1) / 2) * (childD + gapZ);
      return {
        id: `${cluster.id}__${slug(child.name)}`,
        name: child.name,
        displayName: child.displayName ?? child.name,
        description: child.description,
        type: child.type ?? 'ip',
        category: child.category ?? cluster.category,
        level: 2,
        parentId: cluster.id,
        position: [x, 0.4, z] as [number, number, number],
        size: [childW, 0.8, childD] as [number, number, number],
        color: cluster.color,
        clockDomains: [build.clocks[index % build.clocks.length].name],
        resetDomains: build.resets.filter(r => r.name !== 'rst_dbg_n').map(r => r.name),
        powerDomains: [build.powers[0].name],
        ports: [],
        docRef: `${build.trmDocumentId} · public block summary`,
      } satisfies ModuleNode;
    });

    const [x, z] = SLOT_POSITIONS[index];
    return {
      id: cluster.id,
      name: cluster.name,
      displayName: cluster.displayName,
      description: cluster.description,
      type: 'subsystem',
      category: cluster.category,
      level: 1,
      parentId: `${build.id}_soc_top`,
      position: [x, 0.9, z] as [number, number, number],
      size: [13, 1.8, 9] as [number, number, number],
      color: cluster.color,
      clockDomains: build.clocks.map(c => c.name),
      resetDomains: build.resets.map(r => r.name),
      powerDomains: [build.powers[index % build.powers.length].name],
      ports: [],
      shortLabel: cluster.shortLabel,
      subtitle: cluster.subtitle,
      children,
      docRef: `${build.trmDocumentId} · public block summary`,
    } satisfies ModuleNode;
  });

  return {
    id: `${build.id}_soc_top`,
    name: build.chipModel.split(' ')[0],
    displayName: build.chipModel,
    description: build.tagline,
    type: 'subsystem',
    category: 'compute',
    level: 0,
    parentId: null,
    position: [0, 0, 0],
    size: [48, 0.8, 38],
    color: '#0e162b',
    clockDomains: build.clocks.map(c => c.name),
    resetDomains: build.resets.map(r => r.name),
    powerDomains: build.powers.map(p => p.name),
    ports: [],
    children: clusterNodes,
  };
};

const buildConnections = (build: CompanyBuild): InterconnectConnection[] => {
  const c = build.clusters;
  const conn = (
    id: string,
    name: string,
    src: string,
    dst: string,
    srcClock: string,
    dstClock: string,
    cdc: InterconnectConnection['cdcStatus'],
    width = 64,
    bus = 'AXI4 / coherent fabric',
    sync = 'Synchronous NoC'
  ): InterconnectConnection => ({
    id,
    name,
    srcModuleId: src,
    srcPortId: '',
    dstModuleId: dst,
    dstPortId: '',
    busType: bus,
    width,
    srcClock,
    dstClock,
    isCrossClock: srcClock !== dstClock,
    cdcStatus: cdc,
    rdcStatus: 'clean',
    syncScheme: sync,
    reportSource: 'system_check',
    edaCheckId: cdc === 'violation' ? 'CDC_STRUCTURAL_UNSYNC' : 'CDC_VALID_SYNC',
    details: `${name} — public architecture-level connectivity for ${build.chipModel}.`,
    hierarchicalLevelScope: 'soc_top',
  });
  const k = build.clocks;
  return [
    conn(`${build.id}_cpu_noc`, 'CPU to coherent NoC', c[0].id, c[3].id, k[0].name, k[0].name, 'clean'),
    conn(`${build.id}_gpu_noc`, 'GPU to coherent NoC', c[1].id, c[3].id, k[1 % k.length].name, k[0].name, 'clean', 128, 'AXI4 / CHI', 'Async FIFO'),
    conn(`${build.id}_mem_noc`, 'NoC to memory controller', c[3].id, c[4].id, k[0].name, k[2 % k.length].name, 'clean', 128, 'AXI4 / CHI'),
    conn(`${build.id}_io_noc`, 'NoC to IO fabric', c[3].id, c[6].id, k[0].name, k[3 % k.length].name, 'waiver', 64, 'AXI4', 'Structural clock-ratio waiver'),
    conn(`${build.id}_sec_irq`, 'Security interrupt to CPU', c[5].id, c[0].id, k[2 % k.length].name, k[0].name, 'violation', 8, 'Sideband IRQ', 'Unsynchronized level IRQ'),
    conn(`${build.id}_pmu_clk`, 'PMU clock / DVFS to CPU', c[7].id, c[0].id, k[0].name, k[0].name, 'clean', 1, 'Sideband clock', 'Synchronous DVFS handshake'),
  ];
};

const makeCompany = (build: CompanyBuild): CompanySoCEntry => ({
  id: build.id,
  companyName: build.companyName,
  chipModel: build.chipModel,
  trmDocumentId: build.trmDocumentId,
  tagline: build.tagline,
  processNode: build.processNode,
  primaryApp: build.primaryApp,
  brandColor: build.brandColor,
  badgeSymbol: build.badgeSymbol,
  memoryMap: build.memoryMap,
  hierarchy: buildHierarchy(build),
  connections: buildConnections(build),
  clockDomains: build.clocks,
  resetDomains: build.resets,
  powerDomains: build.powers,
});

const ARM_BUILD: CompanyBuild = {
  id: 'arm',
  companyName: 'Arm',
  chipModel: 'Arm Total Compute 2024 Reference',
  trmDocumentId: 'Arm Total Compute Solutions 2024 public documentation',
  tagline: 'CSS reference SoC: Cortex-X4/A720/A520, Mali-G720, Ethos-U85, CMN-700',
  processNode: '3nm reference flow',
  primaryApp: 'Premium Android, AI PC, automotive compute',
  brandColor: '#0091bd',
  badgeSymbol: 'ARM',
  clocks: [
    { name: 'F_CORE_3G', freqMhz: 3000, color: '#00f2fe', description: 'Cortex-X4/A720/A520 core cluster clock' },
    { name: 'F_GPU_1G', freqMhz: 1000, color: '#76b900', description: 'Mali-G720 GPU core clock' },
    { name: 'F_MEM_6G', freqMhz: 6000, color: '#3b82f6', description: 'LPDDR5X memory interface clock' },
    { name: 'F_IO_500M', freqMhz: 500, color: '#ec4899', description: 'PCIe/USB/display IO clock' },
    { name: 'F_AI_1G', freqMhz: 1000, color: '#f59e0b', description: 'Ethos-U85 NPU clock' },
  ],
  resets: [
    { name: 'rst_arm_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '0.7 V', color: '#00f2fe', description: 'CPU cluster core domain' },
    { name: 'PD_GPU', voltage: '0.75 V', color: '#76b900', description: 'Mali GPU domain' },
    { name: 'PD_MEM', voltage: '1.05 V', color: '#3b82f6', description: 'LPDDR/DMC domain' },
    { name: 'PD_IO', voltage: '1.8 V', color: '#ec4899', description: 'IO and display domain' },
    { name: 'PD_STANDBY', voltage: '0.6 V', color: '#a855f7', description: 'Always-on / SCP domain' },
  ],
  memoryMap: [
    { region: 'DRAM (LPDDR5X)', startAddr: '0x8000_0000', endAddr: '0xFFFF_FFFF', size: '2 GB window', busMaster: 'CMN-700 / DMC-700', description: 'Public reference memory window for the CSS platform' },
    { region: 'GIC-700 distributor', startAddr: '0x2C00_0000', endAddr: '0x2C00_FFFF', size: '64 KB', busMaster: 'GIC-700', description: 'Interrupt distributor and redistributor frame' },
    { region: 'SCP / PMU SRAM', startAddr: '0x1C00_0000', endAddr: '0x1C0F_FFFF', size: '1 MB', busMaster: 'SCP-firmware', description: 'System control processor firmware and telemetry' },
  ],
  clusters: [
    { id: 'arm_cluster_cpu', name: 'CPU_Cluster', displayName: 'Cortex-X4 / A720 / A520 CPU Cluster', description: 'Armv9.2 CPU cluster with DSU-120 and 3 nm physical implementation', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: 'X4 + A720 + A520', children: [
      { name: 'Cortex-X4', description: 'Armv9.2 flagship performance core' },
      { name: 'Cortex-A720', description: 'Armv9.2 balanced performance core' },
      { name: 'Cortex-A520', description: 'Armv9.2 efficiency core' },
      { name: 'DSU-120', description: 'DynamIQ Shared Unit and L3 cache' },
    ] },
    { id: 'arm_cluster_gpu', name: 'GPU_Cluster', displayName: 'Mali-G720 GPU', description: 'Arm Immortalis/Mali GPU cluster with tiling and hardware ray tracing', category: 'compute', color: '#76b900', shortLabel: 'GPU', subtitle: 'Mali-G720', children: [
      { name: 'Mali-G720', description: 'Graphics processor with 10+ shader cores' },
      { name: 'Mali-G620', description: 'Secondary GPU configuration IP' },
      { name: 'GPU_MMU', description: 'GPU memory management unit' },
      { name: 'Job_Manager', description: 'GPU scheduling and command stream front end' },
    ] },
    { id: 'arm_cluster_ai', name: 'AI_Cluster', displayName: 'Ethos-U85 NPU', description: 'MicroNPU for edge inference and transformer acceleration', category: 'compute', color: '#f59e0b', shortLabel: 'NPU', subtitle: 'Ethos-U85', children: [
      { name: 'Ethos-U85', description: 'Neural processing unit for INT8/INT16 inference' },
      { name: 'NPU_SRAM', description: 'Local tensor and weight scratchpad' },
      { name: 'NPU_DMA', description: 'Tensor DMA engine' },
      { name: 'AI_Accel', description: 'Auxiliary matrix acceleration block' },
    ] },
    { id: 'arm_cluster_noc', name: 'Coherent_NoC', displayName: 'CMN-700 Coherent Mesh', description: 'Arm Coherent Mesh Network with GIC-700 and MMU-700', category: 'interconnect', color: '#8b5cf6', shortLabel: 'NOC', subtitle: 'CMN-700 fabric', children: [
      { name: 'CMN-700', description: 'Coherent mesh interconnect' },
      { name: 'GIC-700', description: 'Generic interrupt controller' },
      { name: 'MMU-700', description: 'System memory management unit' },
      { name: 'NI-700', description: 'Network interconnect for peripherals' },
    ] },
    { id: 'arm_cluster_mem', name: 'Memory_Subsystem', displayName: 'LPDDR5X Memory Subsystem', description: 'DMC-700 controller and LPDDR5X PHY', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'LPDDR5X / DMC-700', children: [
      { name: 'DMC-700', description: 'Dynamic memory controller' },
      { name: 'LPDDR5X_PHY', description: 'High-speed memory PHY' },
      { name: 'SRAM', description: 'On-chip SRAM banks' },
      { name: 'SLC', description: 'System level cache' },
    ] },
    { id: 'arm_cluster_security', name: 'Security_Cluster', displayName: 'TrustZone & Crypto', description: 'Arm security IP and secure boot chain', category: 'security', color: '#f43f5e', shortLabel: 'SEC', subtitle: 'TrustZone / CryptoCell', children: [
      { name: 'TrustZone', description: 'Secure/non-secure world isolation' },
      { name: 'CryptoCell-713', description: 'Hardware cryptography and key management' },
      { name: 'Secure_Enclave', description: 'Isolated secure execution environment' },
      { name: 'TZ_MPC', description: 'TrustZone memory protection controller' },
    ] },
    { id: 'arm_cluster_io', name: 'IO_Cluster', displayName: 'PCIe / USB4 / Display IO', description: 'High-speed IO controllers and display pipeline', category: 'peripheral', color: '#ec4899', shortLabel: 'IO', subtitle: 'PCIe · USB4 · Display', children: [
      { name: 'PCIe_Gen4', description: 'PCIe Gen4 controller' },
      { name: 'USB4', description: 'USB4 / Thunderbolt-compatible controller' },
      { name: 'Ethernet', description: 'Multi-gigabit Ethernet MAC' },
      { name: 'Display', description: 'Display controller and DSI/DP PHY' },
    ] },
    { id: 'arm_cluster_pmu', name: 'PMU_Clock', displayName: 'SCP / PMU / Clock', description: 'System control processor, DVFS and thermal management', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'SCP · DVFS · Thermal', children: [
      { name: 'SCP', description: 'System control processor firmware' },
      { name: 'PLL_CCU', description: 'PLL and clock control unit' },
      { name: 'Thermal', description: 'Thermal sensors and throttling' },
      { name: 'DVFS', description: 'Dynamic voltage/frequency scaling' },
    ] },
  ],
};

const BROADCOM_BUILD: CompanyBuild = {
  id: 'broadcom',
  companyName: 'Broadcom',
  chipModel: 'BCM2712 (Raspberry Pi 5)',
  trmDocumentId: 'Broadcom BCM2712 public datasheet / Raspberry Pi documentation',
  tagline: '4x Cortex-A76, VideoCore VII, PCIe 2.0 x4, USB3 and dual 4Kp60 HDMI',
  processNode: '16nm',
  primaryApp: 'Edge computing, media, industrial SBC',
  brandColor: '#cc0000',
  badgeSymbol: 'BCM',
  clocks: [
    { name: 'F_CPU_2P4G', freqMhz: 2400, color: '#00f2fe', description: 'Cortex-A76 core clock' },
    { name: 'F_GPU_800M', freqMhz: 800, color: '#76b900', description: 'VideoCore VII clock' },
    { name: 'F_DDR_4P2G', freqMhz: 4267, color: '#3b82f6', description: 'LPDDR4X memory clock' },
    { name: 'F_IO_500M', freqMhz: 500, color: '#ec4899', description: 'PCIe/USB/Ethernet IO clock' },
    { name: 'F_ISP_600M', freqMhz: 600, color: '#eab308', description: 'ISP and camera clock' },
  ],
  resets: [
    { name: 'rst_bcm_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '0.9 V', color: '#00f2fe', description: 'CPU core domain' },
    { name: 'PD_GPU', voltage: '0.85 V', color: '#76b900', description: 'VideoCore GPU domain' },
    { name: 'PD_DDR', voltage: '1.1 V', color: '#3b82f6', description: 'LPDDR4X domain' },
    { name: 'PD_IO', voltage: '3.3 V', color: '#ec4899', description: 'PCIe/USB/HDMI IO domain' },
    { name: 'PD_STANDBY', voltage: '0.8 V', color: '#a855f7', description: 'Always-on PMU domain' },
  ],
  memoryMap: [
    { region: 'DRAM (LPDDR4X)', startAddr: '0x0000_0000', endAddr: '0x3FFF_FFFF', size: '1 GB window', busMaster: 'DDR controller', description: 'Public BCM2712 memory window' },
    { region: 'Peripheral aperture', startAddr: '0x7C00_0000', endAddr: '0x7FFF_FFFF', size: '64 MB', busMaster: 'AXI peripheral fabric', description: 'Public peripheral register aperture' },
    { region: 'VideoCore / ISP', startAddr: '0x7E00_0000', endAddr: '0x7EFF_FFFF', size: '16 MB', busMaster: 'VideoCore VII', description: 'GPU, ISP and display register space' },
  ],
  clusters: [
    { id: 'bcm_cluster_cpu', name: 'CPU_Cluster', displayName: '4x Cortex-A76 CPU Cluster', description: 'Quad-core Arm Cortex-A76 application processor', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: '4x Cortex-A76', children: [
      { name: 'Cortex-A76', description: 'Armv8.2-A out-of-order application core' },
      { name: 'L2_Cache', description: 'Per-core L2 cache' },
      { name: 'SCU', description: 'Snoop control unit' },
      { name: 'Debug', description: 'CoreSight debug and trace' },
    ] },
    { id: 'bcm_cluster_gpu', name: 'GPU_Cluster', displayName: 'VideoCore VII GPU', description: 'Broadcom graphics, ISP and display pipeline', category: 'compute', color: '#76b900', shortLabel: 'GPU', subtitle: 'VideoCore VII', children: [
      { name: 'VideoCore_VII', description: 'Broadcom programmable graphics core' },
      { name: 'ISP', description: 'Image signal processor' },
      { name: 'HVS', description: 'Hardware video scaler' },
      { name: 'Display', description: 'Dual 4Kp60 HDMI display pipeline' },
    ] },
    { id: 'bcm_cluster_media', name: 'Media_Cluster', displayName: 'Video Encode / Decode', description: 'HEVC, H.264 and VP9 media acceleration', category: 'peripheral', color: '#10b981', shortLabel: 'MEDIA', subtitle: 'HEVC / VP9', children: [
      { name: 'HEVC_Decode', description: 'HEVC/H.265 decode engine' },
      { name: 'H264_Decode', description: 'H.264 decode engine' },
      { name: 'VP9_Decode', description: 'VP9 decode engine' },
      { name: 'Audio', description: 'Audio DMA and HDMI audio' },
    ] },
    { id: 'bcm_cluster_pcie', name: 'PCIe_USB', displayName: 'PCIe 2.0 x4 + USB3', description: 'High-speed expansion and storage interfaces', category: 'peripheral', color: '#8b5cf6', shortLabel: 'PCIE', subtitle: 'PCIe x4 · USB3', children: [
      { name: 'PCIe_x4', description: 'PCIe 2.0 x4 root complex' },
      { name: 'USB3', description: 'Dual USB 3.0 host controllers' },
      { name: 'USB2', description: 'USB 2.0 host controllers' },
      { name: 'SDIO', description: 'SDIO / eMMC interface' },
    ] },
    { id: 'bcm_cluster_eth', name: 'Ethernet_Cluster', displayName: 'Gigabit Ethernet', description: 'Gigabit MAC, PHY and PTP timestamping', category: 'peripheral', color: '#06b6d4', shortLabel: 'ETH', subtitle: 'GbE + PTP', children: [
      { name: 'GbE_MAC', description: 'Gigabit Ethernet MAC' },
      { name: 'GbE_PHY', description: 'RGMII PHY interface' },
      { name: 'PTP', description: 'IEEE 1588 timestamp unit' },
      { name: 'MDIO', description: 'Management data interface' },
    ] },
    { id: 'bcm_cluster_mem', name: 'Memory_Subsystem', displayName: 'LPDDR4X Memory', description: 'Memory controller, PHY and boot ROM', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'LPDDR4X', children: [
      { name: 'DDR_Controller', description: 'LPDDR4X memory controller' },
      { name: 'DDR_PHY', description: 'Memory physical layer' },
      { name: 'SRAM', description: 'On-chip SRAM' },
      { name: 'Boot_ROM', description: 'Boot ROM and SPI boot' },
    ] },
    { id: 'bcm_cluster_security', name: 'Security_Cluster', displayName: 'Secure Boot & Crypto', description: 'One-time programmable keys and secure boot', category: 'security', color: '#f43f5e', shortLabel: 'SEC', subtitle: 'Secure boot', children: [
      { name: 'Secure_Boot', description: 'Verified boot chain' },
      { name: 'OTP', description: 'One-time programmable key store' },
      { name: 'Crypto', description: 'AES/SHA/RSA acceleration' },
      { name: 'RNG', description: 'True random number generator' },
    ] },
    { id: 'bcm_cluster_pmu', name: 'PMU_Clock', displayName: 'PMU / Clock / Thermal', description: 'Power management, DVFS and thermal control', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'DVFS · Thermal', children: [
      { name: 'PMIC_IF', description: 'PMIC control interface' },
      { name: 'DVFS', description: 'Voltage/frequency scaling' },
      { name: 'Thermal', description: 'Thermal sensor and throttling' },
      { name: 'Clock', description: 'PLL and clock distribution' },
    ] },
  ],
};

const SAMSUNG_BUILD: CompanyBuild = {
  id: 'samsung',
  companyName: 'Samsung',
  chipModel: 'Exynos 2400',
  trmDocumentId: 'Samsung Exynos 2400 public product brief',
  tagline: 'Cortex-X4/A720/A520, Xclipse 940 (RDNA 3), dual-core NPU and 5G modem',
  processNode: '4nm Samsung SF4',
  primaryApp: 'Flagship smartphones, AI mobile, XR',
  brandColor: '#1428a0',
  badgeSymbol: 'SS',
  clocks: [
    { name: 'F_CPU_3P2G', freqMhz: 3200, color: '#00f2fe', description: 'Cortex-X4/A720/A520 cluster clock' },
    { name: 'F_GPU_1G', freqMhz: 1000, color: '#a855f7', description: 'Xclipse 940 GPU clock' },
    { name: 'F_NPU_1G', freqMhz: 1000, color: '#f59e0b', description: 'Dual-core NPU clock' },
    { name: 'F_MEM_8P5G', freqMhz: 8533, color: '#3b82f6', description: 'LPDDR5X memory clock' },
    { name: 'F_IO_500M', freqMhz: 500, color: '#ec4899', description: 'Modem/IO clock' },
  ],
  resets: [
    { name: 'rst_exynos_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '0.75 V', color: '#00f2fe', description: 'CPU cluster domain' },
    { name: 'PD_GPU', voltage: '0.8 V', color: '#a855f7', description: 'Xclipse GPU domain' },
    { name: 'PD_NPU', voltage: '0.8 V', color: '#f59e0b', description: 'NPU domain' },
    { name: 'PD_MEM', voltage: '1.05 V', color: '#3b82f6', description: 'LPDDR5X domain' },
    { name: 'PD_IO', voltage: '1.8 V', color: '#ec4899', description: 'Modem and IO domain' },
  ],
  memoryMap: [
    { region: 'DRAM (LPDDR5X)', startAddr: '0x8000_0000', endAddr: '0xFFFF_FFFF', size: '2 GB window', busMaster: 'DMC', description: 'Public Exynos 2400 memory window' },
    { region: 'NPU SRAM', startAddr: '0x1800_0000', endAddr: '0x180F_FFFF', size: '1 MB', busMaster: 'NPU', description: 'Neural processing local SRAM' },
    { region: 'Modem shared RAM', startAddr: '0x1C00_0000', endAddr: '0x1C1F_FFFF', size: '2 MB', busMaster: '5G modem', description: 'Modem firmware and packet buffers' },
  ],
  clusters: [
    { id: 'ss_cluster_cpu', name: 'CPU_Cluster', displayName: 'Cortex-X4 / A720 / A520', description: 'Armv9.2 tri-cluster CPU with 10 cores', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: 'X4 + A720 + A520', children: [
      { name: 'Cortex-X4', description: 'Flagship Cortex-X4 performance core' },
      { name: 'Cortex-A720', description: 'Balanced performance cores' },
      { name: 'Cortex-A520', description: 'Efficiency cores' },
      { name: 'DSU', description: 'DynamIQ shared unit and L3' },
    ] },
    { id: 'ss_cluster_gpu', name: 'GPU_Cluster', displayName: 'Xclipse 940 (AMD RDNA 3)', description: 'Samsung Xclipse GPU based on AMD RDNA 3 architecture', category: 'compute', color: '#a855f7', shortLabel: 'GPU', subtitle: 'Xclipse 940', children: [
      { name: 'Xclipse_940', description: 'RDNA 3-based mobile GPU' },
      { name: 'GMU', description: 'GPU management unit' },
      { name: 'GPU_Mem', description: 'GPU-local memory and cache' },
      { name: 'Display', description: 'Display controller and composition' },
    ] },
    { id: 'ss_cluster_npu', name: 'NPU_Cluster', displayName: 'Dual-Core NPU', description: 'AI acceleration for vision, language and camera', category: 'compute', color: '#f59e0b', shortLabel: 'NPU', subtitle: 'Dual-core AI', children: [
      { name: 'NPU_Core0', description: 'First neural processing core' },
      { name: 'NPU_Core1', description: 'Second neural processing core' },
      { name: 'NPU_SRAM', description: 'Tensor scratchpad' },
      { name: 'NPU_DMA', description: 'Tensor DMA' },
    ] },
    { id: 'ss_cluster_isp', name: 'Camera_Media', displayName: 'ISP / MFC / Display', description: 'Image signal processing, video codec and display', category: 'peripheral', color: '#10b981', shortLabel: 'ISP', subtitle: 'ISP · MFC', children: [
      { name: 'ISP', description: 'Image signal processor' },
      { name: 'MFC', description: 'Multi-format video codec' },
      { name: 'Display', description: 'Display driver and MIPI DSI' },
      { name: 'Audio', description: 'Audio DSP and interfaces' },
    ] },
    { id: 'ss_cluster_modem', name: 'Modem_Cluster', displayName: '5G NR Modem', description: 'Integrated 5G modem with GNSS and RF interfaces', category: 'peripheral', color: '#ec4899', shortLabel: '5G', subtitle: '5G NR + GNSS', children: [
      { name: '5G_NR', description: 'Sub-6 GHz and mmWave modem' },
      { name: 'GNSS', description: 'GPS/GLONASS/Galileo receiver' },
      { name: 'RF_IF', description: 'RF transceiver interface' },
      { name: 'Modem_DSP', description: 'Baseband DSP' },
    ] },
    { id: 'ss_cluster_mem', name: 'Memory_Subsystem', displayName: 'LPDDR5X Memory', description: 'High-bandwidth LPDDR5X controller and PHY', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'LPDDR5X', children: [
      { name: 'DMC', description: 'LPDDR5X memory controller' },
      { name: 'LPDDR5X_PHY', description: 'Memory PHY' },
      { name: 'SRAM', description: 'On-chip SRAM' },
      { name: 'SLC', description: 'System level cache' },
    ] },
    { id: 'ss_cluster_security', name: 'Security_Cluster', displayName: 'Knox Vault / Secure Element', description: 'Isolated security subsystem and secure boot', category: 'security', color: '#f43f5e', shortLabel: 'SEC', subtitle: 'Knox Vault', children: [
      { name: 'Knox_Vault', description: 'Isolated security processor' },
      { name: 'Secure_Boot', description: 'Verified boot chain' },
      { name: 'Crypto', description: 'Cryptographic acceleration' },
      { name: 'Key_Store', description: 'Hardware key storage' },
    ] },
    { id: 'ss_cluster_pmu', name: 'PMU_Clock', displayName: 'PMU / Clock / Thermal', description: 'Power domains, DVFS and thermal management', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'DVFS · Thermal', children: [
      { name: 'PMU', description: 'Power management unit' },
      { name: 'PLL_CCU', description: 'PLL and clock control' },
      { name: 'Thermal', description: 'Thermal sensors' },
      { name: 'DVFS', description: 'Dynamic voltage/frequency scaling' },
    ] },
  ],
};

const APPLE_BUILD: CompanyBuild = {
  id: 'apple',
  companyName: 'Apple',
  chipModel: 'A17 Pro',
  trmDocumentId: 'Apple A17 Pro public architecture summary (no public TRM)',
  tagline: '2P + 4E CPU, 6-core GPU, 16-core Neural Engine, 3nm',
  processNode: '3nm TSMC N3B',
  primaryApp: 'iPhone 15 Pro, spatial computing, mobile AI',
  brandColor: '#a3a3a3',
  badgeSymbol: 'A17',
  clocks: [
    { name: 'F_CPU_3P8G', freqMhz: 3780, color: '#00f2fe', description: 'Performance/efficiency CPU cluster clock' },
    { name: 'F_GPU_1P4G', freqMhz: 1400, color: '#8b5cf6', description: 'Apple GPU core clock' },
    { name: 'F_ANE_1G', freqMhz: 1000, color: '#f59e0b', description: 'Neural Engine clock' },
    { name: 'F_MEM_6P4G', freqMhz: 6400, color: '#3b82f6', description: 'LPDDR5 memory clock' },
    { name: 'F_IO_500M', freqMhz: 500, color: '#ec4899', description: 'Thunderbolt/USB/display IO clock' },
  ],
  resets: [
    { name: 'rst_a17_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '0.7 V', color: '#00f2fe', description: 'CPU core domain' },
    { name: 'PD_GPU', voltage: '0.75 V', color: '#8b5cf6', description: 'GPU domain' },
    { name: 'PD_ANE', voltage: '0.75 V', color: '#f59e0b', description: 'Neural Engine domain' },
    { name: 'PD_MEM', voltage: '1.05 V', color: '#3b82f6', description: 'LPDDR5 domain' },
    { name: 'PD_STANDBY', voltage: '0.6 V', color: '#a855f7', description: 'Always-on / Secure Enclave domain' },
  ],
  memoryMap: [
    { region: 'DRAM (LPDDR5)', startAddr: '0x8000_0000', endAddr: '0xFFFF_FFFF', size: '2 GB window', busMaster: 'Memory controller', description: 'Public A17 Pro memory window (illustrative)' },
    { region: 'Neural Engine SRAM', startAddr: '0x1800_0000', endAddr: '0x180F_FFFF', size: '1 MB', busMaster: 'Neural Engine', description: 'ANE-local tensor memory (public summary)' },
    { region: 'Secure Enclave', startAddr: '0x1C00_0000', endAddr: '0x1C00_FFFF', size: '64 KB', busMaster: 'Secure Enclave', description: 'Isolated security processor aperture (public summary)' },
  ],
  clusters: [
    { id: 'apple_cluster_cpu', name: 'CPU_Cluster', displayName: '2P + 4E CPU Cluster', description: 'Two performance cores and four efficiency cores (public summary)', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: '2P + 4E', children: [
      { name: 'Performance_Core', description: 'High-performance CPU core (public summary)' },
      { name: 'Efficiency_Core', description: 'High-efficiency CPU core (public summary)' },
      { name: 'L2_Cache', description: 'Shared CPU cluster cache' },
      { name: 'DSU', description: 'Cluster shared unit' },
    ] },
    { id: 'apple_cluster_gpu', name: 'GPU_Cluster', displayName: '6-Core Apple GPU', description: 'Six-core GPU with hardware ray tracing (public summary)', category: 'compute', color: '#8b5cf6', shortLabel: 'GPU', subtitle: '6-core', children: [
      { name: 'GPU_Core', description: 'Apple GPU shader core' },
      { name: 'Ray_Tracing', description: 'Hardware ray tracing unit' },
      { name: 'Display', description: 'ProMotion display controller' },
      { name: 'GPU_Mem', description: 'GPU-local cache and memory interface' },
    ] },
    { id: 'apple_cluster_neural', name: 'Neural_Cluster', displayName: '16-Core Neural Engine', description: 'Neural Engine for on-device AI (public summary)', category: 'compute', color: '#f59e0b', shortLabel: 'ANE', subtitle: '16-core', children: [
      { name: 'Neural_Core', description: 'Neural Engine compute core' },
      { name: 'ANE_SRAM', description: 'Local tensor memory' },
      { name: 'ANE_DMA', description: 'Tensor DMA' },
      { name: 'Scheduler', description: 'Neural task scheduler' },
    ] },
    { id: 'apple_cluster_media', name: 'Media_Cluster', displayName: 'ISP / ProRes / HEVC', description: 'Image signal processor and media engines (public summary)', category: 'peripheral', color: '#10b981', shortLabel: 'MEDIA', subtitle: 'ISP · ProRes', children: [
      { name: 'ISP', description: 'Image signal processor' },
      { name: 'ProRes', description: 'ProRes encode/decode' },
      { name: 'HEVC', description: 'HEVC codec' },
      { name: 'Audio', description: 'Audio DSP' },
    ] },
    { id: 'apple_cluster_mem', name: 'Memory_Subsystem', displayName: 'LPDDR5 Memory', description: 'Unified memory controller and PHY (public summary)', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'LPDDR5', children: [
      { name: 'Memory_Controller', description: 'Unified memory controller' },
      { name: 'LPDDR5_PHY', description: 'Memory PHY' },
      { name: 'SLC', description: 'System level cache' },
      { name: 'SRAM', description: 'On-chip SRAM' },
    ] },
    { id: 'apple_cluster_io', name: 'IO_Cluster', displayName: 'Thunderbolt / USB4 / PCIe', description: 'High-speed serial IO and display interfaces', category: 'peripheral', color: '#ec4899', shortLabel: 'IO', subtitle: 'USB4 · PCIe', children: [
      { name: 'Thunderbolt', description: 'Thunderbolt/USB4 controller' },
      { name: 'PCIe', description: 'PCIe controller' },
      { name: 'USB', description: 'USB host controllers' },
      { name: 'Display_IO', description: 'DisplayPort/DSI interfaces' },
    ] },
    { id: 'apple_cluster_security', name: 'Security_Cluster', displayName: 'Secure Enclave', description: 'Isolated security processor and secure boot', category: 'security', color: '#f43f5e', shortLabel: 'SEP', subtitle: 'Secure Enclave', children: [
      { name: 'Secure_Enclave', description: 'Isolated security processor' },
      { name: 'SEP', description: 'Secure enclave processor' },
      { name: 'Crypto', description: 'Cryptographic engine' },
      { name: 'Secure_Boot', description: 'Boot ROM and trust chain' },
    ] },
    { id: 'apple_cluster_pmu', name: 'PMU_Clock', displayName: 'PMU / Clock / Thermal', description: 'Power management, DVFS and thermal control', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'DVFS · Thermal', children: [
      { name: 'PMU', description: 'Power management unit' },
      { name: 'Clock', description: 'PLL and clock distribution' },
      { name: 'Thermal', description: 'Thermal sensors' },
      { name: 'DVFS', description: 'Dynamic voltage/frequency scaling' },
    ] },
  ],
};

const MEDIATEK_BUILD: CompanyBuild = {
  id: 'mediatek',
  companyName: 'MediaTek',
  chipModel: 'Dimensity 9400',
  trmDocumentId: 'MediaTek Dimensity 9400 public product brief',
  tagline: 'Cortex-X925/X4/A720, Immortalis-G925, APU 890 and 5G modem',
  processNode: 'TSMC N3E (3nm)',
  primaryApp: 'Flagship smartphones, AI mobile, gaming',
  brandColor: '#ff6a00',
  badgeSymbol: 'MTK',
  clocks: [
    { name: 'F_CPU_3P6G', freqMhz: 3620, color: '#00f2fe', description: 'Cortex-X925/A720 CPU cluster clock' },
    { name: 'F_GPU_1P6G', freqMhz: 1600, color: '#76b900', description: 'Immortalis-G925 GPU clock' },
    { name: 'F_APU_1G', freqMhz: 1000, color: '#f59e0b', description: 'APU 890 AI accelerator clock' },
    { name: 'F_MEM_10G', freqMhz: 10667, color: '#3b82f6', description: 'LPDDR5X memory clock' },
    { name: 'F_IO_500M', freqMhz: 500, color: '#ec4899', description: 'Modem/IO/display clock' },
  ],
  resets: [
    { name: 'rst_mtk_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '0.75 V', color: '#00f2fe', description: 'CPU core domain' },
    { name: 'PD_GPU', voltage: '0.8 V', color: '#76b900', description: 'Immortalis GPU domain' },
    { name: 'PD_APU', voltage: '0.8 V', color: '#f59e0b', description: 'APU/NPU domain' },
    { name: 'PD_MEM', voltage: '1.05 V', color: '#3b82f6', description: 'LPDDR5X domain' },
    { name: 'PD_IO', voltage: '1.8 V', color: '#ec4899', description: 'Modem and IO domain' },
  ],
  memoryMap: [
    { region: 'DRAM (LPDDR5X)', startAddr: '0x8000_0000', endAddr: '0xFFFF_FFFF', size: '2 GB window', busMaster: 'DMC', description: 'Public Dimensity 9400 memory window' },
    { region: 'APU shared SRAM', startAddr: '0x1800_0000', endAddr: '0x180F_FFFF', size: '1 MB', busMaster: 'APU 890', description: 'AI accelerator local SRAM' },
    { region: 'Modem shared RAM', startAddr: '0x1C00_0000', endAddr: '0x1C1F_FFFF', size: '2 MB', busMaster: '5G modem', description: 'Modem firmware and packet buffers' },
  ],
  clusters: [
    { id: 'mtk_cluster_cpu', name: 'CPU_Cluster', displayName: 'Cortex-X925 / X4 / A720', description: 'Armv9.2 all-big-core CPU configuration with a large L2/L3', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: 'X925 + X4 + A720', children: [
      { name: 'Cortex-X925', description: 'Armv9.2 flagship performance core' },
      { name: 'Cortex-X4', description: 'Second high-performance core' },
      { name: 'Cortex-A720', description: 'Balanced performance cores' },
      { name: 'DSU', description: 'DynamIQ shared unit and L3 cache' },
    ] },
    { id: 'mtk_cluster_gpu', name: 'GPU_Cluster', displayName: 'Immortalis-G925', description: 'Arm Immortalis GPU with hardware ray tracing', category: 'compute', color: '#76b900', shortLabel: 'GPU', subtitle: 'Immortalis-G925', children: [
      { name: 'Immortalis_G925', description: 'Arm flagship mobile GPU' },
      { name: 'GPU_MMU', description: 'GPU memory management unit' },
      { name: 'Display', description: 'Display controller and composition' },
      { name: 'GPU_Mem', description: 'GPU-local cache and memory interface' },
    ] },
    { id: 'mtk_cluster_apu', name: 'APU_Cluster', displayName: 'APU 890 AI Processor', description: 'MediaTek AI processing unit for generative AI', category: 'compute', color: '#f59e0b', shortLabel: 'APU', subtitle: 'APU 890', children: [
      { name: 'APU_890', description: 'AI processing unit' },
      { name: 'APU_SRAM', description: 'Tensor scratchpad' },
      { name: 'APU_DMA', description: 'Tensor DMA' },
      { name: 'Scheduler', description: 'AI task scheduler' },
    ] },
    { id: 'mtk_cluster_media', name: 'Camera_Media', displayName: 'ISP / MFC / Display', description: 'Image signal processing, video codec and display', category: 'peripheral', color: '#10b981', shortLabel: 'ISP', subtitle: 'ISP · MFC', children: [
      { name: 'ISP', description: 'Image signal processor' },
      { name: 'MFC', description: 'Multi-format video codec' },
      { name: 'Display', description: 'Display driver and MIPI DSI' },
      { name: 'Audio', description: 'Audio DSP and interfaces' },
    ] },
    { id: 'mtk_cluster_modem', name: 'Modem_Cluster', displayName: '5G NR Modem', description: 'Integrated 5G modem with GNSS and RF interfaces', category: 'peripheral', color: '#ec4899', shortLabel: '5G', subtitle: '5G NR + GNSS', children: [
      { name: '5G_NR', description: 'Sub-6 GHz and mmWave modem' },
      { name: 'GNSS', description: 'GNSS receiver' },
      { name: 'RF_IF', description: 'RF transceiver interface' },
      { name: 'Modem_DSP', description: 'Baseband DSP' },
    ] },
    { id: 'mtk_cluster_mem', name: 'Memory_Subsystem', displayName: 'LPDDR5X Memory', description: 'High-bandwidth LPDDR5X controller and PHY', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'LPDDR5X', children: [
      { name: 'DMC', description: 'LPDDR5X memory controller' },
      { name: 'LPDDR5X_PHY', description: 'Memory PHY' },
      { name: 'SRAM', description: 'On-chip SRAM' },
      { name: 'SLC', description: 'System level cache' },
    ] },
    { id: 'mtk_cluster_security', name: 'Security_Cluster', displayName: 'MediaTek Security', description: 'Secure boot, TEE and key storage', category: 'security', color: '#f43f5e', shortLabel: 'SEC', subtitle: 'TEE · Secure boot', children: [
      { name: 'Secure_Boot', description: 'Verified boot chain' },
      { name: 'TEE', description: 'Trusted execution environment' },
      { name: 'Crypto', description: 'Cryptographic acceleration' },
      { name: 'Key_Store', description: 'Hardware key storage' },
    ] },
    { id: 'mtk_cluster_pmu', name: 'PMU_Clock', displayName: 'PMU / Clock / Thermal', description: 'Power domains, DVFS and thermal management', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'DVFS · Thermal', children: [
      { name: 'PMU', description: 'Power management unit' },
      { name: 'PLL_CCU', description: 'PLL and clock control' },
      { name: 'Thermal', description: 'Thermal sensors' },
      { name: 'DVFS', description: 'Dynamic voltage/frequency scaling' },
    ] },
  ],
};

const TI_C29X_BUILD: CompanyBuild = {
  id: 'ti_c29x',
  companyName: 'Texas Instruments',
  chipModel: 'C29x (F29H85x)',
  trmDocumentId: 'TI C29x public architecture summary (F29H85x family)',
  tagline: 'C29x real-time MCU: VPU/TMU, ETG/ePWM, CLB, VBUSM/VBUSP fabric and AXI-APB bridges',
  processNode: 'TI embedded flash',
  primaryApp: 'Real-time motor control, digital power, automotive/safety',
  brandColor: '#cc0000',
  badgeSymbol: 'C29',
  clocks: [
    { name: 'F_C29X_400M', freqMhz: 400, color: '#00f2fe', description: 'C29x CPU/VPU/TMU core clock' },
    { name: 'F_VBUS_200M', freqMhz: 200, color: '#8b5cf6', description: 'VBUSM/VBUSP fabric clock' },
    { name: 'F_PWM_200M', freqMhz: 200, color: '#10b981', description: 'ETG/ePWM/CLB clock' },
    { name: 'F_ADC_100M', freqMhz: 100, color: '#eab308', description: 'ADC and analog clock' },
    { name: 'F_IO_100M', freqMhz: 100, color: '#ec4899', description: 'CAN/Ethernet/USB/SPI clock' },
  ],
  resets: [
    { name: 'rst_c29x_n', type: 'async_assert_sync_deassert', color: '#00f2fe' },
    { name: 'rst_core_n', type: 'async_assert_sync_deassert', color: '#fbbf24' },
    { name: 'rst_io_n', type: 'async_assert_sync_deassert', color: '#ec4899' },
    { name: 'rst_dbg_n', type: 'async', color: '#f472b6' },
  ],
  powers: [
    { name: 'PD_CORE', voltage: '1.2 V', color: '#00f2fe', description: 'C29x core domain' },
    { name: 'PD_FABRIC', voltage: '1.2 V', color: '#8b5cf6', description: 'VBUS/AXI fabric domain' },
    { name: 'PD_ANALOG', voltage: '3.3 V', color: '#eab308', description: 'ADC/analog domain' },
    { name: 'PD_IO', voltage: '3.3 V', color: '#ec4899', description: 'IO domain' },
    { name: 'PD_STANDBY', voltage: '1.2 V', color: '#a855f7', description: 'Always-on domain' },
  ],
  memoryMap: [
    { region: 'Flash / ECC', startAddr: '0x0800_0000', endAddr: '0x083F_FFFF', size: '4 MB window', busMaster: 'C29x / DMA', description: 'Public C29x flash window (illustrative)' },
    { region: 'SRAM / ECC', startAddr: '0x0000_0000', endAddr: '0x0003_FFFF', size: '256 KB', busMaster: 'C29x / DMA', description: 'Public C29x SRAM window' },
    { region: 'Peripheral frame', startAddr: '0x4000_0000', endAddr: '0x400F_FFFF', size: '1 MB', busMaster: 'VBUSP / AXI-APB', description: 'ETG/ePWM/ADC/connectivity registers' },
  ],
  clusters: [
    { id: 'c29x_cluster_cpu', name: 'C29x_CPU', displayName: 'C29x Real-Time CPU + VPU', description: 'C29x CPU with vector processing unit, TMU and FPU', category: 'compute', color: '#00f2fe', shortLabel: 'CPU', subtitle: 'C29x + VPU/TMU', children: [
      { name: 'C29x_Core', description: 'Real-time control CPU core' },
      { name: 'VPU', description: 'Vector processing unit' },
      { name: 'TMU', description: 'Trigonometric math unit' },
      { name: 'FPU', description: 'Floating-point unit' },
    ] },
    { id: 'c29x_cluster_vbus', name: 'VBUS_Fabric', displayName: 'VBUSM / VBUSP + AXI-APB Bridges', description: 'Master/peripheral VBUS fabric with explicit AXI-to-APB bridge instances', category: 'interconnect', color: '#8b5cf6', shortLabel: 'VBUS', subtitle: 'VBUSM · VBUSP · AXI-APB', children: [
      { name: 'VBUSM_Master', description: 'VBUS master port from the C29x CPU', type: 'fabric' },
      { name: 'VBUSP_Peripheral', description: 'VBUS peripheral port for ETG/ADC/IO', type: 'fabric' },
      { name: 'AXI_to_APB_0', description: 'AXI-to-APB bridge for ETG/ePWM', type: 'bridge' },
      { name: 'AXI_to_APB_1', description: 'AXI-to-APB bridge for ADC/connectivity', type: 'bridge' },
    ] },
    { id: 'c29x_cluster_etg', name: 'ETG_PWM', displayName: 'ETG / ePWM / CLB', description: 'Enhanced timer, high-resolution PWM and configurable logic', category: 'peripheral', color: '#10b981', shortLabel: 'ETG', subtitle: 'ETG · ePWM · CLB', children: [
      { name: 'ETG', description: 'Enhanced timer global control' },
      { name: 'ePWM', description: 'High-resolution PWM channels' },
      { name: 'CLB', description: 'Configurable logic block' },
      { name: 'eCAP', description: 'Capture and quadrature interface' },
    ] },
    { id: 'c29x_cluster_adc', name: 'ADC_Cluster', displayName: 'ADC-A/B/C/D', description: 'Four ADC slices with comparators and reference DACs', category: 'analog', color: '#eab308', shortLabel: 'ADC', subtitle: '4x ADC slices', children: [
      { name: 'ADC_A', description: 'ADC slice A' },
      { name: 'ADC_B', description: 'ADC slice B' },
      { name: 'ADC_C', description: 'ADC slice C' },
      { name: 'ADC_D', description: 'ADC slice D' },
    ] },
    { id: 'c29x_cluster_mem', name: 'Memory_Subsystem', displayName: 'Flash / SRAM / ROM / DMA', description: 'On-chip flash, SRAM, boot ROM and DMA', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'Flash · SRAM · DMA', children: [
      { name: 'Flash', description: 'ECC-protected embedded flash' },
      { name: 'SRAM', description: 'ECC-protected SRAM' },
      { name: 'ROM', description: 'Boot ROM' },
      { name: 'DMA', description: 'Direct memory access controller' },
    ] },
    { id: 'c29x_cluster_io', name: 'Connectivity', displayName: 'CAN-FD / Ethernet / USB / SPI', description: 'Automotive and industrial connectivity', category: 'peripheral', color: '#ec4899', shortLabel: 'IO', subtitle: 'CAN-FD · Ethernet', children: [
      { name: 'CAN_FD', description: 'CAN-FD controller' },
      { name: 'Ethernet', description: 'Ethernet MAC' },
      { name: 'USB', description: 'USB controller' },
      { name: 'SPI', description: 'SPI/QSPI interface' },
    ] },
    { id: 'c29x_cluster_safety', name: 'Safety_Cluster', displayName: 'Lockstep / ECC / Watchdog', description: 'Safety mechanisms and diagnostics', category: 'security', color: '#f43f5e', shortLabel: 'SAFE', subtitle: 'Lockstep · ECC', children: [
      { name: 'Lockstep', description: 'CPU lockstep comparator' },
      { name: 'ECC', description: 'Memory ECC' },
      { name: 'Watchdog', description: 'Windowed watchdog' },
      { name: 'ERAD', description: 'Enhanced bus analyzer / debug' },
    ] },
    { id: 'c29x_cluster_pmu', name: 'PMU_Clock', displayName: 'PMU / Clock / Thermal', description: 'Power management, PLL and thermal control', category: 'analog', color: '#fbbf24', shortLabel: 'PMU', subtitle: 'PLL · Thermal', children: [
      { name: 'PMU', description: 'Power management unit' },
      { name: 'Clock', description: 'PLL and clock tree' },
      { name: 'Thermal', description: 'Thermal sensors' },
      { name: 'Debug', description: 'Debug and trace' },
    ] },
  ],
};

const AMD_BUILD: CompanyBuild = {
  id: 'amd',
  companyName: 'AMD',
  chipModel: 'Pensando DPU / P4 NIC',
  trmDocumentId: 'AMD Pensando DPU public architecture summary',
  tagline: 'P4-programmable NIC/DPU: parser, match-action pipeline, traffic manager, 16 Arm cores',
  processNode: '7nm',
  primaryApp: 'Cloud NIC, DPU, SmartNIC, programmable packet processing',
  brandColor: '#ed1c24',
  badgeSymbol: 'AMD',
  clocks: [
    { name: 'F_P4_1G', freqMhz: 1000, color: '#22d3ee', description: 'P4 parser/MAU/deparser pipeline clock' },
    { name: 'F_ARM_2G', freqMhz: 2000, color: '#a78bfa', description: 'Arm management core clock' },
    { name: 'F_MEM_2P4G', freqMhz: 2400, color: '#3b82f6', description: 'DDR4 / packet buffer clock' },
    { name: 'F_ETH_800M', freqMhz: 800, color: '#f472b6', description: 'Ethernet MAC/PCS clock' },
    { name: 'F_PCIE_1G', freqMhz: 1000, color: '#f59e0b', description: 'PCIe host interface clock' },
  ],
  resets: [
    { name: 'rst_amd_n', type: 'async_assert_sync_deassert', color: '#22d3ee' },
    { name: 'rst_p4_n', type: 'async_assert_sync_deassert', color: '#a78bfa' },
    { name: 'rst_eth_n', type: 'async_assert_sync_deassert', color: '#f472b6' },
    { name: 'rst_dbg_n', type: 'async', color: '#fbbf24' },
  ],
  powers: [
    { name: 'PD_P4', voltage: '0.8 V', color: '#22d3ee', description: 'P4 pipeline domain' },
    { name: 'PD_ARM', voltage: '0.8 V', color: '#a78bfa', description: 'Arm core domain' },
    { name: 'PD_MEM', voltage: '1.05 V', color: '#3b82f6', description: 'DDR4/packet buffer domain' },
    { name: 'PD_IO', voltage: '1.2 V', color: '#f472b6', description: 'Ethernet/PCIe IO domain' },
    { name: 'PD_ALWAYS', voltage: '0.8 V', color: '#f59e0b', description: 'management/always-on domain' },
  ],
  memoryMap: [
    { region: 'Packet buffer', startAddr: '0x0000_0000', endAddr: '0x03FF_FFFF', size: '64 MB', busMaster: 'P4 pipeline', description: 'Public-summary packet buffer window' },
    { region: 'DDR4', startAddr: '0x8000_0000', endAddr: '0xFFFF_FFFF', size: 'up to 16 GB', busMaster: 'DDR controller', description: 'Host/DPU memory window (reference)' },
    { region: 'PCIe BAR', startAddr: '0x1000_0000', endAddr: '0x100F_FFFF', size: '1 MB', busMaster: 'PCIe', description: 'Host control BAR (illustrative)' },
  ],
  clusters: [
    { id: 'amd_cluster_p4', name: 'P4_Pipeline', displayName: 'P4 Parser → MAU → Deparser', description: 'P4-programmable packet processing pipeline', category: 'compute', color: '#22d3ee', shortLabel: 'P4', subtitle: 'Parser · MAU · Deparser', children: [
      { name: 'P4_Parser', description: 'Programmable header parser', type: 'ip' },
      { name: 'MAU', description: 'Match-action unit with tables', type: 'ip' },
      { name: 'P4_Deparser', description: 'Packet rewrite / deparser', type: 'ip' },
      { name: 'P4_Tables', description: 'SRAM/TCAM table store', type: 'ip' },
    ] },
    { id: 'amd_cluster_tm', name: 'Packet_TM', displayName: 'Packet Buffer / Traffic Manager', description: 'Buffering, scheduling and QoS', category: 'memory', color: '#3b82f6', shortLabel: 'TM', subtitle: 'Buffer · TM · Queues', children: [
      { name: 'Packet_Buffer', description: 'On-chip packet buffer' },
      { name: 'Traffic_Manager', description: 'Queue and scheduler' },
      { name: 'Scheduler', description: 'Port/queue arbitration' },
      { name: 'Queues', description: 'VoQ / QoS queues' },
    ] },
    { id: 'amd_cluster_host', name: 'Host_Interface', displayName: 'PCIe / DMA / SR-IOV', description: 'Host connectivity and virtualization', category: 'interconnect', color: '#f59e0b', shortLabel: 'HOST', subtitle: 'PCIe · DMA · SR-IOV', children: [
      { name: 'PCIe_Gen4', description: 'PCIe Gen4 x16 host interface' },
      { name: 'DMA', description: 'Host/packet DMA' },
      { name: 'SR_IOV', description: 'Virtual functions' },
      { name: 'VirtIO', description: 'VirtIO datapath' },
    ] },
    { id: 'amd_cluster_eth', name: 'Ethernet', displayName: '100G Ethernet MAC/PCS', description: 'Dual 100G Ethernet ports', category: 'peripheral', color: '#f472b6', shortLabel: 'ETH', subtitle: '2x100G MAC', children: [
      { name: 'MAC0', description: '100G Ethernet MAC 0' },
      { name: 'MAC1', description: '100G Ethernet MAC 1' },
      { name: 'PCS', description: 'PCS/FEC' },
      { name: 'SerDes', description: 'High-speed SerDes' },
    ] },
    { id: 'amd_cluster_arm', name: 'Arm_Complex', displayName: '16x Arm Management Cores', description: 'Control plane, P4 runtime and telemetry', category: 'compute', color: '#a78bfa', shortLabel: 'ARM', subtitle: '16x Arm cores', children: [
      { name: 'Arm_Cluster', description: 'Management cores' },
      { name: 'L3_Cache', description: 'Shared cache' },
      { name: 'P4_Runtime', description: 'P4 control-plane agent' },
      { name: 'Telemetry', description: 'Flow/telemetry engine' },
    ] },
    { id: 'amd_cluster_mem', name: 'Memory', displayName: 'DDR4 / SRAM / SMMU', description: 'Host memory and packet memory', category: 'memory', color: '#3b82f6', shortLabel: 'MEM', subtitle: 'DDR4 · SRAM', children: [
      { name: 'DDR4_Ctrl', description: 'DDR4 controller + PHY' },
      { name: 'SRAM', description: 'On-chip SRAM' },
      { name: 'SMMU', description: 'System MMU' },
      { name: 'Cache', description: 'Packet/table caches' },
    ] },
    { id: 'amd_cluster_sec', name: 'Security', displayName: 'IPsec / TLS / Crypto', description: 'Inline and control-plane security', category: 'security', color: '#fb7185', shortLabel: 'SEC', subtitle: 'IPsec · TLS', children: [
      { name: 'IPsec', description: 'Inline IPsec engine' },
      { name: 'TLS', description: 'TLS record engine' },
      { name: 'Crypto', description: 'AES/SHA/PKA' },
      { name: 'TRNG', description: 'True random number generator' },
    ] },
    { id: 'amd_cluster_mgmt', name: 'Management', displayName: 'BMC / P4 Compiler / JTAG', description: 'Boot, management and debug', category: 'peripheral', color: '#f59e0b', shortLabel: 'MGMT', subtitle: 'BMC · P4',
      children: [
        { name: 'BMC', description: 'Board management controller' },
        { name: 'P4_Loader', description: 'P4 program loader' },
        { name: 'eMMC', description: 'Boot storage' },
        { name: 'JTAG', description: 'Debug' },
      ] },
  ],
};

export const ARM_SOC = makeCompany(ARM_BUILD);
export const BROADCOM_SOC = makeCompany(BROADCOM_BUILD);
export const SAMSUNG_SOC = makeCompany(SAMSUNG_BUILD);
export const APPLE_SOC = makeCompany(APPLE_BUILD);
export const MEDIATEK_SOC = makeCompany(MEDIATEK_BUILD);
export const TI_C29X_SOC = makeCompany(TI_C29X_BUILD);
export const AMD_SOC = makeCompany(AMD_BUILD);
const c29xVbus = TI_C29X_SOC.hierarchy.children?.find(child => child.id === 'c29x_cluster_vbus');
if (c29xVbus?.children) {
  const short: Record<string, string> = {
    'c29x_cluster_vbus__vbusm_master': 'VBUSM',
    'c29x_cluster_vbus__vbusp_peripheral': 'VBUSP',
    'c29x_cluster_vbus__axi_to_apb_0': 'AXI2APB0',
    'c29x_cluster_vbus__axi_to_apb_1': 'AXI2APB1',
  };
  for (const child of c29xVbus.children) {
    if (short[child.id]) child.shortLabel = short[child.id];
  }
}

TI_C29X_SOC.connections.push(
  {
    id: 'c29x_vbusm_to_axi_apb0',
    name: 'VBUSM to AXI-APB Bridge 0',
    srcModuleId: 'c29x_cluster_vbus__vbusm_master',
    srcPortId: '',
    dstModuleId: 'c29x_cluster_vbus__axi_to_apb_0',
    dstPortId: '',
    busType: 'VBUSM / AXI4',
    width: 64,
    srcClock: 'F_VBUS_200M',
    dstClock: 'F_PWM_200M',
    isCrossClock: false,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'Synchronous VBUSM-to-AXI bridge',
    reportSource: 'system_check',
    edaCheckId: 'CDC_VALID_SYNC',
    details: 'VBUSM master traffic is bridged to the ETG/ePWM APB domain through AXI-APB bridge 0.',
    hierarchicalLevelScope: 'c29x_cluster_vbus',
  },
  {
    id: 'c29x_vbusm_to_axi_apb1',
    name: 'VBUSM to AXI-APB Bridge 1',
    srcModuleId: 'c29x_cluster_vbus__vbusm_master',
    srcPortId: '',
    dstModuleId: 'c29x_cluster_vbus__axi_to_apb_1',
    dstPortId: '',
    busType: 'VBUSM / AXI4',
    width: 64,
    srcClock: 'F_VBUS_200M',
    dstClock: 'F_ADC_100M',
    isCrossClock: true,
    cdcStatus: 'clean',
    rdcStatus: 'clean',
    syncScheme: 'AXI-APB bridge with async clock crossing',
    reportSource: 'system_check',
    edaCheckId: 'CDC_VALID_FIFO',
    details: 'VBUSM traffic is bridged to ADC/connectivity APB peripherals through AXI-APB bridge 1.',
    hierarchicalLevelScope: 'c29x_cluster_vbus',
  },
  {
    id: 'c29x_vbusm_to_vbusp',
    name: 'VBUSM to VBUSP Peripheral Port',
    srcModuleId: 'c29x_cluster_vbus__vbusm_master',
    srcPortId: '',
    dstModuleId: 'c29x_cluster_vbus__vbusp_peripheral',
    dstPortId: '',
    busType: 'VBUSM / VBUSP',
    width: 32,
    srcClock: 'F_VBUS_200M',
    dstClock: 'F_IO_100M',
    isCrossClock: true,
    cdcStatus: 'waiver',
    rdcStatus: 'clean',
    syncScheme: 'Structural VBUS clock-ratio waiver',
    reportSource: 'system_check',
    edaCheckId: 'Ac_unsync01 (Waived by Architect)',
    details: 'VBUSP peripheral traffic runs at a divided clock; the waiver records the integer ratio.',
    hierarchicalLevelScope: 'c29x_cluster_vbus',
  }
);

