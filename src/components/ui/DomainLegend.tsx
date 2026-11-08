import React from 'react';
import { ModuleNode, ClockDomainInfo, ResetDomainInfo, PowerDomainInfo, InterconnectConnection, DomainLens } from '../../types/soc';
import { Palette, X, ScanEye } from 'lucide-react';

interface DomainLegendProps {
  mode: 'clock' | 'reset' | 'power' | 'cdc';
  clockDomains: ClockDomainInfo[];
  resetDomains: ResetDomainInfo[];
  powerDomains: PowerDomainInfo[];
  connections: InterconnectConnection[];
  levelNodes: ModuleNode[];
  activeModule: ModuleNode;
  lens: DomainLens | null;
  onSelectLens: (lens: DomainLens | null) => void;
}

interface Row {
  key: string;
  name: string;
  detail: string;
  color: string;
  count: number;
  kind: 'clock' | 'reset' | 'power' | 'cdc';
}

export const DomainLegend: React.FC<DomainLegendProps> = ({
  mode,
  clockDomains,
  resetDomains,
  powerDomains,
  connections,
  levelNodes,
  activeModule,
  lens,
  onSelectLens,
}) => {
  const scoped = connections.filter(conn => {
    if (activeModule.level === 0) return conn.hierarchicalLevelScope === 'soc_top';
    return conn.hierarchicalLevelScope === activeModule.id;
  });

  let rows: Row[] = [];

  if (mode === 'clock') {
    rows = clockDomains.map(domain => ({
      key: domain.name,
      name: domain.name,
      detail: `${domain.freqMhz} MHz`,
      color: domain.color,
      kind: 'clock',
      count: levelNodes.filter(node => node.clockDomains.includes(domain.name)).length,
    }));
  } else if (mode === 'reset') {
    rows = resetDomains.map(domain => ({
      key: domain.name,
      name: domain.name,
      detail: domain.type.replace(/_/g, ' '),
      color: domain.color,
      kind: 'reset',
      count: levelNodes.filter(node => node.resetDomains.includes(domain.name)).length,
    }));
  } else if (mode === 'power') {
    rows = powerDomains.map(domain => ({
      key: domain.name,
      name: domain.name,
      detail: domain.voltage,
      color: domain.color,
      kind: 'power',
      count: levelNodes.filter(node => (node.powerDomains ?? []).includes(domain.name)).length,
    }));
  } else {
    rows = (['clean', 'waiver', 'violation'] as const).map(status => ({
      key: status,
      name: status === 'clean' ? 'Synchronous / clean' : status === 'waiver' ? 'Structural waiver' : 'CDC violation',
      detail: '',
      color: status === 'clean' ? '#10b981' : status === 'waiver' ? '#f59e0b' : '#f43f5e',
      kind: 'cdc',
      count: scoped.filter(conn => conn.cdcStatus === status).length,
    }));
  }

  const title =
    mode === 'clock' ? 'CLOCK DOMAIN' :
    mode === 'reset' ? 'RESET DOMAIN' :
    mode === 'power' ? 'POWER DOMAIN' : 'CDC STATUS';

  const activeKey = lens ? `${lens.kind}:${lens.name}` : null;

  return (
    <div className="absolute top-3 right-3 z-10 w-[258px] rounded-lg bg-silicon-950/90 backdrop-blur-md border border-slate-700 shadow-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <Palette className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300">
          COLOR BY {title}
        </span>
        {lens && (
          <button
            onClick={() => onSelectLens(null)}
            className="ml-auto p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Clear domain lens"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-1.5 space-y-0.5">
        {rows.length === 0 && (
          <div className="px-2 py-2 text-[9px] font-mono text-slate-500">
            No {title.toLowerCase()} data for this preset.
          </div>
        )}
        {rows.map(row => {
          const isActive = activeKey === `${row.kind}:${row.key}`;
          return (
            <button
              key={row.key}
              onClick={() => onSelectLens(isActive ? null : { kind: row.kind, name: row.key })}
              className={`w-full flex items-center gap-2 px-1.5 py-1 rounded border text-left transition ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-500/50'
                  : 'border-transparent hover:bg-slate-800/60'
              }`}
              title={`${row.name} · ${row.count} blocks in this level`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
              <span className="text-[9.5px] font-mono text-slate-200 truncate">{row.name}</span>
              <span className="ml-auto text-[8.5px] font-mono text-slate-500 shrink-0">{row.detail}</span>
              <span className="text-[8.5px] font-mono text-cyan-300 w-5 text-right shrink-0">{row.count}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-1.5 border-t border-slate-800 text-[8.5px] font-mono text-slate-500 flex items-center gap-1.5">
        <ScanEye className="w-3 h-3 text-slate-500" />
        {lens ? `LENS: ${lens.name} · click again to clear` : 'click a domain to isolate its blocks'}
      </div>
    </div>
  );
};
