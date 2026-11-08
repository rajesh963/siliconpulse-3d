import React from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { COMPANY_PROFILES, SOC_PROFILES, IP_REGISTRY, SPEC_SECTIONS, CROSS_VENDOR_BINDINGS, LATEST_SOCS } from '../../data/platformData';
import { downloadJson } from '../../utils/integrationJson';
import { ArrowUpRight, BookOpen, Cpu, Database, Network, ShieldCheck, Box } from 'lucide-react';

interface CatalogViewProps {
  catalog: Record<string, CompanySoCEntry>;
  onLoadCompany: (id: string) => void;
  onOpenSpec: (companyId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ catalog, onLoadCompany, onOpenSpec }) => {
  const entries = Object.values(catalog).filter(entry => entry.id !== 'custom');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {entries.map(entry => {
          const profile = COMPANY_PROFILES.find(p => p.id === entry.id) ?? COMPANY_PROFILES.find(p => p.id === entry.id.replace(/_.*$/, ''));
          const soc = SOC_PROFILES.find(s => s.companyId === entry.id) ?? SOC_PROFILES.find(s => s.companyId === entry.id.replace(/_.*$/, ''));
          const ipCount = IP_REGISTRY.filter(ip => ip.usedBy.some(use => use.companyId === entry.id)).length;
          const specCount = SPEC_SECTIONS.filter(s => s.companyId === entry.id).length;
          const bindings = CROSS_VENDOR_BINDINGS.filter(b => b.companyId === entry.id);
          return (
            <div key={entry.id} className="rounded-xl bg-silicon-950 border border-slate-800 hover:border-slate-700 transition p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-[11px]" style={{ backgroundColor: `${entry.brandColor}22`, color: entry.brandColor, border: `1px solid ${entry.brandColor}55` }}>
                  {entry.badgeSymbol}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{entry.companyName}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{entry.chipModel}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                {soc?.summary ?? entry.tagline}
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8.5px] font-mono text-cyan-300">{entry.processNode}</span>
                {profile?.architectures.slice(0, 2).map(arch => (
                  <span key={arch} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8.5px] font-mono text-slate-400">{arch}</span>
                ))}
                {soc && (
                  <span className={`px-1.5 py-0.5 rounded border text-[8.5px] font-mono ${
                    soc.publiclyDocumented === 'high' ? 'bg-emerald-950/60 border-emerald-900 text-emerald-300' :
                    soc.publiclyDocumented === 'medium' ? 'bg-amber-950/60 border-amber-900 text-amber-300' :
                    'bg-red-950/50 border-red-900 text-red-300'
                  }`}>
                    public data: {soc.publiclyDocumented}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 mt-3 text-center font-mono">
                <div className="p-1.5 rounded bg-silicon-900/70 border border-slate-800">
                  <div className="text-[10px] text-cyan-300 font-bold">{ipCount}</div>
                  <div className="text-[8px] text-slate-500 uppercase">IP refs</div>
                </div>
                <div className="p-1.5 rounded bg-silicon-900/70 border border-slate-800">
                  <div className="text-[10px] text-cyan-300 font-bold">{specCount}</div>
                  <div className="text-[8px] text-slate-500 uppercase">specs</div>
                </div>
                <div className="p-1.5 rounded bg-silicon-900/70 border border-slate-800">
                  <div className="text-[10px] text-cyan-300 font-bold">{bindings.length}</div>
                  <div className="text-[8px] text-slate-500 uppercase">bindings</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <button
                  onClick={() => onLoadCompany(entry.id)}
                  className="flex-1 px-2 py-1.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 text-[10px] font-mono font-bold transition flex items-center justify-center gap-1"
                >
                  <Box className="w-3.5 h-3.5" /> Load 3D
                </button>
                <button
                  onClick={() => onOpenSpec(entry.id)}
                  className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono transition flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Specs
                </button>
                {profile?.sources[0]?.url && (
                  <a
                    href={profile.sources[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-slate-500 hover:text-cyan-300"
                    title="Public source"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Latest public SoC sheets</h3>
          <span className="text-[9px] font-mono text-slate-500">5 latest / public summaries / JSON download</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {LATEST_SOCS.map(sheet => (
            <div key={sheet.id} className="rounded-lg bg-silicon-950 border border-slate-800 p-2.5 flex flex-col">
              <div className="text-[8px] font-mono text-slate-500">{sheet.companyName} · {sheet.year}</div>
              <div className="text-[11px] font-mono font-bold text-white truncate">{sheet.name}</div>
              <div className="text-[8px] font-mono text-slate-500">{sheet.process}</div>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {sheet.clusters.slice(0, 4).map(cluster => (
                  <span key={cluster.name} className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[7.5px] font-mono text-slate-400">{cluster.name}</span>
                ))}
              </div>
              <div className="mt-1.5 space-y-0.5">
                {sheet.bridges.map(bridge => (
                  <div key={bridge.name} className="text-[7.5px] font-mono text-purple-300 truncate">
                    {bridge.kind} · {bridge.name} ×{bridge.instances}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-800">
                <span className={`text-[7.5px] font-mono uppercase ${sheet.confidence === 'high' ? 'text-emerald-300' : sheet.confidence === 'medium' ? 'text-amber-300' : 'text-red-300'}`}>{sheet.confidence}</span>
                <button onClick={() => downloadJson(`${sheet.id}.json`, sheet)} className="ml-auto px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[7.5px] font-mono text-cyan-200">JSON</button>
                {sheet.source.url && (
                  <a href={sheet.source.url} target="_blank" rel="noreferrer" className="p-0.5 text-slate-500 hover:text-cyan-300" title="Public source">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold"><Network className="w-4 h-4" /> Cross-vendor IP graph</div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {IP_REGISTRY.length} reusable IP definitions, {IP_REGISTRY.reduce((sum, ip) => sum + ip.usedBy.length, 0)} verified usage links and {CROSS_VENDOR_BINDINGS.filter(b => b.verified).length} verified vendor bindings.
            Arm CPU IP appears across Arm, Samsung, Qualcomm and Broadcom; AMD RDNA 3 is bound to Samsung Xclipse.
          </p>
        </div>
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold"><ShieldCheck className="w-4 h-4" /> Public-data policy</div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Every SoC carries a public-data confidence level. Apple and other proprietary blocks are explicitly modelled as public summaries; no invented register maps are presented as fact.
          </p>
        </div>
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold"><Database className="w-4 h-4" /> Custom & IP-XACT</div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Import IP-XACT 1685-2014 components, assemble a custom SoC, or export any catalog SoC as an IP-XACT component with memory maps and bus interfaces.
          </p>
        </div>
      </div>
    </div>
  );
};
