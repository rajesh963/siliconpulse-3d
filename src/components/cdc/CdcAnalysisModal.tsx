import React, { useState } from 'react';
import { InterconnectConnection } from '../../types/soc';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Activity, Sparkles, Wrench } from 'lucide-react';

interface CdcAnalysisModalProps {
  connection: InterconnectConnection | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyFix: (connectionId: string, fixType: '2ff' | 'fifo' | 'handshake' | 'waiver') => void;
}

export const CdcAnalysisModal: React.FC<CdcAnalysisModalProps> = ({
  connection,
  isOpen,
  onClose,
  onApplyFix
}) => {
  const [selectedFix, setSelectedFix] = useState<'2ff' | 'fifo' | 'handshake' | 'waiver'>('2ff');

  if (!isOpen || !connection) return null;

  const isViol = connection.cdcStatus === 'violation';

  // Calculate MTBF estimates
  const rawMtbf = isViol ? '0.0042 seconds (CRITICAL METASTABILITY RISK)' : '> 100,000 Years (Silicon Safe)';
  const resolutionTime = isViol ? '0.12 ns' : '1.85 ns (Clean 2-Stage)';

  const handleFixSubmit = () => {
    onApplyFix(connection.id, selectedFix);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-silicon-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-silicon-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isViol ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  CDC Waveform & Metastability MTBF Analysis
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  isViol ? 'bg-red-950 text-red-400 border border-red-700' : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {connection.cdcStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Path: {connection.name} ({connection.busType})
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Domain Crossing Visualizer */}
          <div className="grid grid-cols-2 gap-4 bg-silicon-950 p-4 rounded-xl border border-slate-800 font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Transmit Domain (Tx)</span>
              <div className="text-sm font-bold text-cyan-300">{connection.srcClock}</div>
              <div className="text-[11px] text-slate-400">Driver: {connection.srcModuleId}</div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Receive Domain (Rx)</span>
              <div className="text-sm font-bold text-purple-300">{connection.dstClock}</div>
              <div className="text-[11px] text-slate-400">Receiver: {connection.dstModuleId}</div>
            </div>
          </div>

          {/* Simulated Waveform SVG */}
          <div className="bg-silicon-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>ASYNCHRONOUS CLOCK WAVEFORMS & SAMPLING WINDOW</span>
              <span className="text-cyan-400">Simulation Corner: SSG 0.75V 125°C</span>
            </div>
            <div className="w-full bg-[#04060a] p-3 rounded-lg border border-slate-850">
              <svg viewBox="0 0 600 130" className="w-full h-28 stroke-current font-mono text-[10px]">
                {/* Tx Clock trace */}
                <text x="10" y="24" fill="#38bdf8" className="font-bold">CLK_TX</text>
                <path
                  d="M 80 30 L 110 30 L 110 10 L 140 10 L 140 30 L 170 30 L 170 10 L 200 10 L 200 30 L 230 30 L 230 10 L 260 10 L 260 30 L 290 30 L 290 10 L 320 10 L 320 30 L 350 30 L 350 10 L 380 10 L 380 30 L 410 30 L 410 10 L 440 10 L 440 30 L 470 30 L 470 10 L 500 10 L 500 30 L 530 30 L 530 10 L 560 10 L 560 30"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Data Out trace */}
                <text x="10" y="65" fill="#f59e0b" className="font-bold">TX_DATA</text>
                <path
                  d="M 80 70 L 180 70 L 190 50 L 360 50 L 370 70 L 560 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />

                {/* Rx Clock trace */}
                <text x="10" y="105" fill="#c084fc" className="font-bold">CLK_RX</text>
                <path
                  d="M 80 115 L 145 115 L 145 88 L 210 88 L 210 115 L 275 115 L 275 88 L 340 88 L 340 115 L 405 115 L 405 88 L 470 88 L 470 115 L 535 115 L 535 88 L 560 88"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2"
                />

                {/* Metastability Hazard Window */}
                {isViol && (
                  <g>
                    <rect x="180" y="45" width="35" height="75" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" strokeDasharray="3 3" />
                    <text x="185" y="40" fill="#f43f5e" className="font-bold text-[9px]">METASTABLE HAZARD</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* MTBF Silicon Calculation Panel */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-silicon-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">MEAN TIME BETWEEN FAILURES (MTBF)</span>
              <span className={`text-sm font-bold block mt-1 ${isViol ? 'text-red-400' : 'text-emerald-400'}`}>
                {rawMtbf}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Target: {'>'} 10,000 Years for Automotive & Mission Critical
              </span>
            </div>

            <div className="p-3 rounded-lg bg-silicon-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">RESOLUTION TIME (T_resol)</span>
              <span className="text-sm font-bold text-white block mt-1">{resolutionTime}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Foundry TSMC N5: tau = 18ps, T0 = 12ps
              </span>
            </div>
          </div>

          {/* Interactive Circuit Fix Selector (If Violation) */}
          {isViol && (
            <div className="p-4 rounded-xl bg-silicon-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white font-mono text-xs">
                  Insert Circuit Synchronizer to Fix Violation:
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFix('fifo')}
                  className={`p-2.5 rounded-lg border text-left transition font-mono ${
                    selectedFix === 'fifo'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                      : 'bg-silicon-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">Dual-Clock Async FIFO</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Depth 16, Gray pointers</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFix('2ff')}
                  className={`p-2.5 rounded-lg border text-left transition font-mono ${
                    selectedFix === '2ff'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                      : 'bg-silicon-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">2-FF Synchronizer</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Double-flop level capture</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFix('waiver')}
                  className={`p-2.5 rounded-lg border text-left transition font-mono ${
                    selectedFix === 'waiver'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : 'bg-silicon-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">Quasi-Static Waiver</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Boot-time static signal</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-silicon-850 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400 text-xs font-mono">
            {connection.edaCheckId}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Close
            </button>
            {isViol && (
              <button
                onClick={handleFixSubmit}
                className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition shadow-glow-cyan flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply Fix & Re-verify Path
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
