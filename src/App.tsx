import React, { useState, useEffect } from 'react';
import { SOC_CATALOG, CompanySoCEntry } from './data/socCatalog';
import { ModuleNode, InterconnectConnection, Port, CDCStatus, DomainKind, DomainLens } from './types/soc';
import { ParsedEdaReportSummary } from './types/eda';
import { applyEdaReportToConnections } from './utils/edaParsers';
import { findFirstModuleInDomain, findNodeById, findPathToNode, getLevelNodes, moduleInDomain } from './utils/hierarchy';
import { TopNav } from './components/ui/TopNav';
import { PlatformWorkspace } from './components/platform/PlatformWorkspace';
import { ArchitectureDiagramView } from './components/diagram/ArchitectureDiagramView';
import { normalizeDiagram } from './utils/diagramImport';
import type { ArchitectureDiagram } from './types/diagram';
import { CdcMatrixTable } from './components/cdc/CdcMatrixTable';
import { DeliverablesBoard } from './components/project/DeliverablesBoard';
import { PRDFeatureTracker } from './components/prd/PRDFeatureTracker';
import { CustomerRequirementsMatrix } from './components/requirements/CustomerRequirementsMatrix';
import { TRMSpecViewer } from './components/trm/TRMSpecViewer';
import { EdaReportModal } from './components/cdc/EdaReportModal';
import { CdcAnalysisModal } from './components/cdc/CdcAnalysisModal';
import confetti from 'canvas-confetti';

type CompanyId = 'ti' | 'nvidia' | 'infineon' | 'cerebras' | 'qualcomm' | 'arm' | 'broadcom' | 'samsung' | 'apple' | 'mediatek' | 'ti_c29x' | 'amd' | 'custom';
const COMPANY_IDS: CompanyId[] = ['ti', 'nvidia', 'infineon', 'cerebras', 'qualcomm', 'arm', 'broadcom', 'samsung', 'apple', 'mediatek', 'ti_c29x', 'amd'];

const CUSTOM_SOC_KEY = 'socpulse.customsoc.v1';
const DIAGRAM_KEY = 'socpulse.uploaded.diagram.v1';

const loadStoredDiagram = (companyId: string): ArchitectureDiagram | null => {
  try {
    const stored = localStorage.getItem(DIAGRAM_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { companyId?: string; diagram?: ArchitectureDiagram };
    if (parsed.companyId !== companyId || !parsed.diagram) return null;
    return normalizeDiagram(parsed.diagram, { companyId });
  } catch {
    return null;
  }
};

const loadStoredCustomSoc = (): CompanySoCEntry | null => {
  try {
    const stored = localStorage.getItem(CUSTOM_SOC_KEY);
    return stored ? (JSON.parse(stored) as CompanySoCEntry) : null;
  } catch {
    return null;
  }
};

const readInitialRoute = (): { companyId: CompanyId; entry: CompanySoCEntry; path: ModuleNode[]; view: 'diagram' | 'platform' | 'trm' | 'matrix' | 'deliverables' | 'prd' | 'cascade' } => {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('chip') as CompanyId | null;
  const storedCustom = loadStoredCustomSoc();
  const catalog = storedCustom ? { ...SOC_CATALOG, custom: storedCustom } : SOC_CATALOG;
  const companyId: CompanyId = requested === 'custom' && storedCustom
    ? 'custom'
    : requested && COMPANY_IDS.includes(requested) ? requested : 'infineon';
  const entry = catalog[companyId] ?? SOC_CATALOG['infineon'];
  const moduleId = params.get('module');
  const path = moduleId ? findPathToNode(entry.hierarchy, moduleId) : null;
  const requestedView = params.get('view');
  const allowed = ['diagram', 'platform', 'trm', 'matrix', 'deliverables', 'prd', 'cascade'] as const;
  const view = allowed.includes(requestedView as typeof allowed[number]) ? requestedView as typeof allowed[number] : 'diagram';

  return {
    companyId,
    entry,
    path: path && path.length > 0 ? path : [entry.hierarchy],
    view,
  };
};

export const App: React.FC = () => {
  const initial = React.useMemo(readInitialRoute, []);

  // Active Company SoC Preset (TI, NVIDIA, Infineon, Cerebras, Qualcomm)
  const [activeCompanyId, setActiveCompanyId] = useState<CompanyId>(initial.companyId);
  const [customSoc, setCustomSoc] = useState<CompanySoCEntry | null>(loadStoredCustomSoc);
  const [diagramOverride, setDiagramOverride] = useState<ArchitectureDiagram | null>(() => loadStoredDiagram(initial.companyId));
  const catalog = React.useMemo<Record<string, CompanySoCEntry>>(
    () => (customSoc ? { ...SOC_CATALOG, custom: customSoc } : SOC_CATALOG),
    [customSoc]
  );
  const activeCompany = catalog[activeCompanyId] ?? catalog['infineon'];

  // SoC Hierarchy State: Path of modules for drill-down
  const [rootModule, setRootModule] = useState<ModuleNode>(initial.entry.hierarchy);
  const [activeHierarchyPath, setActiveHierarchyPath] = useState<ModuleNode[]>(initial.path);
  const activeModule = activeHierarchyPath[activeHierarchyPath.length - 1];
  const levelNodes = getLevelNodes(activeModule, rootModule);

  // Interconnect & CDC Connections State
  const [connections, setConnections] = useState<InterconnectConnection[]>(initial.entry.connections);
  const [clockDomains, setClockDomains] = useState(initial.entry.clockDomains);
  const [resetDomains, setResetDomains] = useState(initial.entry.resetDomains);
  const [powerDomains, setPowerDomains] = useState(initial.entry.powerDomains ?? []);

  // Inspector & Selection State
  const [selectedModule, setSelectedModule] = useState<ModuleNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<InterconnectConnection | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);

  // Views & Filters
  const [activeView, setActiveView] = useState<'diagram' | 'trm' | 'matrix' | 'deliverables' | 'prd' | 'cascade' | 'platform'>(initial.view);
  const [cdcFilter, setCdcFilter] = useState<'all' | 'violation' | 'clean' | 'waiver'>('all');
  const [domainLens, setDomainLens] = useState<DomainLens | null>(null);
  const [explodeFactor, setExplodeFactor] = useState<number>(0.2);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'front'>('iso');
  const [colorMode, setColorMode] = useState<'cluster' | 'clock' | 'reset' | 'power' | 'cdc'>('cluster');

  // Modals & Notifications
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [connectionToAnalyze, setConnectionToAnalyze] = useState<InterconnectConnection | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deep-linkable route: ?chip=infineon&module=inf_cluster_compute
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('chip', activeCompanyId);
    params.set('module', activeModule.id);
    params.set('view', activeView);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeCompanyId, activeModule.id, activeView]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch Company Preset Handler
  const handleSelectCompany = (companyId: CompanyId) => {
    const entry = catalog[companyId];
    if (!entry) return;
    saveDiagramOverride(null);

    setActiveCompanyId(companyId);
    setRootModule(entry.hierarchy);
    setActiveHierarchyPath([entry.hierarchy]);
    setConnections(entry.connections);
    setClockDomains(entry.clockDomains);
    setResetDomains(entry.resetDomains);
    setPowerDomains(entry.powerDomains ?? []);
    setSelectedModule(null);
    setSelectedConnection(null);
    setSelectedPort(null);
    setDomainLens(null);
    setColorMode('cluster');
    setCdcFilter('all');
    showToast(`Loaded ${entry.companyName} - ${entry.chipModel} (${entry.processNode})`);
  };

  const saveDiagramOverride = (next: ArchitectureDiagram | null) => {
    setDiagramOverride(next);
    try {
      if (next) localStorage.setItem(DIAGRAM_KEY, JSON.stringify({ companyId: next.companyId, diagram: next }));
      else localStorage.removeItem(DIAGRAM_KEY);
    } catch {
      // Local storage may be unavailable; the in-memory diagram still works.
    }
  };

  const handleLoadDiagram = (diagram: ArchitectureDiagram) => {
    const next = { ...diagram, companyId: activeCompanyId };
    saveDiagramOverride(next);
    setActiveView('diagram');
    showToast(`Loaded ${next.blocks.length} blocks / ${next.wires.length} links from uploaded diagram`);
  };

  const handleClearDiagram = () => {
    saveDiagramOverride(null);
    showToast('Uploaded diagram cleared');
  };

  const handlePlatformLoadCompany = (id: string) => {
    handleSelectCompany(id as CompanyId);
    setActiveView('diagram');
  };

  const handlePlatformOpenModule = (companyId: string, moduleId: string) => {
    const entry = catalog[companyId];
    if (!entry) return;
    const path = findPathToNode(entry.hierarchy, moduleId);
    setActiveCompanyId(companyId as CompanyId);
    setRootModule(entry.hierarchy);
    setActiveHierarchyPath(path ?? [entry.hierarchy]);
    setConnections(entry.connections);
    setClockDomains(entry.clockDomains);
    setResetDomains(entry.resetDomains);
    setPowerDomains(entry.powerDomains ?? []);
    setSelectedModule(path ? path[path.length - 1] : null);
    setSelectedConnection(null);
    setSelectedPort(null);
    setDomainLens(null);
    setColorMode('cluster');
    saveDiagramOverride(null);
    setActiveView('diagram');
  };

  const handleLoadCustomSoc = (entry: CompanySoCEntry | null) => {
    setCustomSoc(entry);
    saveDiagramOverride(null);
    try {
      if (entry) localStorage.setItem(CUSTOM_SOC_KEY, JSON.stringify(entry));
      else localStorage.removeItem(CUSTOM_SOC_KEY);
    } catch {
      // Storage may be unavailable; the in-memory custom SoC still works.
    }
    if (!entry) {
      handleSelectCompany('infineon');
      showToast('Custom SoC cleared');
      return;
    }
    setActiveCompanyId('custom');
    setRootModule(entry.hierarchy);
    setActiveHierarchyPath([entry.hierarchy]);
    setConnections(entry.connections);
    setClockDomains(entry.clockDomains);
    setResetDomains(entry.resetDomains);
    setPowerDomains(entry.powerDomains ?? []);
    setSelectedModule(null);
    setSelectedConnection(null);
    setSelectedPort(null);
    setDomainLens(null);
    setColorMode('cluster');
    setActiveView('diagram');
    showToast(`Loaded custom IP-XACT SoC: ${entry.chipModel}`);
  };

  // Count active blocker violations
  const violationCount = connections.filter(c => c.cdcStatus === 'violation').length;

  // Hierarchy drill-down handlers (Module-inside-Module)
  const handleDrillDown = (module: ModuleNode) => {
    if (module.children && module.children.length > 0) {
      // Resolve the full ancestor chain. This keeps the breadcrumb correct even
      // when the user opens a nested child from the inspector quick-open grid.
      const fullPath = findPathToNode(rootModule, module.id);
      setActiveHierarchyPath(prev => {
        if (prev[prev.length - 1].id === module.id) return prev;
        return fullPath ?? [...prev, module];
      });
      setSelectedModule(module);
      setSelectedConnection(null);
      setSelectedPort(null);
      showToast(`Opened ${module.name} — ${module.children.length} sub-blocks · double-click deeper or press ESC to go up`);
    } else {
      setSelectedModule(module);
      showToast(`${module.name} is a leaf IP block — no deeper hierarchy`);
    }
  };

  const handleNavigateToLevel = (targetModule: ModuleNode) => {
    const targetPath = findPathToNode(rootModule, targetModule.id);
    if (targetPath) {
      setActiveHierarchyPath(targetPath);
      setSelectedModule(targetModule);
      setSelectedConnection(null);
      setSelectedPort(null);
    }
  };

  const handleSelectModule = (mod: ModuleNode) => {
    setSelectedModule(mod);
    setSelectedConnection(null);
    setSelectedPort(null);
  };

  // Used by the TRM / deliverables / PRD / requirements tables: selecting a
  // module there should take the 3D view *inside* that module, not just
  // highlight it on the top-level die.
  const handleOpenModuleIn3D = (mod: ModuleNode) => {
    if (mod.children && mod.children.length > 0) {
      handleDrillDown(mod);
    } else {
      // Leaf IP: open its parent level so the block is visible in context.
      const fullPath = findPathToNode(rootModule, mod.id);
      if (fullPath && fullPath.length > 1) {
        setActiveHierarchyPath(fullPath.slice(0, -1));
        setSelectedModule(mod);
        setSelectedConnection(null);
        setSelectedPort(null);
      } else {
        handleDrillDown(mod);
      }
    }
    setActiveView('diagram');
  };

  const handleSelectConnection = (conn: InterconnectConnection) => {
    setSelectedConnection(conn);
    setSelectedModule(null);
    setSelectedPort(null);
    setActiveView('diagram');
  };

  const handleSelectPort = (port: Port, mod: ModuleNode) => {
    setSelectedPort(port);
    setSelectedModule(mod);
    setSelectedConnection(null);
  };

  const handleSelectDomainLens = (lens: DomainLens | null) => {
    setDomainLens(lens);
    if (!lens) return;

    setColorMode(lens.kind === 'cdc' ? 'cdc' : lens.kind);

    // If the selected domain has no member at the current hierarchy level,
    // open the parent level of the first member so the highlight is visible.
    if (lens.kind !== 'cdc' && !levelNodes.some(node => moduleInDomain(node, lens.kind as 'clock' | 'reset' | 'power', lens.name))) {
      const target = findFirstModuleInDomain(rootModule, lens.kind as 'clock' | 'reset' | 'power', lens.name);
      if (target) {
        const targetPath = findPathToNode(rootModule, target.id);
        if (targetPath && targetPath.length > 1) {
          setActiveHierarchyPath(targetPath.slice(0, -1));
          setSelectedModule(target);
        }
      }
    }
  };

  const handleSetColorMode = (mode: 'cluster' | 'clock' | 'reset' | 'power' | 'cdc') => {
    setColorMode(mode);
    if (domainLens && domainLens.kind !== mode) {
      setDomainLens(null);
    }
  };

  const handleApplyEdaReport = (report: ParsedEdaReportSummary) => {
    const updated = applyEdaReportToConnections(connections, report);
    setConnections(updated);
    showToast(`Successfully ingested ${report.tool === 'synopsys_spyglass' ? 'Synopsys SpyGlass' : 'Cadence JasperGold'} report: ${report.cleanCount} clean, ${report.violationCount} violations.`);
  };

  const handleCreateIssueForConnection = (conn: InterconnectConnection) => {
    setActiveView('deliverables');
    showToast(`Opening hardware deliverables tracker for violation ${conn.edaCheckId}`);
  };

  const handleAnalyzeConnection = (conn: InterconnectConnection) => {
    setConnectionToAnalyze(conn);
    setIsAnalysisModalOpen(true);
  };

  const handleApplyFix = (connectionId: string, fixType: '2ff' | 'fifo' | 'handshake' | 'waiver') => {
    setConnections(prev => prev.map(c => {
      if (c.id === connectionId) {
        const isWaiver = fixType === 'waiver';
        const newStatus: CDCStatus = isWaiver ? 'waiver' : 'clean';
        const newScheme =
          fixType === 'fifo' ? 'Async FIFO (depth 16) with Gray Coded Pointers' :
          fixType === '2ff' ? 'Double Flop (2-FF) Synchronizer Cell' :
          fixType === 'handshake' ? 'Four-Phase Request/Acknowledge Handshake FSM' :
          'Structural Waiver: Static Boot Configuration';

        return {
          ...c,
          cdcStatus: newStatus,
          rdcStatus: 'clean',
          syncScheme: newScheme,
          edaCheckId: isWaiver ? 'Ac_unsync01 (Waived by Architect)' : 'CDC_VALID_SYNC (Verified)'
        };
      }
      return c;
    }));

    showToast(`Synchronizer inserted: CDC path marked as CLEAN!`);

    // Check if all violations resolved
    const remaining = connections.filter(c => c.id !== connectionId && c.cdcStatus === 'violation').length;
    if (remaining === 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      showToast('🎉 ALL CDC VIOLATIONS RESOLVED! SoC Sign-off 100% Tapeout Ready!');
    }
  };

  // Keyboard navigation: Enter opens the selected module, ESC/Backspace goes up.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isReportModalOpen || isAnalysisModalOpen) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON' || target?.closest('button')) return;

      if (event.key === 'Enter' && selectedModule?.children?.length) {
        event.preventDefault();
        handleDrillDown(selectedModule);
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        if (activeHierarchyPath.length > 1) {
          event.preventDefault();
          handleNavigateToLevel(activeHierarchyPath[activeHierarchyPath.length - 2]);
        } else if (selectedModule || selectedConnection || selectedPort) {
          event.preventDefault();
          setSelectedModule(null);
          setSelectedConnection(null);
          setSelectedPort(null);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView, selectedModule, selectedConnection, selectedPort, activeHierarchyPath, isReportModalOpen, isAnalysisModalOpen]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-silicon-950 text-slate-100 select-none">
      {/* Top Navigation & Controls Bar */}
      <TopNav
        rootModule={rootModule}
        activeHierarchyPath={activeHierarchyPath}
        onNavigateToLevel={handleNavigateToLevel}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        clockDomains={clockDomains}
        resetDomains={resetDomains}
        powerDomains={powerDomains}
        domainLens={domainLens}
        onSelectDomainLens={handleSelectDomainLens}
        cdcFilter={cdcFilter}
        onSelectCdcFilter={setCdcFilter}
        explodeFactor={explodeFactor}
        onSetExplodeFactor={setExplodeFactor}
        cameraPreset={cameraPreset}
        onSetCameraPreset={setCameraPreset}
        colorMode={colorMode}
        onSetColorMode={handleSetColorMode}
        violationCount={violationCount}
        activeCompanyId={activeCompanyId}
        onSelectCompany={handleSelectCompany}
        companyCatalog={catalog}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* ARCHITECTURE: spec-derived block/bus diagram */}
        {activeView === 'diagram' && (
          <div className="flex-1 p-3 overflow-hidden">
            <ArchitectureDiagramView
              company={activeCompany}
              diagramOverride={diagramOverride}
              onLoadDiagram={handleLoadDiagram}
              onClearDiagram={handleClearDiagram}
              onOpenPlatformIp={(companyId, moduleId) => {
                const entry = catalog[companyId];
                const path = entry ? findPathToNode(entry.hierarchy, moduleId) : null;
                setActiveCompanyId(companyId as CompanyId);
                setSelectedModule(path ? path[path.length - 1] : null);
                setActiveView('platform');
              }}
            />
          </div>
        )}

        {/* PLATFORM: catalog, spec query, cross-reference, IP-XACT and tracker */}
        {activeView === 'platform' && (
          <div className="flex-1 p-4 overflow-hidden">
            <PlatformWorkspace
              catalog={catalog}
              activeCompanyId={activeCompanyId}
              customSoc={customSoc}
              onLoadCompany={handlePlatformLoadCompany}
              onOpenModule={handlePlatformOpenModule}
              onLoadCustomSoc={handleLoadCustomSoc}
              onLoadDiagram={handleLoadDiagram}
              initialTab="spec"
            />
          </div>
        )}

        {/* VIEW 2: Real Silicon TRM Specifications & Memory Map */}
        {activeView === 'trm' && (
          <div className="flex-1 p-4 overflow-hidden">
            <TRMSpecViewer
              currentCompany={activeCompany}
              onSelectModule={handleOpenModuleIn3D}
              onSelectDomainLens={handleSelectDomainLens}
              onOpen3DView={() => setActiveView('diagram')}
            />
          </div>
        )}

        {/* VIEW 2: CDC & RDC Verification Sign-off Matrix */}
        {activeView === 'matrix' && (
          <div className="flex-1 p-4 overflow-hidden">
            <CdcMatrixTable
              connections={connections}
              onSelectConnection={handleSelectConnection}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: Hardware Project & Deliverables Tracker (Hardware Jira) */}
        {activeView === 'deliverables' && (
          <div className="flex-1 p-4 overflow-hidden">
            <DeliverablesBoard
              rootModule={rootModule}
              onSelectModule={handleOpenModuleIn3D}
              onOpen3DView={() => setActiveView('diagram')}
            />
          </div>
        )}

        {/* VIEW 4: PRD & Hardware Architecture Feature Tracker */}
        {activeView === 'prd' && (
          <div className="flex-1 p-4 overflow-hidden">
            <PRDFeatureTracker
              rootModule={rootModule}
              onSelectModule={handleOpenModuleIn3D}
              onOpen3DView={() => setActiveView('diagram')}
            />
          </div>
        )}

        {/* VIEW 5: Customer PRD Cascading Requirements Engine (Architect, Manager, RTL, DV) */}
        {activeView === 'cascade' && (
          <div className="flex-1 p-4 overflow-hidden">
            <CustomerRequirementsMatrix
              rootModule={rootModule}
              onSelectModule={handleOpenModuleIn3D}
              onOpen3DView={() => setActiveView('diagram')}
            />
          </div>
        )}

        {/* Right Inspector & Details Drawer */}
      </main>

      {/* EDA Report Ingestion Modal (Synopsys SpyGlass & Cadence JasperGold) */}
      <EdaReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onApplyReport={handleApplyEdaReport}
      />

      {/* CDC Waveform & MTBF Analysis Modal */}
      <CdcAnalysisModal
        connection={connectionToAnalyze}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onApplyFix={handleApplyFix}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded-lg shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
