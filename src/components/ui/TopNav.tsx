import React from 'react';
import { ModuleNode, ClockDomainInfo, ResetDomainInfo, PowerDomainInfo, DomainLens } from '../../types/soc';
import { Layers, ChevronRight, ArrowUp, UploadCloud, Box, Boxes, LayoutDashboard, Table, CheckSquare, Sparkles, Filter, Target, FileSpreadsheet, Cpu, BookOpen, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanySoCEntry } from '../../data/socCatalog';
import { prettyName } from '../../utils/hierarchy';

interface TopNavProps {
  rootModule: ModuleNode;
  activeHierarchyPath: ModuleNode[];
  onNavigateToLevel: (module: ModuleNode) => void;
  activeView: 'diagram' | 'trm' | 'matrix' | 'deliverables' | 'prd' | 'cascade' | 'platform';
  onSelectView: (view: 'diagram' | 'trm' | 'matrix' | 'deliverables' | 'prd' | 'cascade' | 'platform') => void;
  onOpenReportModal: () => void;
  clockDomains: ClockDomainInfo[];
  resetDomains: ResetDomainInfo[];
  powerDomains: PowerDomainInfo[];
  domainLens: DomainLens | null;
  onSelectDomainLens: (lens: DomainLens | null) => void;
  cdcFilter: 'all' | 'violation' | 'clean' | 'waiver';
  onSelectCdcFilter: (filter: 'all' | 'violation' | 'clean' | 'waiver') => void;
  explodeFactor: number;
  onSetExplodeFactor: (factor: number) => void;
  cameraPreset: 'iso' | 'top' | 'front';
  onSetCameraPreset: (preset: 'iso' | 'top' | 'front') => void;
  colorMode: 'cluster' | 'clock' | 'reset' | 'power' | 'cdc';
  onSetColorMode: (mode: 'cluster' | 'clock' | 'reset' | 'power' | 'cdc') => void;
  violationCount: number;
  // Multi-Company SoC Switcher Props
  activeCompanyId: string;
  onSelectCompany: (companyId: 'ti' | 'nvidia' | 'infineon' | 'cerebras' | 'qualcomm' | 'arm' | 'broadcom' | 'samsung' | 'apple' | 'mediatek' | 'ti_c29x' | 'amd' | 'custom') => void;
  companyCatalog: Record<string, CompanySoCEntry>;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeHierarchyPath,
  onNavigateToLevel,
  activeView,
  onSelectView,
  onOpenReportModal,
  clockDomains,
  resetDomains,
  powerDomains,
  domainLens,
  onSelectDomainLens,
  cdcFilter,
  onSelectCdcFilter,
  explodeFactor,
  onSetExplodeFactor,
  cameraPreset,
  onSetCameraPreset,
  colorMode,
  onSetColorMode,
  violationCount,
  activeCompanyId,
  onSelectCompany,
  companyCatalog
}) => {
  const currentCompany = companyCatalog[activeCompanyId] || companyCatalog['ti'];

  const handleConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <header className="bg-silicon-900 border-b border-slate-800 text-slate-200 select-none flex flex-col z-20">
      {/* Upper Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 flex-wrap gap-2">
        {/* Brand & Product */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-glow-cyan font-mono font-bold text-sm">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide font-mono">
                SILICONPULSE <span className="text-cyan-400">3D</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                VLSI Cockpit
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              SoC Module-in-Module CDC/RDC Sign-off
            </div>
          </div>
        </div>

        {/* COMPANY PRESET SWITCHER (TI, NVIDIA, Infineon, Cerebras, Qualcomm) */}
        <div className="flex items-center gap-2 bg-silicon-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-400">CHIP PRESET:</span>
          <select
            value={activeCompanyId}
            onChange={(e) => onSelectCompany(e.target.value as any)}
            className="bg-silicon-900 border border-slate-700 text-white font-mono text-xs rounded px-2.5 py-1 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ti">TI (Texas Instruments) - C2000 MCU</option>
            <option value="nvidia">NVIDIA - Drive Orin Autonomous AI SoC</option>
            <option value="infineon">Infineon - AURIX TC4Dx (TriCore 1.8)</option>
            <option value="cerebras">Cerebras - WSE-3 Wafer-Scale AI Engine</option>
            <option value="qualcomm">Qualcomm - Snapdragon 8 Flagship SoC</option>
            <option value="arm">Arm - Total Compute 2024 Reference</option>
            <option value="broadcom">Broadcom - BCM2712 (Raspberry Pi 5)</option>
            <option value="samsung">Samsung - Exynos 2400</option>
            <option value="apple">Apple - A17 Pro</option>
            <option value="mediatek">MediaTek - Dimensity 9400</option>
            <option value="ti_c29x">TI - C29x (F29H85x) Real-Time MCU</option>
            <option value="amd">AMD - Pensando DPU / P4 NIC</option>
            {companyCatalog.custom && <option value="custom">Custom - IP-XACT assembly</option>}
          </select>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 hidden lg:inline">
            {currentCompany.processNode}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex rounded-lg bg-silicon-950 p-1 border border-slate-800 font-mono text-xs">
          <button
            onClick={() => onSelectView('diagram')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'diagram'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Architecture 3D</span>
          </button>
          <button
            onClick={() => onSelectView('platform')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'platform'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Platform</span>
          </button>
          <button
            onClick={() => onSelectView('trm')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'trm'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>TRM Specs & Memory</span>
          </button>
          <button
            onClick={() => onSelectView('matrix')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'matrix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>CDC/RDC Matrix</span>
          </button>
          <button
            onClick={() => onSelectView('deliverables')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'deliverables'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Deliverables (Jira)</span>
          </button>
          <button
            onClick={() => onSelectView('prd')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'prd'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>PRD Specs</span>
          </button>
          <button
            onClick={() => onSelectView('cascade')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              activeView === 'cascade'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Customer PRD Cascade</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Tapeout Health Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-silicon-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Tapeout Gates:</span>
            {violationCount > 0 ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {violationCount} Blocker Violations
              </span>
            ) : (
              <button
                onClick={handleConfetti}
                className="text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                100% CDC Clean!
              </button>
            )}
          </div>

          {/* Ingest EDA Report Button */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-purple-400" />
            <span>Ingest SpyGlass / JasperGold</span>
          </button>
        </div>
      </div>

      {/* Sub Bar: Breadcrumbs & 3D Interactive Controls */}
      <div className="px-4 py-2 bg-silicon-950/80 flex items-center justify-between text-xs flex-wrap gap-2">
        {/* Module-inside-Module Hierarchy Breadcrumb */}
        <div className="flex items-center gap-1.5 font-mono">
          <Layers className="w-4 h-4 text-cyan-400 mr-1" />
          <span className="text-slate-500 text-[11px]">Hierarchy:</span>
          <button
            onClick={() => {
              if (activeHierarchyPath.length > 1) {
                onNavigateToLevel(activeHierarchyPath[activeHierarchyPath.length - 2]);
              }
            }}
            disabled={activeHierarchyPath.length === 1}
            title="Up one level (ESC)"
            className={`p-1 rounded border transition ${
              activeHierarchyPath.length > 1
                ? 'text-cyan-300 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50'
                : 'text-slate-700 border-slate-800 cursor-not-allowed'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          {activeHierarchyPath.map((mod, idx) => {
            const isLast = idx === activeHierarchyPath.length - 1;
            return (
              <React.Fragment key={mod.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                <button
                  onClick={() => onNavigateToLevel(mod)}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    isLast
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {prettyName(mod.name)}
                </button>
              </React.Fragment>
            );
          })}
          <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-slate-400">
            L{activeHierarchyPath[activeHierarchyPath.length - 1].level} · {['ARCH','SUBSYS','IP','MICRO'][activeHierarchyPath[activeHierarchyPath.length - 1].level]}
          </span>
        </div>

        {/* Architecture view owns its own 3D/2D layer controls. */}
      </div>
    </header>
  );
};
