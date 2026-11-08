import React, { useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { BookOpen, MapPin, Binary, Search, Cpu, ArrowUpRight, Zap, CheckCircle2, Layers } from 'lucide-react';
import { ModuleNode, DomainLens } from '../../types/soc';

interface TRMSpecViewerProps {
  currentCompany: CompanySoCEntry;
  onSelectModule: (mod: ModuleNode) => void;
  onSelectDomainLens: (lens: DomainLens | null) => void;
  onOpen3DView: () => void;
}

export const TRMSpecViewer: React.FC<TRMSpecViewerProps> = ({
  currentCompany,
  onSelectModule,
  onSelectDomainLens,
  onOpen3DView
}) => {
  const [activeTab, setActiveTab] = useState<'memory_map' | 'clock_tree' | 'domains' | 'subsystems'>('memory_map');
  const [search, setSearch] = useState('');

  const filteredMemoryMap = currentCompany.memoryMap.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      return (
        m.region.toLowerCase().includes(q) ||
        m.startAddr.toLowerCase().includes(q) ||
        m.endAddr.toLowerCase().includes(q) ||
        m.busMaster.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Top Banner: Real Silicon Specification Document Header */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {currentCompany.companyName} Silicon Specification
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {currentCompany.chipModel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Source Document: <strong className="text-slate-300">{currentCompany.trmDocumentId}</strong> • Node: <strong className="text-slate-300">{currentCompany.processNode}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {currentCompany.primaryApp}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex rounded-lg bg-silicon-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('memory_map')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'memory_map'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>System Memory Map ({currentCompany.memoryMap.length} Ranges)</span>
            </button>
            <button
              onClick={() => setActiveTab('clock_tree')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'clock_tree'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Clock Domains & SDC Specs ({currentCompany.clockDomains.length} Clocks)</span>
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'domains'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Domain Map ({currentCompany.clockDomains.length} clk · {currentCompany.resetDomains.length} rst · {currentCompany.powerDomains?.length ?? 0} pwr)</span>
            </button>
            <button
              onClick={() => setActiveTab('subsystems')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'subsystems'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>TRM Subsystem Hierarchy</span>
            </button>
          </div>

          {activeTab === 'memory_map' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hex address, region, master..."
                className="pl-8 pr-3 py-1 bg-silicon-900 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: System Memory Map Table */}
      {activeTab === 'memory_map' && (
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-silicon-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur z-10">
                <th className="py-3 px-4">Memory Region & Description</th>
                <th className="py-3 px-4">Start Address</th>
                <th className="py-3 px-4">End Address</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Bus Master / Interconnect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMemoryMap.map((mem, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-white font-mono text-xs">{mem.region}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{mem.description}</div>
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-semibold">{mem.startAddr}</td>
                  <td className="py-3 px-4 text-purple-300 font-semibold">{mem.endAddr}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">
                      {mem.size}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">{mem.busMaster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Clock Domains & Timing Tree */}
      {activeTab === 'clock_tree' && (
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {currentCompany.clockDomains.map(clk => (
              <div
                key={clk.name}
                className="p-3.5 rounded-xl bg-silicon-950 border border-slate-800 font-mono text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: clk.color }} />
                    <span className="font-bold text-white">{clk.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                    {clk.freqMhz >= 1000 ? `${(clk.freqMhz / 1000).toFixed(2)} GHz` : `${clk.freqMhz} MHz`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {clk.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                  <span>Cycle Period: {(1000 / clk.freqMhz).toFixed(3)} ns</span>
                  <span>STA SDC Target: Closed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain Map: clock / reset / power membership */}
      {activeTab === 'domains' && (
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">Clock Domains</h3>
              <span className="text-[10px] font-mono text-slate-500">click a domain to highlight it in 3D</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {currentCompany.clockDomains.map(clk => (
                <button
                  key={clk.name}
                  onClick={() => { onSelectDomainLens({ kind: 'clock', name: clk.name }); onOpen3DView(); }}
                  className="text-left p-2.5 rounded-lg bg-silicon-950 border border-slate-800 hover:border-cyan-600/60 transition font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: clk.color }} />
                    <span className="text-xs font-bold text-white">{clk.name}</span>
                    <span className="ml-auto text-[10px] text-cyan-300">{clk.freqMhz} MHz</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-snug">{clk.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2">Reset Domains</h3>
            <div className="grid grid-cols-3 gap-2">
              {currentCompany.resetDomains.map(rst => (
                <button
                  key={rst.name}
                  onClick={() => { onSelectDomainLens({ kind: 'reset', name: rst.name }); onOpen3DView(); }}
                  className="text-left p-2.5 rounded-lg bg-silicon-950 border border-slate-800 hover:border-emerald-600/60 transition font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rst.color }} />
                    <span className="text-xs font-bold text-white">{rst.name}</span>
                    <span className="ml-auto text-[9px] text-emerald-300 uppercase">{rst.type.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-snug">{rst.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-2">Power Domains</h3>
            <div className="grid grid-cols-3 gap-2">
              {(currentCompany.powerDomains ?? []).map(pd => (
                <button
                  key={pd.name}
                  onClick={() => { onSelectDomainLens({ kind: 'power', name: pd.name }); onOpen3DView(); }}
                  className="text-left p-2.5 rounded-lg bg-silicon-950 border border-slate-800 hover:border-amber-600/60 transition font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pd.color }} />
                    <span className="text-xs font-bold text-white">{pd.name}</span>
                    <span className="ml-auto text-[9px] text-amber-300">{pd.voltage}</span>
                    {pd.alwaysOn && <span className="text-[8px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">ALWAYS ON</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-snug">{pd.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TRM Subsystems Breakdown */}
      {activeTab === 'subsystems' && (
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {currentCompany.hierarchy.children?.map(sub => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-silicon-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  onSelectModule(sub);
                  onOpen3DView();
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                      {sub.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      {sub.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sub.color }} />
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                    {sub.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-850 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">
                    {sub.children?.length ? `${sub.children.length} Child Blocks` : 'Leaf Block'}
                  </span>
                  <span className="text-cyan-300 flex items-center gap-1 font-semibold hover:underline">
                    View in 3D <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
