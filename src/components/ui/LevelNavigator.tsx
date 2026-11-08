import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, CornerDownRight, Layers, ArrowUp, Box } from 'lucide-react';
import { ModuleNode, InterconnectConnection } from '../../types/soc';
import { countViolationsDeep, getLevelNodes, prettyName } from '../../utils/hierarchy';

interface LevelNavigatorProps {
  rootModule: ModuleNode;
  activeModule: ModuleNode;
  activeHierarchyPath: ModuleNode[];
  selectedModule: ModuleNode | null;
  onSelectModule: (module: ModuleNode) => void;
  onDrillDown: (module: ModuleNode) => void;
  onNavigateToLevel: (module: ModuleNode) => void;
  connections: InterconnectConnection[];
}

export const LevelNavigator: React.FC<LevelNavigatorProps> = ({
  rootModule,
  activeModule,
  activeHierarchyPath,
  selectedModule,
  onSelectModule,
  onDrillDown,
  onNavigateToLevel,
  connections,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const children = getLevelNodes(activeModule, rootModule);
  const isTop = activeModule.id === rootModule.id;
  const depth = activeHierarchyPath.length;
  const archLevel = ['ARCHITECTURE', 'SUBSYSTEM', 'IP', 'MICROARCH'][activeModule.level] ?? 'LEVEL';
  const childIds = new Set(children.map(child => child.id));
  const internalLinks = connections.filter(conn => childIds.has(conn.srcModuleId) && childIds.has(conn.dstModuleId));
  const crossDomainLinks = internalLinks.filter(conn => conn.srcClock !== conn.dstClock).length;
  const internalViolations = internalLinks.filter(conn => conn.cdcStatus === 'violation').length;
  const role = activeModule.level === 0 ? 'soc' : activeModule.role ?? (
    activeModule.type === 'fabric' ? 'fabric' :
    activeModule.type === 'bridge' ? 'bridge' :
    activeModule.category === 'memory' ? 'memory' :
    activeModule.category === 'compute' ? 'master' :
    activeModule.category === 'security' ? 'control' :
    'io'
  );

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-silicon-950/90 backdrop-blur-md border border-slate-700 text-cyan-300 hover:border-cyan-500/60 shadow-2xl font-mono text-[11px] transition"
        title="Show submodule navigator"
      >
        <Layers className="w-4 h-4" />
        <span>SUBMODULE NAV</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-20 w-[264px] max-h-[calc(100%-5.75rem)] flex flex-col rounded-xl bg-silicon-950/88 backdrop-blur-md border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-800 bg-gradient-to-r from-cyan-950/70 to-silicon-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-300">SUBMODULE NAV</div>
            <div className="text-[9px] font-mono text-slate-500">LEVEL {activeModule.level} · {archLevel} · {children.length} BLOCKS</div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Collapse navigator"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* Current module */}
      <div className="px-3 py-2.5 border-b border-slate-800/80 bg-silicon-900/40">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: activeModule.color }} />
          <div className="min-w-0">
            <div className="text-[12px] font-mono font-bold text-white leading-snug">{activeModule.displayName}</div>
            <div className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{activeModule.description}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 mt-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[8.5px] font-mono uppercase text-slate-300">
            {role}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8.5px] font-mono text-slate-400">
            {internalLinks.length} links
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8.5px] font-mono text-cyan-300">
            {crossDomainLinks} cross-clock
          </span>
          {internalViolations > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-[8.5px] font-mono text-red-300">
              {internalViolations} CDC fail
            </span>
          )}
        </div>

        {!isTop && (
          <button
            onClick={() => onNavigateToLevel(activeHierarchyPath[depth - 2])}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-mono transition"
          >
            <ArrowUp className="w-3 h-3" />
            UP TO {activeHierarchyPath[depth - 2].name}
          </button>
        )}
      </div>

      {/* Child list */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {children.length === 0 && (
          <div className="p-3 text-center text-[10px] font-mono text-slate-500">
            <Box className="w-4 h-4 mx-auto mb-1.5 text-slate-600" />
            LEAF IP BLOCK · NO DEEPER HIERARCHY
          </div>
        )}

        {children.map(child => {
          const subBlocks = child.children?.length ?? 0;
          const violationCount = countViolationsDeep(child);
          const isSelected = selectedModule?.id === child.id;

          return (
            <div
              key={child.id}
              className={`group flex items-center gap-1.5 rounded-md border transition ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50'
                  : 'bg-silicon-900/50 border-transparent hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => onSelectModule(child)}
                onDoubleClick={() => subBlocks > 0 && onDrillDown(child)}
                className="flex-1 min-w-0 text-left px-1.5 py-1.5"
                title={`${child.displayName}${subBlocks > 0 ? ' — double-click to open' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: child.color }} />
                  <span className="text-[10.5px] font-mono font-semibold text-slate-100 truncate">{prettyName(child.name)}</span>
                  {violationCount > 0 && (
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  )}
                  {subBlocks > 0 && (
                    <span className="ml-auto text-[8px] font-mono px-1 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                      {subBlocks}
                    </span>
                  )}
                </div>
                <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5 pl-3">
                  L{child.level} · {child.level >= 3 ? 'microarch' : child.type} · {Math.round(child.size[0])}×{Math.round(child.size[2])}
                </div>
              </button>

              {subBlocks > 0 && (
                <button
                  onClick={() => onDrillDown(child)}
                  className="p-1.5 mr-1 rounded text-cyan-400 hover:text-black hover:bg-cyan-400 transition shrink-0"
                  title={`Open ${subBlocks} sub-blocks`}
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-1.5 border-t border-slate-800 text-[9px] font-mono text-slate-500">
        Double-click / <span className="text-slate-300">ENTER</span> opens · <span className="text-slate-300">ESC</span> up · empty click clears
      </div>
    </div>
  );
};
