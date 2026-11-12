import React from 'react';
import { Settings } from 'lucide-react';

interface IndustryParametersProps {
  meLevel: number;
  setMeLevel: (val: number) => void;
  teLevel: number;
  setTeLevel: (val: number) => void;
  structureMeBonus: number;
  setStructureMeBonus: (val: number) => void;
  structureTeBonus: number;
  setStructureTeBonus: (val: number) => void;
  runs: number;
  setRuns: (val: number) => void;
  systemCostIndex: number;
  setSystemCostIndex: (val: number) => void;
  facilityTax: number;
  setFacilityTax: (val: number) => void;
  brokerFee: number;
  setBrokerFee: (val: number) => void;
  salesTax: number;
  setSalesTax: (val: number) => void;
}

export const IndustryParameters: React.FC<IndustryParametersProps> = ({
  meLevel, setMeLevel, teLevel, setTeLevel,
  structureMeBonus, setStructureMeBonus, structureTeBonus, setStructureTeBonus,
  runs, setRuns, systemCostIndex, setSystemCostIndex,
  facilityTax, setFacilityTax, brokerFee, setBrokerFee,
  salesTax, setSalesTax
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur space-y-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Settings className="w-4 h-4 text-amber-400" />
        Industry Parameters
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">ME Level (0-10)</label>
          <input type="number" min="0" max="10" value={meLevel} onChange={(e) => setMeLevel(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">TE Level (0-20)</label>
          <input type="number" min="0" max="20" value={teLevel} onChange={(e) => setTeLevel(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Structure ME</label>
          <select value={structureMeBonus} onChange={(e) => setStructureMeBonus(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500">
            <option value={0.0}>None (0%)</option>
            <option value={0.01}>Raitaru/Azbel (1%)</option>
            <option value={0.02}>Keepstar/Sotiyo (2%)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Structure TE</label>
          <select value={structureTeBonus} onChange={(e) => setStructureTeBonus(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500">
            <option value={0.0}>None (0%)</option>
            <option value={0.15}>Raitaru (15%)</option>
            <option value={0.20}>Azbel/Sotiyo (20%)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Number of Runs</span>
            <span className="text-amber-400 font-bold">{runs}</span>
          </div>
          <input type="range" min="1" max="100" value={runs} onChange={(e) => setRuns(parseInt(e.target.value) || 1)} className="w-full accent-amber-500 cursor-pointer" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">System Cost Index (%)</label>
            <input type="number" step="0.1" value={systemCostIndex} onChange={(e) => setSystemCostIndex(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Facility Tax (%)</label>
            <input type="number" step="0.1" value={facilityTax} onChange={(e) => setFacilityTax(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Broker Fee (%)</label>
            <input type="number" step="0.1" value={brokerFee} onChange={(e) => setBrokerFee(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Sales Tax (%)</label>
            <input type="number" step="0.1" value={salesTax} onChange={(e) => setSalesTax(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
