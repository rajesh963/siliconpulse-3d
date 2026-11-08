import React, { useState } from 'react';
import { PRDFeature } from '../../types/prd';
import { MOCK_PRD_FEATURES, CHIP_SPEC_METRICS } from '../../data/mockPrdData';
import { ModuleNode } from '../../types/soc';
import { Target, CheckCircle2, AlertTriangle, Eye, ArrowUpRight, Search, FileCode2 } from 'lucide-react';

interface PRDFeatureTrackerProps {
  rootModule: ModuleNode;
  onSelectModule: (mod: ModuleNode) => void;
  onOpen3DView: () => void;
}

export const PRDFeatureTracker: React.FC<PRDFeatureTrackerProps> = ({
  rootModule,
  onSelectModule,
  onOpen3DView
}) => {
  const [features, setFeatures] = useState<PRDFeature[]>(MOCK_PRD_FEATURES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = features.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        f.id.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.specTarget.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const findModuleById = (id: string, node: ModuleNode): ModuleNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const c of node.children) {
        const found = findModuleById(id, c);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header & Architectural Targets Banner */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Silicon PRD & Hardware Architecture Feature Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Product Requirements Document (PRD) tracking mapped directly to RTL IPs, CDC Sign-off, and Tapeout Gates.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            Design Spec Rev 1.4
          </span>
        </div>

        {/* Spec Metrics Row */}
        <div className="grid grid-cols-6 gap-2.5 font-mono text-xs">
          {CHIP_SPEC_METRICS.map(m => (
            <div
              key={m.name}
              className={`p-2.5 rounded-lg border transition ${
                m.status === 'Met'
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : m.status === 'At Risk'
                  ? 'bg-red-950/20 border-red-800/40 shadow-glow-red'
                  : 'bg-silicon-950/60 border-slate-800'
              }`}
            >
              <div className="text-[10px] text-slate-400 uppercase truncate">{m.name}</div>
              <div className="text-base font-bold text-white mt-1 flex items-baseline gap-1">
                <span>{m.current}</span>
                <span className="text-[11px] text-slate-400 font-normal">/ {m.target} {m.unit}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{m.domain}</span>
                <span className={m.status === 'Met' ? 'text-emerald-400' : m.status === 'At Risk' ? 'text-red-400 font-bold' : 'text-amber-400'}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="px-4 py-2.5 bg-silicon-950/70 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-mono">Category:</span>
          {['all', 'Compute', 'Memory Subsystem', 'Interconnect', 'High-Speed I/O', 'Security'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedCategory === cat ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PRD features, specs..."
            className="pl-8 pr-3 py-1 bg-silicon-900 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-60"
          />
        </div>
      </div>

      {/* Feature List Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-silicon-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur z-10">
              <th className="py-3 px-4">Feature ID & Title</th>
              <th className="py-3 px-4">Architecture Specification Target</th>
              <th className="py-3 px-4">Linked SoC Module</th>
              <th className="py-3 px-4">CDC Sign-off</th>
              <th className="py-3 px-4">DV Coverage</th>
              <th className="py-3 px-4">Maturity Status</th>
              <th className="py-3 px-4 text-right">3D Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map(f => {
              const linkedMod = findModuleById(f.linkedModuleId, rootModule);

              return (
                <tr
                  key={f.id}
                  className="hover:bg-slate-800/30 transition group cursor-pointer"
                  onClick={() => {
                    if (linkedMod) {
                      onSelectModule(linkedMod);
                      onOpen3DView();
                    }
                  }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded text-[11px] border border-cyan-800/50">
                        {f.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {f.priority}
                      </span>
                    </div>
                    <div className="font-semibold text-white mt-1 text-xs">
                      {f.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Owner: {f.owner}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-mono text-[11px] leading-relaxed max-w-xs">
                      {f.specTarget}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {linkedMod ? (
                      <div className="font-mono text-[11px] flex items-center gap-1.5 text-cyan-300">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{linkedMod.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">{f.linkedModuleId}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono">
                    {f.cdcVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clean (0 fails)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-semibold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> Fails (Blocker)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={f.dvCoveragePercent >= 95 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {f.dvCoveragePercent}%
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${f.dvCoveragePercent >= 95 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          style={{ width: `${f.dvCoveragePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      f.status === 'Signed Off'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : f.status === 'CDC Verification'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {f.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (linkedMod) {
                          onSelectModule(linkedMod);
                          onOpen3DView();
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View in 3D
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
