import type { SourceRef } from '../../types/platform';
export { SPEC_SECTIONS } from '../../data/platformData';

export const COMPANIES_SOURCE_LOOKUP: Record<string, SourceRef> = {
  infineon: { title: 'AURIX TC4Dx user manual v1.1', url: 'https://www.infineon.com/aurix', type: 'trm' },
  arm: { title: 'Arm Total Compute Solutions 2024', url: 'https://www.arm.com/products/total-compute-solutions', type: 'vendor' },
  broadcom: { title: 'Raspberry Pi BCM2712 documentation', url: 'https://www.raspberrypi.com/documentation/computers/processors.html', type: 'datasheet' },
  samsung: { title: 'Samsung Exynos 2400', url: 'https://semiconductor.samsung.com/processor/mobile-processor/exynos-2400/', type: 'vendor' },
  mediatek: { title: 'MediaTek Dimensity 9400', url: 'https://www.mediatek.com/products/smartphones/mediatek-dimensity-9400', type: 'vendor' },
  apple: { title: 'Apple A17 Pro public summary', url: 'https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/', type: 'vendor' },
  ti: { title: 'TI TMS320F28388D', url: 'https://www.ti.com/product/TMS320F28388D', type: 'datasheet' },
  nvidia: { title: 'NVIDIA DRIVE Orin', url: 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/', type: 'whitepaper' },
  qualcomm: { title: 'Snapdragon 8 Gen 3', url: 'https://www.qualcomm.com/products/mobile/snapdragon/smartphones/snapdragon-8-series-mobile-platforms/snapdragon-8-gen-3-mobile-platform', type: 'vendor' },
  cerebras: { title: 'Cerebras WSE-3', url: 'https://www.cerebras.ai/product-chip', type: 'whitepaper' },
};
