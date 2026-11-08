import React, { useEffect, useState } from 'react';
import { CompanySoCEntry } from '../../data/socCatalog';
import { CatalogView } from './CatalogView';
import { SpecQueryView } from './SpecQueryView';
import { CrossRefView } from './CrossRefView';
import { IpXactView } from './IpXactView';
import { TrackerView } from './TrackerView';
import { JsonView } from './JsonView';
import { BookOpen, Boxes, FileCode2, GitPullRequest, Network, Library, Braces } from 'lucide-react';

interface PlatformWorkspaceProps {
  catalog: Record<string, CompanySoCEntry>;
  activeCompanyId: string;
  customSoc: CompanySoCEntry | null;
  onLoadCompany: (id: string) => void;
  onOpenModule: (companyId: string, moduleId: string) => void;
  onLoadCustomSoc: (soc: CompanySoCEntry | null) => void;
  onLoadDiagram?: (diagram: import('../../types/diagram').ArchitectureDiagram) => void;
  initialTab?: 'catalog' | 'spec' | 'crossref' | 'json' | 'ipxact' | 'tracker';
}

type Tab = 'catalog' | 'spec' | 'crossref' | 'json' | 'ipxact' | 'tracker';

export const PlatformWorkspace: React.FC<PlatformWorkspaceProps> = ({
  catalog,
  activeCompanyId,
  customSoc,
  onLoadCompany,
  onOpenModule,
  onLoadCustomSoc,
  onLoadDiagram,
  initialTab = 'catalog',
}) => {
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  const [specCompany, setSpecCompany] = useState(activeCompanyId);

  const openSpec = (companyId: string) => {
    setSpecCompany(companyId);
    setTab('spec');
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'catalog', label: 'SoC Catalog', icon: <Library className="w-3.5 h-3.5" /> },
    { key: 'spec', label: 'Spec Query', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'crossref', label: 'Cross-Reference', icon: <Network className="w-3.5 h-3.5" /> },
    { key: 'json', label: 'Integration JSON', icon: <Braces className="w-3.5 h-3.5" /> },
    { key: 'ipxact', label: 'IP-XACT', icon: <FileCode2 className="w-3.5 h-3.5" /> },
    { key: 'tracker', label: 'Program Tracker', icon: <GitPullRequest className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-silicon-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 pt-3 pb-2 bg-silicon-850 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-white tracking-wide">SILICONPULSE PLATFORM</div>
            <div className="text-[10px] font-mono text-slate-400">
              Public-data SoC/IP knowledge graph · spec query · cross-reference · IP-XACT · program tracker
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[9px] font-mono text-slate-500">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">{Object.keys(catalog).filter(key => key !== 'custom').length} SoC presets</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">public sources only</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2.5">
          {tabs.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold transition flex items-center gap-1.5 ${
                tab === item.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {tab === 'catalog' && <CatalogView catalog={catalog} onLoadCompany={onLoadCompany} onOpenSpec={openSpec} />}
        {tab === 'spec' && (
          <SpecQueryView
            key={specCompany}
            catalog={catalog}
            activeCompanyId={activeCompanyId}
            initialCompanyId={specCompany}
            onOpenModule={onOpenModule}
          />
        )}
        {tab === 'crossref' && <CrossRefView catalog={catalog} onLoadCompany={onLoadCompany} onOpenModule={onOpenModule} />}
        {tab === 'json' && <JsonView catalog={catalog} activeCompanyId={activeCompanyId} onOpenModule={onOpenModule} />}
        {tab === 'ipxact' && <IpXactView catalog={catalog} activeCompanyId={activeCompanyId} customSoc={customSoc} onLoadCustomSoc={onLoadCustomSoc} onLoadDiagram={onLoadDiagram} />}
        {tab === 'tracker' && <TrackerView catalog={catalog} activeCompanyId={activeCompanyId} onLoadCompany={onLoadCompany} onOpenModule={onOpenModule} />}
      </div>
    </div>
  );
};
