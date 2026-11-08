import type { CompanySoCEntry } from '../data/socCatalog';
import type { ModuleNode } from '../types/soc';
import { getArchitectureDiagram } from '../data/diagrams';
import {
  ARCHITECTURE_DECISIONS,
  CHANGE_REQUESTS,
  COMPANY_PROFILES,
  CROSS_VENDOR_BINDINGS,
  IP_REGISTRY,
  LATEST_SOCS,
  SOC_PROFILES,
  SPEC_SECTIONS,
} from '../data/platformData';

const expandInstances = (node: ModuleNode): string[] => {
  if (node.instances?.length) return node.instances;
  const name = node.name.trim();
  const simpleRange = name.match(/^([A-Za-z_]+)(\d+)\s*[/\-]\s*(\d+)$/);
  if (simpleRange) {
    const [, prefix, startText, endText] = simpleRange;
    const start = Number(startText);
    const end = Number(endText);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start < 64) {
      return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    }
  }
  const spaceRange = name.match(/^(.*?)(\d+)\s*[-–]\s*(\d+)$/);
  if (spaceRange) {
    const [, prefixText, startText, endText] = spaceRange;
    const start = Number(startText);
    const end = Number(endText);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start < 64) {
      return Array.from({ length: end - start + 1 }, (_, i) => `${prefixText.trim()} ${start + i}`);
    }
  }
  return [name];
};

const modulePath = (node: ModuleNode, path: string[] = []): string[] => [...path, node.name];

const toBlockJson = (node: ModuleNode, path: string[] = []): Record<string, unknown> => ({
  id: node.id,
  name: node.name,
  displayName: node.displayName,
  level: node.level,
  type: node.type,
  category: node.category,
  role: node.role ?? (node.type === 'bridge' ? 'bridge' : node.type === 'fabric' ? 'fabric' : node.category === 'memory' ? 'memory' : node.category === 'security' ? 'control' : node.category === 'compute' ? 'master' : 'io'),
  instances: expandInstances(node),
  instanceCount: expandInstances(node).length,
  domains: {
    clock: node.clockDomains,
    reset: node.resetDomains,
    power: node.powerDomains ?? [],
  },
  specRef: node.docRef ?? null,
  source: node.docRef ? { document: node.docRef } : null,
  interfaces: (node.ports ?? []).map(port => ({
    name: port.name,
    direction: port.direction,
    width: port.width,
    protocol: port.protocol,
    clock: port.clockDomain,
    reset: port.resetDomain,
    cdc: port.cdcStatus,
  })),
  path: modulePath(node, path.slice(0, -1)),
  children: (node.children ?? []).map(child => toBlockJson(child, [...path, node.name])),
});

const walk = (node: ModuleNode, out: ModuleNode[] = []): ModuleNode[] => {
  out.push(node);
  for (const child of node.children ?? []) walk(child, out);
  return out;
};

const isBridge = (node: ModuleNode): boolean =>
  node.type === 'bridge' ||
  /bridge|s2s|s2f|s2c|f2s|a2s|s2a|axi_to_apb|vbusm|vbusp|ahb_to_apb|apb_to_ahb/i.test(node.name);

export const buildIntegrationJson = (company: CompanySoCEntry): Record<string, unknown> => {
  const profile = COMPANY_PROFILES.find(p => p.id === company.id) ?? COMPANY_PROFILES.find(p => p.id === company.id.replace(/_.*$/, ''));
  const soc = SOC_PROFILES.find(s => s.companyId === company.id) ?? SOC_PROFILES.find(s => s.companyId === company.id.replace(/_.*$/, ''));
  const nodes = walk(company.hierarchy);
  const bridges = nodes.filter(isBridge).map(node => {
    const parent = nodes.find(candidate => candidate.children?.some(child => child.id === node.id));
    const links = company.connections.filter(conn => conn.srcModuleId === node.id || conn.dstModuleId === node.id);
    return {
      id: node.id,
      name: node.name,
      displayName: node.displayName,
      kind: /s2s/i.test(node.name) ? 'S2S' : /s2f/i.test(node.name) ? 'S2F' : /s2c/i.test(node.name) ? 'S2C' : /vbusm/i.test(node.name) ? 'VBUSM' : /vbusp/i.test(node.name) ? 'VBUSP' : /axi_to_apb/i.test(node.name) ? 'AXI_TO_APB' : node.type === 'bridge' ? 'BRIDGE' : 'FABRIC_BRIDGE',
      instances: expandInstances(node),
      parent: parent?.name ?? null,
      specRef: node.docRef ?? null,
      links: links.map(conn => ({ id: conn.id, name: conn.name, other: conn.srcModuleId === node.id ? conn.dstModuleId : conn.srcModuleId })),
    };
  });

  const busMap = new Map<string, { protocol: string; width: number; busType: string; links: { id: string; name: string; src: string; dst: string; crossClock: boolean; cdc: string }[] }>();
  for (const conn of company.connections) {
    const key = `${conn.busType}|${conn.width}`;
    const entry = busMap.get(key) ?? { protocol: conn.busType.split(/[ /]/)[0], width: conn.width, busType: conn.busType, links: [] };
    entry.links.push({ id: conn.id, name: conn.name, src: conn.srcModuleId, dst: conn.dstModuleId, crossClock: conn.isCrossClock, cdc: conn.cdcStatus });
    busMap.set(key, entry);
  }

  const crs = CHANGE_REQUESTS.filter(cr => cr.companyId === company.id);
  const adrs = ARCHITECTURE_DECISIONS.filter(adr => adr.companyId === company.id);
  const specs = SPEC_SECTIONS.filter(s => s.companyId === company.id);
  const ipRefs = IP_REGISTRY.filter(ip => ip.usedBy.some(use => use.companyId === company.id));

  return {
    schema: 'socpulse.integration.v1',
    generatedAt: new Date().toISOString(),
    company: {
      id: company.id,
      name: company.companyName,
      kind: profile?.kind ?? 'semiconductor',
      hq: profile?.hq ?? null,
      architectures: profile?.architectures ?? [],
      website: profile?.website ?? null,
    },
    soc: {
      name: company.chipModel,
      process: company.processNode,
      tagline: company.tagline,
      primaryApp: company.primaryApp,
      publicDataConfidence: soc?.publiclyDocumented ?? 'medium',
      source: soc?.source ?? profile?.sources[0] ?? null,
    },
    summary: {
      blocks: nodes.length,
      leafIPs: nodes.filter(n => !n.children?.length).length,
      bridges: bridges.length,
      bridgeInstances: bridges.reduce((sum, bridge) => sum + bridge.instances.length, 0),
      connections: company.connections.length,
      specSections: specs.length,
      reusableIPs: ipRefs.length,
      clockDomains: company.clockDomains.length,
      resetDomains: company.resetDomains.length,
      powerDomains: company.powerDomains?.length ?? 0,
    },
    domains: {
      clock: company.clockDomains,
      reset: company.resetDomains,
      power: company.powerDomains ?? [],
    },
    buses: Array.from(busMap.values()),
    bridges,
    blocks: (company.hierarchy.children ?? []).map(child => toBlockJson(child, [company.hierarchy.name])),
    connections: company.connections.map(conn => ({
      id: conn.id,
      name: conn.name,
      source: conn.srcModuleId,
      sourcePort: conn.srcPortId || null,
      target: conn.dstModuleId,
      targetPort: conn.dstPortId || null,
      busType: conn.busType,
      width: conn.width,
      sourceClock: conn.srcClock,
      targetClock: conn.dstClock,
      crossClock: conn.isCrossClock,
      cdc: conn.cdcStatus,
      rdc: conn.rdcStatus,
      syncScheme: conn.syncScheme,
      check: conn.edaCheckId,
      specRef: conn.hierarchicalLevelScope,
    })),
    architecture: getArchitectureDiagram(company),
    memoryMap: company.memoryMap,
    specs,
    reusableIPs: ipRefs,
    crossVendorBindings: CROSS_VENDOR_BINDINGS.filter(binding => binding.companyId === company.id),
    tracker: { changeRequests: crs, architectureDecisions: adrs },
    sources: [
      ...(profile?.sources ?? []),
      ...(soc ? [soc.source] : []),
    ],
  };
};

export const buildAllSpecsJson = (catalog: Record<string, CompanySoCEntry>): Record<string, unknown> => {
  const companies = Object.values(catalog).filter(entry => entry.id !== 'custom');
  return {
    schema: 'socpulse.specs.v1',
    generatedAt: new Date().toISOString(),
    description: 'Public SoC/IP knowledge bundle: company profiles, SoC integration JSON, curated spec sections, reusable IP registry, cross-vendor bindings, CRs and ADRs.',
    policy: 'Public or public-summary data only. Apple and other undocumented blocks are summaries; unverified cross-vendor bindings are marked.',
    companyProfiles: COMPANY_PROFILES,
    socProfiles: SOC_PROFILES,
    specs: SPEC_SECTIONS,
    ipRegistry: IP_REGISTRY,
    crossVendorBindings: CROSS_VENDOR_BINDINGS,
    changeRequests: CHANGE_REQUESTS,
    architectureDecisions: ARCHITECTURE_DECISIONS,
    latestSocSheets: LATEST_SOCS,
    socs: companies.map(company => buildIntegrationJson(company)),
  };
};

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
