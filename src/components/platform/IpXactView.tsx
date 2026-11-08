import React, { useEffect, useMemo, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { IP_XACT_SAMPLE } from '../../data/platformData';
import { ParsedIpXact, buildCustomSoc, downloadText, exportCompanyToIpXact, parseIpXact } from '../../utils/ipxact';
import { diagramFromIpXact } from '../../utils/diagramImport';
import type { ArchitectureDiagram } from '../../types/diagram';
import { UploadCloud, Download, FileCode2, Box, Plus, Trash2, AlertTriangle, CheckCircle2, Cpu, Save } from 'lucide-react';

interface IpXactViewProps {
  catalog: Record<string, CompanySoCEntry>;
  activeCompanyId: string;
  customSoc: CompanySoCEntry | null;
  onLoadCustomSoc: (soc: CompanySoCEntry | null) => void;
  onLoadDiagram?: (diagram: ArchitectureDiagram) => void;
}

const STORAGE_KEY = 'socpulse.ipxact.components.v1';

export const IpXactView: React.FC<IpXactViewProps> = ({ catalog, activeCompanyId, customSoc, onLoadCustomSoc, onLoadDiagram }) => {
  const [xml, setXml] = useState(IP_XACT_SAMPLE);
  const [parsed, setParsed] = useState<ParsedIpXact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<ParsedIpXact[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [socName, setSocName] = useState('My Custom SoC');
  const [buildMessage, setBuildMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
  }, [components]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    setXml(text);
    try {
      const result = parseIpXact(text);
      setParsed(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
      setParsed(null);
    }
  };

  const parse = () => {
    try {
      setParsed(parseIpXact(xml));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
      setParsed(null);
    }
  };

  const addComponent = () => {
    if (!parsed) return;
    if (components.some(c => c.vendor === parsed.vendor && c.name === parsed.name && c.version === parsed.version)) {
      setBuildMessage('Component already in the custom assembly.');
      return;
    }
    setComponents(prev => [...prev, parsed]);
    setBuildMessage(`Added ${parsed.vendor}:${parsed.name}:${parsed.version}.`);
  };

  const build = () => {
    if (components.length === 0) {
      setBuildMessage('Add at least one IP-XACT component first.');
      return;
    }
    const soc = buildCustomSoc(components, socName || 'Custom SoC');
    onLoadCustomSoc(soc);
    setBuildMessage(`Built ${socName} with ${components.length} components and ${soc.connections.length} inferred connections. Loaded in Architecture.`);
  };

  const exportSoC = (company: CompanySoCEntry) => {
    downloadText(`${company.chipModel.replace(/[^A-Za-z0-9]+/g, '_')}.xml`, exportCompanyToIpXact(company));
  };

  const exportable = useMemo(() => Object.values(catalog).filter(e => e.id !== 'custom'), [catalog]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Import IP-XACT 1685-2014</h3>
            <span className="ml-auto text-[9px] font-mono text-slate-500">component / busInterfaces / memoryMaps</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 cursor-pointer hover:border-cyan-500/60 flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" /> Choose XML
              <input type="file" accept=".xml,application/xml" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <button onClick={() => { setXml(IP_XACT_SAMPLE); setParsed(null); setError(null); }} className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-cyan-300">
              Load sample
            </button>
            <button onClick={parse} className="px-2 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono text-cyan-200 hover:bg-cyan-500/25">
              Parse
            </button>
          </div>
          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            spellCheck={false}
            className="mt-2 w-full h-44 p-2 rounded-lg bg-silicon-900 border border-slate-800 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none"
          />
          {error && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-red-300">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
        </div>

        {parsed && (
          <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold text-white">{parsed.vendor}:{parsed.library}:{parsed.name}:{parsed.version}</span>
              <button onClick={addComponent} className="ml-auto px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-[9px] font-mono text-emerald-200 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add to custom SoC
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-[8px] font-mono uppercase text-slate-500 mb-1">Bus interfaces ({parsed.busInterfaces.length})</div>
                {parsed.busInterfaces.map((iface, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-300 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${iface.direction === 'master' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                    <span className="truncate">{iface.name}</span>
                    <span className="ml-auto text-slate-500">{iface.busType} {iface.width}b</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[8px] font-mono uppercase text-slate-500 mb-1">Memory maps ({parsed.memoryMaps.length})</div>
                {parsed.memoryMaps.flatMap((map, mi) => map.blocks.map((block, bi) => (
                  <div key={`${mi}-${bi}`} className="text-[9px] font-mono text-slate-300 py-0.5 truncate">
                    {block.name} <span className="text-slate-500">@ {block.baseAddress} / {block.range}</span>
                  </div>
                )))}
                {parsed.memoryMaps.length === 0 && <div className="text-[9px] font-mono text-slate-500">No memory maps</div>}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Custom SoC assembly ({components.length})</h3>
            {components.length > 0 && (
              <button onClick={() => setComponents([])} className="ml-auto text-[9px] font-mono text-red-300 hover:text-red-200">clear all</button>
            )}
          </div>
          <div className="space-y-1 mt-2 max-h-44 overflow-y-auto">
            {components.map((component, index) => (
              <div key={`${component.vendor}-${component.name}-${index}`} className="flex items-center gap-2 p-1.5 rounded bg-silicon-900 border border-slate-800">
                <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-[10px] font-mono text-slate-200 truncate">{component.vendor}:{component.name}</span>
                <span className="ml-auto text-[8px] font-mono text-slate-500">{component.busInterfaces.length} if</span>
                <button onClick={() => setComponents(prev => prev.filter((_, i) => i !== index))} className="p-1 text-slate-500 hover:text-red-300">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {components.length === 0 && <div className="text-[9px] font-mono text-slate-500 p-2">Parse a component and add it here, or import several to assemble a custom SoC.</div>}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input value={socName} onChange={(e) => setSocName(e.target.value)} className="flex-1 px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500" />
            <button
              onClick={() => {
                if (components.length === 0) { setBuildMessage('Add at least one IP-XACT component first.'); return; }
                const diagram = diagramFromIpXact(components, { title: socName || 'Imported IP-XACT architecture' });
                onLoadDiagram?.(diagram);
                setBuildMessage(`Mapped ${components.length} components to ${diagram.wires.length} inferred links. Opening Architecture.`);
              }}
              className="px-2.5 py-1.5 rounded bg-purple-500/15 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-200 hover:bg-purple-500/25"
            >
              Map to diagram
            </button>
            <button onClick={build} className="px-2.5 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-200 hover:bg-cyan-500/25 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Build custom SoC
            </button>
          </div>
          {buildMessage && <div className="text-[9px] font-mono text-emerald-300 mt-1.5">{buildMessage}</div>}
          {customSoc && (
            <div className="text-[9px] font-mono text-slate-400 mt-1.5">
              Loaded custom SoC: <span className="text-cyan-300">{customSoc.chipModel}</span> · {customSoc.hierarchy.children?.length ?? 0} components
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">Export a catalog SoC</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
            Generate an IP-XACT 1685-2014 component with bus interfaces derived from the SoC connections and memory maps from the TRM model.
          </p>
          <div className="space-y-1 mt-2 max-h-72 overflow-y-auto">
            {exportable.map(company => (
              <div key={company.id} className="flex items-center gap-2 p-1.5 rounded bg-silicon-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-200 truncate">{company.companyName} · {company.chipModel}</span>
                <button onClick={() => exportSoC(company)} className="ml-auto px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-[8.5px] font-mono text-purple-200 hover:bg-purple-500/25 flex items-center gap-0.5">
                  <Download className="w-2.5 h-2.5" /> XML
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">What is mapped</h3>
          </div>
          <ul className="text-[10px] text-slate-400 mt-2 space-y-1.5 leading-relaxed list-disc list-inside">
            <li><span className="text-slate-200">busInterfaces</span> → platform <span className="text-cyan-300">Port</span> records (direction, width, bus type, clock).</li>
            <li><span className="text-slate-200">memoryMaps</span> → platform <span className="text-cyan-300">MemoryMapRange</span> and diagram hierarchy metadata.</li>
            <li><span className="text-slate-200">vendor / library / name / version</span> → component identity and source references.</li>
            <li>Custom assembly lays components out in a 3×3 floorplan and infers connections between master/slave bus interfaces.</li>
            <li>Export preserves clock, reset and power domain comments; full vendor extensions are not yet round-tripped.</li>
          </ul>
        </div>

        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="text-[10px] font-mono text-slate-300 font-bold">IP-XACT schema note</div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            The importer accepts 1685-2014-style component XML with or without namespace prefixes. Vendor-specific bus definitions are preserved as strings; normalize them before tape-out sign-off.
          </p>
        </div>
      </div>
    </div>
  );
};
