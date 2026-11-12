import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, TrendingUp } from 'lucide-react';

export const Dashboard = ({ calculation, formatIsk, sccSurcharge, facilityTax, brokerFee, salesTax, pricingMode, currentBp }: any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border backdrop-blur shadow-xl flex flex-col justify-between ${calculation.netProfit >= 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase">
            <span>Net Profit</span>
            {calculation.netProfit >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-extrabold ${calculation.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIsk(calculation.netProfit)} ISK
            </span>
            <p className="text-xs text-slate-400 mt-1">Margin: {calculation.profitMargin.toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase">
            <span>ISK / Hour</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-400">{formatIsk(calculation.iskPerHour)}</span>
            <p className="text-xs text-slate-400 mt-1">Build: {calculation.totalBuildTimeHours.toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase">
            <span>Production Cost</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{formatIsk(calculation.totalProductionCost)} ISK</span>
            <p className="text-xs text-slate-400 mt-1">Materials + Fees</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Financial & Revenue Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
              <span>Costs Breakdown</span><span>ISK</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>Material ({pricingMode}):</span><span className="text-slate-200">{formatIsk(calculation.totalMaterialCost)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Job Cost:</span><span className="text-slate-200">{formatIsk(calculation.jobCost)}</span></div>
            <div className="flex justify-between text-slate-400"><span>SCC ({sccSurcharge}%):</span><span className="text-slate-200">{formatIsk(calculation.sccFee)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Tax ({facilityTax}%):</span><span className="text-slate-200">{formatIsk(calculation.taxFee)}</span></div>
            <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800">
              <span>Total Cost:</span><span className="text-amber-400">{formatIsk(calculation.totalProductionCost)}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
              <span>Revenue Breakdown</span><span>ISK</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>Output ({calculation.totalUnits}x {currentBp.outputName}):</span><span className="text-slate-200">{formatIsk(calculation.grossRevenue)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Broker ({brokerFee}%):</span><span className="text-slate-200">-{formatIsk(calculation.brokerFeeAmount)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Sales Tax ({salesTax}%):</span><span className="text-slate-200">-{formatIsk(calculation.salesTaxAmount)}</span></div>
            <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800">
              <span>Net Revenue:</span><span className="text-emerald-400">{formatIsk(calculation.netRevenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
