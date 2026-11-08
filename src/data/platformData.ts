import type {
  ArchitectureDecision,
  ChangeRequest,
  CompanyProfile,
  CrossVendorBinding,
  IpRegistryEntry,
  SocProfile,
  SpecSection,
} from '../types/platform';

const trm = (title: string, section: string, url?: string): SpecSection['source'] => ({ title, section, url, type: 'trm' });
const datasheet = (title: string, url: string): SpecSection['source'] => ({ title, url, type: 'datasheet' });
const whitepaper = (title: string, url: string): SpecSection['source'] => ({ title, url, type: 'whitepaper' });
const publicSummary = (title: string, url: string): SpecSection['source'] => ({ title, url, type: 'vendor', note: 'Public summary; proprietary details are not disclosed.' });

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'arm', name: 'Arm', kind: 'ip-vendor', hq: 'Cambridge, UK', founded: '1990', website: 'https://www.arm.com',
    summary: 'CPU/GPU/NPU/system IP licensor. The Total Compute reference solution assembles Cortex-X4/A720/A520, Mali-G720, Ethos-U85 and CMN-700 into a licensable SoC blueprint.',
    architectures: ['Armv9.2-A', 'DynamIQ', 'Mali', 'Ethos', 'AMBA AXI/CHI'],
    sources: [{ title: 'Arm Total Compute Solutions 2024', url: 'https://www.arm.com/products/total-compute-solutions', type: 'vendor' }],
  },
  {
    id: 'broadcom', name: 'Broadcom', kind: 'fabless', hq: 'Palo Alto, CA, USA', founded: '1991', website: 'https://www.broadcom.com',
    summary: 'Broadcom designs networking, broadband, storage and wireless SoCs. BCM2712 is the publicly documented Raspberry Pi 5 application processor.',
    architectures: ['Armv8.2-A', 'VideoCore', 'PCIe', 'Ethernet'],
    sources: [{ title: 'Raspberry Pi BCM2712 documentation', url: 'https://www.raspberrypi.com/documentation/computers/processors.html', type: 'datasheet' }],
  },
  {
    id: 'samsung', name: 'Samsung Electronics', kind: 'semiconductor', hq: 'Suwon, South Korea', founded: '1969', website: 'https://semiconductor.samsung.com',
    summary: 'Samsung is an integrated device manufacturer (IDM) offering Exynos mobile SoCs, memory and foundry. Exynos 2400 combines Armv9 CPUs, AMD RDNA 3 graphics and a dual-core NPU.',
    architectures: ['Armv9.2-A', 'AMD RDNA 3', 'LPDDR5X', '5G NR'],
    sources: [{ title: 'Exynos 2400 product page', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/', type: 'vendor' }],
  },
  {
    id: 'apple', name: 'Apple', kind: 'systems', hq: 'Cupertino, CA, USA', founded: '1976', website: 'https://www.apple.com',
    summary: 'Apple designs A-series/M-series SoCs using Arm architecture licenses, in-house GPU/Neural Engine/Secure Enclave and TSMC process technology. Apple does not publish a full TRM.',
    architectures: ['Armv8.6-A architecture license', 'Apple GPU', 'Neural Engine', 'Secure Enclave'],
    sources: [{ title: 'Apple A17 Pro announcement', url: 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/', type: 'vendor' }],
  },
  {
    id: 'mediatek', name: 'MediaTek', kind: 'fabless', hq: 'Hsinchu, Taiwan', founded: '1997', website: 'https://www.mediatek.com',
    summary: 'MediaTek designs Dimensity mobile platforms with Armv9 CPUs, Immortalis GPUs, APU AI accelerators and integrated 5G modems.',
    architectures: ['Armv9.2-A', 'Immortalis GPU', 'APU 890', '5G NR'],
    sources: [{ title: 'MediaTek Dimensity 9400', url: 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400', type: 'vendor' }],
  },
  {
    id: 'amd', name: 'AMD', kind: 'fabless', hq: 'Santa Clara, CA, USA', founded: '1969', website: 'https://www.amd.com',
    summary: 'AMD designs CPUs, GPUs, adaptive SoCs and, through Pensando, P4-programmable DPUs/SmartNICs for cloud and enterprise networks.',
    architectures: ['P4', 'Arm management cores', 'PCIe Gen4', '100G Ethernet', 'IPsec/TLS'],
    sources: [{ title: 'AMD Pensando DPU', url: 'https://www.amd.com/en/products/accelerators/pensando.html', type: 'vendor' }],
  },
  {
    id: 'ti', name: 'Texas Instruments', kind: 'semiconductor', hq: 'Dallas, TX, USA', founded: '1930', website: 'https://www.ti.com',
    summary: 'TI builds real-time MCUs, DSPs, analog and power devices. C2000 TMS320F28388D combines C28x DSP cores, CLA accelerators and industrial peripherals.',
    architectures: ['C28x', 'CLA', 'Arm Cortex-M4 (connectivity)', 'ePWM'],
    sources: [{ title: 'TMS320F28388D product page', url: 'https://www.ti.com/product/TMS320F28388D', type: 'datasheet' }],
  },
  {
    id: 'nvidia', name: 'NVIDIA', kind: 'fabless', hq: 'Santa Clara, CA, USA', founded: '1993', website: 'https://www.nvidia.com',
    summary: 'NVIDIA designs GPUs and SoCs for AI, automotive and robotics. Drive Orin integrates Ampere GPU, Arm Cortex-A78AE CPUs, NVDLA and safety islands.',
    architectures: ['Ampere GPU', 'Arm Cortex-A78AE', 'NVDLA', 'NVLink-C2C'],
    sources: [{ title: 'NVIDIA DRIVE Orin', url: 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/', type: 'whitepaper' }],
  },
  {
    id: 'qualcomm', name: 'Qualcomm', kind: 'fabless', hq: 'San Diego, CA, USA', founded: '1985', website: 'https://www.qualcomm.com',
    summary: 'Qualcomm designs Snapdragon mobile platforms with Kryo CPUs, Adreno GPUs, Hexagon NPUs and Snapdragon X75 5G modems.',
    architectures: ['Armv9.2-A', 'Adreno', 'Hexagon', '5G NR'],
    sources: [{ title: 'Snapdragon 8 Gen 3', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' }],
  },
  {
    id: 'infineon', name: 'Infineon Technologies', kind: 'semiconductor', hq: 'Neubiberg, Germany', founded: '1999', website: 'https://www.infineon.com',
    summary: 'Infineon builds automotive safety MCUs, power and security devices. AURIX TC4Dx is the public TriCore 1.8 automotive reference used in this model.',
    architectures: ['TriCore 1.8', 'SRI', 'eGTM', 'ISO 26262 ASIL-D'],
    sources: [{ title: 'AURIX TC4Dx user manual v1.1', url: 'https://www.infineon.com/aurix', type: 'trm' }],
  },
  {
    id: 'cerebras', name: 'Cerebras Systems', kind: 'systems', hq: 'Sunnyvale, CA, USA', founded: '2015', website: 'https://www.cerebras.ai',
    summary: 'Cerebras builds wafer-scale AI engines. WSE-3 integrates 900,000 sparse linear algebra cores and 44 GB on-wafer SRAM.',
    architectures: ['Wafer-scale', 'SLAC', 'SwarmX', '2D mesh'],
    sources: [{ title: 'Cerebras WSE-3', url: 'https://www.cerebras.ai/product-chip', type: 'whitepaper' }],
  },
];

export const SOC_PROFILES: SocProfile[] = [
  { id: 'arm', companyId: 'arm', name: 'Arm Total Compute 2024', year: '2024', process: '3nm reference flow', summary: 'Licensable CSS reference solution, not a shipped die.', source: { title: 'Arm TCS24', url: 'https://www.arm.com/products/total-compute-solutions', type: 'vendor' }, publiclyDocumented: 'high' },
  { id: 'broadcom', companyId: 'broadcom', name: 'BCM2712', year: '2023', process: '16nm', summary: 'Raspberry Pi 5 application processor with 4x Cortex-A76 and VideoCore VII.', source: { title: 'Raspberry Pi documentation', url: 'https://www.raspberrypi.com/documentation/computers/processors.html', type: 'datasheet' }, publiclyDocumented: 'high' },
  { id: 'samsung', companyId: 'samsung', name: 'Exynos 2400', year: '2024', process: 'Samsung SF4 (4nm)', summary: 'Flagship mobile SoC with deca-core CPU, Xclipse 940 GPU and 5G modem.', source: { title: 'Exynos 2400 product page', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/', type: 'vendor' }, publiclyDocumented: 'medium' },
  { id: 'apple', companyId: 'apple', name: 'A17 Pro', year: '2023', process: 'TSMC N3B (3nm)', summary: 'iPhone 15 Pro SoC. Public block names are limited; this model uses published summaries.', source: { title: 'Apple A17 Pro announcement', url: 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/', type: 'vendor' }, publiclyDocumented: 'low' },
  { id: 'mediatek', companyId: 'mediatek', name: 'Dimensity 9400', year: '2024', process: 'TSMC N3E (3nm)', summary: 'Flagship mobile SoC with Cortex-X925, Immortalis-G925 and APU 890.', source: { title: 'MediaTek Dimensity 9400', url: 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400', type: 'vendor' }, publiclyDocumented: 'medium' },
  { id: 'amd', companyId: 'amd', name: 'Pensando DPU / P4 NIC', year: '2024', process: '7nm', summary: 'P4-programmable DPU with parser/MAU/deparser, traffic manager, 16 Arm cores, 2x100G Ethernet and PCIe Gen4.', source: { title: 'AMD Pensando DPU', url: 'https://www.amd.com/en/products/accelerators/pensando.html', type: 'vendor' }, publiclyDocumented: 'medium' },
  { id: 'ti', companyId: 'ti', name: 'TMS320F28388D', year: '2019', process: '65nm/45nm eFlash', summary: 'C2000 real-time control MCU.', source: { title: 'TI product page', url: 'https://www.ti.com/product/TMS320F28388D', type: 'datasheet' }, publiclyDocumented: 'high' },
  { id: 'ti_c29x', companyId: 'ti_c29x', name: 'C29x (F29H85x)', year: '2025', process: 'TI embedded flash', summary: 'Real-time C29x MCU with VBUSM/VBUSP fabric, AXI-APB bridges, ETG/ePWM and CLB.', source: { title: 'TI C29x overview', url: 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview', type: 'vendor' }, publiclyDocumented: 'medium' },
  { id: 'nvidia', companyId: 'nvidia', name: 'Drive Orin', year: '2022', process: '8nm', summary: 'Automotive AI SoC with Ampere GPU and Arm safety CPUs.', source: { title: 'NVIDIA Orin', url: 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/', type: 'whitepaper' }, publiclyDocumented: 'medium' },
  { id: 'qualcomm', companyId: 'qualcomm', name: 'Snapdragon 8 Gen 3', year: '2023', process: 'TSMC N4P', summary: 'Flagship Android mobile platform.', source: { title: 'Qualcomm product page', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' }, publiclyDocumented: 'medium' },
  { id: 'infineon', companyId: 'infineon', name: 'AURIX TC4Dx', year: '2025', process: '28nm eFlash', summary: 'ASIL-D automotive TriCore MCU with public 9,015-page TRM.', source: { title: 'AURIX TC4Dx user manual v1.1', url: 'https://www.infineon.com/aurix', type: 'trm' }, publiclyDocumented: 'high' },
  { id: 'cerebras', companyId: 'cerebras', name: 'WSE-3', year: '2024', process: 'TSMC 5nm', summary: 'Wafer-scale AI engine.', source: { title: 'Cerebras WSE-3', url: 'https://www.cerebras.ai/product-chip', type: 'whitepaper' }, publiclyDocumented: 'medium' },
];

const spec = (
  id: string, companyId: string, section: string, title: string, summary: string,
  keywords: string[], source: SpecSection['source'], moduleId?: string
): SpecSection => ({ id, companyId, socId: companyId, moduleId, section, title, summary, keywords, source });

export const SPEC_SECTIONS: SpecSection[] = [
  spec('spec_inf_cpu', 'infineon', '§4.1–4.2', 'TriCore 1.8 CPU cluster', 'Six TriCore 1.8 cores (CPU0–CPU5) plus CPUcs run at up to 500 MHz with lockstep, double-precision FPU, virtualization and per-core DSPR/PSPR. The TC1.8 block diagram splits CORE, PMI, DMI, PCACHE, DCACHE, SFR and STM; local NVM and SRI/FPI interfaces connect to the rest of the SoC.', ['tricore', 'cpu', 'lockstep', 'fpu', 'cache'], trm('AURIX TC4Dx user manual v1.1', '§4.1–4.2'), 'inf_cluster_compute'),
  spec('spec_inf_nvm', 'infineon', '§5.1–5.2', 'NVM subsystem', 'PFLASH0–5 plus PFLASHcs provide 21 MB of program flash with ECC and read-while-write. DFLASH0/1 add 1.1 MB of EEPROM-emulation flash, UCB/CFS hold configuration and keys, BROM provides boot software, and the DMU/PFI/FWB blocks manage commands and verify.', ['flash', 'pflash', 'dflash', 'eeprom', 'ucb', 'dmu'], trm('AURIX TC4Dx user manual v1.1', '§5.1–5.2'), 'inf_cluster_nvm'),
  spec('spec_inf_sri', 'infineon', '§6.1–6.2', 'SRI crossbar fabric', 'Eight 64-bit SRI crossbars (SRI0–SRI7) connect masters and slaves with EDC, pipelined transactions, per-slave arbiters and QoS monitoring. S2S/S2F/S2A bridges join SRI domains and FPI0/FPI1 at integer clock ratios; fSRI is 500 MHz and fSPB is 100 MHz.', ['sri', 'crossbar', 'noc', 'edc', 'qos'], trm('AURIX TC4Dx user manual v1.1', '§6.1–6.2'), 'inf_cluster_sri'),
  spec('spec_inf_lmu', 'infineon', '§10.1–10.3', 'LMU shared SRAM', 'Each LMU instance provides 512 KB of SRAM with byte/word/double-word and burst access, 16 access-protection regions, ECC and internal read-modify-write. Ten LMUs are distributed across SRI domains and shared by CPUs, SDMA and the PPU.', ['lmu', 'sram', 'ecc', 'apu', 'rmw'], trm('AURIX TC4Dx user manual v1.1', '§10.1–10.3'), 'inf_cluster_mem'),
  spec('spec_inf_geth', 'infineon', '§14.1–14.2', 'Gigabit Ethernet', 'GETH supports 10M/100M/1G/2.5G/5G full duplex, TSN/AVB and a host DMA. The block comprises host interface, optional bridge, XGMAC cores, HSPHY and safety logic; PPS outputs bypass HSPHY to the ports.', ['geth', 'ethernet', 'tsn', 'xgmac', 'hsphy'], trm('AURIX TC4Dx user manual v1.1', '§14.1–14.2'), 'inf_cluster_hsio'),
  spec('spec_inf_pcie', 'infineon', '§19.1–19.2', 'PCIe Gen3 controller', 'PCIe is a Gen3 x1 controller at 8 GT/s with root-complex/endpoint modes, 4+4 DMA channels, 8 inbound and 8 outbound translation regions, MSI/MSI-X and AER. It uses the shared HSPHY block.', ['pcie', 'gen3', 'dma', 'aer'], trm('AURIX TC4Dx user manual v1.1', '§19.1–19.2'), 'inf_cluster_hsio'),
  spec('spec_inf_mcmcan', 'infineon', '§21.1–21.3', 'MCMCAN', 'MCMCAN is an ISO 11898-1 M_CAN cluster with six nodes, shared message RAM, CRE routing, DMA, RX/TX FIFOs and AUTOSAR/J1939 support. The CRE/DRE can route frames between CAN nodes and Ethernet ACF.', ['can', 'mcan', 'cre', 'message ram'], trm('AURIX TC4Dx user manual v1.1', '§21.1–21.3'), 'inf_mcmcan'),
  spec('spec_inf_canxl', 'infineon', '§22.1–22.2', 'CAN-XL', 'CAN-XL supports ISO 11898-1:2024 classical/FD/XL frames, up to 2048 payload bytes and up to 20 Mbit/s. Each X_CAN node has 64-bit timestamping, integrated DMA, 8 TX/RX FIFO queues and extensive filtering.', ['canxl', 'can fd', 'timestamp', 'dma'], trm('AURIX TC4Dx user manual v1.1', '§22.1–22.2'), 'inf_canxl'),
  spec('spec_inf_gtm', 'infineon', '§44.1–44.2', 'eGTM v4.1 timer', 'eGTM v4.1 provides ATOM/TOM/TIM timer clusters, DTM/CDTM dead-time, CMU/TBU time base, CCM/SPE/MON/CMP and trigger routing to ADC, SENT, PSI5, ASCLIN, QSPI, CAN and SCU.', ['egtm', 'atom', 'tom', 'tim', 'dtm', 'pwm'], trm('AURIX TC4Dx user manual v1.1', '§44.1–44.2'), 'inf_cluster_gtm'),
  spec('spec_inf_adc', 'infineon', '§45.1–45.2', 'ADC / analog cluster', 'The ADC block contains TMADC[0:7], FCC[0:9], DSADC[0:9], EXMOD[0:7] and CDSP[0:17]. TMADC is a time-multiplexed SAR converter; FCC provides fast compare; DSADC handles delta-sigma; CDSP performs per-channel filtering and calibration.', ['adc', 'tmadc', 'dsadc', 'fcc', 'cdsp'], trm('AURIX TC4Dx user manual v1.1', '§45.1–45.2'), 'inf_cluster_adc'),
  spec('spec_inf_smu', 'infineon', '§42.1–42.2', 'Safety & security alarm unit', 'SMU collects safety and security alarms into SMU_SAFE0/1, SMU_CS and SMU_STDBY handlers. Reactions include CPU interrupts, NMI to SCU, resets, port emergency stop and FSP error pins; SMU_GCC handles global config and register monitoring.', ['smu', 'safety', 'alarm', 'fsp', 'asil'], trm('AURIX TC4Dx user manual v1.1', '§42.1–42.2'), 'inf_smu'),
  spec('spec_inf_clock', 'infineon', '§32.1–32.3', 'Clock generation and CCU', 'SYSPLL0 generates the 500 MHz system clock; PERPLL1–3 generate peripheral clocks. MCCU/PCCU/DCCU select, divide, gate and distribute clocks, with frequency modulation, clock monitoring and reset support.', ['clock', 'pll', 'ccu', 'sdc'], trm('AURIX TC4Dx user manual v1.1', '§32.1–32.3'), 'inf_pll_ccu'),

  spec('spec_arm_x4', 'arm', 'TCS24 §Cortex-X4', 'Cortex-X4 performance core', 'Armv9.2-A flagship core with 2 MB L2 option, 10-wide decode and improved branch prediction. In TCS24 it is paired with A720/A520 in a DynamIQ cluster with DSU-120.', ['cortex-x4', 'armv9', 'cpu', 'dynamiq'], publicSummary('Arm Total Compute Solutions 2024', 'https://www.arm.com/products/total-compute-solutions'), 'arm_cluster_cpu'),
  spec('spec_arm_g720', 'arm', 'TCS24 §Mali-G720', 'Mali-G720 GPU', 'Fifth-generation Mali GPU with hardware ray tracing and variable-rate shading. TCS24 uses it with a GPU MMU and job manager.', ['mali', 'gpu', 'ray tracing'], publicSummary('Arm Total Compute Solutions 2024', 'https://www.arm.com/products/total-compute-solutions'), 'arm_cluster_gpu'),
  spec('spec_arm_cmn', 'arm', 'TCS24 §CMN-700', 'CMN-700 coherent mesh', 'Coherent mesh network for multi-core SoCs with CHI, DSU and GIC-700 integration; supports multiple mesh sizes and QoS.', ['cmn-700', 'chi', 'noc', 'coherent'], publicSummary('Arm CMN-700 documentation', 'https://www.arm.com/products/silicon-ip-system/coherent-mesh-network'), 'arm_cluster_noc'),
  spec('spec_arm_ethos', 'arm', 'TCS24 §Ethos-U85', 'Ethos-U85 NPU', 'MicroNPU for edge AI with INT8/INT16 support, transformer-friendly operators and local SRAM; integrated through the NPU DMA.', ['ethos', 'npu', 'ai', 'transformer'], publicSummary('Arm Ethos-U85', 'https://www.arm.com/products/silicon-ip-cpu/ethos/ethos-u85'), 'arm_cluster_ai'),

  spec('spec_bcm_cpu', 'broadcom', 'BCM2712 CPU', '4x Cortex-A76 cluster', 'BCM2712 integrates four Arm Cortex-A76 cores with 512 KB L2 per core and a shared L3. Public Raspberry Pi documentation describes the 2.4 GHz maximum clock and the 16nm process.', ['bcm2712', 'cortex-a76', 'raspberry pi'], datasheet('Raspberry Pi BCM2712 documentation', 'https://www.raspberrypi.com/documentation/computers/processors.html'), 'bcm_cluster_cpu'),
  spec('spec_bcm_gpu', 'broadcom', 'BCM2712 GPU', 'VideoCore VII', 'VideoCore VII supports OpenGL ES 3.1 and Vulkan 1.2, dual 4Kp60 HDMI and an ISP/HVS pipeline for the Raspberry Pi 5.', ['videocore', 'gpu', 'hdmi'], datasheet('Raspberry Pi BCM2712 documentation', 'https://www.raspberrypi.com/documentation/computers/processors.html'), 'bcm_cluster_gpu'),
  spec('spec_bcm_pcie', 'broadcom', 'BCM2712 PCIe', 'PCIe 2.0 x4 + USB3', 'BCM2712 exposes a PCIe 2.0 x4 link and two USB 3.0 ports, enabling NVMe and high-speed peripherals on Raspberry Pi 5.', ['pcie', 'usb3', 'nvme'], datasheet('Raspberry Pi BCM2712 documentation', 'https://www.raspberrypi.com/documentation/computers/processors.html'), 'bcm_cluster_pcie'),

  spec('spec_ss_cpu', 'samsung', 'Exynos 2400 CPU', 'Deca-core CPU cluster', 'Exynos 2400 uses one Cortex-X4, three Cortex-A720 and six Cortex-A520 cores in a tri-cluster configuration with DynamIQ and shared L3.', ['exynos', 'cortex-x4', 'a720', 'a520'], publicSummary('Samsung Exynos 2400', 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/'), 'ss_cluster_cpu'),
  spec('spec_ss_gpu', 'samsung', 'Exynos 2400 GPU', 'Xclipse 940 (AMD RDNA 3)', 'Xclipse 940 is based on AMD RDNA 3 and supports hardware ray tracing and variable-rate shading; a GMU manages GPU power and scheduling.', ['xclipse', 'rdna3', 'gpu', 'ray tracing'], publicSummary('Samsung Exynos 2400', 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/'), 'ss_cluster_gpu'),
  spec('spec_ss_npu', 'samsung', 'Exynos 2400 NPU', 'Dual-core NPU', 'The dual-core NPU accelerates vision, language and camera AI workloads; Samsung quotes a substantial AI throughput improvement over Exynos 2200.', ['npu', 'ai', 'exynos'], publicSummary('Samsung Exynos 2400', 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/'), 'ss_cluster_npu'),
  spec('spec_ss_modem', 'samsung', 'Exynos 2400 modem', '5G NR modem', 'Integrated 5G NR modem supports sub-6 GHz and mmWave with GNSS and RF interfaces; the modem shares memory with the application processor.', ['5g', 'modem', 'gnss', 'rf'], publicSummary('Samsung Exynos 2400', 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/'), 'ss_cluster_modem'),

  spec('spec_apple_cpu', 'apple', 'A17 Pro CPU', '2P + 4E CPU cluster', 'A17 Pro uses two performance cores and four efficiency cores on a 3nm process. Apple does not publish a block-level TRM; this model records the public core counts and labels proprietary units as summaries.', ['a17', 'cpu', '3nm', 'performance core'], publicSummary('Apple A17 Pro announcement', 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/'), 'apple_cluster_cpu'),
  spec('spec_apple_gpu', 'apple', 'A17 Pro GPU', '6-core Apple GPU', 'The six-core GPU adds hardware ray tracing and mesh shading, with a display pipeline for ProMotion. Exact microarchitecture is not public.', ['a17', 'gpu', 'ray tracing', 'promotion'], publicSummary('Apple A17 Pro announcement', 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/'), 'apple_cluster_gpu'),
  spec('spec_apple_ane', 'apple', 'A17 Pro Neural Engine', '16-core Neural Engine', 'Apple states a 16-core Neural Engine with roughly 35 TOPS for on-device AI. Local SRAM, DMA and scheduler details are not publicly documented.', ['neural engine', 'ane', 'ai', 'tops'], publicSummary('Apple A17 Pro announcement', 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/'), 'apple_cluster_neural'),
  spec('spec_apple_sep', 'apple', 'A17 Pro Security', 'Secure Enclave', 'The Secure Enclave is an isolated security processor handling keys, biometrics and secure boot. Apple does not publish its internal bus or memory map.', ['secure enclave', 'security', 'sep'], publicSummary('Apple Platform Security', 'https://support.apple.com/guide/security/welcome/web'), 'apple_cluster_security'),

  spec('spec_mtk_cpu', 'mediatek', 'Dimensity 9400 CPU', 'Cortex-X925 / X4 / A720 cluster', 'Dimensity 9400 uses a second-generation all-big-core Armv9 CPU with Cortex-X925, Cortex-X4 and Cortex-A720 cores plus a large shared cache.', ['dimensity', 'cortex-x925', 'a720', 'cpu'], publicSummary('MediaTek Dimensity 9400', 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400'), 'mtk_cluster_cpu'),
  spec('spec_mtk_gpu', 'mediatek', 'Dimensity 9400 GPU', 'Immortalis-G925', 'Arm Immortalis-G925 adds hardware ray tracing and a 12-core configuration for flagship mobile rendering and AI graphics.', ['immortalis', 'g925', 'gpu', 'ray tracing'], publicSummary('MediaTek Dimensity 9400', 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400'), 'mtk_cluster_gpu'),
  spec('spec_mtk_apu', 'mediatek', 'Dimensity 9400 APU', 'APU 890 AI processor', 'APU 890 accelerates generative AI, vision and language workloads with a dedicated tensor/DMA path.', ['apu', 'ai', 'dimensity'], publicSummary('MediaTek Dimensity 9400', 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400'), 'mtk_cluster_apu'),
  spec('spec_mtk_modem', 'mediatek', 'Dimensity 9400 modem', '5G NR modem', 'Integrated 5G modem supports sub-6 GHz and mmWave with GNSS and RF interfaces.', ['5g', 'modem', 'gnss'], publicSummary('MediaTek Dimensity 9400', 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400'), 'mtk_cluster_modem'),
  spec('spec_amd_p4', 'amd', 'Pensando §P4', 'P4 parser / MAU / deparser pipeline', 'The Pensando DPU runs a P4-programmable packet pipeline: a parser extracts headers, a match-action unit (MAU) applies tables/actions, and a deparser rewrites the packet. P4 programs are loaded by the control plane.', ['p4', 'parser', 'mau', 'deparser', 'smartnic', 'dpu'], publicSummary('AMD Pensando DPU', 'https://www.amd.com/en/products/accelerators/pensando.html'), 'amd_cluster_p4'),
  spec('spec_amd_tm', 'amd', 'Pensando §TM', 'Packet buffer and traffic manager', 'The traffic manager buffers packets, schedules queues and enforces QoS before the Ethernet MACs. It is the bridge between the P4 pipeline and the wire.', ['traffic manager', 'packet buffer', 'qos', 'scheduler'], publicSummary('AMD Pensando DPU', 'https://www.amd.com/en/products/accelerators/pensando.html'), 'amd_cluster_tm'),
  spec('spec_amd_host', 'amd', 'Pensando §Host', 'PCIe / SR-IOV / DMA', 'The host interface exposes PCIe Gen4, SR-IOV virtual functions and DMA queues so VMs and bare-metal hosts can drive the DPU datapath.', ['pcie', 'sr-iov', 'dma', 'virtio'], publicSummary('AMD Pensando DPU', 'https://www.amd.com/en/products/accelerators/pensando.html'), 'amd_cluster_host'),
  spec('spec_amd_eth', 'amd', 'Pensando §Ethernet', '2x100G Ethernet', 'Dual 100G Ethernet MAC/PCS ports connect the DPU to the network; the P4 pipeline sees packets after MAC parsing.', ['100g', 'ethernet', 'mac', 'pcs'], publicSummary('AMD Pensando DPU', 'https://www.amd.com/en/products/accelerators/pensando.html'), 'amd_cluster_eth'),
  spec('spec_ti_c28x', 'ti', 'SPRUHM8 §C28x', 'Dual C28x + CLA', 'TMS320F28388D integrates two 200 MHz C28x DSP cores, dual CLA coprocessors, TMU, VCU-II, 1 MB flash and a 6-master/10-slave interconnect.', ['c28x', 'cla', 'dsp', 'c2000'], trm('TI TRM SPRUHM8 / SPRUI33', 'C28x CPU and CLA'), 'ti_subsys_c28x'),
  spec('spec_ti_epwm', 'ti', 'SPRUHM8 §ePWM', 'ePWM / eQEP motor control', 'Eight high-resolution ePWM channels with 150 ps MEP, trip zones, eCAP and eQEP provide deterministic motor-control waveforms.', ['epwm', 'motor', 'mep', 'eqep'], trm('TI TRM SPRUHM8 / SPRUI33', 'ePWM'), 'ti_subsys_epwm'),
  spec('spec_ti_adc', 'ti', 'SPRUHM8 §ADC', 'Quad 16-bit ADC', 'Four 16-bit SAR ADCs with 3.5 MSPS, comparator subsystems and DAC references support motor current and voltage sensing.', ['adc', 'comparator', 'c2000'], trm('TI TRM SPRUHM8 / SPRUI33', 'ADC'), 'ti_macro_analog'),

  spec('spec_ti_vbus', 'ti_c29x', 'C29x §VBUS', 'VBUSM / VBUSP fabric', 'The C29x CPU exposes a VBUS master (VBUSM) port for high-bandwidth traffic and a VBUS peripheral (VBUSP) port for ETG, ADC and IO. Explicit AXI-to-APB bridge instances connect the fabric to legacy APB peripherals.', ['vbusm', 'vbusp', 'axi', 'apb', 'bridge'], publicSummary('TI C29x public overview', 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview'), 'c29x_cluster_vbus'),
  spec('spec_ti_etg', 'ti_c29x', 'C29x §ETG', 'ETG / ePWM / CLB', 'The enhanced timer global (ETG) block coordinates high-resolution ePWM channels, CLB logic and capture units for deterministic motor and power control.', ['etg', 'epwm', 'clb', 'pwm'], publicSummary('TI C29x public overview', 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview'), 'c29x_cluster_etg'),
  spec('spec_ti_c29adc', 'ti_c29x', 'C29x §ADC', 'ADC-A/B/C/D', 'Four ADC slices with comparators and reference DACs support current/voltage sensing for motor and digital-power loops.', ['adc', 'c29x', 'comparator'], publicSummary('TI C29x public overview', 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview'), 'c29x_cluster_adc'),
  spec('spec_nv_gpu', 'nvidia', 'Orin §GPU', 'Ampere GPU', 'Drive Orin integrates a 2048-CUDA-core Ampere GPU with 64 Tensor Cores and 254 TOPS for autonomous-driving inference.', ['orin', 'ampere', 'gpu', 'tensor'], whitepaper('NVIDIA DRIVE Orin', 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/'), 'nv_subsys_gpu'),
  spec('spec_nv_scf', 'nvidia', 'Orin §SCF', 'System Coherent Fabric', 'SCF is a coherent mesh connecting GPU, CPUs, DLA, LPDDR5 and safety islands; NVLink-C2C provides high-bandwidth chip-to-chip links.', ['orin', 'scf', 'noc', 'nvlink'], whitepaper('NVIDIA DRIVE Orin', 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/'), 'nv_bridge_scf_noc'),
  spec('spec_nv_dla', 'nvidia', 'Orin §DLA', 'Deep Learning Accelerator', 'Two NVDLA instances accelerate INT8/FP16 inference alongside the GPU, sharing LPDDR5 through the SCF.', ['orin', 'dla', 'nvdla', 'ai'], whitepaper('NVIDIA DRIVE Orin', 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/'), 'nv_subsys_dla'),

  spec('spec_qc_kryo', 'qualcomm', 'SM8650 §Kryo', 'Kryo CPU cluster', 'Snapdragon 8 Gen 3 uses a 1+5+2 Armv9 CPU configuration with Cortex-X4 and A720/A520 derivatives, plus large shared caches.', ['snapdragon', 'kryo', 'cortex-x4'], publicSummary('Snapdragon 8 Gen 3', 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform'), 'qc_subsys_kryo_cpu'),
  spec('spec_qc_adreno', 'qualcomm', 'SM8650 §Adreno', 'Adreno 750 GPU', 'Adreno 750 adds hardware ray tracing, frame-rate upscaling and a large GMEM/L2 configuration for mobile rendering.', ['adreno', 'gpu', 'ray tracing'], publicSummary('Snapdragon 8 Gen 3', 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform'), 'qc_subsys_adreno_gpu'),
  spec('spec_qc_hexagon', 'qualcomm', 'SM8650 §Hexagon', 'Hexagon NPU', 'Hexagon NPU accelerates INT4/INT8/FP16 AI workloads across scalar, vector and tensor engines.', ['hexagon', 'npu', 'ai'], publicSummary('Snapdragon 8 Gen 3', 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform'), 'qc_subsys_hexagon_npu'),

  spec('spec_cer_slac', 'cerebras', 'WSE-3 §SLAC', 'Sparse Linear Algebra Cores', 'WSE-3 integrates 900,000 SLAC cores across a wafer-scale die with 44 GB SRAM and 21 PB/s on-wafer bandwidth.', ['cerebras', 'wse-3', 'slac', 'wafer'], whitepaper('Cerebras WSE-3', 'https://www.cerebras.ai/product-chip'), 'cer_subsys_slac_nw'),
  spec('spec_cer_mesh', 'cerebras', 'WSE-3 §Mesh', '2D switched mesh', 'A 2D switched mesh with virtual channels routes flits between SLAC cores and memory banks at 21 PB/s aggregate bandwidth.', ['cerebras', 'mesh', 'noc', 'flit'], whitepaper('Cerebras WSE-3', 'https://www.cerebras.ai/product-chip'), 'cer_subsys_2d_mesh'),
];

const use = (companyId: string, moduleId: string) => ({ companyId, socId: companyId, moduleId });

export const IP_REGISTRY: IpRegistryEntry[] = [
  { id: 'arm_cortex_x4', name: 'Cortex-X4', vendor: 'Arm', category: 'cpu', description: 'Armv9.2 flagship CPU core.', usedBy: [use('arm', 'arm_cluster_cpu'), use('samsung', 'ss_cluster_cpu'), use('qualcomm', 'qc_subsys_kryo_cpu')], source: { title: 'Arm Cortex-X4', url: 'https://www.arm.com/products/silicon-ip-cpu/cortex-x4', type: 'vendor' }, openSpec: 'Arm Cortex-X4 TRM (registration)' },
  { id: 'arm_cortex_a720', name: 'Cortex-A720', vendor: 'Arm', category: 'cpu', description: 'Armv9.2 balanced performance CPU core.', usedBy: [use('arm', 'arm_cluster_cpu'), use('samsung', 'ss_cluster_cpu'), use('qualcomm', 'qc_subsys_kryo_cpu'), use('mediatek', 'mtk_cluster_cpu')], source: { title: 'Arm Cortex-A720', url: 'https://www.arm.com/products/silicon-ip-cpu/cortex-a720', type: 'vendor' } },
  { id: 'arm_cortex_a520', name: 'Cortex-A520', vendor: 'Arm', category: 'cpu', description: 'Armv9.2 efficiency CPU core.', usedBy: [use('arm', 'arm_cluster_cpu'), use('samsung', 'ss_cluster_cpu'), use('qualcomm', 'qc_subsys_kryo_cpu')], source: { title: 'Arm Cortex-A520', url: 'https://www.arm.com/products/silicon-ip-cpu/cortex-a520', type: 'vendor' } },
  { id: 'arm_cortex_a76', name: 'Cortex-A76', vendor: 'Arm', category: 'cpu', description: 'Armv8.2-A out-of-order application core.', usedBy: [use('broadcom', 'bcm_cluster_cpu')], source: { title: 'Arm Cortex-A76', url: 'https://www.arm.com/products/silicon-ip-cpu/cortex-a76', type: 'vendor' } },
  { id: 'arm_mali_g720', name: 'Mali-G720', vendor: 'Arm', category: 'gpu', description: 'Fifth-generation Mali GPU with ray tracing.', usedBy: [use('arm', 'arm_cluster_gpu')], source: { title: 'Arm Mali-G720', url: 'https://www.arm.com/products/silicon-ip-gpu/mali-g720', type: 'vendor' } },
  { id: 'arm_ethos_u85', name: 'Ethos-U85', vendor: 'Arm', category: 'npu', description: 'Edge AI microNPU.', usedBy: [use('arm', 'arm_cluster_ai')], source: { title: 'Arm Ethos-U85', url: 'https://www.arm.com/products/silicon-ip-cpu/ethos/ethos-u85', type: 'vendor' } },
  { id: 'arm_cmn700', name: 'CMN-700', vendor: 'Arm', category: 'interconnect', description: 'Coherent mesh network.', usedBy: [use('arm', 'arm_cluster_noc')], source: { title: 'Arm CMN-700', url: 'https://www.arm.com/products/silicon-ip-system/coherent-mesh-network', type: 'vendor' } },
  { id: 'arm_cortex_x925', name: 'Cortex-X925', vendor: 'Arm', category: 'cpu', description: 'Armv9.2 flagship CPU core used in Dimensity 9400.', usedBy: [use('mediatek', 'mtk_cluster_cpu')], source: { title: 'Arm Cortex-X925', url: 'https://www.arm.com/products/silicon-ip-cpu/cortex-x925', type: 'vendor' } },
  { id: 'arm_immortalis_g925', name: 'Immortalis-G925', vendor: 'Arm', category: 'gpu', description: 'Arm flagship mobile GPU with ray tracing.', usedBy: [use('mediatek', 'mtk_cluster_gpu')], source: { title: 'Arm Immortalis-G925', url: 'https://www.arm.com/products/silicon-ip-gpu/immortalis-g925', type: 'vendor' } },
  { id: 'amd_rdna3', name: 'RDNA 3 GPU architecture', vendor: 'AMD', category: 'gpu', description: 'AMD RDNA 3 graphics architecture licensed into Xclipse 940.', usedBy: [use('samsung', 'ss_cluster_gpu')], source: { title: 'Samsung Xclipse 940', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/', type: 'vendor' } },
  { id: 'broadcom_videocore', name: 'VideoCore VII', vendor: 'Broadcom', category: 'gpu', description: 'Broadcom graphics/ISP/display processor.', usedBy: [use('broadcom', 'bcm_cluster_gpu')], source: { title: 'BCM2712 documentation', url: 'https://www.raspberrypi.com/documentation/computers/processors.html', type: 'datasheet' } },
  { id: 'apple_ane', name: 'Apple Neural Engine', vendor: 'Apple', category: 'npu', description: '16-core on-device AI accelerator (public summary).', usedBy: [use('apple', 'apple_cluster_neural')], source: { title: 'Apple A17 Pro', url: 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/', type: 'vendor' } },
  { id: 'apple_sep', name: 'Secure Enclave', vendor: 'Apple', category: 'security', description: 'Isolated security processor.', usedBy: [use('apple', 'apple_cluster_security')], source: { title: 'Apple Platform Security', url: 'https://support.apple.com/guide/security/welcome/web', type: 'vendor' } },
  { id: 'qualcomm_adreno', name: 'Adreno 750', vendor: 'Qualcomm', category: 'gpu', description: 'Mobile GPU with ray tracing.', usedBy: [use('qualcomm', 'qc_subsys_adreno_gpu')], source: { title: 'Snapdragon 8 Gen 3', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' } },
  { id: 'qualcomm_hexagon', name: 'Hexagon NPU', vendor: 'Qualcomm', category: 'npu', description: 'Scalar/vector/tensor AI engine.', usedBy: [use('qualcomm', 'qc_subsys_hexagon_npu')], source: { title: 'Snapdragon 8 Gen 3', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' } },
  { id: 'nvidia_ampere', name: 'Ampere GPU', vendor: 'NVIDIA', category: 'gpu', description: '2048 CUDA + 64 Tensor cores in Drive Orin.', usedBy: [use('nvidia', 'nv_subsys_gpu')], source: { title: 'NVIDIA DRIVE Orin', url: 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/', type: 'whitepaper' } },
  { id: 'nvidia_nvdla', name: 'NVDLA', vendor: 'NVIDIA', category: 'npu', description: 'Deep learning accelerator.', usedBy: [use('nvidia', 'nv_subsys_dla')], source: { title: 'NVIDIA DRIVE Orin', url: 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/', type: 'whitepaper' } },
  { id: 'infineon_tricore', name: 'TriCore 1.8', vendor: 'Infineon', category: 'cpu', description: 'Automotive DSP/RISC hybrid CPU.', usedBy: [use('infineon', 'inf_cluster_compute')], source: { title: 'AURIX TC4Dx user manual v1.1', url: 'https://www.infineon.com/aurix', type: 'trm' } },
  { id: 'infineon_ppu', name: 'PPU vector AI accelerator', vendor: 'Infineon', category: 'npu', description: 'AURIX vector/AI accelerator (NDA details).', usedBy: [use('infineon', 'inf_ppu')], source: { title: 'AURIX TC4Dx user manual v1.1', url: 'https://www.infineon.com/aurix', type: 'trm' } },
  { id: 'amd_p4_pipeline', name: 'P4 programmable pipeline', vendor: 'AMD', category: 'npu', description: 'Parser/MAU/deparser packet pipeline programmed in P4.', usedBy: [use('amd', 'amd_cluster_p4')], source: { title: 'AMD Pensando DPU', url: 'https://www.amd.com/en/products/accelerators/pensando.html', type: 'vendor' } },
  { id: 'ti_c29x_cpu', name: 'C29x CPU/VPU', vendor: 'TI', category: 'dsp', description: 'Real-time C29x core with vector unit.', usedBy: [use('ti_c29x', 'c29x_cluster_cpu')], source: { title: 'TI C29x overview', url: 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview', type: 'vendor' } },
  { id: 'ti_vbus', name: 'VBUSM/VBUSP fabric', vendor: 'TI', category: 'interconnect', description: 'Master/peripheral VBUS fabric with AXI-APB bridges.', usedBy: [use('ti_c29x', 'c29x_cluster_vbus')], source: { title: 'TI C29x overview', url: 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview', type: 'vendor' } },
  { id: 'ti_c28x', name: 'C28x DSP core', vendor: 'TI', category: 'dsp', description: 'Real-time control DSP with FPU/TMU.', usedBy: [use('ti', 'ti_subsys_c28x')], source: { title: 'TI TMS320F28388D', url: 'https://www.ti.com/product/TMS320F28388D', type: 'datasheet' } },
  { id: 'ti_cla', name: 'Control Law Accelerator', vendor: 'TI', category: 'dsp', description: 'Independent floating-point control coprocessor.', usedBy: [use('ti', 'ti_ip_cla_accelerators')], source: { title: 'TI TMS320F28388D', url: 'https://www.ti.com/product/TMS320F28388D', type: 'datasheet' } },
  { id: 'cerebras_slac', name: 'SLAC core', vendor: 'Cerebras', category: 'cpu', description: 'Sparse linear algebra compute core.', usedBy: [use('cerebras', 'cer_subsys_slac_nw')], source: { title: 'Cerebras WSE-3', url: 'https://www.cerebras.ai/product-chip', type: 'whitepaper' } },
];

export const CROSS_VENDOR_BINDINGS: CrossVendorBinding[] = [
  {
    id: 'bind_samsung_rdna3', companyId: 'samsung', socId: 'samsung', blockId: 'ss_cluster_gpu',
    vendor: 'AMD', macro: 'RDNA 3 GPU architecture', role: 'GPU architecture license',
    verified: true, note: 'Samsung publicly states Xclipse 940 is based on AMD RDNA 3.',
    source: { title: 'Samsung Exynos 2400', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/', type: 'vendor' },
  },
  {
    id: 'bind_broadcom_arm', companyId: 'broadcom', socId: 'broadcom', blockId: 'bcm_cluster_cpu',
    vendor: 'Arm', macro: 'Cortex-A76', role: 'CPU IP license',
    verified: true, note: 'BCM2712 uses four Arm Cortex-A76 cores per Raspberry Pi documentation.',
    source: { title: 'BCM2712 documentation', url: 'https://www.raspberrypi.com/documentation/computers/processors.html', type: 'datasheet' },
  },
  {
    id: 'bind_apple_arm', companyId: 'apple', socId: 'apple', blockId: 'apple_cluster_cpu',
    vendor: 'Arm', macro: 'Arm architecture license', role: 'ISA architecture license',
    verified: true, note: 'Apple designs its own CPU cores under an Arm architecture license.',
    source: { title: 'Apple A17 Pro', url: 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/', type: 'vendor' },
  },
  {
    id: 'bind_apple_ti_power', companyId: 'apple', socId: 'apple', blockId: 'apple_cluster_pmu',
    vendor: 'TI', macro: 'Power-management macro (example)', role: 'External PMIC / power macro',
    verified: false, note: 'Illustrative user-defined cross-vendor binding. Replace with the real BOM/IP-XACT vendor extension; not a verified Apple supply-chain claim.',
    source: { title: 'Example binding', type: 'estimate' },
  },
  {
    id: 'bind_mediatek_arm', companyId: 'mediatek', socId: 'mediatek', blockId: 'mtk_cluster_cpu',
    vendor: 'Arm', macro: 'Cortex-X925 / X4 / A720', role: 'CPU IP license',
    verified: true, note: 'Dimensity 9400 publicly uses Armv9 CPU cores (Cortex-X925/X4/A720).',
    source: { title: 'MediaTek Dimensity 9400', url: 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400', type: 'vendor' },
  },
  {
    id: 'bind_qualcomm_arm', companyId: 'qualcomm', socId: 'qualcomm', blockId: 'qc_subsys_kryo_cpu',
    vendor: 'Arm', macro: 'Cortex-X4 / A720 / A520 family', role: 'CPU IP license',
    verified: true, note: 'Snapdragon 8 Gen 3 uses Armv9 CPU cores in a 1+5+2 configuration.',
    source: { title: 'Snapdragon 8 Gen 3', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' },
  },
];

export interface LatestSocSheet {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  year: string;
  process: string;
  summary: string;
  source: SpecSection['source'];
  clusters: { name: string; blocks: string[] }[];
  bridges: { kind: string; name: string; instances: number; from: string; to: string }[];
  ipRefs: string[];
  confidence: 'high' | 'medium' | 'low';
}

export const LATEST_SOCS: LatestSocSheet[] = [
  {
    id: 'apple_a18_pro', companyId: 'apple', companyName: 'Apple', name: 'A18 Pro', year: '2024', process: 'TSMC N3E (3nm)',
    summary: 'iPhone 16 Pro SoC: 6-core CPU (2P+4E), 6-core GPU, 16-core Neural Engine. Public block names only; no public TRM.',
    source: publicSummary('Apple A18 Pro', 'https://www.apple.com/newsroom/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/'),
    clusters: [
      { name: 'CPU', blocks: ['2x performance core', '4x efficiency core', 'L2', 'DSU'] },
      { name: 'GPU', blocks: ['6-core GPU', 'ray tracing', 'display'] },
      { name: 'Neural Engine', blocks: ['16-core ANE', 'SRAM', 'DMA'] },
      { name: 'Media', blocks: ['ISP', 'ProRes', 'HEVC'] },
      { name: 'Memory', blocks: ['LPDDR5X controller', 'PHY', 'SLC'] },
      { name: 'IO', blocks: ['USB4', 'PCIe', 'display IO'] },
      { name: 'Security', blocks: ['Secure Enclave', 'secure boot'] },
      { name: 'PMU', blocks: ['PMU', 'clock', 'thermal'] },
    ],
    bridges: [{ kind: 'NoC', name: 'Coherent fabric bridge', instances: 1, from: 'CPU/GPU/ANE', to: 'Memory/IO' }],
    ipRefs: ['Arm architecture license', 'Apple GPU', 'Apple Neural Engine'],
    confidence: 'low',
  },
  {
    id: 'qualcomm_8_elite', companyId: 'qualcomm', companyName: 'Qualcomm', name: 'Snapdragon 8 Elite', year: '2024', process: 'TSMC N3E',
    summary: 'Flagship Snapdragon with Oryon CPU, Adreno GPU, Hexagon NPU and integrated 5G. Public high-level block summary.',
    source: publicSummary('Snapdragon 8 Elite', 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-elite-mobile-platform'),
    clusters: [
      { name: 'CPU', blocks: ['2x Oryon prime', '6x Oryon performance', 'L2/L3'] },
      { name: 'GPU', blocks: ['Adreno GPU', 'frame extrapolation', 'display'] },
      { name: 'NPU', blocks: ['Hexagon NPU', 'sensing hub', 'DMA'] },
      { name: 'Media', blocks: ['Spectra ISP', 'video', 'audio'] },
      { name: 'Modem', blocks: ['5G NR', 'GNSS', 'RF'] },
      { name: 'Memory', blocks: ['LPDDR5X', 'DMC', 'SLC'] },
      { name: 'Security', blocks: ['secure boot', 'TEE', 'crypto'] },
      { name: 'PMU', blocks: ['PMU', 'clock', 'thermal'] },
    ],
    bridges: [{ kind: 'AXI_TO_APB', name: 'Peripheral AXI-APB bridge', instances: 2, from: 'NoC', to: 'Peripheral bus' }],
    ipRefs: ['Qualcomm Oryon', 'Adreno', 'Hexagon'],
    confidence: 'medium',
  },
  {
    id: 'mediatek_9400_sheet', companyId: 'mediatek', companyName: 'MediaTek', name: 'Dimensity 9400', year: '2024', process: 'TSMC N3E',
    summary: 'Cortex-X925/X4/A720, Immortalis-G925, APU 890 and 5G modem. Public high-level block summary.',
    source: publicSummary('MediaTek Dimensity 9400', 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400'),
    clusters: [
      { name: 'CPU', blocks: ['Cortex-X925', 'Cortex-X4', 'Cortex-A720', 'DSU'] },
      { name: 'GPU', blocks: ['Immortalis-G925', 'GPU MMU', 'display'] },
      { name: 'APU', blocks: ['APU 890', 'SRAM', 'DMA'] },
      { name: 'Media', blocks: ['ISP', 'MFC', 'display'] },
      { name: 'Modem', blocks: ['5G NR', 'GNSS', 'RF'] },
      { name: 'Memory', blocks: ['LPDDR5X', 'DMC', 'SLC'] },
      { name: 'Security', blocks: ['secure boot', 'TEE', 'crypto'] },
      { name: 'PMU', blocks: ['PMU', 'clock', 'thermal'] },
    ],
    bridges: [{ kind: 'AXI_TO_APB', name: 'Peripheral AXI-APB bridge', instances: 2, from: 'NoC', to: 'Peripheral bus' }],
    ipRefs: ['Arm Cortex-X925', 'Arm Immortalis-G925', 'MediaTek APU 890'],
    confidence: 'medium',
  },
  {
    id: 'samsung_2500', companyId: 'samsung', companyName: 'Samsung', name: 'Exynos 2500', year: '2025', process: 'Samsung SF3 (3nm)',
    summary: 'Successor to Exynos 2400 with Armv9 CPUs, Xclipse GPU and AI/NPU blocks. Public summary.',
    source: publicSummary('Samsung Exynos 2500', 'https://semiconductor.samsung.com/processor/mobile-processor/'),
    clusters: [
      { name: 'CPU', blocks: ['Cortex-X925', 'Cortex-A725', 'Cortex-A520', 'DSU'] },
      { name: 'GPU', blocks: ['Xclipse GPU', 'GMU', 'display'] },
      { name: 'NPU', blocks: ['AI NPU', 'SRAM', 'DMA'] },
      { name: 'Media', blocks: ['ISP', 'MFC', 'audio'] },
      { name: 'Modem', blocks: ['5G NR', 'GNSS', 'RF'] },
      { name: 'Memory', blocks: ['LPDDR5X', 'DMC', 'SLC'] },
      { name: 'Security', blocks: ['Knox Vault', 'secure boot', 'crypto'] },
      { name: 'PMU', blocks: ['PMU', 'clock', 'thermal'] },
    ],
    bridges: [{ kind: 'AXI_TO_APB', name: 'Peripheral AXI-APB bridge', instances: 2, from: 'NoC', to: 'Peripheral bus' }],
    ipRefs: ['Arm Cortex-X925', 'Samsung Xclipse', 'Samsung Knox Vault'],
    confidence: 'medium',
  },
  {
    id: 'ti_c29x', companyId: 'ti', companyName: 'Texas Instruments', name: 'C29x (F29H85x)', year: '2025', process: 'TI embedded flash',
    summary: 'Real-time C29x MCU with VPU/TMU, ETG/ePWM, CLB and VBUSM/VBUSP fabric. Bridge instances are the architecture-level view requested for the platform.',
    source: publicSummary('TI C29x real-time MCU', 'https://www.ti.com/microcontrollers-mcus-processors/microcontrollers/c2000-real-time-control-mcus/overview'),
    clusters: [
      { name: 'C29x CPU', blocks: ['C29x core', 'VPU', 'TMU', 'FPU'] },
      { name: 'VBUS fabric', blocks: ['VBUSM master', 'VBUSP peripheral', 'AXI-APB bridge 0', 'AXI-APB bridge 1'] },
      { name: 'ETG / PWM', blocks: ['ETG', 'ePWM', 'CLB', 'eCAP'] },
      { name: 'ADC', blocks: ['ADC-A', 'ADC-B', 'ADC-C', 'ADC-D'] },
      { name: 'Memory', blocks: ['Flash', 'SRAM', 'ROM', 'DMA'] },
      { name: 'Connectivity', blocks: ['CAN-FD', 'Ethernet', 'USB', 'SPI'] },
      { name: 'Safety', blocks: ['lockstep', 'ECC', 'watchdog', 'ERAD'] },
      { name: 'PMU', blocks: ['PMU', 'clock', 'thermal'] },
    ],
    bridges: [
      { kind: 'VBUSM', name: 'VBUSM master bridge', instances: 1, from: 'C29x CPU', to: 'VBUS/AXI' },
      { kind: 'VBUSP', name: 'VBUSP peripheral bridge', instances: 1, from: 'VBUS', to: 'Peripherals' },
      { kind: 'AXI_TO_APB', name: 'AXI-APB bridge 0', instances: 1, from: 'VBUSM', to: 'APB peripherals' },
      { kind: 'AXI_TO_APB', name: 'AXI-APB bridge 1', instances: 1, from: 'VBUSM', to: 'ETG/ePWM' },
    ],
    ipRefs: ['TI C29x', 'TI VPU/TMU', 'TI CLB'],
    confidence: 'medium',
  },
];

export const CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'CR-1001', title: 'eGTM ATOM IRQ is unsynchronized into IR', description: 'ATOM interrupt from the 500 MHz fGTM domain is sampled directly by the 100 MHz IR edge detector; add a 2-FF pulse synchronizer and a pulse-stretch register.',
    companyId: 'infineon', targetModuleId: 'inf_cluster_gtm', discipline: 'rtl', severity: 'critical', status: 'open', owner: 'RTL Integration',
    linkedSpecId: 'spec_inf_gtm', createdAt: '2026-10-18', updatedAt: '2026-11-02',
    history: [{ at: '2026-10-18', by: 'CDC lint', action: 'Created from Ac_unsync01' }, { at: '2026-11-02', by: 'Architecture', action: 'Assigned to RTL Integration' }],
  },
  {
    id: 'CR-1002', title: 'SMU NMI de-assertion violates RDC recovery/removal', description: 'SMU_SAFE NMI crosses into the 500 MHz CPU domain without a reset synchronizer. Add async-assert/sync-deassert reset logic and document the safety reaction latency.',
    companyId: 'infineon', targetModuleId: 'inf_cluster_safety', discipline: 'safety', severity: 'high', status: 'in_progress', owner: 'Safety Architect',
    linkedSpecId: 'spec_inf_smu', createdAt: '2026-10-21', updatedAt: '2026-11-04',
    history: [{ at: '2026-10-21', by: 'RDC review', action: 'Created' }, { at: '2026-11-04', by: 'Safety Architect', action: 'Prototype synchronizer under review' }],
  },
  {
    id: 'CR-1003', title: 'Xclipse GPU to NoC clock-domain crossing needs FIFO depth proof', description: 'GPU traffic crosses from the Xclipse clock to the coherent NoC. Prove FIFO depth 16 with the worst-case burst and add formal CDC coverage.',
    companyId: 'samsung', targetModuleId: 'ss_cluster_gpu', discipline: 'rtl', severity: 'high', status: 'triage', owner: 'SoC Integration',
    linkedSpecId: 'spec_ss_gpu', createdAt: '2026-10-28', updatedAt: '2026-11-05',
    history: [{ at: '2026-10-28', by: 'Architecture', action: 'Created during GPU integration review' }],
  },
  {
    id: 'CR-1004', title: 'PCIe reference clock power-domain sequence', description: 'BCM2712 PCIe refclk must be stable before the PCIe power domain is released. Add a PMIC sequencing dependency and a reset stretch.',
    companyId: 'broadcom', targetModuleId: 'bcm_cluster_pcie', discipline: 'pd', severity: 'medium', status: 'open', owner: 'Power/Timing',
    linkedSpecId: 'spec_bcm_pcie', createdAt: '2026-10-30', updatedAt: '2026-11-01',
    history: [{ at: '2026-10-30', by: 'Power team', action: 'Created' }],
  },
  {
    id: 'CR-1005', title: 'ANE SRAM DVFS transition ordering', description: 'Neural Engine SRAM must not be power-gated while the ANE DMA is active. Add a handshake and a DVFS quarantine window.',
    companyId: 'apple', targetModuleId: 'apple_cluster_neural', discipline: 'arch', severity: 'medium', status: 'triage', owner: 'Platform Architecture',
    linkedSpecId: 'spec_apple_ane', createdAt: '2026-11-01', updatedAt: '2026-11-03',
    history: [{ at: '2026-11-01', by: 'Platform Architecture', action: 'Created from public-summary review' }],
  },
  {
    id: 'CR-1006', title: 'IP-XACT bus-interface names must match interconnect schema', description: 'Imported IP-XACT components use vendor-specific bus interface names. Normalize them to the platform AXI4/CHI schema before assembly.',
    companyId: 'arm', targetModuleId: 'arm_cluster_noc', discipline: 'arch', severity: 'high', status: 'open', owner: 'IP-XACT Working Group',
    createdAt: '2026-11-02', updatedAt: '2026-11-02',
    history: [{ at: '2026-11-02', by: 'Platform', action: 'Created' }],
  },
];

export const ARCHITECTURE_DECISIONS: ArchitectureDecision[] = [
  {
    id: 'ADR-001', title: 'Use CMN-700 as the coherent interconnect for the Arm reference', context: 'The reference solution needs a scalable coherent mesh for CPU/GPU/NPU traffic.',
    decision: 'Adopt Arm CMN-700 with GIC-700 and MMU-700 as the reference NoC.', consequences: 'Vendor-specific CHI knowledge required; IP-XACT export uses CHI bus interfaces.',
    status: 'accepted', companyId: 'arm', linkedModuleIds: ['arm_cluster_noc'], linkedSpecIds: ['spec_arm_cmn'], owner: 'SoC Architecture', date: '2026-09-12',
  },
  {
    id: 'ADR-002', title: 'Keep the AURIX SRI as the central architectural hub', context: 'The top-level AURIX floorplan must explain how CPU, NVM, LMU, safety and peripherals interact.',
    decision: 'Render SRI as the central hub with star links to clusters and separate control/IRQ paths.', consequences: 'Top-level traces are longer; focus/lens is required to inspect a single path.',
    status: 'accepted', companyId: 'infineon', linkedModuleIds: ['inf_cluster_sri'], linkedSpecIds: ['spec_inf_sri'], owner: 'Automotive Architecture', date: '2026-09-20',
  },
  {
    id: 'ADR-003', title: 'Model Apple proprietary units as public summaries', context: 'Apple does not publish a block-level TRM for A17 Pro.',
    decision: 'Use published core counts and block names only; mark every proprietary detail as a public summary.', consequences: 'The Apple view is intentionally less granular; estimates must not be used for sign-off.',
    status: 'accepted', companyId: 'apple', linkedModuleIds: ['apple_cluster_cpu', 'apple_cluster_neural'], linkedSpecIds: ['spec_apple_cpu', 'spec_apple_ane'], owner: 'Research', date: '2026-09-28',
  },
  {
    id: 'ADR-004', title: 'IP-XACT 1685-2014 as the external exchange format', context: 'Custom IP and third-party macros must be importable into the platform.',
    decision: 'Support IP-XACT 1685-2014 component import/export and map busInterfaces/ports to the platform ModuleNode/Port model.', consequences: 'Vendor extensions are preserved as metadata; schema normalization is required.',
    status: 'accepted', companyId: 'arm', linkedModuleIds: [], linkedSpecIds: [], owner: 'Platform', date: '2026-10-05',
  },
  {
    id: 'ADR-005', title: 'Cross-vendor bindings must carry a verified flag', context: 'Public sources rarely confirm exact macro usage inside a competitor SoC.',
    decision: 'Every binding has verified:true/false plus a source; unverified bindings are illustrative and visibly marked.', consequences: 'The UI never presents a hypothetical Apple/TI power macro as fact.',
    status: 'accepted', companyId: 'apple', linkedModuleIds: ['apple_cluster_pmu'], linkedSpecIds: [], owner: 'Platform', date: '2026-10-12',
  },
];

export const IP_XACT_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<ipxact:component xmlns:ipxact="http://www.accellera.org/XMLSchema/IPXACT/1685-2014">
  <ipxact:vendor>ExampleVendor</ipxact:vendor>
  <ipxact:library>Platform</ipxact:library>
  <ipxact:name>axi_dma_controller</ipxact:name>
  <ipxact:version>1.0.0</ipxact:version>
  <ipxact:busInterfaces>
    <ipxact:busInterface>
      <ipxact:name>M_AXI</ipxact:name>
      <ipxact:busType vendor="amba" library="amba4" name="AXI4" version="1.0"/>
      <ipxact:master/>
      <ipxact:bitsWidth>64</ipxact:bitsWidth>
      <ipxact:clock>aclk</ipxact:clock>
    </ipxact:busInterface>
    <ipxact:busInterface>
      <ipxact:name>S_AXI</ipxact:name>
      <ipxact:busType vendor="amba" library="amba4" name="AXI4" version="1.0"/>
      <ipxact:slave/>
      <ipxact:bitsWidth>64</ipxact:bitsWidth>
      <ipxact:clock>aclk</ipxact:clock>
    </ipxact:busInterface>
  </ipxact:busInterfaces>
  <ipxact:memoryMaps>
    <ipxact:memoryMap><ipxact:name>regs</ipxact:name><ipxact:addressBlock><ipxact:name>csr</ipxact:name><ipxact:baseAddress>0x0</ipxact:baseAddress><ipxact:range>0x1000</ipxact:range><ipxact:width>32</ipxact:width></ipxact:addressBlock></ipxact:memoryMap>
  </ipxact:memoryMaps>
</ipxact:component>`;
