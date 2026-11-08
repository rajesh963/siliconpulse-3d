import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Sparkles, X } from 'lucide-react';
import { RAW_SPYGLASS_SAMPLE_REPORT, RAW_JASPERGOLD_SAMPLE_REPORT } from '../../data/mockEdaReports';
import { parseSpyglassReport, parseJasperGoldReport } from '../../utils/edaParsers';
import { ParsedEdaReportSummary } from '../../types/eda';

interface EdaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyReport: (report: ParsedEdaReportSummary) => void;
}

export const EdaReportModal: React.FC<EdaReportModalProps> = ({ isOpen, onClose, onApplyReport }) => {
  const [reportType, setReportType] = useState<'synopsys' | 'cadence'>('synopsys');
  const [reportText, setReportText] = useState(RAW_SPYGLASS_SAMPLE_REPORT);
  const [parsedSummary, setParsedSummary] = useState<ParsedEdaReportSummary | null>(() => parseSpyglassReport(RAW_SPYGLASS_SAMPLE_REPORT));

  if (!isOpen) return null;

  const handleSelectTemplate = (type: 'synopsys' | 'cadence') => {
    setReportType(type);
    const text = type === 'synopsys' ? RAW_SPYGLASS_SAMPLE_REPORT : RAW_JASPERGOLD_SAMPLE_REPORT;
    setReportText(text);
    const summary = type === 'synopsys' ? parseSpyglassReport(text) : parseJasperGoldReport(text);
    setParsedSummary(summary);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReportText(val);
    const summary = reportType === 'synopsys' ? parseSpyglassReport(val) : parseJasperGoldReport(val);
    setParsedSummary(summary);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setReportText(content);
      const isCadence = content.includes('JasperGold') || content.includes('CDC_STRUCTURAL');
      const type = isCadence ? 'cadence' : 'synopsys';
      setReportType(type);
      const summary = type === 'synopsys' ? parseSpyglassReport(content) : parseJasperGoldReport(content);
      setParsedSummary(summary);
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (parsedSummary) {
      onApplyReport(parsedSummary);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-silicon-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-silicon-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Ingest EDA CDC Sign-off Reports
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Synopsys & Cadence
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Parse output logs from Synopsys SpyGlass or Cadence JasperGold to map CDC results directly to the 3D SoC model.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tool Selector & Presets */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex rounded-lg bg-silicon-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectTemplate('synopsys')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition flex items-center gap-2 ${
                  reportType === 'synopsys'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Synopsys SpyGlass CDC</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('cadence')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition flex items-center gap-2 ${
                  reportType === 'cadence'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Cadence JasperGold CDC</span>
              </button>
            </div>

            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 flex items-center gap-2 transition">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Upload Custom Report (.rpt, .log, .csv)</span>
              <input type="file" accept=".rpt,.log,.txt,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Parsed Metrics Bar */}
          {parsedSummary && (
            <div className="grid grid-cols-4 gap-3 bg-silicon-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="p-2 rounded bg-silicon-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TOTAL CHECKS</span>
                <span className="text-lg font-bold text-white">{parsedSummary.totalChecks}</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50">
                <span className="text-emerald-400 block text-[10px]">VERIFIED CLEAN</span>
                <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {parsedSummary.cleanCount}
                </span>
              </div>
              <div className="p-2 rounded bg-red-950/30 border border-red-900/50">
                <span className="text-red-400 block text-[10px]">VIOLATIONS (BLOCKERS)</span>
                <span className="text-lg font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {parsedSummary.violationCount}
                </span>
              </div>
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50">
                <span className="text-amber-400 block text-[10px]">WAIVERED / REVIEW</span>
                <span className="text-lg font-bold text-amber-400">{parsedSummary.waiverCount}</span>
              </div>
            </div>
          )}

          {/* Text Area for Report */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">EDA Report Console Input (Paste or Edit):</span>
              <span className="text-[11px] text-slate-500">Auto-parsers active</span>
            </div>
            <textarea
              value={reportText}
              onChange={handleTextChange}
              rows={11}
              className="w-full bg-silicon-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/70 resize-none font-medium leading-relaxed"
              placeholder="Paste Synopsys SpyGlass summary report or Cadence JasperGold tabular findings..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-silicon-850 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Parses rule signatures like <code className="text-cyan-300">Ac_unsync01</code>, <code className="text-cyan-300">CDC_STRUCTURAL_UNSYNC</code>, etc.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition shadow-glow-cyan flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply to 3D SoC Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
