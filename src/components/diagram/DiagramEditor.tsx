import React, { useEffect, useState } from 'react';
import type { ArchitectureDiagram, DiagramBlock, DiagramWire } from '../../types/diagram';
import { normalizeDiagram } from '../../utils/diagramImport';
import { Plus, Trash2, Save, X, Boxes, Network, Braces, ChevronDown, ChevronRight } from 'lucide-react';

interface DiagramEditorProps {
  open: boolean;
  diagram: ArchitectureDiagram;
  onClose: () => void;
  onSave: (next: ArchitectureDiagram) => void;
}

const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 999)}`;

const emptyInternal = (block: DiagramBlock): ArchitectureDiagram => ({
  id: `${block.id}_internal`,
  companyId: 'custom',
  socId: 'custom',
  title: `${block.label} internals`,
  subtitle: 'Nested module',
  source: 'Nested diagram',
  width: 900,
  height: 620,
  groups: [],
  blocks: [{
    id: `${block.id}_sub0`, label: 'New sub-block', kind: 'peripheral',
    x: 100, y: 100, w: 200, h: 90, details: 'Edit this nested block.',
  }],
  wires: [],
  notes: ['Nested module created from the editor.'],
});

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ open, diagram, onClose, onSave }) => {
  const [draft, setDraft] = useState<ArchitectureDiagram>(diagram);
  const [tab, setTab] = useState<'blocks' | 'wires' | 'json'>('blocks');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const next = JSON.parse(JSON.stringify(diagram)) as ArchitectureDiagram;
    setDraft(next);
    setJsonText(JSON.stringify(next, null, 2));
    setError(null);
  }, [open, diagram]);

  if (!open) return null;

  const updateBlock = (id: string, patch: Partial<DiagramBlock>) => {
    setDraft(prev => ({ ...prev, blocks: prev.blocks.map(block => block.id === id ? { ...block, ...patch } : block) }));
  };

  const addBlock = () => {
    const maxY = Math.max(0, ...draft.blocks.map(block => block.y + block.h));
    setDraft(prev => ({
      ...prev,
      blocks: [...prev.blocks, {
        id: newId('block'), label: 'New block', kind: 'peripheral',
        x: 80, y: maxY + 50, w: 200, h: 90, details: 'Describe this block.',
      }],
    }));
  };

  const removeBlock = (id: string) => {
    setDraft(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== id),
      wires: prev.wires.filter(wire => wire.from !== id && wire.to !== id),
    }));
  };

  const addInternal = (block: DiagramBlock) => {
    updateBlock(block.id, { internal: emptyInternal(block) });
    setExpanded(prev => new Set(prev).add(block.id));
  };

  const addWire = () => {
    if (draft.blocks.length < 2) return;
    const from = draft.blocks[0];
    const to = draft.blocks[1];
    const ax = from.x + from.w / 2;
    const ay = from.y + from.h / 2;
    const bx = to.x + to.w / 2;
    const by = to.y + to.h / 2;
    const midY = (ay + by) / 2;
    setDraft(prev => ({
      ...prev,
      wires: [...prev.wires, {
        id: newId('wire'), from: from.id, to: to.id,
        points: ax === bx ? [[ax, ay], [bx, by]] : [[ax, ay], [ax, midY], [bx, midY], [bx, by]],
        busType: 'AXI4', width: 64, clock: 'F_CLK', label: `${from.label} → ${to.label}`,
      }],
    }));
  };

  const updateWire = (id: string, patch: Partial<DiagramWire>) => {
    setDraft(prev => ({ ...prev, wires: prev.wires.map(wire => wire.id === id ? { ...wire, ...patch } : wire) }));
  };

  const removeWire = (id: string) => {
    setDraft(prev => ({ ...prev, wires: prev.wires.filter(wire => wire.id !== id) }));
  };

  const save = () => {
    try {
      const normalized = normalizeDiagram(draft, { companyId: draft.companyId });
      onSave(normalized);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid diagram');
    }
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const normalized = normalizeDiagram(parsed, { companyId: draft.companyId });
      setDraft(normalized);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-slate-700 bg-silicon-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs font-mono font-bold text-white">EDIT MODULE</div>
            <div className="text-[9px] font-mono text-slate-500">{draft.title}</div>
          </div>
          <button onClick={onClose} className="ml-auto p-1 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          {([['blocks', 'Blocks', Boxes], ['wires', 'Links', Network], ['json', 'JSON', Braces]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => { setTab(key); if (key === 'json') setJsonText(JSON.stringify(draft, null, 2)); }} className={`px-2.5 py-1.5 rounded text-[9px] font-mono flex items-center gap-1 ${tab === key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 border border-transparent'}`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
          <button onClick={addBlock} className="ml-auto px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Block</button>
          <button onClick={addWire} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-cyan-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Link</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tab === 'blocks' && draft.blocks.map(block => {
            const isOpen = expanded.has(block.id);
            return (
              <div key={block.id} className="rounded border border-slate-800 bg-silicon-900 p-2">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setExpanded(prev => { const next = new Set(prev); next.has(block.id) ? next.delete(block.id) : next.add(block.id); return next; })} className="p-0.5 text-slate-500">
                    {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  <input value={block.label} onChange={e => updateBlock(block.id, { label: e.target.value })} className="w-40 px-1.5 py-1 rounded bg-silicon-950 border border-slate-700 text-[10px] font-mono text-white" />
                  <select value={block.kind} onChange={e => updateBlock(block.id, { kind: e.target.value as DiagramBlock['kind'] })} className="px-1 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300">
                    {['cpu', 'bus', 'crossbar', 'bridge', 'memory', 'peripheral', 'accelerator', 'io', 'security', 'clock', 'debug'].map(kind => <option key={kind} value={kind}>{kind}</option>)}
                  </select>
                  <input value={block.specRef ?? ''} placeholder="specRef" onChange={e => updateBlock(block.id, { specRef: e.target.value || undefined })} className="w-24 px-1.5 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300" />
                  <button onClick={() => addInternal(block)} className="ml-auto px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-purple-300">
                    {block.internal ? 'internal ✓' : 'add internal'}
                  </button>
                  <button onClick={() => removeBlock(block.id)} className="p-1 text-slate-500 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                </div>
                {isOpen && (
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {(['x', 'y', 'w', 'h'] as const).map(key => (
                      <label key={key} className="text-[8px] font-mono text-slate-500">{key}
                        <input type="number" value={block[key]} onChange={e => updateBlock(block.id, { [key]: Number(e.target.value) } as any)} className="w-full px-1 py-0.5 rounded bg-silicon-950 border border-slate-800 text-[9px] font-mono text-white" />
                      </label>
                    ))}
                    <textarea value={block.details ?? ''} onChange={e => updateBlock(block.id, { details: e.target.value })} placeholder="details" rows={2} className="col-span-4 px-1.5 py-1 rounded bg-silicon-950 border border-slate-800 text-[9px] font-mono text-slate-300 resize-none" />
                    {block.internal && (
                      <div className="col-span-4 text-[8px] font-mono text-purple-300">
                        Nested module: {block.internal.blocks.length} blocks / {block.internal.wires.length} links — open it in the view to edit inside.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {tab === 'wires' && draft.wires.map(wire => (
            <div key={wire.id} className="rounded border border-slate-800 bg-silicon-900 p-2 flex items-center gap-1.5">
              <select value={wire.from ?? ''} onChange={e => updateWire(wire.id, { from: e.target.value })} className="px-1 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300">
                <option value="">from…</option>
                {draft.blocks.map(block => <option key={block.id} value={block.id}>{block.label}</option>)}
              </select>
              <span className="text-slate-500">→</span>
              <select value={wire.to ?? ''} onChange={e => updateWire(wire.id, { to: e.target.value })} className="px-1 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300">
                <option value="">to…</option>
                {draft.blocks.map(block => <option key={block.id} value={block.id}>{block.label}</option>)}
              </select>
              <input value={wire.busType ?? ''} onChange={e => updateWire(wire.id, { busType: e.target.value })} placeholder="bus" className="w-20 px-1.5 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300" />
              <input type="number" value={wire.width ?? ''} onChange={e => updateWire(wire.id, { width: e.target.value ? Number(e.target.value) : undefined })} placeholder="bits" className="w-14 px-1 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300" />
              <input value={wire.clock ?? ''} onChange={e => updateWire(wire.id, { clock: e.target.value })} placeholder="clock" className="w-24 px-1.5 py-1 rounded bg-silicon-950 border border-slate-700 text-[9px] font-mono text-slate-300" />
              <button onClick={() => removeWire(wire.id)} className="ml-auto p-1 text-slate-500 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}

          {tab === 'json' && (
            <div className="space-y-2">
              <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} className="w-full h-72 p-2 rounded bg-silicon-900 border border-slate-800 text-[9px] font-mono text-slate-300 resize-none" spellCheck={false} />
              <button onClick={applyJson} className="px-2.5 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[9px] font-mono text-cyan-200">Apply JSON to editor</button>
            </div>
          )}

          {error && <div className="rounded bg-red-950/50 border border-red-900 p-2 text-[9px] font-mono text-red-300">{error}</div>}
        </div>

        <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-500">{draft.blocks.length} blocks · {draft.wires.length} links · nested modules are preserved</span>
          <button onClick={onClose} className="ml-auto px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">Cancel</button>
          <button onClick={save} className="px-2.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-[9px] font-mono text-cyan-200 flex items-center gap-1"><Save className="w-3 h-3" /> Save module</button>
        </div>
      </div>
    </div>
  );
};
