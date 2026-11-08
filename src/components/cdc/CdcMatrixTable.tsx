import React, { useState } from 'react';
import { InterconnectConnection } from '../../types/soc';
import { AlertCircle, CheckCircle, ShieldAlert, Eye, Search, Filter, ShieldCheck, Zap } from 'lucide-react';

interface CdcMatrixTableProps {
  connections: InterconnectConnection[];
  onSelectConnection: (conn: InterconnectConnection) => void;
  onOpenReportModal: () => void;
}

export const CdcMatrixTable: React.FC<CdcMatrixTableProps> = ({
  connections,
  onSelectConnection,
  onOpenReportModal
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'violation' | 'clean' | 'waiver'>('all');

  const filtered = connections.filter(c => {
    if (statusFilter !== 'all' && c.cdcStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.srcClock.toLowerCase().includes(q) ||
        c.dstClock.toLowerCase().includes(q) ||
        c.syncScheme.toLowerCase().includes(q) ||
        c.edaCheckId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const violationCount = connections.filter(c => c.cdcStatus === 'violation').length;
  const cleanCount = connections.filter(c => c.cdcStatus === 'clean').length;
  const waiverCount = connections.filter(c => c.cdcStatus === 'waiver').length;

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Toolbar */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              CDC & RDC Verification Sign-off Matrix
              <span className="text-xs px-2 py-0.5 rounded font-normal bg-slate-800 text-slate-300">
                {connections.length} Total Paths
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cross-domain clock & reset checks mapped from Synopsys SpyGlass & Cadence JasperGold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Ingest EDA Report
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="px-4 py-2.5 bg-silicon-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Paths ({connections.length})
          </button>
          <button
            onClick={() => setStatusFilter('violation')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              statusFilter === 'violation' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-red-400 hover:text-red-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Violations ({violationCount})
          </button>
          <button
            onClick={() => setStatusFilter('clean')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              statusFilter === 'clean' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Clean ({cleanCount})
          </button>
          <button
            onClick={() => setStatusFilter('waiver')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              statusFilter === 'waiver' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Waivers ({waiverCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals, clocks, rules..."
            className="pl-8 pr-3 py-1 bg-silicon-900 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-silicon-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur z-10">
              <th className="py-3 px-4">Crossing Name & Bus</th>
              <th className="py-3 px-4">Clock Domains (Tx ➔ Rx)</th>
              <th className="py-3 px-4">Synchronizer Scheme</th>
              <th className="py-3 px-4">EDA Tool & Rule</th>
              <th className="py-3 px-4">CDC Status</th>
              <th className="py-3 px-4">RDC Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((c) => {
              const isViol = c.cdcStatus === 'violation';
              const isClean = c.cdcStatus === 'clean';
              const isWaive = c.cdcStatus === 'waiver';

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectConnection(c)}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white font-mono flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        isViol ? 'bg-red-500 animate-ping' : isClean ? 'bg-emerald-500' : 'bg-amber-400'
                      }`} />
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c.busType} ({c.width}b)
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                        {c.srcClock}
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900">
                        {c.dstClock}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-200 block font-medium">
                      {c.syncScheme}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-slate-300">{c.edaCheckId}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{c.reportSource}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase font-mono ${
                      isViol
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : isClean
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {c.cdcStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      c.rdcStatus === 'hazard'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700'
                        : 'text-slate-400'
                    }`}>
                      {c.rdcStatus === 'hazard' ? 'HAZARD' : 'CLEAN'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConnection(c);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Architecture
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
