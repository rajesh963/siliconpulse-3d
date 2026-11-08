import type { ArchitectureDiagram, DiagramBlock, DiagramGroup, DiagramWire } from '../types/diagram';
import type { ParsedIpXact } from './ipxact';
import type { InterconnectConnection, ModuleNode } from '../types/soc';
import { guessCategory } from './ipxact';

const KINDS: DiagramBlock['kind'][] = ['cpu', 'bus', 'crossbar', 'bridge', 'memory', 'peripheral', 'accelerator', 'io', 'security', 'clock', 'debug', 'group'];

const slug = (value: string, fallback: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || fallback;

const asNumber = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const parsePoints = (points: unknown): [number, number][] => {
  if (Array.isArray(points)) {
    return points
      .map((point: any) => {
        if (Array.isArray(point) && point.length >= 2) return [asNumber(point[0], 0), asNumber(point[1], 0)] as [number, number];
        if (point && typeof point === 'object') return [asNumber(point.x, 0), asNumber(point.y, 0)] as [number, number];
        return null;
      })
      .filter((point): point is [number, number] => point !== null);
  }
  if (typeof points === 'string') {
    return points
      .split(/[;\s]+/)
      .map(part => part.split(/[:,]/).map(Number))
      .filter(pair => pair.length === 2 && pair.every(Number.isFinite))
      .map(pair => [pair[0], pair[1]] as [number, number]);
  }
  return [];
};

export function normalizeDiagram(
  raw: any,
  options: { companyId?: string; socId?: string; title?: string } = {}
): ArchitectureDiagram {
  if (!raw || typeof raw !== 'object') throw new Error('Diagram must be a JSON object.');
  if (!Array.isArray(raw.blocks) || raw.blocks.length === 0) throw new Error('Diagram needs a non-empty "blocks" array.');

  const seen = new Set<string>();
  const blocks: DiagramBlock[] = raw.blocks.map((block: any, index: number) => {
    const label = String(block.label ?? block.name ?? `Block ${index + 1}`);
    const id = String(block.id ?? slug(label, `block_${index + 1}`));
    if (seen.has(id)) throw new Error(`Duplicate block id "${id}".`);
    seen.add(id);
    const kind = KINDS.includes(block.kind) ? block.kind : 'peripheral';
    return {
      id,
      label,
      sublabel: block.sublabel ? String(block.sublabel) : undefined,
      kind,
      x: asNumber(block.x, 60 + (index % 4) * 260),
      y: asNumber(block.y, 80 + Math.floor(index / 4) * 150),
      w: Math.max(20, asNumber(block.w, 200)),
      h: Math.max(16, asNumber(block.h, 90)),
      color: block.color ? String(block.color) : undefined,
      moduleId: block.moduleId ? String(block.moduleId) : undefined,
      specRef: block.specRef ? String(block.specRef) : undefined,
      badges: Array.isArray(block.badges) ? block.badges.map(String) : undefined,
      details: block.details ? String(block.details) : undefined,
      internal: block.internal && typeof block.internal === 'object'
        ? normalizeDiagram(block.internal, { companyId: options.companyId, title: block.internal.title ?? `${label} internals` })
        : undefined,
    };
  });

  const byId = new Map(blocks.map(block => [block.id, block]));
  const wireSeen = new Set<string>();
  const wires: DiagramWire[] = (Array.isArray(raw.wires) ? raw.wires : []).map((wire: any, index: number) => {
    const from = wire.from ? String(wire.from) : undefined;
    const to = wire.to ? String(wire.to) : undefined;
    if (from && !byId.has(from)) throw new Error(`Wire ${index + 1} references missing block "${from}".`);
    if (to && !byId.has(to)) throw new Error(`Wire ${index + 1} references missing block "${to}".`);
    let points = parsePoints(wire.points);
    if (points.length < 2 && from && to) {
      const a = byId.get(from)!;
      const b = byId.get(to)!;
      const ax = a.x + a.w / 2;
      const ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const midY = (ay + by) / 2;
      points = ax === bx ? [[ax, ay], [bx, by]] : [[ax, ay], [ax, midY], [bx, midY], [bx, by]];
    }
    if (points.length < 2) throw new Error(`Wire ${index + 1} needs at least two points, or from/to blocks.`);
    const id = String(wire.id ?? `wire_${index + 1}`);
    if (wireSeen.has(id)) throw new Error(`Duplicate wire id "${id}".`);
    wireSeen.add(id);
    return {
      id,
      label: wire.label ? String(wire.label) : undefined,
      points,
      from,
      to,
      busType: wire.busType ? String(wire.busType) : undefined,
      width: wire.width == null ? undefined : asNumber(wire.width, 0),
      clock: wire.clock ? String(wire.clock) : undefined,
      color: wire.color ? String(wire.color) : undefined,
      dashed: Boolean(wire.dashed),
      arrow: wire.arrow === 'both' || wire.arrow === 'none' ? wire.arrow : 'end',
      details: wire.details ? String(wire.details) : undefined,
    };
  });

  const groups: DiagramGroup[] = (Array.isArray(raw.groups) ? raw.groups : []).map((group: any, index: number) => ({
    id: String(group.id ?? `group_${index + 1}`),
    label: String(group.label ?? `Group ${index + 1}`),
    x: asNumber(group.x, 0),
    y: asNumber(group.y, 0),
    w: Math.max(10, asNumber(group.w, 400)),
    h: Math.max(10, asNumber(group.h, 200)),
    color: group.color ? String(group.color) : undefined,
  }));

  const maxX = Math.max(0, ...blocks.map(block => block.x + block.w), ...groups.map(group => group.x + group.w));
  const maxY = Math.max(0, ...blocks.map(block => block.y + block.h), ...groups.map(group => group.y + group.h));

  return {
    id: String(raw.id ?? 'uploaded_architecture'),
    companyId: String(raw.companyId ?? options.companyId ?? 'custom'),
    socId: String(raw.socId ?? options.socId ?? options.companyId ?? 'custom'),
    title: String(raw.title ?? options.title ?? 'Uploaded architecture'),
    subtitle: raw.subtitle ? String(raw.subtitle) : 'User-supplied diagram JSON',
    source: raw.source ? String(raw.source) : 'Uploaded diagram JSON',
    width: Math.max(320, asNumber(raw.width, maxX + 60)),
    height: Math.max(240, asNumber(raw.height, maxY + 60)),
    groups,
    blocks,
    wires,
    notes: Array.isArray(raw.notes) ? raw.notes.map(String) : ['User-supplied diagram. Validate against the source spec before using for sign-off.'],
  };
}

export function diagramFromCsv(text: string, options: { companyId?: string } = {}): ArchitectureDiagram {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one data row.');
  const header = rows[0].map(cell => cell.trim().toLowerCase());
  const get = (row: string[], key: string) => {
    const index = header.indexOf(key);
    return index >= 0 ? row[index]?.trim() ?? '' : '';
  };
  const blocks: any[] = [];
  const wires: any[] = [];
  const groups: any[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(cell => !cell.trim())) continue;
    const type = (get(row, 'type') || get(row, 'record') || (get(row, 'from') || get(row, 'to') ? 'wire' : 'block')).toLowerCase();
    if (type === 'wire') {
      wires.push({
        id: get(row, 'id'),
        label: get(row, 'label'),
        from: get(row, 'from'),
        to: get(row, 'to'),
        points: get(row, 'points'),
        busType: get(row, 'bustype') || get(row, 'bus'),
        width: get(row, 'width') || undefined,
        clock: get(row, 'clock'),
        color: get(row, 'color'),
        details: get(row, 'details'),
      });
    } else if (type === 'group') {
      groups.push({
        id: get(row, 'id'),
        label: get(row, 'label'),
        x: get(row, 'x'),
        y: get(row, 'y'),
        w: get(row, 'w'),
        h: get(row, 'h'),
        color: get(row, 'color'),
      });
    } else {
      blocks.push({
        id: get(row, 'id'),
        label: get(row, 'label') || get(row, 'name'),
        sublabel: get(row, 'sublabel'),
        kind: get(row, 'kind') || 'peripheral',
        x: get(row, 'x'),
        y: get(row, 'y'),
        w: get(row, 'w'),
        h: get(row, 'h'),
        color: get(row, 'color'),
        moduleId: get(row, 'moduleid'),
        specRef: get(row, 'specref'),
        badges: get(row, 'badges') ? get(row, 'badges').split('|') : undefined,
        details: get(row, 'details'),
      });
    }
  }
  return normalizeDiagram({ title: 'Imported CSV architecture', blocks, wires, groups }, options);
}

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char === '\r') { /* ignore */ }
    else cell += char;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
};

const mapCategory = (name: string): DiagramBlock['kind'] => {
  const category = guessCategory(name);
  if (category === 'compute') return 'cpu';
  if (category === 'memory') return 'memory';
  if (category === 'interconnect') return 'crossbar';
  if (category === 'security') return 'security';
  if (category === 'analog') return 'peripheral';
  return 'peripheral';
};

export function diagramFromIpXact(components: ParsedIpXact[], options: { title?: string; companyId?: string } = {}): ArchitectureDiagram {
  if (components.length === 0) throw new Error('No IP-XACT components parsed.');
  const cols = Math.min(4, Math.max(1, components.length));
  const blocks: DiagramBlock[] = components.map((component, index) => {
    const x = 60 + (index % cols) * 270;
    const y = 100 + Math.floor(index / cols) * 170;
    const kind = mapCategory(component.name);
    return {
      id: `ipx_${slug(component.name, `component_${index}`)}_${index}`,
      label: component.name,
      sublabel: `${component.vendor} · ${component.version}`,
      kind,
      x,
      y,
      w: 220,
      h: 100,
      color: kind === 'cpu' ? '#22d3ee' : kind === 'memory' ? '#3b82f6' : kind === 'crossbar' ? '#a78bfa' : kind === 'security' ? '#fb7185' : '#94a3b8',
      specRef: 'IP-XACT',
      badges: Array.from(new Set(component.busInterfaces.map(iface => iface.busType))).slice(0, 2),
      details: `Imported IP-XACT component ${component.vendor}:${component.library}:${component.name}:${component.version}. ${component.busInterfaces.length} bus interfaces, ${component.memoryMaps.length} memory maps.`,
    };
  });
  const blockByComponent = new Map(components.map((component, index) => [component, blocks[index]]));
  const wires: DiagramWire[] = [];
  let wireIndex = 0;
  for (const source of components) {
    for (const target of components) {
      if (source === target) continue;
      const master = source.busInterfaces.find(iface => iface.direction === 'master');
      const slave = target.busInterfaces.find(iface => iface.direction === 'slave');
      if (!master || !slave) continue;
      if (master.busType !== slave.busType) continue;
      const a = blockByComponent.get(source)!;
      const b = blockByComponent.get(target)!;
      const ax = a.x + a.w / 2;
      const ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const midY = (ay + by) / 2;
      wires.push({
        id: `ipx_wire_${wireIndex++}`,
        label: `${master.name} → ${slave.name}`,
        from: a.id,
        to: b.id,
        points: ax === bx ? [[ax, ay], [bx, by]] : [[ax, ay], [ax, midY], [bx, midY], [bx, by]],
        busType: master.busType,
        width: master.width,
        clock: master.clock,
        details: `Inferred from IP-XACT master ${source.name}/${master.name} to slave ${target.name}/${slave.name}.`,
      });
    }
  }
  return normalizeDiagram({
    title: options.title || 'Imported IP-XACT architecture',
    subtitle: `${components.length} IP-XACT components`,
    source: 'IP-XACT 1685-2014 import',
    blocks,
    wires,
    notes: [
      'Connections are inferred from matching master/slave bus interfaces; verify protocol compatibility and missing bridges.',
      'Memory maps and vendor extensions are not rendered as blocks.',
    ],
  }, { companyId: options.companyId ?? 'custom', title: options.title || 'Imported IP-XACT architecture' });
}

const moduleKind = (module: ModuleNode): DiagramBlock['kind'] => {
  if (module.type === 'bridge') return 'bridge';
  if (module.type === 'fabric') return 'crossbar';
  if (module.category === 'compute') return 'cpu';
  if (module.category === 'memory') return 'memory';
  if (module.category === 'security') return 'security';
  if (module.category === 'analog') return 'peripheral';
  if (module.category === 'interconnect') return 'crossbar';
  return 'peripheral';
};

/** Build an internal diagram from a hierarchy node's children. */
export function diagramFromModule(
  module: ModuleNode,
  connections: InterconnectConnection[],
  companyId: string
): ArchitectureDiagram {
  const children = module.children ?? [];
  if (children.length === 0) throw new Error(`${module.name} has no child modules.`);
  const cols = Math.min(4, Math.max(1, children.length));
  const blocks: DiagramBlock[] = children.map((child, index) => ({
    id: child.id,
    label: child.name,
    sublabel: child.displayName,
    kind: moduleKind(child),
    x: 60 + (index % cols) * 260,
    y: 80 + Math.floor(index / cols) * 160,
    w: 220,
    h: 100,
    color: child.category === 'compute' ? '#22d3ee' : child.category === 'memory' ? '#3b82f6' : child.category === 'security' ? '#fb7185' : child.category === 'interconnect' ? '#a78bfa' : '#94a3b8',
    moduleId: child.id,
    specRef: child.docRef,
    details: child.description,
    badges: child.instances?.slice(0, 2),
  }));
  const ids = new Set(blocks.map(block => block.id));
  const wires: DiagramWire[] = [];
  for (const conn of connections) {
    if (!ids.has(conn.srcModuleId) || !ids.has(conn.dstModuleId)) continue;
    const a = blocks.find(block => block.id === conn.srcModuleId)!;
    const b = blocks.find(block => block.id === conn.dstModuleId)!;
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const midY = (ay + by) / 2;
    wires.push({
      id: `mod_${conn.id}`,
      label: conn.busType,
      from: a.id,
      to: b.id,
      points: ax === bx ? [[ax, ay], [bx, by]] : [[ax, ay], [ax, midY], [bx, midY], [bx, by]],
      busType: conn.busType,
      width: conn.width,
      clock: conn.srcClock,
      details: conn.details,
    });
  }
  return normalizeDiagram({
    title: `${module.displayName} internals`,
    subtitle: `Generated from the ${module.displayName} hierarchy`,
    source: 'Hierarchy-derived internal module',
    blocks,
    wires,
    notes: ['Generated from the platform hierarchy. Add/edit nested blocks with Edit module.'],
  }, { companyId, title: `${module.displayName} internals` });
}

export const diagramToJson = (diagram: ArchitectureDiagram): string => JSON.stringify(diagram, null, 2);
