import React, { useMemo, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { COMPANIES_SOURCE_LOOKUP } from './specSource';
import { SPEC_SECTIONS } from '../../data/platformData';
import { ModuleNode } from '../../types/soc';
import { BookOpen, Search, ExternalLink, ArrowUpRight, FileText, Layers } from 'lucide-react';

interface SpecQueryViewProps {
  catalog: Record<string, CompanySoCEntry>;
  activeCompanyId: string;
  initialCompanyId?: string;
  onOpenModule: (companyId: string, moduleId: string) => void;
}

interface Result {
  id: string;
  companyId: string;
  section: string;
  title: string;
  summary: string;
  keywords: string[];
  moduleId?: string;
  modulePath?: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: string;
  explicit: boolean;
}

const walk = (node: ModuleNode, path: string[], out: { module: ModuleNode; path: string[] }[]) => {
  out.push({ module: node, path: [...path, node.name] });
  for (const child of node.children ?? []) walk(child, [...path, node.name], out);
};

export const SpecQueryView: React.FC<SpecQueryViewProps> = ({ catalog, activeCompanyId, initialCompanyId, onOpenModule }) => {
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState(initialCompanyId ?? 'all');
  const [showGenerated, setShowGenerated] = useState(true);

  const results = useMemo<Result[]>(() => {
    const output: Result[] = [];
    const entries = Object.values(catalog).filter(entry => entry.id !== 'custom');
    for (const entry of entries) {
      if (companyFilter !== 'all' && entry.id !== companyFilter) continue;
      const modules: { module: ModuleNode; path: string[] }[] = [];
      walk(entry.hierarchy, [], modules);

      for (const section of SPEC_SECTIONS.filter(s => s.companyId === entry.id)) {
        output.push({
          id: section.id,
          companyId: entry.id,
          section: section.section,
          title: section.title,
          summary: section.summary,
          keywords: section.keywords,
          moduleId: section.moduleId,
          modulePath: section.moduleId ? modules.find(m => m.module.id === section.moduleId)?.path.slice(1).join(' / ') : undefined,
          sourceTitle: section.source.title,
          sourceUrl: section.source.url,
          sourceType: section.source.type,
          explicit: true,
        });
      }

      if (showGenerated) {
        for (const { module, path } of modules) {
          if (module.level === 0) continue;
          if (SPEC_SECTIONS.some(s => s.companyId === entry.id && s.moduleId === module.id)) continue;
          output.push({
            id: `module_${entry.id}_${module.id}`,
            companyId: entry.id,
            section: module.docRef ?? 'Public summary',
            title: module.displayName,
            summary: module.description,
            keywords: [module.name, module.category, ...(module.clockDomains ?? [])],
            moduleId: module.id,
            modulePath: path.slice(1).join(' / '),
            sourceTitle: COMPANIES_SOURCE_LOOKUP[entry.id]?.title ?? entry.trmDocumentId,
            sourceUrl: COMPANIES_SOURCE_LOOKUP[entry.id]?.url,
            sourceType: COMPANIES_SOURCE_LOOKUP[entry.id]?.type ?? 'estimate',
            explicit: false,
          });
        }
      }
    }
    return output;
  }, [catalog, companyFilter, showGenerated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results.slice(0, 60);
    const terms = q.split(/\s+/).filter(Boolean);
    return results
      .map(result => {
        const haystack = `${result.title} ${result.summary} ${result.section} ${result.keywords.join(' ')} ${result.companyId}`.toLowerCase();
        const matched = terms.every(term => haystack.includes(term));
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0) + (result.explicit ? 0.2 : 0);
        return { result, score, matches: matched };
      })
      .filter(item => item.matches)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(item => item.result);
  }, [results, query]);

  const explicitCount = filtered.filter(r => r.explicit).length;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-silicon-950 border border-slate-800 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Query a spec: "SRI arbiter", "§45.1", "power domain", "PCIe", "Cortex-X4"...'
              className="w-full pl-9 pr-3 py-2 bg-silicon-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-silicon-900 border border-slate-700 text-cyan-300 rounded-lg px-2 py-2 text-[10px] font-mono focus:outline-none"
          >
            <option value="all">All SoCs ({Object.keys(catalog).filter(key => key !== 'custom').length})</option>
            {Object.values(catalog).filter(e => e.id !== 'custom').map(entry => (
              <option key={entry.id} value={entry.id}>{entry.companyName}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
            <input type="checkbox" checked={showGenerated} onChange={(e) => setShowGenerated(e.target.checked)} className="accent-cyan-500" />
            module summaries
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[9px] font-mono text-slate-500">TRY:</span>
          {['SRI arbiter', '§45.1', 'power domain', 'PCIe', 'Cortex-X4', 'CMA', 'CDC'].map(example => (
            <button key={example} onClick={() => setQuery(example)} className="px-1.5 py-0.5 rounded bg-silicon-900 border border-slate-800 text-[9px] font-mono text-slate-300 hover:text-cyan-300">
              {example}
            </button>
          ))}
          <span className="ml-auto text-[9px] font-mono text-slate-500">
            {filtered.length} results · {explicitCount} curated spec sections
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map(result => {
          const entry = catalog[result.companyId];
          return (
            <div key={result.id} className="rounded-lg bg-silicon-950 border border-slate-800 hover:border-slate-700 transition p-3 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-900 text-[9px] font-mono text-cyan-300">{result.section}</span>
                <span className="text-[9px] font-mono text-slate-500 truncate">{entry.companyName}</span>
                <span className={`ml-auto px-1.5 py-0.5 rounded border text-[8px] font-mono uppercase ${
                  result.sourceType === 'trm' ? 'bg-purple-950/60 border-purple-900 text-purple-300' :
                  result.sourceType === 'datasheet' ? 'bg-blue-950/60 border-blue-900 text-blue-300' :
                  result.sourceType === 'whitepaper' ? 'bg-emerald-950/60 border-emerald-900 text-emerald-300' :
                  'bg-slate-900 border-slate-700 text-slate-400'
                }`}>{result.sourceType}</span>
              </div>
              <div className="text-[12px] font-mono font-bold text-white mt-1">{result.title}</div>
              {result.modulePath && <div className="text-[8.5px] font-mono text-slate-500 mt-0.5 truncate">{result.modulePath}</div>}
              <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1.5 line-clamp-3">{result.summary}</p>
              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800/80">
                <span className="text-[8.5px] font-mono text-slate-500 truncate flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {result.sourceTitle}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {result.sourceUrl && (
                    <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="p-1 rounded text-slate-500 hover:text-cyan-300" title="Open source">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {result.moduleId && (
                    <button
                      onClick={() => onOpenModule(result.companyId, result.moduleId!)}
                      className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 text-[8.5px] font-mono flex items-center gap-0.5 hover:bg-cyan-500/25"
                    >
                      <Layers className="w-3 h-3" /> Open IP
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl bg-silicon-950 border border-slate-800 p-8 text-center text-slate-500 text-xs font-mono">
          No spec section matched “{query}”. Try a block name, section number, or domain.
        </div>
      )}

      <div className="text-[9px] font-mono text-slate-500 flex items-center gap-2">
        <BookOpen className="w-3 h-3" />
        Curated sections are quoted from public TRMs/datasheets/whitepapers. Generated summaries are derived from the public architecture model and are not a substitute for a licensed TRM.
        <ArrowUpRight className="w-3 h-3 ml-auto" />
      </div>
    </div>
  );
};
