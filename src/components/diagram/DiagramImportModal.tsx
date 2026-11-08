import React, { useMemo, useState } from 'react';
import type { ArchitectureDiagram } from '../../types/diagram';
import type { ParsedIpXact } from '../../utils/ipxact';
import { parseIpXact, downloadText } from '../../utils/ipxact';
import { diagramFromCsv, diagramFromIpXact, diagramToJson, normalizeDiagram } from '../../utils/diagramImport';
import { UploadCloud, FileJson, FileCode2, Table2, X, CheckCircle2, AlertTriangle, Download, ClipboardPaste } from 'lucide-react';

interface DiagramImportModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (diagram: ArchitectureDiagram) => void;
  currentDiagram: ArchitectureDiagram;
  companyId: string;
}

type Tab = 'json' | 'ipxact' | 'csv';

export const DiagramImportModal: React.FC<DiagramImportModalProps> = ({ open, onClose, onApply, currentDiagram, companyId }) => {
  const [tab, setTab] = useState<Tab>('json');
  const [jsonText, setJsonText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [ipxComponents, setIpxComponents] = useState<ParsedIpXact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ArchitectureDiagram | null>(null);

  const currentJson = useMemo(() => diagramToJson(currentDiagram), [currentDiagram]);
  if (!open) return null;

  const reset = () => { setError(null); setDraft(null); };

  const parseJson = () => {
    reset();
    try {
      const raw = JSON.parse(jsonText);
      setDraft(normalizeDiagram(raw, { companyId, title: raw.title ?? 'Uploaded architecture' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const readJsonFile = async (file: File) => {
    reset();
    try {
      const text = await file.text();
      setJsonText(text);
      const raw = JSON.parse(text);
      setDraft(normalizeDiagram(raw, { companyId, title: raw.title ?? 'Uploaded architecture' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const readIpx = async (files: FileList) => {
    reset();
    try {
      const parsed = await Promise.all(Array.from(files).map(async file => parseIpXact(await file.text())));
      setIpxComponents(parsed);
      setDraft(diagramFromIpXact(parsed, { companyId, title: `Imported IP-XACT (${parsed.length} components)` }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IP-XACT parse failed');
    }
  };

  const parseCsvText = (text: string) => {
    reset();
    try {
      setCsvText(text);
      setDraft(diagramFromCsv(text, { companyId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV parse failed');
    }
  };

  const readCsvFile = async (file: File) => {
    parseCsvText(await file.text());
  };

  const apply = () => {
    if (!draft) return;
    onApply(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-silicon-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs font-mono font-bold text-white">LOAD YOUR OWN ARCHITECTURE</div>
            <div className="text-[9px] font-mono text-slate-500">diagram.json · IP-XACT 1685-2014 · CSV netlist</div>
          </div>
          <button onClick={onClose} className="ml-auto p-1 rounded text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          {([
            ['json', 'diagram.json', FileJson],
            ['ipxact', 'IP-XACT', FileCode2],
            ['csv', 'CSV / netlist', Table2],
          ] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => { setTab(key); reset(); }} className={`px-2.5 py-1.5 rounded text-[9px] font-mono flex items-center gap-1 ${tab === key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 border border-transparent hover:text-white'}`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
          <button onClick={() => downloadText(`${currentDiagram.id}.json`, currentJson)} className="ml-auto px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[8.5px] font-mono text-slate-300 flex items-center gap-1">
            <Download className="w-3 h-3" /> current JSON
          </button>
        </div>

        <div className="p-4 space-y-3">
          {tab === 'json' && (
            <>
              <div className="flex items-center gap-2">
                <label className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 cursor-pointer flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" /> Choose .json
                  <input type="file" accept=".json,application/json" className="hidden" onChange={e => e.target.files?.[0] && readJsonFile(e.target.files[0])} />
                </label>
                <button onClick={() => { setJsonText(currentJson); reset(); }} className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300 flex items-center gap-1">
                  <ClipboardPaste className="w-3 h-3" /> Use current as template
                </button>
              </div>
              <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} placeholder='Paste a diagram JSON with "blocks" and "wires"...' className="w-full h-48 p-2 rounded bg-silicon-900 border border-slate-800 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none" spellCheck={false} />
              <button onClick={parseJson} className="px-2.5 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[9px] font-mono text-cyan-200">Validate & preview</button>
            </>
          )}

          {tab === 'ipxact' && (
            <>
              <label className="inline-flex px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 cursor-pointer items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" /> Choose IP-XACT XML (one or more)
                <input type="file" multiple accept=".xml,application/xml" className="hidden" onChange={e => e.target.files && readIpx(e.target.files)} />
              </label>
              <p className="text-[9px] text-slate-500 leading-relaxed">
                Each XML component becomes a block. Connections are inferred from matching master/slave bus interfaces. This is an architecture draft — verify bridges and missing interfaces.
              </p>
              {ipxComponents.length > 0 && (
                <div className="rounded bg-silicon-900 border border-slate-800 p-2 text-[9px] font-mono text-slate-400">
                  {ipxComponents.map((component, i) => (
                    <div key={i}>{component.vendor}:{component.name}:{component.version} · {component.busInterfaces.length} interfaces</div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'csv' && (
            <>
              <div className="flex items-center gap-2">
                <label className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 cursor-pointer flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" /> Choose .csv
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => e.target.files?.[0] && readCsvFile(e.target.files[0])} />
                </label>
                <button onClick={() => parseCsvText(`type,id,label,kind,x,y,w,h,from,to,busType,width,clock,specRef\nblock,cpu0,CPU0,cpu,60,80,180,90,,,,,\nblock,dram,DDR,memory,360,80,200,90,,,,,\nwire,w0,CPU0 to DDR,,,,\u002c,cpu0,dram,AXI4,64,F_CPU`) } className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">Load sample</button>
              </div>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="type,id,label,kind,x,y,w,h,from,to,busType,width,clock,specRef..." className="w-full h-48 p-2 rounded bg-silicon-900 border border-slate-800 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none" spellCheck={false} />
              <button onClick={() => parseCsvText(csvText)} className="px-2.5 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[9px] font-mono text-cyan-200">Validate & preview</button>
              <div className="text-[8.5px] font-mono text-slate-500 leading-relaxed">
                One row per block or wire. `points` may be `x:y;x:y`; if omitted, a wire is routed from `from` to `to` block centers.
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded bg-red-950/50 border border-red-900 p-2 text-[9px] font-mono text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {draft && (
            <div className="rounded bg-emerald-950/40 border border-emerald-900 p-2">
              <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> {draft.title} · {draft.blocks.length} blocks · {draft.wires.length} links
              </div>
              <div className="text-[8.5px] font-mono text-slate-400 mt-1">Preview is ready. Applying replaces the current architecture until you clear it.</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-800">
          <span className="text-[8px] font-mono text-slate-500">No rebuild · stored locally</span>
          <button onClick={onClose} className="ml-auto px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">Cancel</button>
          <button onClick={apply} disabled={!draft} className="px-2.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-[9px] font-mono text-cyan-200 disabled:opacity-40">Load diagram</button>
        </div>
      </div>
    </div>
  );
};
