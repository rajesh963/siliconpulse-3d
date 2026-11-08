import React, { useMemo, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { buildAllSpecsJson, buildIntegrationJson, downloadJson } from '../../utils/integrationJson';
import { Braces, Download, ExternalLink, GitBranch, Network, Layers, ChevronRight, FileJson } from 'lucide-react';

interface JsonViewProps {
  catalog: Record<string, CompanySoCEntry>;
  activeCompanyId: string;
  onOpenModule: (companyId: string, moduleId: string) => void;
}

const JsonTree: React.FC<{
  node: any;
  companyId: string;
  depth: number;
  onOpenModule: (companyId: string, moduleId: string) => void;
}> = ({ node, companyId, depth, onOpenModule }) => {
  const hasChildren = (node.children?.length ?? 0) > 0;
  return (
    <details open={depth < 1} className="group">
      <summary className="list-none flex items-center gap-1.5 py-0.5 cursor-pointer hover:bg-slate-800/40 rounded px-1">
        <ChevronRight className="w-3 h-3 text-slate-500 group-open:rotate-90 transition-transform shrink-0" />
        <span className={`text-[8.5px] font-mono px-1 py-0.5 rounded border ${
          node.level === 1 ? 'bg-cyan-950/60 border-cyan-900 text-cyan-300' :
          node.level === 2 ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>L{node.level}</span>
        <span className="text-[10px] font-mono text-slate-200 truncate">{node.name}</span>
        <span className="text-[8px] font-mono text-slate-500">×{node.instanceCount}</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenModule(companyId, node.id); }}
          className="ml-auto px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 hover:border-cyan-500/60"
        >
          open diagram
        </button>
      </summary>
      {hasChildren && (
        <div className="ml-3 border-l border-slate-800 pl-2">
          {node.children.map((child: any) => (
            <JsonTree key={child.id} node={child} companyId={companyId} depth={depth + 1} onOpenModule={onOpenModule} />
          ))}
        </div>
      )}
    </details>
  );
};

export const JsonView: React.FC<JsonViewProps> = ({ catalog, activeCompanyId, onOpenModule }) => {
  const [companyId, setCompanyId] = useState(activeCompanyId);
  const [showRaw, setShowRaw] = useState(false);
  const company = catalog[companyId] ?? catalog[activeCompanyId];
  const json = useMemo(() => (company ? buildIntegrationJson(company) : null), [company]);
  const summary = json?.summary as any;
  const bridges = (json?.bridges as any[]) ?? [];

  if (!company || !json) return <div className="text-slate-500 text-xs font-mono p-6">No company selected.</div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3 flex items-center gap-2 flex-wrap">
        <FileJson className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold text-cyan-300">SoC INTEGRATION JSON · socpulse.integration.v1</span>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="ml-2 bg-silicon-900 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-[10px] font-mono focus:outline-none"
        >
          {Object.values(catalog).filter(entry => entry.id !== 'custom').map(entry => (
            <option key={entry.id} value={entry.id}>{entry.companyName} · {entry.chipModel}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => downloadJson(`${company.id}_${company.chipModel.replace(/[^A-Za-z0-9]+/g, '_')}.json`, json)} className="px-2 py-1 rounded bg-cyan-500/15 border border-cyan-500/40 text-[9px] font-mono text-cyan-200 flex items-center gap-1">
            <Download className="w-3 h-3" /> SoC JSON
          </button>
          <button onClick={() => downloadJson('siliconpulse_all_specs.json', buildAllSpecsJson(catalog))} className="px-2 py-1 rounded bg-purple-500/15 border border-purple-500/40 text-[9px] font-mono text-purple-200 flex items-center gap-1">
            <Download className="w-3 h-3" /> All specs + SoCs
          </button>
          <button onClick={() => setShowRaw(v => !v)} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">
            {showRaw ? 'tree' : 'raw JSON'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {[
          ['blocks', summary?.blocks],
          ['leaf IPs', summary?.leafIPs],
          ['bridges', summary?.bridges],
          ['bridge instances', summary?.bridgeInstances],
          ['links', summary?.connections],
          ['specs', summary?.specSections],
          ['IP refs', summary?.reusableIPs],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg bg-silicon-950 border border-slate-800 px-2 py-1.5 text-center">
            <div className="text-[12px] font-mono font-bold text-cyan-300">{String(value ?? 0)}</div>
            <div className="text-[7.5px] font-mono uppercase text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">Block tree · click to zoom</span>
            <span className="ml-auto text-[8.5px] font-mono text-slate-500">{summary?.blocks} nodes</span>
          </div>
          <div className="max-h-[430px] overflow-y-auto pr-1">
            {(json.blocks as any[]).map(block => (
              <JsonTree key={block.id} node={block} companyId={company.id} depth={0} onOpenModule={onOpenModule} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">Bridge instances</span>
              <span className="ml-auto text-[8.5px] font-mono text-slate-500">{bridges.length} types / {summary?.bridgeInstances} instances</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {bridges.map(bridge => (
                <button key={bridge.id} onClick={() => onOpenModule(company.id, bridge.id)} className="w-full text-left p-1.5 rounded bg-silicon-900 border border-slate-800 hover:border-purple-500/60 transition">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.5 rounded bg-purple-950/60 border border-purple-900 text-[7.5px] font-mono text-purple-300">{bridge.kind}</span>
                    <span className="text-[10px] font-mono text-slate-200 truncate">{bridge.name}</span>
                    <span className="ml-auto text-[8px] font-mono text-slate-500">×{bridge.instances.length}</span>
                  </div>
                  <div className="text-[8px] font-mono text-slate-500 truncate mt-0.5">{bridge.instances.join(', ')} · {bridge.parent}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">Buses / protocols</span>
            </div>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {(json.buses as any[]).map(bus => (
                <div key={`${bus.busType}-${bus.width}`} className="flex items-center gap-2 text-[9px] font-mono">
                  <span className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{bus.protocol}</span>
                  <span className="text-slate-400 truncate">{bus.busType}</span>
                  <span className="ml-auto text-slate-500">{bus.width}b · {bus.links.length} links</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-300">Schema notes</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
              Every block has instances, domains, interfaces, specRef and recursive children. Bridges are first-class objects; buses are derived from the connection graph. Download includes specs, IP refs, bindings and tracker items.
            </p>
          </div>
        </div>
      </div>

      {showRaw && (
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Braces className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-300">Raw JSON</span>
            <span className="ml-auto text-[8px] font-mono text-slate-500">{JSON.stringify(json).length.toLocaleString()} bytes</span>
          </div>
          <pre className="max-h-72 overflow-auto text-[8.5px] font-mono text-slate-400 bg-silicon-900 p-2 rounded border border-slate-800">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
        <ExternalLink className="w-3 h-3" />
        Public-data JSON. Instance expansion covers ranges such as LMU0/1, CDSP0-17, SRI0/1 and explicit bridge instances.
      </div>
    </div>
  );
};
