import type { CompanySoCEntry } from '../socCatalog';
import type { ArchitectureDiagram, DiagramBlock, DiagramWire } from '../../types/diagram';
import { AURIX_TC4DX_DIAGRAM } from './aurixTC4Dx';
import { ARM_TCS24_DIAGRAM } from './armTCS24';
import { BROADCOM_BCM2712_DIAGRAM } from './broadcomBCM2712';
import { SAMSUNG_EXYNOS2400_DIAGRAM } from './samsungExynos2400';
import { APPLE_A17PRO_DIAGRAM } from './appleA17Pro';
import { MEDIATEK_D9400_DIAGRAM } from './mediatekDimensity9400';
import { TI_C29X_DIAGRAM } from './tiC29x';
import { TI_C2000_F28388D_DIAGRAM } from './tiC2000F28388D';
import { NVIDIA_ORIN_DIAGRAM } from './nvidiaOrin';
import { QUALCOMM_SM8650_DIAGRAM } from './qualcommSM8650';
import { CEREBRAS_WSE3_DIAGRAM } from './cerebrasWSE3';
import { AMD_P4_NIC_DIAGRAM } from './amdP4Nic';

const COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#fbbf24', '#60a5fa', '#f87171'];

export const buildAutoDiagram = (company: CompanySoCEntry): ArchitectureDiagram => {
  const clusters = company.hierarchy.children ?? [];
  const cols = Math.min(4, Math.max(2, clusters.length));
  const gapX = 300;
  const gapY = 180;
  const startX = 80;
  const startY = 100;
  const blocks: DiagramBlock[] = clusters.map((cluster, index) => ({
    id: cluster.id,
    label: cluster.name,
    sublabel: cluster.displayName,
    kind: cluster.category === 'compute' ? 'cpu' : cluster.category === 'memory' ? 'memory' : cluster.category === 'interconnect' ? 'crossbar' : cluster.category === 'security' ? 'security' : 'peripheral',
    x: startX + (index % cols) * gapX,
    y: startY + Math.floor(index / cols) * gapY,
    w: 240,
    h: 90,
    color: COLORS[index % COLORS.length],
    moduleId: cluster.id,
    specRef: cluster.docRef,
    details: cluster.description,
  }));

  const byId = new Map(blocks.map(block => [block.id, block]));
  const wires: DiagramWire[] = [];
  for (const conn of company.connections) {
    const from = byId.get(conn.srcModuleId);
    const to = byId.get(conn.dstModuleId);
    if (!from || !to) continue;
    const fx = from.x + from.w / 2;
    const fy = from.y + from.h / 2;
    const tx = to.x + to.w / 2;
    const ty = to.y + to.h / 2;
    const midY = (fy + ty) / 2;
    wires.push({
      id: conn.id,
      label: conn.busType,
      from: from.id,
      to: to.id,
      busType: conn.busType,
      width: conn.width,
      clock: conn.srcClock,
      points: fx === tx ? [[fx, fy], [tx, ty]] : [[fx, fy], [fx, midY], [tx, midY], [tx, ty]],
    });
  }

  return {
    id: `${company.id}_auto_arch`,
    companyId: company.id,
    socId: company.id,
    title: `${company.companyName} ${company.chipModel} — architecture`,
    subtitle: company.tagline,
    source: company.trmDocumentId,
    width: Math.max(1400, startX + cols * gapX + 60),
    height: Math.max(800, startY + Math.ceil(clusters.length / cols) * gapY + 120),
    groups: [],
    blocks,
    wires,
    notes: ['Auto-generated cluster-level diagram. Add a spec-derived diagram for full block/bus fidelity.'],
  };
};

export const DIAGRAM_REGISTRY: Record<string, ArchitectureDiagram> = {
  infineon: AURIX_TC4DX_DIAGRAM,
  arm: ARM_TCS24_DIAGRAM,
  broadcom: BROADCOM_BCM2712_DIAGRAM,
  samsung: SAMSUNG_EXYNOS2400_DIAGRAM,
  apple: APPLE_A17PRO_DIAGRAM,
  mediatek: MEDIATEK_D9400_DIAGRAM,
  ti_c29x: TI_C29X_DIAGRAM,
  ti: TI_C2000_F28388D_DIAGRAM,
  nvidia: NVIDIA_ORIN_DIAGRAM,
  qualcomm: QUALCOMM_SM8650_DIAGRAM,
  cerebras: CEREBRAS_WSE3_DIAGRAM,
  amd: AMD_P4_NIC_DIAGRAM,
};

export const getArchitectureDiagram = (company: CompanySoCEntry): ArchitectureDiagram => {
  return DIAGRAM_REGISTRY[company.id] ?? buildAutoDiagram(company);
};
