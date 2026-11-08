import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../../types/diagram';

const C = { p4: '#22d3ee', tm: '#3b82f6', host: '#f59e0b', eth: '#f472b6', arm: '#a78bfa', mem: '#60a5fa', sec: '#fb7185', mgmt: '#94a3b8' };
const B = (id: string, label: string, x: number, y: number, w: number, h: number, kind: DiagramBlock['kind'], opts: Partial<DiagramBlock> = {}): DiagramBlock => ({ id, label, x, y, w, h, kind, ...opts });
const W = (id: string, points: [number, number][], opts: Partial<DiagramWire> = {}): DiagramWire => ({ id, points, ...opts });

const ETH: DiagramBlock[] = [
  B('mac0', '100G MAC 0', 60, 80, 150, 70, 'io', { sublabel: 'Ethernet', color: C.eth, specRef: 'Pensando §ETH', moduleId: 'amd_cluster_eth' }),
  B('mac1', '100G MAC 1', 230, 80, 150, 70, 'io', { sublabel: 'Ethernet', color: C.eth }),
  B('pcs', 'PCS / FEC / SerDes', 400, 80, 170, 70, 'io', { sublabel: 'line side', color: C.eth }),
];

const P4: DiagramBlock[] = [
  B('parser', 'P4 Parser', 80, 230, 180, 100, 'accelerator', { sublabel: 'programmable headers', color: C.p4, badges: ['P4'], specRef: 'Pensando §P4', moduleId: 'amd_cluster_p4' }),
  B('mau', 'Match-Action Unit', 290, 230, 200, 100, 'accelerator', { sublabel: 'tables · actions', color: C.p4, badges: ['P4', 'TCAM'], moduleId: 'amd_cluster_p4' }),
  B('tables', 'P4 Tables / SRAM', 290, 350, 200, 54, 'memory', { sublabel: 'exact / LPM / TCAM', color: C.mem, moduleId: 'amd_cluster_p4' }),
  B('deparser', 'P4 Deparser', 520, 230, 180, 100, 'accelerator', { sublabel: 'rewrite · checksum', color: C.p4, badges: ['P4'], moduleId: 'amd_cluster_p4' }),
  B('p4rt', 'P4 Runtime', 520, 350, 180, 54, 'peripheral', { sublabel: 'control plane', color: C.arm, moduleId: 'amd_cluster_arm' }),
];

const TM: DiagramBlock[] = [
  B('tm', 'Traffic Manager', 740, 230, 180, 100, 'accelerator', { sublabel: 'queues · QoS', color: C.tm, specRef: 'Pensando §TM', moduleId: 'amd_cluster_tm' }),
  B('pbuf', 'Packet Buffer', 740, 350, 180, 54, 'memory', { sublabel: 'on-chip buffer', color: C.mem, moduleId: 'amd_cluster_tm' }),
  B('sched', 'Scheduler', 940, 230, 120, 100, 'peripheral', { sublabel: 'port arbitration', color: C.tm, moduleId: 'amd_cluster_tm' }),
];

const HOST: DiagramBlock[] = [
  B('pcie', 'PCIe Gen4', 80, 520, 150, 80, 'io', { sublabel: 'x16 host', color: C.host, specRef: 'Pensando §Host', moduleId: 'amd_cluster_host' }),
  B('dma', 'DMA', 250, 520, 120, 80, 'accelerator', { sublabel: 'host queues', color: C.host }),
  B('sriov', 'SR-IOV', 390, 520, 120, 80, 'io', { sublabel: 'virtual functions', color: C.host }),
  B('virtio', 'VirtIO', 530, 520, 120, 80, 'io', { sublabel: 'VM datapath', color: C.host }),
];

const ARM: DiagramBlock[] = [
  B('arm', '16x Arm Cores', 700, 520, 170, 80, 'cpu', { sublabel: 'management / control', color: C.arm, specRef: 'Pensando §Arm', moduleId: 'amd_cluster_arm' }),
  B('l3', 'L3 / SLC', 890, 520, 120, 80, 'memory', { sublabel: 'shared cache', color: C.mem }),
];

const MEM: DiagramBlock[] = [
  B('ddr', 'DDR4 + PHY', 80, 650, 170, 80, 'memory', { sublabel: 'host memory', color: C.mem, moduleId: 'amd_cluster_mem' }),
  B('sram', 'On-chip SRAM', 270, 650, 150, 80, 'memory', { sublabel: 'tables / queues', color: C.mem, moduleId: 'amd_cluster_mem' }),
  B('smmu', 'SMMU', 440, 650, 120, 80, 'io', { sublabel: 'IOMMU', color: C.mem }),
  B('sec', 'IPsec / TLS', 580, 650, 130, 80, 'security', { sublabel: 'inline crypto', color: C.sec }),
  B('crypto', 'Crypto / TRNG', 730, 650, 130, 80, 'security', { sublabel: 'AES/SHA/PKA', color: C.sec }),
  B('mgmt', 'BMC / P4 Loader', 880, 650, 150, 80, 'clock', { sublabel: 'boot / management', color: C.mgmt, moduleId: 'amd_cluster_mgmt' }),
];

const GROUPS: DiagramGroup[] = [
  { id: 'eth', label: 'Network ports', x: 45, y: 65, w: 540, h: 105, color: C.eth },
  { id: 'p4', label: 'P4 programmable pipeline', x: 45, y: 210, w: 700, h: 210, color: C.p4 },
  { id: 'tm', label: 'Packet buffer / traffic manager', x: 725, y: 210, w: 350, h: 210, color: C.tm },
  { id: 'host', label: 'PCIe host interface', x: 45, y: 500, w: 625, h: 120, color: C.host },
  { id: 'arm', label: 'Arm control plane', x: 680, y: 500, w: 345, h: 120, color: C.arm },
  { id: 'mem', label: 'Memory / security / management', x: 45, y: 635, w: 1000, h: 110, color: C.mem },
];

const WIRES: DiagramWire[] = [
  W('mac0_parser', [[135, 150], [135, 190], [170, 190], [170, 230]], { from: 'mac0', to: 'parser', busType: 'packet', width: 512, clock: 'F_ETH_800M' }),
  W('mac1_parser', [[305, 150], [305, 190], [200, 190], [200, 230]], { from: 'mac1', to: 'parser', busType: 'packet', width: 512 }),
  W('parser_mau', [[260, 280], [290, 280]], { from: 'parser', to: 'mau', busType: 'P4 headers' }),
  W('mau_tables', [[390, 330], [390, 350]], { from: 'mau', to: 'tables', busType: 'table lookup' }),
  W('mau_deparser', [[490, 280], [520, 280]], { from: 'mau', to: 'deparser', busType: 'actions' }),
  W('p4rt_mau', [[610, 350], [610, 330], [460, 330], [460, 300]], { from: 'p4rt', to: 'mau', busType: 'P4 runtime' }),
  W('deparser_tm', [[700, 280], [740, 280]], { from: 'deparser', to: 'tm', busType: 'packet' }),
  W('tm_pbuf', [[830, 330], [830, 350]], { from: 'tm', to: 'pbuf', busType: 'buffer' }),
  W('tm_sched', [[920, 280], [940, 280]], { from: 'tm', to: 'sched', busType: 'queue' }),
  W('tm_mac0', [[740, 260], [700, 260], [700, 120], [135, 120], [135, 150]], { from: 'tm', to: 'mac0', busType: 'packet out' }),
  W('tm_mac1', [[750, 260], [710, 260], [710, 110], [305, 110], [305, 150]], { from: 'tm', to: 'mac1', busType: 'packet out' }),
  W('pcie_dma', [[230, 560], [250, 560]], { from: 'pcie', to: 'dma', busType: 'TLP' }),
  W('dma_sriov', [[370, 560], [390, 560]], { from: 'dma', to: 'sriov', busType: 'queue' }),
  W('sriov_virtio', [[510, 560], [530, 560]], { from: 'sriov', to: 'virtio', busType: 'VF' }),
  W('virtio_tm', [[650, 560], [650, 440], [830, 440], [830, 330]], { from: 'virtio', to: 'tm', busType: 'host packet' }),
  W('arm_p4rt', [[785, 600], [785, 620], [610, 620], [610, 404]], { from: 'arm', to: 'p4rt', busType: 'P4 program' }),
  W('arm_l3', [[870, 560], [890, 560]], { from: 'arm', to: 'l3', busType: 'AXI' }),
  W('ddr_smmu', [[250, 690], [440, 690]], { from: 'ddr', to: 'smmu', busType: 'DDR' }),
  W('smmu_sec', [[560, 690], [580, 690]], { from: 'smmu', to: 'sec', busType: 'inline' }),
  W('sec_crypto', [[710, 690], [730, 690]], { from: 'sec', to: 'crypto', busType: 'crypto' }),
  W('mgmt_arm', [[955, 650], [955, 620], [870, 620], [870, 600]], { from: 'mgmt', to: 'arm', busType: 'management' }),
];

export const AMD_P4_NIC_DIAGRAM: ArchitectureDiagram = {
  id: 'amd_p4_nic_arch',
  companyId: 'amd',
  socId: 'amd',
  title: 'AMD Pensando DPU / P4 programmable NIC — block diagram',
  subtitle: 'P4 parser → MAU → deparser · traffic manager · 2x100G · PCIe Gen4 · 16 Arm cores',
  source: 'AMD Pensando DPU public architecture material',
  width: 1100,
  height: 790,
  groups: GROUPS,
  blocks: [...ETH, ...P4, ...TM, ...HOST, ...ARM, ...MEM],
  wires: WIRES,
  notes: [
    'P4 is the programmable packet-processing language; parser/MAU/deparser are the P4 pipeline stages.',
    'Public block names and the 2x100G/PCIe Gen4/16 Arm core counts are used; exact table sizes and queue depths are not asserted.',
    'This is a NIC/DPU architecture, not an x86 CPU core diagram.',
  ],
};
