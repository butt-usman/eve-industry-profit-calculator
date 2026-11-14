import React from 'react';
import { Shield } from 'lucide-react';
import { TRADE_HUBS } from '@/data/hubs';

export const MaterialTable = ({ calculation, runs, pricingMode, formatIsk, buyHub }: any) => {
  const buyHubName = TRADE_HUBS[buyHub]?.name || 'Dodixie';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" /> Material Requirements ({runs} runs)
        </h2>
        <span className="text-xs text-slate-400">Unit Prices via {buyHubName} {pricingMode === 'buy' ? 'Buy' : 'Sell'}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Material</th>
              <th className="py-2.5 px-3 text-right">Per Run</th>
              <th className="py-2.5 px-3 text-right">Total Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price (ISK)</th>
              <th className="py-2.5 px-3 text-right">Total Cost (ISK)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {calculation.materialBreakdown.map((mat: any) => (
              <tr key={mat.typeId} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                  <a
                    href={`https://evetycoon.com/type/${mat.typeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    {mat.name}
                  </a>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">{mat.perRunQty.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-amber-400">{mat.totalQty.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-slate-300">{formatIsk(mat.unitPrice)}</td>
                <td className="py-2.5 px-3 text-right font-medium text-white">{formatIsk(mat.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

