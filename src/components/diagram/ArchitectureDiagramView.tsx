import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CompanySoCEntry } from '../../data/socCatalog';
import type { ArchitectureDiagram, DiagramBlock, DiagramWire } from '../../types/diagram';
import { getArchitectureDiagram } from '../../data/diagrams';
import { ArrowUpRight, ArrowLeft, Box, Layers, Maximize2, Minus, Plus, Search, ZoomIn, Pencil, ChevronRight } from 'lucide-react';
import { DiagramImportModal } from './DiagramImportModal';
import { DiagramEditor } from './DiagramEditor';
import { diagramFromModule, diagramToJson } from '../../utils/diagramImport';
import { findNodeById } from '../../utils/hierarchy';
import { downloadText } from '../../utils/ipxact';

interface ArchitectureDiagramViewProps {
  company: CompanySoCEntry;
  onOpenPlatformIp?: (companyId: string, moduleId: string) => void;
  diagramOverride?: ArchitectureDiagram | null;
  onLoadDiagram?: (diagram: ArchitectureDiagram) => void;
  onClearDiagram?: () => void;
}

const KIND_LABEL: Record<DiagramBlock['kind'], string> = {
  cpu: 'CPU', bus: 'BUS', crossbar: 'XBAR', bridge: 'BRIDGE', memory: 'MEMORY',
  peripheral: 'PERIPH', accelerator: 'ACCEL', io: 'IO', security: 'SECURITY',
  clock: 'CLOCK', debug: 'DEBUG', group: 'GROUP',
};

const colorFor = (block: DiagramBlock) => block.color ?? '#94a3b8';

const replaceInternalAtPath = (root: ArchitectureDiagram, ids: string[], next: ArchitectureDiagram): ArchitectureDiagram => {
  if (ids.length === 0) return next;
  const [head, ...rest] = ids;
  return {
    ...root,
    blocks: root.blocks.map(block => block.id === head && block.internal
      ? { ...block, internal: replaceInternalAtPath(block.internal, rest, next) }
      : block),
  };
};

const addInternalAtPath = (
  root: ArchitectureDiagram,
  ids: string[],
  blockId: string,
  internal: ArchitectureDiagram
): ArchitectureDiagram => {
  if (ids.length === 0) {
    return { ...root, blocks: root.blocks.map(block => block.id === blockId ? { ...block, internal } : block) };
  }
  const [head, ...rest] = ids;
  return {
    ...root,
    blocks: root.blocks.map(block => block.id === head && block.internal
      ? { ...block, internal: addInternalAtPath(block.internal, rest, blockId, internal) }
      : block),
  };
};

export const ArchitectureDiagramView: React.FC<ArchitectureDiagramViewProps> = ({ company, onOpenPlatformIp, diagramOverride, onLoadDiagram, onClearDiagram }) => {
  const rootDiagram = useMemo(() => diagramOverride ?? getArchitectureDiagram(company), [company, diagramOverride]);
  const [diagramPath, setDiagramPath] = useState<string[]>([]);
  const diagram = useMemo(() => {
    let current = rootDiagram;
    for (const id of diagramPath) {
      const block = current.blocks.find(candidate => candidate.id === id);
      if (!block?.internal) return current;
      current = block.internal;
    }
    return current;
  }, [rootDiagram, diagramPath]);
  const pathBlocks = useMemo(() => {
    const result: DiagramBlock[] = [];
    let current = rootDiagram;
    for (const id of diagramPath) {
      const block = current.blocks.find(candidate => candidate.id === id);
      if (!block?.internal) break;
      result.push(block);
      current = block.internal;
    }
    return result;
  }, [rootDiagram, diagramPath]);
  const [importOpen, setImportOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<DiagramBlock | null>(null);
  const [selectedWire, setSelectedWire] = useState<DiagramWire | null>(null);
  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState<'core' | 'peripherals' | 'all'>('core');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    setSelectedBlock(null);
    setSelectedWire(null);
    setDiagramPath([]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [company.id, rootDiagram.id]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const visibleBlocks = useMemo(() => {
    if (diagramPath.length > 0) return diagram.blocks;
    const peripheral = (block: DiagramBlock) =>
      block.id === 'fpi0' || block.id === 'fpi1' || block.id === 's2f' || block.id === 's2c' || block.y >= 700;
    if (layer === 'all') return diagram.blocks;
    return layer === 'core' ? diagram.blocks.filter(block => !peripheral(block)) : diagram.blocks.filter(peripheral);
  }, [diagram.blocks, layer, diagramPath.length]);

  const visibleIds = useMemo(() => new Set(visibleBlocks.map(block => block.id)), [visibleBlocks]);
  const visibleWires = useMemo(
    () => diagram.wires.filter(wire => visibleIds.has(wire.from ?? '') && visibleIds.has(wire.to ?? '')),
    [diagram.wires, visibleIds]
  );

  const bounds = useMemo(() => {
    if (visibleBlocks.length === 0) return { x: 0, y: 0, w: diagram.width, h: diagram.height };
    const minX = Math.max(0, Math.min(...visibleBlocks.map(block => block.x)) - 20);
    const minY = Math.max(0, Math.min(...visibleBlocks.map(block => block.y)) - 20);
    const maxX = Math.max(...visibleBlocks.map(block => block.x + block.w)) + 20;
    const maxY = Math.max(...visibleBlocks.map(block => block.y + block.h)) + 20;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [visibleBlocks, diagram.width, diagram.height]);

  const viewBox = `${bounds.x + pan.x} ${bounds.y + pan.y} ${bounds.w / zoom} ${bounds.h / zoom}`;
  const matchedIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(visibleBlocks.filter(block => `${block.label} ${block.sublabel ?? ''}`.toLowerCase().includes(q)).map(block => block.id));
  }, [query, visibleBlocks]);

  const incident = useMemo(() => {
    if (!selectedBlock) return new Set<string>();
    return new Set(visibleWires.filter(wire => wire.from === selectedBlock.id || wire.to === selectedBlock.id).map(wire => wire.id));
  }, [selectedBlock, visibleWires]);

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom(prev => Math.min(4, Math.max(0.45, prev * (event.deltaY < 0 ? 1.12 : 0.89))));
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest('[data-block]')) return;
    drag.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y };
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = (diagram.width / zoom) / rect.width;
    const scaleY = (diagram.height / zoom) / rect.height;
    setPan({
      x: drag.current.px - (event.clientX - drag.current.x) * scaleX,
      y: drag.current.py - (event.clientY - drag.current.y) * scaleY,
    });
  };

  const onPointerUp = () => { drag.current = null; };

  const selectBlock = (block: DiagramBlock) => {
    setSelectedBlock(block);
    setSelectedWire(null);
  };

  const openPlatform = () => {
    if (selectedBlock?.moduleId) onOpenPlatformIp?.(company.id, selectedBlock.moduleId);
  };

  const enterInternal = (block: DiagramBlock) => {
    if (!block.internal) return;
    setDiagramPath(prev => [...prev, block.id]);
    setSelectedBlock(null);
    setSelectedWire(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const goUp = () => {
    setDiagramPath(prev => prev.slice(0, -1));
    setSelectedBlock(null);
    setSelectedWire(null);
  };

  const saveActiveDiagram = (next: ArchitectureDiagram) => {
    if (!onLoadDiagram) return;
    if (diagramPath.length === 0) {
      onLoadDiagram(next);
      return;
    }
    onLoadDiagram(replaceInternalAtPath(rootDiagram, diagramPath, next));
  };

  const internalFor = (block: DiagramBlock): ArchitectureDiagram | null => {
    if (block.internal) return block.internal;
    if (!block.moduleId) return null;
    const node = findNodeById(company.hierarchy, block.moduleId);
    if (!node?.children?.length) return null;
    return diagramFromModule(node, company.connections, company.id);
  };

  const enterDeep = (block: DiagramBlock) => {
    const internal = internalFor(block);
    if (!internal) return;
    if (!block.internal && onLoadDiagram) {
      onLoadDiagram(addInternalAtPath(rootDiagram, diagramPath, block.id, internal));
    }
    setDiagramPath(prev => [...prev, block.id]);
    setSelectedBlock(null);
    setSelectedWire(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-2.5 bg-silicon-850 border-b border-slate-800 flex items-center gap-3">
        <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Layers className="w-4 h-4" /></div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono font-bold text-white">{diagram.title}</div>
            {diagramOverride && <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[7.5px] font-mono text-amber-300">UPLOADED</span>}
            {diagramPath.length > 0 && <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-[7.5px] font-mono text-purple-300">NESTED</span>}
          </div>
          <div className="text-[9px] font-mono text-slate-400">{diagram.subtitle}</div>
          {diagramPath.length > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[8px] font-mono text-slate-500">
              <button onClick={() => setDiagramPath([])} className="hover:text-cyan-300">{rootDiagram.title}</button>
              {pathBlocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <button onClick={() => setDiagramPath(prev => prev.slice(0, index + 1))} className="hover:text-cyan-300">{block.label}</button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {diagramPath.length > 0 && (
            <button onClick={goUp} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Up
            </button>
          )}
          {onLoadDiagram && (
            <button onClick={() => setEditorOpen(true)} className="px-2 py-1 rounded bg-purple-500/15 border border-purple-500/40 text-[9px] font-mono text-purple-200 flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Edit module
            </button>
          )}
          {onLoadDiagram && (
            <button onClick={() => setImportOpen(true)} className="px-2 py-1 rounded bg-cyan-500/15 border border-cyan-500/40 text-[9px] font-mono text-cyan-200 hover:bg-cyan-500/25">
              Load JSON / IP-XACT / CSV
            </button>
          )}
          <button onClick={() => downloadText(`${diagram.id}.json`, diagramToJson(diagram))} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300 hover:text-cyan-300">
            Export JSON
          </button>
          {diagramOverride && onClearDiagram && (
            <button onClick={onClearDiagram} className="px-2 py-1 rounded bg-amber-950/50 border border-amber-800 text-[9px] font-mono text-amber-300">
              Clear upload
            </button>
          )}
          <div className={`flex rounded bg-silicon-900 border border-slate-700 p-0.5 ${diagramPath.length === 0 ? '' : 'hidden'}`}>
            {(['core', 'peripherals', 'all'] as const).map(item => (
              <button
                key={item}
                onClick={() => { setLayer(item); setSelectedBlock(null); setSelectedWire(null); }}
                className={`px-1.5 py-1 rounded text-[8px] font-mono uppercase ${layer === item ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1.5" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find block…" className="w-40 pl-7 pr-2 py-1 rounded bg-silicon-900 border border-slate-700 text-[9px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="flex items-center gap-0.5 rounded bg-silicon-900 border border-slate-700 p-0.5">
            <button onClick={() => setZoom(z => Math.max(0.45, z / 1.2))} className="p-1 text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
            <span className="text-[8px] font-mono text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z * 1.2))} className="p-1 text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1 text-slate-400 hover:text-white" title="Fit"><Maximize2 className="w-3 h-3" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative" onClick={(event) => event.stopPropagation()}>
        <div className="absolute inset-0 bg-[#070b14]">
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClick={() => { setSelectedBlock(null); setSelectedWire(null); }}
          >
            <defs>
              <pattern id="diagGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111827" strokeWidth="0.6" />
              </pattern>
              <marker id="diagArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 z" fill="#64748b" />
              </marker>
              <marker id="diagArrowHot" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 z" fill="#fbbf24" />
              </marker>
            </defs>
            <rect x="0" y="0" width={diagram.width} height={diagram.height} fill="url(#diagGrid)" />

            {diagram.groups.map(group => (
              <g key={group.id}>
                <rect x={group.x} y={group.y} width={group.w} height={group.h} rx="6" fill={`${group.color ?? '#64748b'}08`} stroke={`${group.color ?? '#64748b'}44`} strokeDasharray="4 3" />
                <text x={group.x + 7} y={group.y + 12} fill={group.color ?? '#64748b'} fontSize="10" fontFamily="monospace" fontWeight="700">{group.label.toUpperCase()}</text>
              </g>
            ))}

            {visibleWires.map(wire => {
              const hot = selectedWire?.id === wire.id || (selectedBlock && incident.has(wire.id));
              const dim = (selectedBlock && !incident.has(wire.id)) || (matchedIds.size > 0 && !matchedIds.has(wire.from ?? '') && !matchedIds.has(wire.to ?? ''));
              return (
                <g key={wire.id} opacity={dim ? 0.16 : 1} onClick={(e) => { e.stopPropagation(); setSelectedWire(wire); setSelectedBlock(null); }}>
                  <polyline
                    points={wire.points.map(p => p.join(',')).join(' ')}
                    fill="none"
                    stroke={hot ? '#fbbf24' : (wire.color ?? '#64748b')}
                    strokeWidth={hot ? 2.4 : 1.15}
                    strokeDasharray={wire.dashed ? '4 3' : undefined}
                    markerEnd={wire.arrow === 'none' ? undefined : `url(#${hot ? 'diagArrowHot' : 'diagArrow'})`}
                    style={{ cursor: 'pointer' }}
                  />
                  {selectedWire?.id === wire.id && (
                    <text x={wire.points[0][0] + 4} y={wire.points[0][1] - 5} fill="#fbbf24" fontSize="8" fontFamily="monospace">{wire.label ?? wire.busType ?? wire.id}</text>
                  )}
                </g>
              );
            })}

            {visibleBlocks.map(block => {
              const selected = selectedBlock?.id === block.id;
              const dim = (selectedBlock && !selected && !incident.size) || (matchedIds.size > 0 && !matchedIds.has(block.id));
              const color = colorFor(block);
              const isBus = block.kind === 'bus';
              const lines = block.label.split('\n');
              return (
                <g key={block.id} data-block="true" opacity={dim ? 0.22 : 1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); selectBlock(block); }}>
                  <rect
                    x={block.x} y={block.y} width={block.w} height={block.h} rx={isBus ? 3 : 4}
                    fill={isBus ? `${color}44` : `${color}1f`}
                    stroke={selected ? '#f8fafc' : color}
                    strokeWidth={selected ? 2 : 1}
                  />
                  {isBus ? (
                    <text x={block.x + 6} y={block.y + 11.5} fill={color} fontSize="11" fontFamily="monospace" fontWeight="700">{block.label}</text>
                  ) : (
                    <>
                      <text x={block.x + block.w / 2} y={block.y + block.h / 2 - (lines.length > 1 ? 3 : 0) + (block.sublabel ? -4 : 3)} textAnchor="middle" fill="#e2e8f0" fontSize={Math.min(12, Math.max(8, block.w / 9))} fontFamily="monospace" fontWeight="700">
                        {lines.map((line, index) => <tspan key={index} x={block.x + block.w / 2} dy={index === 0 ? 0 : 9}>{line}</tspan>)}
                      </text>
                      {block.sublabel && <text x={block.x + block.w / 2} y={block.y + block.h - 6} textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">{block.sublabel}</text>}
                      {block.badges?.length ? (
                        <g>
                          {block.badges.slice(0, 2).map((badge, index) => (
                            <g key={badge}>
                              <rect x={block.x + 3 + index * 26} y={block.y + 3} width="24" height="9" rx="2" fill="#0f172a" stroke={color} strokeWidth="0.7" />
                              <text x={block.x + 15 + index * 26} y={block.y + 9.5} textAnchor="middle" fill={color} fontSize="6.2" fontFamily="monospace">{badge}</text>
                            </g>
                          ))}
                        </g>
                      ) : null}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded bg-silicon-950/90 border border-slate-800 px-2 py-1.5">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Legend</span>
            {[
              ['CPU', '#22d3ee'], ['BUS', '#fbbf24'], ['BRIDGE', '#fb923c'], ['MEM', '#3b82f6'], ['IO', '#f472b6'], ['SEC', '#fb7185'],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1 text-[8px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: `${color}66`, border: `1px solid ${color}` }} />
                {label}
              </span>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 text-[8px] font-mono text-slate-500">
            drag to pan · wheel / buttons to zoom · click a block
          </div>
        </div>

        {(selectedBlock || selectedWire) && <aside className="absolute top-0 right-0 bottom-0 w-[300px] z-20 border-l border-slate-800 bg-silicon-950/98 backdrop-blur overflow-y-auto shadow-2xl">
          {(selectedBlock || selectedWire) && <button onClick={() => { setSelectedBlock(null); setSelectedWire(null); }} className="absolute top-2 right-2 z-30 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-slate-400">close</button>}
          {selectedBlock ? (
            <div className="p-3 space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded flex items-center justify-center font-mono text-[9px] font-bold" style={{ backgroundColor: `${colorFor(selectedBlock)}22`, color: colorFor(selectedBlock), border: `1px solid ${colorFor(selectedBlock)}66` }}>
                  {KIND_LABEL[selectedBlock.kind]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-mono font-bold text-white">{selectedBlock.label}</div>
                  <div className="text-[9px] font-mono text-slate-400">{selectedBlock.sublabel ?? selectedBlock.kind}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedBlock.badges?.map(badge => <span key={badge} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-cyan-300">{badge}</span>)}
                {selectedBlock.specRef && <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-900 text-[8px] font-mono text-purple-300">{selectedBlock.specRef}</span>}
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-slate-400">{KIND_LABEL[selectedBlock.kind]}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{selectedBlock.details ?? 'Architectural block from the public TC4Dx block diagram.'}</p>
              <div className="text-[9px] font-mono text-slate-500">ID: {selectedBlock.id}</div>
              {internalFor(selectedBlock) && (
                <button onClick={() => enterDeep(selectedBlock)} className="w-full px-2 py-1.5 rounded bg-purple-500/20 border border-purple-500/50 text-[10px] font-mono text-purple-200 hover:bg-purple-500/30 flex items-center justify-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Open internal module ({internalFor(selectedBlock)!.blocks.length} blocks)
                </button>
              )}
              {selectedBlock.moduleId && onOpenPlatformIp && (
                <button onClick={openPlatform} className="w-full px-2 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono text-cyan-200 hover:bg-cyan-500/25 flex items-center justify-center gap-1">
                  <Box className="w-3.5 h-3.5" /> Open IP in Platform
                </button>
              )}
              <div>
                <div className="text-[8px] font-mono uppercase text-slate-500 mb-1">Incident links ({incident.size})</div>
                <div className="space-y-1">
                  {visibleWires.filter(wire => wire.from === selectedBlock.id || wire.to === selectedBlock.id).slice(0, 12).map(wire => (
                    <button key={wire.id} onClick={() => { setSelectedWire(wire); setSelectedBlock(null); }} className="w-full text-left px-1.5 py-1 rounded bg-silicon-900 border border-slate-800 hover:border-cyan-500/50">
                      <div className="text-[8.5px] font-mono text-slate-300 truncate">{wire.label ?? wire.busType ?? wire.id}</div>
                      <div className="text-[7.5px] font-mono text-slate-500 truncate">{wire.from ?? '—'} → {wire.to ?? '—'}{wire.width ? ` · ${wire.width}b` : ''}</div>
                    </button>
                  ))}
                </div>
              </div>
              {selectedBlock.specRef && (
                <div className="text-[8.5px] font-mono text-slate-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> TRM reference {selectedBlock.specRef}
                </div>
              )}
            </div>
          ) : selectedWire ? (
            <div className="p-3 space-y-3">
              <div className="text-sm font-mono font-bold text-white">{selectedWire.label ?? 'Interconnect link'}</div>
              <div className="flex flex-wrap gap-1">
                {selectedWire.busType && <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-900 text-[8px] font-mono text-cyan-300">{selectedWire.busType}</span>}
                {selectedWire.width && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-slate-300">{selectedWire.width}-bit</span>}
                {selectedWire.clock && <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-900 text-[8px] font-mono text-purple-300">{selectedWire.clock}</span>}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{selectedWire.details ?? 'Architectural interconnect link.'}</p>
              <div className="text-[9px] font-mono text-slate-500 space-y-1">
                <div>from: {selectedWire.from ?? '—'}</div>
                <div>to: {selectedWire.to ?? '—'}</div>
                <div>id: {selectedWire.id}</div>
              </div>
              <button onClick={() => setSelectedWire(null)} className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">Clear wire</button>
            </div>
          ) : (
            <div className="p-3 text-[10px] font-mono text-slate-500 leading-relaxed">
              <div className="text-[9px] uppercase tracking-wider text-cyan-300 mb-2">Spec block diagram</div>
              Click any block to see its role, TRM section and incident links. Click a link to inspect protocol, width and clock. Use “Open IP in Platform” to pull its spec and tracker records.
              <div className="mt-3 text-[8.5px] text-slate-600">{diagram.source}</div>
            </div>
          )}
        </aside>}
      </div>

      <DiagramEditor
        open={editorOpen}
        diagram={diagram}
        onClose={() => setEditorOpen(false)}
        onSave={saveActiveDiagram}
      />

      <DiagramImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onApply={(next) => onLoadDiagram?.(next)}
        currentDiagram={diagram}
        companyId={company.id}
      />

      <div className="px-4 py-1.5 border-t border-slate-800 bg-silicon-850 text-[8.5px] font-mono text-slate-500 flex items-center gap-3">
        <span>{visibleBlocks.length}/{diagram.blocks.length} blocks · {visibleWires.length}/{diagram.wires.length} links</span>
        <span className="text-slate-600">SPB/COMPB = CPU peripheral bus views · S2S/S2F/S2C = SRI bridges</span>
        <span className="ml-auto flex items-center gap-1"><ZoomIn className="w-3 h-3" /> spec-derived, public TRM Fig. 5</span>
      </div>
    </div>
  );
};
