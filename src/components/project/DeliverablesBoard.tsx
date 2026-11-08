import React, { useState } from 'react';
import { ModuleNode } from '../../types/soc';
import { HardwareIssue, TapeoutMilestone, IssueSeverity } from '../../types/project';
import { TAPEOUT_MILESTONES, MOCK_HARDWARE_ISSUES } from '../../data/mockEdaReports';
import { CheckCircle2, XCircle, AlertCircle, Plus, Calendar, Clock, Layers } from 'lucide-react';

interface DeliverablesBoardProps {
  rootModule: ModuleNode;
  onSelectModule: (mod: ModuleNode) => void;
  onOpenArchitecture: () => void;
}

export const DeliverablesBoard: React.FC<DeliverablesBoardProps> = ({
  rootModule,
  onSelectModule,
  onOpenArchitecture
}) => {
  const [issues, setIssues] = useState<HardwareIssue[]>(MOCK_HARDWARE_ISSUES);
  const [selectedMilestone] = useState<TapeoutMilestone>(TAPEOUT_MILESTONES[2]); // v0.8
  const [activeTab, setActiveTab] = useState<'matrix' | 'issues'>('matrix');

  // Filter issues
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Flatten all modules with deliverables
  const getDeliverableModules = (node: ModuleNode): ModuleNode[] => {
    let list: ModuleNode[] = [];
    if (node.deliverables) {
      list.push(node);
    }
    if (node.children) {
      for (const c of node.children) {
        list = list.concat(getDeliverableModules(c));
      }
    }
    return list;
  };

  const deliverableModules = getDeliverableModules(rootModule);

  const filteredIssues = issues.filter(iss => {
    if (severityFilter !== 'all' && iss.severity !== severityFilter) return false;
    return true;
  });

  const handleToggleIssueStatus = (issueId: string) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === issueId) {
        const nextStatus = iss.status === 'Open' ? 'In Progress' : iss.status === 'In Progress' ? 'Signed Off' : 'Open';
        return { ...iss, status: nextStatus };
      }
      return iss;
    }));
  };

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Banner: Tape-out Milestones Roadmap */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              SoC Tapeout Milestones & IP Deliverables Gate
            </h2>
          </div>
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/70 px-3 py-1 rounded border border-cyan-800/60">
            Target Tapeout: Q1 2027 (TSMC N5 Process)
          </div>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-5 gap-2 font-mono text-xs">
          {TAPEOUT_MILESTONES.map((m) => {
            const isCompleted = m.status === 'Completed';
            const isCurrent = m.status === 'Current';

            return (
              <div
                key={m.id}
                className={`p-2.5 rounded-lg border transition ${
                  isCurrent
                    ? 'bg-cyan-950/50 border-cyan-500/80 shadow-glow-cyan'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-slate-300'
                    : 'bg-silicon-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase ${
                    isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {m.code}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.targetDate}</span>
                </div>
                <div className="font-semibold text-white text-xs truncate mt-1">
                  {m.name}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="px-4 py-2 bg-silicon-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            IP Sign-off Matrix ({deliverableModules.length} IPs)
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'issues' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Hardware Blocker Issues ({issues.length})
          </button>
        </div>

        {activeTab === 'issues' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Severity:</span>
            {['all', 'Blocker', 'Critical', 'Major'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  severityFilter === sev ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'matrix' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-silicon-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3 px-3">IP Subsystem / Module</th>
                  <th className="py-3 px-3">Maturity</th>
                  <th className="py-3 px-3 text-center">RTL Frozen</th>
                  <th className="py-3 px-3 text-center">Lint Clean</th>
                  <th className="py-3 px-3 text-center">SpyGlass CDC</th>
                  <th className="py-3 px-3 text-center">JasperGold Formal</th>
                  <th className="py-3 px-3 text-center">UPF Power Intent</th>
                  <th className="py-3 px-3 text-center">Timing Closed</th>
                  <th className="py-3 px-3 text-center">DV Coverage</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deliverableModules.map((m) => {
                  const d = m.deliverables!;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-800/30 transition group cursor-pointer"
                      onClick={() => onSelectModule(m)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-white font-mono flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
                          {m.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.description}</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                          {d.maturity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.rtlFrozen ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.lintClean ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.spyglassCdcClean ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400">
                            <XCircle className="w-3.5 h-3.5" /> Fail
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.jasperGoldVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Proven
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400">
                            <XCircle className="w-3.5 h-3.5" /> Unproven
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.upfPowerIntent ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {d.timingClosed ? (
                          <span className="text-emerald-400 font-mono text-[10px]">WNS +0.12ns</span>
                        ) : (
                          <span className="text-red-400 font-mono text-[10px]">WNS -0.34ns</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`font-semibold ${d.uvmCoveragePercent >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {d.uvmCoveragePercent}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectModule(m);
                            onOpenArchitecture();
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold"
                        >
                          View Architecture
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-xl bg-silicon-950 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-4 font-sans"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                      {iss.id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      iss.severity === 'Blocker'
                        ? 'bg-red-950 text-red-400 border border-red-700'
                        : iss.severity === 'Critical'
                        ? 'bg-orange-950 text-orange-400 border border-orange-700'
                        : 'bg-amber-950 text-amber-400 border border-amber-700'
                    }`}>
                      {iss.severity}
                    </span>
                    <span className="text-xs font-mono text-purple-300">
                      [{iss.type}]
                    </span>
                    {iss.edaToolSource && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        via {iss.edaToolSource} ({iss.edaCheckId})
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white">
                    {iss.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {iss.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Assigned to: <strong className="text-slate-300">{iss.assignee}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target: <strong className="text-slate-300">{iss.targetMilestone}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleToggleIssueStatus(iss.id)}
                    className={`px-3 py-1 rounded text-xs font-semibold font-mono transition ${
                      iss.status === 'Signed Off'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : iss.status === 'In Progress'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {iss.status}
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">Click to advance</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
