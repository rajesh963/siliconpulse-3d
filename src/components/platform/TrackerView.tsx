import React, { useEffect, useMemo, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { ARCHITECTURE_DECISIONS, CHANGE_REQUESTS, SPEC_SECTIONS } from '../../data/platformData';
import { ArchitectureDecision, ChangeRequest, TrackerDiscipline, TrackerStatus } from '../../types/platform';
import { ModuleNode } from '../../types/soc';
import { AlertTriangle, CheckCircle2, ClipboardList, GitPullRequest, Landmark, Plus, XCircle, ArrowUpRight, Network } from 'lucide-react';

interface TrackerViewProps {
  catalog: Record<string, CompanySoCEntry>;
  activeCompanyId: string;
  onLoadCompany: (id: string) => void;
  onOpenModule: (companyId: string, moduleId: string) => void;
}

const CR_KEY = 'socpulse.crs.v1';
const ADR_KEY = 'socpulse.adrs.v1';

const flatten = (node: ModuleNode, out: ModuleNode[] = []): ModuleNode[] => {
  if (node.level > 0) out.push(node);
  for (const child of node.children ?? []) flatten(child, out);
  return out;
};

const statusColor = (status: TrackerStatus) =>
  status === 'open' ? 'bg-red-950/70 border-red-800 text-red-300' :
  status === 'triage' ? 'bg-amber-950/70 border-amber-800 text-amber-300' :
  status === 'in_progress' ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300' :
  status === 'resolved' ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' :
  'bg-slate-800 border-slate-700 text-slate-400';

const disciplineColor = (discipline: TrackerDiscipline) =>
  discipline === 'arch' ? 'text-cyan-300' :
  discipline === 'rtl' ? 'text-purple-300' :
  discipline === 'dv' ? 'text-emerald-300' :
  discipline === 'pd' ? 'text-amber-300' :
  discipline === 'safety' ? 'text-rose-300' : 'text-slate-300';

export const TrackerView: React.FC<TrackerViewProps> = ({ catalog, activeCompanyId, onLoadCompany, onOpenModule }) => {
  const [tab, setTab] = useState<'crs' | 'adrs' | 'gates'>('crs');
  const [crs, setCrs] = useState<ChangeRequest[]>(() => {
    try {
      const stored = localStorage.getItem(CR_KEY);
      if (!stored) return CHANGE_REQUESTS;
      const byId = new Map<string, ChangeRequest>();
      for (const cr of [...CHANGE_REQUESTS, ...(JSON.parse(stored) as ChangeRequest[])]) byId.set(cr.id, cr);
      return Array.from(byId.values());
    } catch { return CHANGE_REQUESTS; }
  });
  const [adrs, setAdrs] = useState<ArchitectureDecision[]>(() => {
    try {
      const stored = localStorage.getItem(ADR_KEY);
      if (!stored) return ARCHITECTURE_DECISIONS;
      const byId = new Map<string, ArchitectureDecision>();
      for (const adr of [...ARCHITECTURE_DECISIONS, ...(JSON.parse(stored) as ArchitectureDecision[])]) byId.set(adr.id, adr);
      return Array.from(byId.values());
    } catch { return ARCHITECTURE_DECISIONS; }
  });
  const [showCrForm, setShowCrForm] = useState(false);
  const [showAdrForm, setShowAdrForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | TrackerStatus>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | string>('all');
  const [crForm, setCrForm] = useState({ title: '', description: '', targetModuleId: '', discipline: 'rtl' as TrackerDiscipline, severity: 'high' as ChangeRequest['severity'], linkedSpecId: '' });
  const [adrForm, setAdrForm] = useState({ title: '', context: '', decision: '', consequences: '', linkedModuleIds: [] as string[] });

  useEffect(() => {
    localStorage.setItem(CR_KEY, JSON.stringify(crs));
  }, [crs]);
  useEffect(() => {
    localStorage.setItem(ADR_KEY, JSON.stringify(adrs));
  }, [adrs]);

  const activeModules = useMemo(() => flatten(catalog[activeCompanyId]?.hierarchy).filter(m => m.level <= 2), [catalog, activeCompanyId]);
  const allCrs = crs.filter(cr => (companyFilter === 'all' || cr.companyId === companyFilter) && (statusFilter === 'all' || cr.status === statusFilter));
  const activeCompany = catalog[activeCompanyId];

  const moduleName = (companyId: string, moduleId: string) => {
    const company = catalog[companyId];
    const module = company ? flatten(company.hierarchy).find(m => m.id === moduleId) : undefined;
    return module?.displayName ?? moduleId;
  };

  const updateStatus = (id: string, status: TrackerStatus) => {
    setCrs(prev => prev.map(cr => cr.id === id ? { ...cr, status, updatedAt: new Date().toISOString().slice(0, 10), history: [...cr.history, { at: new Date().toISOString().slice(0, 10), by: 'You', action: `Status → ${status}` }] } : cr));
  };

  const createCr = () => {
    if (!crForm.title.trim() || !crForm.targetModuleId) return;
    const now = new Date().toISOString().slice(0, 10);
    const cr: ChangeRequest = {
      id: `CR-${1000 + crs.length + 1}`,
      title: crForm.title.trim(),
      description: crForm.description.trim(),
      companyId: activeCompanyId,
      targetModuleId: crForm.targetModuleId,
      discipline: crForm.discipline,
      severity: crForm.severity,
      status: 'open',
      owner: 'You',
      linkedSpecId: crForm.linkedSpecId || undefined,
      createdAt: now,
      updatedAt: now,
      history: [{ at: now, by: 'You', action: 'Created' }],
    };
    setCrs(prev => [cr, ...prev]);
    setCrForm({ title: '', description: '', targetModuleId: '', discipline: 'rtl', severity: 'high', linkedSpecId: '' });
    setShowCrForm(false);
  };

  const createAdr = () => {
    if (!adrForm.title.trim()) return;
    const adr: ArchitectureDecision = {
      id: `ADR-${String(adrs.length + 1).padStart(3, '0')}`,
      title: adrForm.title.trim(),
      context: adrForm.context.trim(),
      decision: adrForm.decision.trim(),
      consequences: adrForm.consequences.trim(),
      status: 'proposed',
      companyId: activeCompanyId,
      linkedModuleIds: adrForm.linkedModuleIds,
      linkedSpecIds: [],
      owner: 'You',
      date: new Date().toISOString().slice(0, 10),
    };
    setAdrs(prev => [adr, ...prev]);
    setAdrForm({ title: '', context: '', decision: '', consequences: '', linkedModuleIds: [] });
    setShowAdrForm(false);
  };

  const deliverableModules = useMemo(() => {
    if (!activeCompany) return [];
    return flatten(activeCompany.hierarchy).filter(m => m.deliverables);
  }, [activeCompany]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg bg-silicon-950 p-1 border border-slate-800 text-[10px] font-mono">
          {([['crs', 'Change Requests'], ['adrs', 'Architecture Decisions'], ['gates', 'RTL / DV Gates']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition ${tab === key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="bg-silicon-900 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-[10px] font-mono focus:outline-none">
            <option value="all">All companies</option>
            {Object.values(catalog).filter(e => e.id !== 'custom').map(entry => <option key={entry.id} value={entry.id}>{entry.companyName}</option>)}
          </select>
          {tab !== 'gates' && (
            <button
              onClick={() => tab === 'crs' ? setShowCrForm(v => !v) : setShowAdrForm(v => !v)}
              className="px-2.5 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono text-cyan-200 hover:bg-cyan-500/25 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New {tab === 'crs' ? 'CR' : 'ADR'}
            </button>
          )}
        </div>
      </div>

      {tab === 'crs' && showCrForm && (
        <div className="rounded-xl bg-silicon-950 border border-cyan-900/60 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={crForm.title} onChange={(e) => setCrForm({ ...crForm, title: e.target.value })} placeholder="Change request title" className="col-span-2 px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500" />
            <textarea value={crForm.description} onChange={(e) => setCrForm({ ...crForm, description: e.target.value })} placeholder="Description / required change" rows={2} className="col-span-2 px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 resize-none" />
            <select value={crForm.targetModuleId} onChange={(e) => setCrForm({ ...crForm, targetModuleId: e.target.value })} className="px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none">
              <option value="">Target module…</option>
              {activeModules.map(module => <option key={module.id} value={module.id}>{module.level === 1 ? 'L1 · ' : 'L2 · '}{module.displayName}</option>)}
            </select>
            <select value={crForm.discipline} onChange={(e) => setCrForm({ ...crForm, discipline: e.target.value as TrackerDiscipline })} className="px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none">
              {['arch', 'rtl', 'dv', 'pd', 'safety', 'fw'].map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
            <select value={crForm.severity} onChange={(e) => setCrForm({ ...crForm, severity: e.target.value as ChangeRequest['severity'] })} className="px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none">
              {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={crForm.linkedSpecId} onChange={(e) => setCrForm({ ...crForm, linkedSpecId: e.target.value })} className="px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none">
              <option value="">Linked spec section…</option>
              {SPEC_SECTIONS.filter(s => s.companyId === activeCompanyId).map(s => <option key={s.id} value={s.id}>{s.section} · {s.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCrForm(false)} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">Cancel</button>
            <button onClick={createCr} className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/50 text-[10px] font-mono text-cyan-200">Create CR</button>
          </div>
        </div>
      )}

      {tab === 'crs' && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-500">STATUS:</span>
            {(['all', 'open', 'triage', 'in_progress', 'resolved'] as const).map(status => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`px-1.5 py-0.5 rounded border text-[8.5px] font-mono uppercase ${statusFilter === status ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200' : 'bg-silicon-900 border-slate-800 text-slate-500'}`}>{status.replace('_', ' ')}</button>
            ))}
            <span className="ml-auto text-[9px] font-mono text-slate-500">{allCrs.length} change requests</span>
          </div>
          <div className="space-y-2">
            {allCrs.map(cr => (
              <div key={cr.id} className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-500">{cr.id}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase ${statusColor(cr.status)}`}>{cr.status.replace('_', ' ')}</span>
                  <span className={`text-[8px] font-mono uppercase ${disciplineColor(cr.discipline)}`}>{cr.discipline}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase ${cr.severity === 'critical' ? 'bg-red-950 border-red-800 text-red-300' : cr.severity === 'high' ? 'bg-amber-950 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{cr.severity}</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-500">{catalog[cr.companyId]?.companyName}</span>
                  <select value={cr.status} onChange={(e) => updateStatus(cr.id, e.target.value as TrackerStatus)} className="bg-silicon-900 border border-slate-700 text-[9px] font-mono text-slate-300 rounded px-1 py-0.5 focus:outline-none">
                    {['open', 'triage', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-[12px] font-mono font-bold text-white mt-1.5">{cr.title}</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{cr.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[9px] font-mono text-slate-500">
                  <button onClick={() => { onLoadCompany(cr.companyId); onOpenModule(cr.companyId, cr.targetModuleId); }} className="text-cyan-300 hover:underline flex items-center gap-0.5">
                    <Network className="w-3 h-3" /> {moduleName(cr.companyId, cr.targetModuleId)}
                  </button>
                  <span>· owner {cr.owner}</span>
                  {cr.linkedSpecId && <span className="text-purple-300">· {SPEC_SECTIONS.find(s => s.id === cr.linkedSpecId)?.section} {SPEC_SECTIONS.find(s => s.id === cr.linkedSpecId)?.title}</span>}
                  <span className="ml-auto">updated {cr.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'adrs' && showAdrForm && (
        <div className="rounded-xl bg-silicon-950 border border-cyan-900/60 p-3 space-y-2">
          <input value={adrForm.title} onChange={(e) => setAdrForm({ ...adrForm, title: e.target.value })} placeholder="Decision title" className="w-full px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500" />
          <textarea value={adrForm.context} onChange={(e) => setAdrForm({ ...adrForm, context: e.target.value })} placeholder="Context" rows={2} className="w-full px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 resize-none" />
          <textarea value={adrForm.decision} onChange={(e) => setAdrForm({ ...adrForm, decision: e.target.value })} placeholder="Decision" rows={2} className="w-full px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 resize-none" />
          <textarea value={adrForm.consequences} onChange={(e) => setAdrForm({ ...adrForm, consequences: e.target.value })} placeholder="Consequences" rows={2} className="w-full px-2 py-1.5 rounded bg-silicon-900 border border-slate-700 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500 resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdrForm(false)} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">Cancel</button>
            <button onClick={createAdr} className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/50 text-[10px] font-mono text-cyan-200">Create ADR</button>
          </div>
        </div>
      )}

      {tab === 'adrs' && (
        <div className="space-y-2">
          {adrs.map(adr => (
            <div key={adr.id} className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[9px] font-mono text-slate-500">{adr.id}</span>
                <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase ${adr.status === 'accepted' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-amber-950 border-amber-800 text-amber-300'}`}>{adr.status}</span>
                <span className="ml-auto text-[9px] font-mono text-slate-500">{catalog[adr.companyId]?.companyName} · {adr.date}</span>
              </div>
              <div className="text-[12px] font-mono font-bold text-white mt-1.5">{adr.title}</div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[9.5px]">
                <div><span className="text-[8px] uppercase text-slate-500 block">Context</span><span className="text-slate-400">{adr.context}</span></div>
                <div><span className="text-[8px] uppercase text-slate-500 block">Decision</span><span className="text-cyan-300">{adr.decision}</span></div>
                <div><span className="text-[8px] uppercase text-slate-500 block">Consequences</span><span className="text-slate-400">{adr.consequences}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[8.5px] font-mono">
                {adr.linkedModuleIds.map(id => (
                  <button key={id} onClick={() => { onLoadCompany(adr.companyId); onOpenModule(adr.companyId, id); }} className="text-cyan-300 hover:underline">{moduleName(adr.companyId, id)}</button>
                ))}
                <span className="ml-auto text-slate-500">owner {adr.owner}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'gates' && (
        <div className="rounded-xl bg-silicon-950 border border-slate-800 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">RTL / DV / timing gates — {activeCompany?.companyName}</span>
            <span className="ml-auto text-[9px] font-mono text-slate-500">{deliverableModules.length} IPs tracked</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-silicon-900/70 text-[8.5px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <th className="py-2 px-3">IP</th>
                <th className="py-2 px-2 text-center">RTL</th>
                <th className="py-2 px-2 text-center">Lint</th>
                <th className="py-2 px-2 text-center">CDC</th>
                <th className="py-2 px-2 text-center">Formal</th>
                <th className="py-2 px-2 text-center">UPF</th>
                <th className="py-2 px-2 text-center">Timing</th>
                <th className="py-2 px-2 text-center">DV cov</th>
                <th className="py-2 px-2">Maturity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deliverableModules.map(module => {
                const d = module.deliverables!;
                return (
                  <tr key={module.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3">
                      <button onClick={() => { onLoadCompany(activeCompanyId); onOpenModule(activeCompanyId, module.id); }} className="text-[10px] font-mono font-bold text-white hover:text-cyan-300 text-left">
                        {module.displayName}
                      </button>
                      <div className="text-[8px] text-slate-500 font-mono">L{module.level} · {module.docRef ?? 'public summary'}</div>
                    </td>
                    {[d.rtlFrozen, d.lintClean, d.spyglassCdcClean, d.jasperGoldVerified, d.upfPowerIntent, d.timingClosed].map((gate, index) => (
                      <td key={index} className="py-2 px-2 text-center">
                        {gate ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />}
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] font-mono font-bold ${d.uvmCoveragePercent >= 90 ? 'text-emerald-300' : d.uvmCoveragePercent >= 80 ? 'text-amber-300' : 'text-red-300'}`}>{d.uvmCoveragePercent}%</span>
                    </td>
                    <td className="py-2 px-2 text-[8.5px] font-mono text-slate-400">{d.maturity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {deliverableModules.length === 0 && (
            <div className="p-6 text-center text-[10px] font-mono text-slate-500">No per-IP deliverable gates recorded for this preset.</div>
          )}
        </div>
      )}
    </div>
  );
};
