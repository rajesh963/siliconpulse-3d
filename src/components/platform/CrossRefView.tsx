import React, { useMemo, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { CROSS_VENDOR_BINDINGS, IP_REGISTRY } from '../../data/platformData';
import { Search, ArrowUpRight, ShieldCheck, ShieldAlert, Network, ExternalLink } from 'lucide-react';

interface CrossRefViewProps {
  catalog: Record<string, CompanySoCEntry>;
  onLoadCompany: (id: string) => void;
  onOpenModule: (companyId: string, moduleId: string) => void;
}

export const CrossRefView: React.FC<CrossRefViewProps> = ({ catalog, onLoadCompany, onOpenModule }) => {
  const [query, setQuery] = useState('');
  const [vendor, setVendor] = useState('all');

  const vendors = useMemo(() => Array.from(new Set(IP_REGISTRY.map(ip => ip.vendor))).sort(), []);
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return IP_REGISTRY.filter(ip => {
      if (vendor !== 'all' && ip.vendor !== vendor) return false;
      if (!q) return true;
      return `${ip.name} ${ip.vendor} ${ip.category} ${ip.description} ${ip.usedBy.map(u => u.companyId).join(' ')}`.toLowerCase().includes(q);
    });
  }, [query, vendor]);

  const companyName = (id: string) => catalog[id]?.companyName ?? id;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reusable IP: Cortex-X4, RDNA 3, Adreno, CMN-700, C28x..."
              className="w-full pl-9 pr-3 py-2 bg-silicon-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="bg-silicon-900 border border-slate-700 text-cyan-300 rounded-lg px-2 py-2 text-[10px] font-mono focus:outline-none">
            <option value="all">All vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <span className="text-[9px] font-mono text-slate-500">{entries.length} IP definitions</span>
        </div>
      </div>

      <div className="rounded-xl bg-silicon-950 border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-silicon-900/80 text-slate-400 uppercase font-mono text-[9px] tracking-wider border-b border-slate-800">
              <th className="py-2 px-3">Reusable IP</th>
              <th className="py-2 px-3">Vendor</th>
              <th className="py-2 px-3">Class</th>
              <th className="py-2 px-3">Used by</th>
              <th className="py-2 px-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.map(ip => (
              <tr key={ip.id} className="hover:bg-slate-800/30 transition align-top">
                <td className="py-2.5 px-3">
                  <div className="font-mono text-[11px] font-bold text-white">{ip.name}</div>
                  <div className="text-[9px] text-slate-500 leading-snug max-w-[260px]">{ip.description}</div>
                </td>
                <td className="py-2.5 px-3 text-[10px] font-mono text-cyan-300">{ip.vendor}</td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[8px] font-mono uppercase text-slate-300">{ip.category}</span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {ip.usedBy.map((use, index) => (
                      <button
                        key={`${use.companyId}-${index}`}
                        onClick={() => { onLoadCompany(use.companyId); onOpenModule(use.companyId, use.moduleId); }}
                        className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-900/70 text-[8.5px] font-mono text-cyan-200 hover:border-cyan-500/60 transition"
                        title={`Open ${companyName(use.companyId)} block`}
                      >
                        {companyName(use.companyId)}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  {ip.source.url ? (
                    <a href={ip.source.url} target="_blank" rel="noreferrer" className="text-[9px] font-mono text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1">
                      {ip.source.type} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500">{ip.source.type}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Cross-vendor bindings</h3>
          <span className="text-[9px] font-mono text-slate-500">verified vs illustrative</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CROSS_VENDOR_BINDINGS.map(binding => (
            <div key={binding.id} className={`rounded-lg bg-silicon-950 border p-3 ${binding.verified ? 'border-slate-800' : 'border-amber-900/60'}`}>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-white">{companyName(binding.companyId)}</span>
                <span className="text-slate-500">→</span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">{binding.vendor}</span>
                <span className={`ml-auto px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase flex items-center gap-1 ${
                  binding.verified ? 'bg-emerald-950/60 border-emerald-900 text-emerald-300' : 'bg-amber-950/60 border-amber-900 text-amber-300'
                }`}>
                  {binding.verified ? <ShieldCheck className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                  {binding.verified ? 'verified' : 'illustrative'}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 mt-1">{binding.macro} · <span className="text-slate-500">{binding.role}</span></div>
              <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{binding.note}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => { onLoadCompany(binding.companyId); onOpenModule(binding.companyId, binding.blockId); }}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8.5px] font-mono text-cyan-300 hover:border-cyan-500/60"
                >
                  Open target block
                </button>
                {binding.source?.url && (
                  <a href={binding.source.url} target="_blank" rel="noreferrer" className="text-[8.5px] font-mono text-slate-500 hover:text-cyan-300 inline-flex items-center gap-0.5">
                    source <ArrowUpRight className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
