import React, { useState } from 'react';
import { CustomerRequirement, StakeholderRole, SpecDeltaEvent } from '../../types/requirements';
import { MOCK_CUSTOMER_REQUIREMENTS, MOCK_SPEC_DELTAS, RAW_CUSTOMER_EXCEL_CSV_SAMPLE } from '../../data/mockCustomerRequirements';
import { ModuleNode } from '../../types/soc';
import {
  FileSpreadsheet,
  Users,
  Building,
  Briefcase,
  Cpu,
  TestTube2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  Eye,
  GitCompare,
  Search,
  Sparkles,
  Layers,
  Clock,
  Zap
} from 'lucide-react';

interface CustomerRequirementsMatrixProps {
  rootModule: ModuleNode;
  onSelectModule: (mod: ModuleNode) => void;
  onOpenArchitecture: () => void;
}

export const CustomerRequirementsMatrix: React.FC<CustomerRequirementsMatrixProps> = ({
  rootModule,
  onSelectModule,
  onOpenArchitecture
}) => {
  const [requirements, setRequirements] = useState<CustomerRequirement[]>(MOCK_CUSTOMER_REQUIREMENTS);
  const [deltas, setDeltas] = useState<SpecDeltaEvent[]>(MOCK_SPEC_DELTAS);
  const [activeRole, setActiveRole] = useState<StakeholderRole>('all');
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState(RAW_CUSTOMER_EXCEL_CSV_SAMPLE);
  const [activeDelta, setActiveDelta] = useState<SpecDeltaEvent | null>(deltas[0]);

  // Find module helper
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

  const filtered = requirements.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.customerSpec.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.targetValue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplyImport = () => {
    // Parse imported CSV text
    const lines = importText.trim().split('\n');
    if (lines.length > 1) {
      // Successfully simulated import from customer document
      setIsImportModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Top Banner: Customer PRD Ingestion & Cascading Header */}
      <div className="p-4 bg-silicon-850 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  Customer PRD Cascading Requirements Engine
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Multi-Role Auto-Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cascades customer product requirements from Excel/Word into IP specs for Architects, Managers, RTL, and DV teams.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import Customer Excel/Doc</span>
            </button>
          </div>
        </div>

        {/* Live Customer Spec Delta / Change Request (ECO) Banner */}
        {activeDelta && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-xs flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <GitCompare className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-amber-300 font-mono mr-2">
                  [LIVE SPEC DELTA {activeDelta.id}]:
                </span>
                <span className="text-white font-semibold">{activeDelta.title}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Requested by: <strong className="text-slate-300">{activeDelta.requestedBy}</strong> ({activeDelta.timestamp}) •
                  Changed from <code className="text-red-400 bg-red-950/60 px-1 rounded">{activeDelta.fromValue}</code> ➔{' '}
                  <code className="text-emerald-400 bg-emerald-950/60 px-1 rounded">{activeDelta.toValue}</code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                Arch: Bandwidth Recalibrated
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900">
                RTL: FIFO Adjusted
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900">
                DV: VIP Re-run
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Role Switcher Toolbar: The 4 Critical Stakeholder Perspectives */}
      <div className="px-4 py-2.5 bg-silicon-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Stakeholder Lens Buttons */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-500 text-[11px] mr-1">STAKEHOLDER LENS:</span>
          <button
            onClick={() => setActiveRole('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeRole === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Unified Traceability</span>
          </button>

          <button
            onClick={() => setActiveRole('architect')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeRole === 'architect'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Architects</span>
          </button>

          <button
            onClick={() => setActiveRole('manager')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeRole === 'manager'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Managers</span>
          </button>

          <button
            onClick={() => setActiveRole('rtl')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeRole === 'rtl'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>RTL Engineers</span>
          </button>

          <button
            onClick={() => setActiveRole('dv')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeRole === 'dv'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5" />
            <span>DV Engineers</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer specs, signals, gates..."
            className="pl-8 pr-3 py-1 bg-silicon-900 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-64"
          />
        </div>
      </div>

      {/* Main Cascading Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-silicon-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur z-10">
              <th className="py-3 px-4 w-72">Customer Requirement & Value</th>
              <th className="py-3 px-4 w-44">Impacted IP Subsystems</th>

              {/* DYNAMIC COLUMNS BASED ON ACTIVE ROLE */}
              {(activeRole === 'all' || activeRole === 'architect') && (
                <th className="py-3 px-4">🏛️ Architect Impact (Microarch & Clocks)</th>
              )}

              {(activeRole === 'all' || activeRole === 'manager') && (
                <th className="py-3 px-4">👔 Manager Impact (Risk & Gates)</th>
              )}

              {(activeRole === 'all' || activeRole === 'rtl') && (
                <th className="py-3 px-4">⚡ RTL Impact (Ports & CDC Cells)</th>
              )}

              {(activeRole === 'all' || activeRole === 'dv') && (
                <th className="py-3 px-4">🧪 DV Impact (UVM & Coverage)</th>
              )}

              <th className="py-3 px-4 text-right">Architecture View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map(req => {
              const primaryModule = findModuleById(req.impactedModuleIds[0], rootModule);

              return (
                <tr
                  key={req.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => {
                    if (primaryModule) {
                      onSelectModule(primaryModule);
                      onOpenArchitecture();
                    }
                  }}
                >
                  {/* Column 1: Customer Requirement */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded text-[11px] border border-cyan-800/60">
                        {req.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {req.customerPriority}
                      </span>
                    </div>
                    <div className="font-semibold text-white mt-1 text-xs leading-snug">
                      {req.customerSpec}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-400">Target: <strong className="text-white">{req.targetValue}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Current: <strong className={req.status === 'ECO / Delta Pending' ? 'text-amber-400' : 'text-cyan-300'}>{req.currentValue}</strong></span>
                    </div>
                  </td>

                  {/* Column 2: Impacted Subsystems */}
                  <td className="py-3.5 px-4 align-top font-mono text-[11px]">
                    <div className="space-y-1">
                      {req.impactedModuleIds.map(modId => {
                        const mod = findModuleById(modId, rootModule);
                        return (
                          <div key={modId} className="flex items-center gap-1.5 text-cyan-300 bg-silicon-950 px-2 py-0.5 rounded border border-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mod?.color || '#38bdf8' }} />
                            <span>{mod?.name || modId}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                        req.status === 'ECO / Delta Pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : req.status === 'Sign-off Clean'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </td>

                  {/* Column 3: ARCHITECT VIEW */}
                  {(activeRole === 'all' || activeRole === 'architect') && (
                    <td className="py-3.5 px-4 align-top text-xs space-y-1">
                      <div className="text-slate-200 leading-relaxed font-medium">
                        {req.architectImpact.microarchChanges}
                      </div>
                      <div className="text-[11px] font-mono text-blue-300">
                        ⚡ Clocks: {req.architectImpact.clockFrequencies}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Δ Area/Power: {req.architectImpact.areaPowerDelta}
                      </div>
                    </td>
                  )}

                  {/* Column 4: MANAGER VIEW */}
                  {(activeRole === 'all' || activeRole === 'manager') && (
                    <td className="py-3.5 px-4 align-top text-xs space-y-1 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.managerImpact.scheduleRisk === 'Blocker'
                            ? 'bg-red-950 text-red-400 border border-red-800 animate-ping'
                            : req.managerImpact.scheduleRisk === 'High'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          Risk: {req.managerImpact.scheduleRisk}
                        </span>
                        <span className="text-[11px] text-slate-300 font-bold">
                          {req.managerImpact.estimatedManWeeks} man-wks
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Milestone Gate: <strong className="text-white">{req.managerImpact.tapeoutMilestone}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sign-off: {req.managerImpact.deliverableGate}
                      </div>
                    </td>
                  )}

                  {/* Column 5: RTL VIEW */}
                  {(activeRole === 'all' || activeRole === 'rtl') && (
                    <td className="py-3.5 px-4 align-top text-xs space-y-1 font-mono">
                      <div className="text-cyan-300 text-[11px]">
                        Hierarchy: <code className="text-white">{req.rtlImpact.moduleHierarchy}</code>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate max-w-xs">
                        Ports: {req.rtlImpact.portSignals}
                      </div>
                      <div className="text-[10px] text-purple-300 bg-purple-950/40 p-1 rounded border border-purple-900/60">
                        CDC: {req.rtlImpact.cdcSynchronizerRequired}
                      </div>
                    </td>
                  )}

                  {/* Column 6: DV VIEW */}
                  {(activeRole === 'all' || activeRole === 'dv') && (
                    <td className="py-3.5 px-4 align-top text-xs space-y-1">
                      <div className="text-slate-200 font-mono text-[11px]">
                        Env: {req.dvImpact.uvmTestbenchEnv}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-400">Coverage:</span>
                        <span className={req.dvImpact.currentCoverage >= 95 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {req.dvImpact.currentCoverage}% / {req.dvImpact.functionalCoverageGoal}%
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 bg-silicon-950 p-1 rounded border border-slate-800">
                        Assertion: {req.dvImpact.formalAssertions}
                      </div>
                    </td>
                  )}

                  {/* Action */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (primaryModule) {
                          onSelectModule(primaryModule);
                          onOpenArchitecture();
                        }
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

      {/* Customer Excel / Document Importer Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-silicon-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-4 bg-silicon-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Import Customer Product Requirements (Excel / CSV / Doc)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste raw customer requirements to auto-cascade into IP specs for Architects, Managers, RTL, and DV.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Excel Spreadsheet / CSV Input:</span>
                <span className="text-cyan-300">Auto-parsers enabled for TSMC / Automotive OEM formats</span>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                className="w-full bg-silicon-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="px-6 py-4 bg-silicon-850 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Supports CSV, Tab-delimited, and IP-XACT XML formats
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyImport}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition shadow-glow-cyan flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Cascade to All Stakeholders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
