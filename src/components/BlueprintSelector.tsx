import React from 'react';
import { Layers } from 'lucide-react';
import { SAMPLE_BLUEPRINTS, BlueprintItem } from '@/data/blueprints';

interface BlueprintSelectorProps {
  selectedBpId: string;
  setSelectedBpId: (id: string) => void;
  currentBp: BlueprintItem;
}

export const BlueprintSelector: React.FC<BlueprintSelectorProps> = ({ selectedBpId, setSelectedBpId, currentBp }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4 text-amber-400" />
        Blueprint Selection
      </h2>
      <div className="space-y-3">
        <label className="text-xs text-slate-400 block">Select Blueprint</label>
        <select
          value={selectedBpId}
          onChange={(e) => setSelectedBpId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition"
        >
          {SAMPLE_BLUEPRINTS.map(bp => (
            <option key={bp.id} value={bp.id}>
              {bp.name} ({bp.category})
            </option>
          ))}
        </select>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 mt-3">
          <span>Category: <strong className="text-slate-200">{currentBp.category}</strong></span>
          <span>Base Time: <strong className="text-slate-200">{Math.round(currentBp.baseBuildTimeSeconds / 60)} mins/run</strong></span>
        </div>
      </div>
    </div>
  );
};
