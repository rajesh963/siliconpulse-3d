import type { CompanySoCEntry } from '../data/socCatalog';
import type { MemoryMapRange, ModuleNode, Port, ClockDomainInfo, ResetDomainInfo, PowerDomainInfo, InterconnectConnection } from '../types/soc';

export interface ParsedBusInterface {
  name: string;
  direction: 'master' | 'slave' | 'system';
  busType: string;
  width: number;
  clock: string;
}

export interface ParsedMemoryMap {
  name: string;
  blocks: { name: string; baseAddress: string; range: string; width: string }[];
}

export interface ParsedIpXact {
  vendor: string;
  library: string;
  name: string;
  version: string;
  busInterfaces: ParsedBusInterface[];
  memoryMaps: ParsedMemoryMap[];
  ports: { name: string; direction: string; width: string }[];
  raw: string;
}

const local = (el: Element, name: string): Element | null => {
  const list = el.getElementsByTagName('*');
  for (let i = 0; i < list.length; i++) {
    if (list[i].localName === name) return list[i];
  }
  return null;
};

const locals = (el: Element, name: string): Element[] => {
  const out: Element[] = [];
  const list = el.getElementsByTagName('*');
  for (let i = 0; i < list.length; i++) {
    if (list[i].localName === name) out.push(list[i]);
  }
  return out;
};

const text = (el: Element | null, fallback = ''): string => el?.textContent?.trim() ?? fallback;

export const parseIpXact = (xml: string): ParsedIpXact => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) throw new Error('Invalid XML: ' + (parserError.textContent ?? 'parse error'));
  const component = doc.getElementsByTagName('*');
  let root: Element | null = null;
  for (let i = 0; i < component.length; i++) {
    if (component[i].localName === 'component') { root = component[i]; break; }
  }
  if (!root) throw new Error('No ipxact:component element found');

  const busInterfaces = locals(root, 'busInterface').map(iface => {
    const busTypeEl = local(iface, 'busType');
    const master = local(iface, 'master');
    const slave = local(iface, 'slave');
    const widthEl = local(iface, 'bitsWidth') ?? local(iface, 'width');
    return {
      name: text(local(iface, 'name'), 'bus'),
      direction: master ? 'master' : slave ? 'slave' : 'system',
      busType: text(busTypeEl, 'AXI4'),
      width: Number(text(widthEl, '64')) || 64,
      clock: text(local(iface, 'clock'), 'clk'),
    } as ParsedBusInterface;
  });

  const memoryMaps = locals(root, 'memoryMap').map(map => ({
    name: text(local(map, 'name'), 'memoryMap'),
    blocks: locals(map, 'addressBlock').map(block => ({
      name: text(local(block, 'name'), 'block'),
      baseAddress: text(local(block, 'baseAddress'), '0x0'),
      range: text(local(block, 'range'), '0x1000'),
      width: text(local(block, 'width'), '32'),
    })),
  }));

  const ports = locals(root, 'port').map(port => ({
    name: text(local(port, 'name'), 'port'),
    direction: text(local(port, 'direction'), 'in'),
    width: text(local(port, 'width'), '1'),
  }));

  return {
    vendor: text(local(root, 'vendor'), 'Unknown'),
    library: text(local(root, 'library'), 'Default'),
    name: text(local(root, 'name'), 'component'),
    version: text(local(root, 'version'), '1.0'),
    busInterfaces,
    memoryMaps,
    ports,
    raw: xml,
  };
};

export const guessCategory = (name: string): ModuleNode['category'] => {
  const n = name.toLowerCase();
  if (/(cpu|core|processor|dsp|riscv|arm|cortex)/.test(n)) return 'compute';
  if (/(gpu|npu|ai|neural|accelerator)/.test(n)) return 'compute';
  if (/(ddr|memory|sram|dram|flash|rom|cache)/.test(n)) return 'memory';
  if (/(axi|chi|noc|bus|fabric|interconnect|bridge)/.test(n)) return 'interconnect';
  if (/(aes|crypto|secure|security|secur|trng|key)/.test(n)) return 'security';
  if (/(adc|dac|phy|analog|pll|pmu|power)/.test(n)) return 'analog';
  return 'peripheral';
};

const SLOT_POSITIONS: [number, number][] = [
  [-15, -11.5], [0, -11.5], [15, -11.5],
  [-15, 0], [0, 0], [15, 0],
  [-15, 11.5], [0, 11.5], [15, 11.5],
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export const componentToModule = (component: ParsedIpXact, index: number, parentId = 'custom_soc_top'): ModuleNode => {
  const [x, z] = SLOT_POSITIONS[index % SLOT_POSITIONS.length];
  const id = `custom_${slug(component.name)}_${index}`;
  const category = guessCategory(component.name);
  const ports: Port[] = component.busInterfaces.map((iface, portIndex) => ({
    id: `${id}_${slug(iface.name)}`,
    name: iface.name,
    direction: iface.direction === 'master' ? 'out' : iface.direction === 'slave' ? 'in' : 'inout',
    width: iface.width,
    clockDomain: iface.clock || 'F_CUSTOM_100M',
    resetDomain: 'rst_custom_n',
    protocol: iface.busType.includes('CHI') ? 'AXI4' : iface.busType.includes('AHB') ? 'AHB' : iface.busType.includes('APB') ? 'APB' : iface.busType.includes('PCIe') ? 'PCIe' : 'AXI4',
    cdcStatus: 'clean',
    normal: (portIndex % 2 === 0 ? [1, 0, 0] : [-1, 0, 0]) as [number, number, number],
    offset: -0.6 + (portIndex % 4) * 0.4,
  }));
  return {
    id,
    name: component.name,
    displayName: `${component.vendor} ${component.name} ${component.version}`.trim(),
    description: `Imported IP-XACT component ${component.vendor}:${component.library}:${component.name}:${component.version}. ${component.busInterfaces.length} bus interfaces, ${component.memoryMaps.length} memory maps.`,
    type: 'ip',
    category,
    level: 1,
    parentId,
    position: [x, 0.9, z],
    size: [13, 1.8, 9],
    color: category === 'compute' ? '#00f2fe' : category === 'memory' ? '#3b82f6' : category === 'interconnect' ? '#8b5cf6' : category === 'security' ? '#f43f5e' : category === 'analog' ? '#eab308' : '#ec4899',
    clockDomains: Array.from(new Set(component.busInterfaces.map(i => i.clock).filter(Boolean))).slice(0, 4),
    resetDomains: ['rst_custom_n'],
    powerDomains: ['PD_CUSTOM'],
    ports,
    shortLabel: component.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'CUST',
    subtitle: `${component.vendor} · ${component.version}`,
    children: [],
  };
};

export const buildCustomSoc = (components: ParsedIpXact[], socName: string, companyName = 'Custom'): CompanySoCEntry => {
  const rootId = 'custom_soc_top';
  const children = components.map((component, index) => componentToModule(component, index, rootId));
  const clocks: ClockDomainInfo[] = [];
  for (const child of children) {
    for (const clock of child.clockDomains) {
      if (!clocks.some(existing => existing.name === clock)) {
        clocks.push({ name: clock, freqMhz: 100, color: `hsl(${(clocks.length * 73) % 360} 70% 55%)`, description: 'Imported IP-XACT clock' });
      }
    }
  }
  if (clocks.length === 0) clocks.push({ name: 'F_CUSTOM_100M', freqMhz: 100, color: '#00f2fe', description: 'Default custom clock' });
  const resets: ResetDomainInfo[] = [{ name: 'rst_custom_n', type: 'async_assert_sync_deassert', color: '#00f2fe' }];
  const powers: PowerDomainInfo[] = [{ name: 'PD_CUSTOM', voltage: 'TBD', color: '#f59e0b', description: 'Custom SoC power domain' }];

  const connections: InterconnectConnection[] = [];
  for (let i = 0; i < children.length; i++) {
    for (let j = i + 1; j < children.length; j++) {
      const a = children[i];
      const b = children[j];
      const aMaster = a.ports.find(p => p.direction === 'out');
      const bSlave = b.ports.find(p => p.direction === 'in');
      if (aMaster && bSlave) {
        connections.push({
          id: `custom_conn_${i}_${j}`,
          name: `${a.name} → ${b.name}`,
          srcModuleId: a.id, srcPortId: aMaster.id, dstModuleId: b.id, dstPortId: bSlave.id,
          busType: `${aMaster.protocol} ${aMaster.width}-bit`, width: aMaster.width,
          srcClock: aMaster.clockDomain, dstClock: bSlave.clockDomain,
          isCrossClock: aMaster.clockDomain !== bSlave.clockDomain,
          cdcStatus: 'unverified', rdcStatus: 'na',
          syncScheme: 'Imported IP-XACT connection — synchronizer TBD',
          reportSource: 'system_check', edaCheckId: 'IPXACT_IMPORT',
          details: 'Auto-generated from matching IP-XACT bus interfaces; verify protocol compatibility.',
          hierarchicalLevelScope: 'soc_top',
        });
      }
    }
  }

  const hierarchy: ModuleNode = {
    id: rootId,
    name: socName.replace(/\s+/g, '_'),
    displayName: socName,
    description: `Custom SoC assembled from ${components.length} imported IP-XACT components.`,
    type: 'subsystem', category: 'compute', level: 0, parentId: null,
    position: [0, 0, 0], size: [48, 0.8, 38], color: '#0e162b',
    clockDomains: clocks.map(c => c.name), resetDomains: resets.map(r => r.name), powerDomains: powers.map(p => p.name),
    ports: [], children,
  };

  return {
    id: 'custom',
    companyName,
    chipModel: socName,
    trmDocumentId: 'Custom IP-XACT assembly',
    tagline: `${components.length} imported IP-XACT components`,
    processNode: 'TBD',
    primaryApp: 'User-defined SoC',
    brandColor: '#22d3ee',
    badgeSymbol: 'CUS',
    memoryMap: components.flatMap(component => component.memoryMaps.flatMap(map => map.blocks.map(block => ({
      region: `${component.name} / ${map.name} / ${block.name}`,
      startAddr: block.baseAddress,
      endAddr: block.baseAddress,
      size: block.range,
      busMaster: component.vendor,
      description: `Imported IP-XACT address block (${block.width}-bit).`,
    } as MemoryMapRange)))),
    hierarchy,
    connections,
    clockDomains: clocks,
    resetDomains: resets,
    powerDomains: powers,
  };
};

export const exportCompanyToIpXact = (company: CompanySoCEntry): string => {
  const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const interfaces = company.connections.slice(0, 40).map((conn, index) => `
    <ipxact:busInterface>
      <ipxact:name>${esc(conn.id)}</ipxact:name>
      <ipxact:busType vendor="amba" library="amba4" name="${esc(conn.busType)}" version="1.0"/>
      ${index % 2 === 0 ? '<ipxact:master/>' : '<ipxact:slave/>'}
      <ipxact:bitsWidth>${conn.width}</ipxact:bitsWidth>
      <ipxact:clock>${esc(conn.srcClock)}</ipxact:clock>
    </ipxact:busInterface>`).join('');
  const maps = company.memoryMap.map(range => `
    <ipxact:memoryMap>
      <ipxact:name>${esc(range.region.replace(/[^A-Za-z0-9]+/g, '_'))}</ipxact:name>
      <ipxact:addressBlock>
        <ipxact:name>${esc(range.region)}</ipxact:name>
        <ipxact:baseAddress>${esc(range.startAddr)}</ipxact:baseAddress>
        <ipxact:range>${esc(range.size)}</ipxact:range>
        <ipxact:width>32</ipxact:width>
      </ipxact:addressBlock>
    </ipxact:memoryMap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<ipxact:component xmlns:ipxact="http://www.accellera.org/XMLSchema/IPXACT/1685-2014">
  <ipxact:vendor>SiliconPulse</ipxact:vendor>
  <ipxact:library>SoC</ipxact:library>
  <ipxact:name>${esc(company.chipModel.replace(/[^A-Za-z0-9]+/g, '_'))}</ipxact:name>
  <ipxact:version>1.0.0</ipxact:version>
  <ipxact:busInterfaces>${interfaces}
  </ipxact:busInterfaces>
  <ipxact:memoryMaps>${maps}
  </ipxact:memoryMaps>
  <!-- Clock domains: ${esc(company.clockDomains.map(c => c.name).join(', '))} -->
  <!-- Reset domains: ${esc(company.resetDomains.map(r => r.name).join(', '))} -->
  <!-- Power domains: ${esc((company.powerDomains ?? []).map(p => p.name).join(', '))} -->
</ipxact:component>`;
};

export const downloadText = (filename: string, text: string, mime = 'application/xml') => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
