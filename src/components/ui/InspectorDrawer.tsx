import React from 'react';
import { ModuleNode, InterconnectConnection, Port, ClockDomainInfo, ResetDomainInfo, PowerDomainInfo, DomainLens } from '../../types/soc';
import { findNodeById, prettyName } from '../../utils/hierarchy';
import { X, ExternalLink, ArrowRight, Activity, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Zap, BookOpen, Box } from 'lucide-react';

interface InspectorDrawerProps {
  selectedModule: ModuleNode | null;
  selectedConnection: InterconnectConnection | null;
  selectedPort: Port | null;
  rootModule: ModuleNode;
  connections: InterconnectConnection[];
  clockDomains: ClockDomainInfo[];
  resetDomains: ResetDomainInfo[];
  powerDomains: PowerDomainInfo[];
  onSelectDomainLens: (lens: DomainLens | null) => void;
  onSelectConnection: (conn: InterconnectConnection) => void;
  onClose: () => void;
  onDrillDown: (mod: ModuleNode) => void;
  onCreateIssueForConnection: (conn: InterconnectConnection) => void;
  onAnalyzeConnection?: (conn: InterconnectConnection) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  selectedModule,
  selectedConnection,
  selectedPort,
  rootModule,
  connections,
  clockDomains,
  resetDomains,
  powerDomains,
  onSelectDomainLens,
  onSelectConnection,
  onClose,
  onDrillDown,
  onCreateIssueForConnection,
  onAnalyzeConnection
}) => {
  if (!selectedModule && !selectedConnection && !selectedPort) {
    return null;
  }

  const hasChildren = Boolean(selectedModule?.children && selectedModule.children.length > 0);
  const incidentConnections = selectedModule
    ? connections.filter(conn => conn.srcModuleId === selectedModule.id || conn.dstModuleId === selectedModule.id)
    : [];
  const moduleName = (id: string) => findNodeById(rootModule, id)?.displayName ?? id;
  const role = selectedModule?.level === 0 ? 'soc' : selectedModule?.role ?? (
    selectedModule?.type === 'fabric' ? 'fabric' :
    selectedModule?.type === 'bridge' ? 'bridge' :
    selectedModule?.category === 'memory' ? 'memory' :
    selectedModule?.category === 'compute' ? 'master' :
    selectedModule?.category === 'security' ? 'control' :
    'io'
  );
  const srcEndpointName = selectedConnection ? moduleName(selectedConnection.srcModuleId) : '';
  const dstEndpointName = selectedConnection ? moduleName(selectedConnection.dstModuleId) : '';
  const clockColor = (name: string) => clockDomains.find(domain => domain.name === name)?.color ?? '#38bdf8';
  const resetColor = (name: string) => resetDomains.find(domain => domain.name === name)?.color ?? '#10b981';
  const powerColor = (name: string) => powerDomains.find(domain => domain.name === name)?.color ?? '#f59e0b';

  return (
    <aside className="w-96 shrink-0 bg-silicon-900/95 border-l border-slate-800 backdrop-blur-md h-full flex flex-col z-30 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedConnection ? (
            <Activity className="w-4 h-4 text-cyan-400" />
          ) : (
            <Cpu className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            {selectedConnection ? 'Interconnect & CDC Path' : selectedPort ? 'Port Pin Inspector' : 'IP / Subsystem Specs'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-5 text-xs">
        {/* CONNECTION SELECTED */}
        {selectedConnection && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  selectedConnection.cdcStatus === 'violation'
                    ? 'bg-red-950 text-red-400 border border-red-700 animate-pulse'
                    : selectedConnection.cdcStatus === 'clean'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : 'bg-amber-950 text-amber-400 border border-amber-700'
                }`}>
                  {selectedConnection.cdcStatus} CDC
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedConnection.busType}
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-mono">
                {selectedConnection.name}
              </h2>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Bus Width: <strong className="text-white font-mono">{selectedConnection.width}-bit</strong>
              </div>
            </div>

            {/* Endpoints & Domains */}
            <div className="bg-silicon-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase block">Tx Source</span>
                  <span className="text-cyan-300 font-bold truncate">{srcEndpointName}</span>
                  <div className="text-[10px] text-blue-400">{selectedConnection.srcClock}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Rx Destination</span>
                  <span className="text-purple-300 font-bold truncate">{dstEndpointName}</span>
                  <div className="text-[10px] text-purple-400">{selectedConnection.dstClock}</div>
                </div>
              </div>
            </div>

            {/* Synchronizer Scheme */}
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] font-medium">Synchronization Scheme:</span>
              <div className="p-2.5 rounded bg-silicon-950 border border-slate-800 text-slate-200 font-mono text-[11px]">
                {selectedConnection.syncScheme}
              </div>
            </div>

            {/* EDA Signoff Check */}
            <div className="bg-silicon-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-cyan-400 font-bold text-[11px]">
                  EDA Rule: {selectedConnection.edaCheckId}
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedConnection.reportSource}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedConnection.details}
              </p>
              {selectedConnection.waiverNote && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[10px] font-mono">
                  {selectedConnection.waiverNote}
                </div>
              )}
            </div>

            {/* RDC Check */}
            <div className="flex items-center justify-between p-2.5 rounded bg-silicon-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-medium text-white text-[11px]">Reset Domain Crossing (RDC)</div>
                  <div className="text-[10px] text-slate-400">Asynchronous reset tree hazard</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedConnection.rdcStatus === 'hazard'
                  ? 'bg-red-950 text-red-400 border border-red-700'
                  : 'bg-emerald-950 text-emerald-400'
              }`}>
                {selectedConnection.rdcStatus.toUpperCase()}
              </span>
            </div>

            {/* CDC Waveform & MTBF Analysis Action */}
            <button
              onClick={() => onAnalyzeConnection && onAnalyzeConnection(selectedConnection)}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Activity className="w-4 h-4" />
              Analyze Waveforms & MTBF
            </button>

            {/* Blocker Action */}
            {selectedConnection.cdcStatus === 'violation' && (
              <button
                onClick={() => onCreateIssueForConnection(selectedConnection)}
                className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-red transition"
              >
                <ShieldAlert className="w-4 h-4" />
                Raise Hardware Tape-out Blocker Ticket
              </button>
            )}
          </div>
        )}

        {/* MODULE SELECTED */}
        {!selectedConnection && selectedModule && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                  Level {selectedModule.level}: {['Architecture', 'Subsystem', 'IP', 'Microarchitecture'][selectedModule.level] ?? selectedModule.type}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {role} · {selectedModule.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedModule.color }} />
                {selectedModule.displayName}
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {selectedModule.description}
              </p>
              {selectedModule.docRef && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  TRM: <span className="text-slate-300">{selectedModule.docRef}</span>
                </div>
              )}
            </div>

            {/* Drill-down inside module button */}
            {hasChildren ? (
              <button
                onClick={() => onDrillDown(selectedModule)}
                className="w-full py-2.5 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Box className="w-4 h-4" />
                <span>Open Submodule Diagram ({selectedModule.children?.length} sub-blocks)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-mono text-center">
                LEAF IP — NO DEEPER SUBMODULES
              </div>
            )}

            {/* Immediate children quick-open */}
            {hasChildren && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Sub-blocks ({selectedModule.children?.length})
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedModule.children?.map(child => (
                    <button
                      key={child.id}
                      onClick={() => onDrillDown(child)}
                      className="text-left p-2 rounded bg-silicon-950 border border-slate-800 hover:border-cyan-600/60 transition min-w-0"
                      title={`Open ${child.displayName}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: child.color }} />
                        <span className="text-[10px] font-mono text-slate-200 truncate">{prettyName(child.name)}</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 mt-0.5 pl-3">
                        {child.children?.length ? `${child.children.length} sub-blocks` : child.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Incident interconnect / CDC paths */}
            {incidentConnections.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Interactions ({incidentConnections.length})
                </span>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                  {incidentConnections.map(conn => {
                    const isSource = conn.srcModuleId === selectedModule.id;
                    const otherId = isSource ? conn.dstModuleId : conn.srcModuleId;
                    const statusColor = conn.cdcStatus === 'violation' ? 'bg-red-500' : conn.cdcStatus === 'waiver' ? 'bg-amber-400' : 'bg-emerald-500';
                    return (
                      <button
                        key={conn.id}
                        onClick={() => onSelectConnection(conn)}
                        className="w-full text-left p-2 rounded bg-silicon-950 border border-slate-800 hover:border-cyan-600/60 transition"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
                          <span className="text-[10px] font-mono text-slate-200 truncate">{conn.name}</span>
                          <span className="ml-auto text-[8px] font-mono text-slate-500 shrink-0">{conn.width}b</span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>{isSource ? 'TX' : 'RX'}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-cyan-300 truncate">{moduleName(otherId)}</span>
                        </div>
                        <div className="text-[8.5px] font-mono text-slate-500 mt-0.5">
                          {conn.srcClock} → {conn.dstClock}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clocks & Resets */}
            <div className="bg-silicon-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Clock Domains</span>
                <span className="text-[8px] font-mono text-slate-500">click to highlight</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedModule.clockDomains?.map(clk => (
                  <button
                    key={clk}
                    onClick={() => onSelectDomainLens({ kind: 'clock', name: clk })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/60 text-blue-200 border border-blue-900 hover:border-cyan-500 text-[10px] font-mono transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: clockColor(clk) }} />
                    {clk}
                  </button>
                ))}
              </div>

              <span className="text-[10px] uppercase font-mono text-slate-400 block pt-2">Reset Domains</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedModule.resetDomains?.map(rst => (
                  <button
                    key={rst}
                    onClick={() => onSelectDomainLens({ kind: 'reset', name: rst })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-200 border border-emerald-900 hover:border-emerald-500 text-[10px] font-mono transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: resetColor(rst) }} />
                    {rst}
                  </button>
                ))}
              </div>

              <span className="text-[10px] uppercase font-mono text-slate-400 block pt-2">Power Domains</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedModule.powerDomains ?? []).map(pd => (
                  <button
                    key={pd}
                    onClick={() => onSelectDomainLens({ kind: 'power', name: pd })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 text-amber-200 border border-amber-900 hover:border-amber-500 text-[10px] font-mono transition"
                    title={powerDomains.find(domain => domain.name === pd)?.voltage}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: powerColor(pd) }} />
                    {pd}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverables / Sign-off Gate (if applicable) */}
            {selectedModule.deliverables && (
              <div className="bg-silicon-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400">IP Maturity</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{selectedModule.deliverables.maturity}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selectedModule.deliverables.rtlFrozen ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span>RTL Frozen</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selectedModule.deliverables.spyglassCdcClean ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span>SpyGlass CDC</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selectedModule.deliverables.jasperGoldVerified ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span>JasperGold</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selectedModule.deliverables.timingClosed ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span>STA Timing</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-slate-800">
                  <span className="text-slate-400">DV Functional Cov:</span>
                  <span className="text-emerald-400 font-bold">{selectedModule.deliverables.uvmCoveragePercent}%</span>
                </div>
              </div>
            )}

            {/* Ports on this block */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Perimeter Ports ({selectedModule.ports?.length || 0})
              </span>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {selectedModule.ports?.map(p => (
                  <div
                    key={p.id}
                    className="p-2 rounded bg-silicon-950 border border-slate-800 flex items-center justify-between font-mono text-[11px]"
                  >
                    <div>
                      <span className="text-slate-400 mr-1">{p.direction === 'in' ? '➔' : '←'}</span>
                      <span className="text-slate-200 font-semibold">{p.name}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      p.cdcStatus === 'violation'
                        ? 'bg-red-950 text-red-400'
                        : p.cdcStatus === 'clean'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}>
                      {p.cdcStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
