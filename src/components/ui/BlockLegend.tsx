import React from 'react';
import { Boxes } from 'lucide-react';

const ITEMS = [
  { glyph: '▦', label: 'CPU core', color: 'text-cyan-300' },
  { glyph: '≣', label: 'Memory macro', color: 'text-sky-300' },
  { glyph: '╋', label: 'Fabric / NoC', color: 'text-violet-300' },
  { glyph: '⊓', label: 'Bridge', color: 'text-indigo-300' },
  { glyph: '◎', label: 'Analog', color: 'text-amber-300' },
  { glyph: '◆', label: 'Security', color: 'text-rose-300' },
  { glyph: '⋮', label: 'Peripheral', color: 'text-pink-300' },
  { glyph: '▭', label: 'IP tile', color: 'text-slate-300' },
];

export const BlockLegend: React.FC = () => (
  <div className="absolute bottom-4 right-4 z-10 w-[218px] rounded-lg bg-silicon-950/88 backdrop-blur-md border border-slate-700 shadow-2xl overflow-hidden">
    <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
      <Boxes className="w-3.5 h-3.5 text-cyan-400" />
      <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300">BLOCK ARCHETYPES</span>
    </div>
    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 p-2">
      {ITEMS.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-4 text-center font-mono text-[11px] ${item.color}`}>{item.glyph}</span>
          <span className="text-[8.5px] font-mono text-slate-400 truncate">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);
