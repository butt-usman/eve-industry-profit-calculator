import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, TrendingUp, RefreshCw, Tag } from 'lucide-react';
import { TRADE_HUBS } from '@/data/hubs';

export const Dashboard = ({ calculation, formatIsk, sccSurcharge, facilityTax, brokerFee, salesTax, pricingMode, revenueBasis, currentBp, buyHub, sellHub, priceTimestamp, fetchMarketPrices, loadingPrices }: any) => {
  const buyHubName = TRADE_HUBS[buyHub]?.name || 'Dodixie';
  const sellHubName = TRADE_HUBS[sellHub]?.name || 'Dodixie';

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return 'Unknown';
    const secs = Math.floor((Date.now() - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Financial & Revenue Summary ({buyHubName} ➔ {sellHubName})
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Data Age: <strong className="text-slate-200">{formatTimestamp(priceTimestamp)}</strong>
            </span>
            <button
              onClick={fetchMarketPrices}
              disabled={loadingPrices}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg border border-amber-500/30 transition disabled:opacity-50"
              title="Fetch latest live ESI market prices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? 'animate-spin' : ''}`} />
              {loadingPrices ? 'Updating...' : 'Fetch Live Prices'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
              <span>Costs Breakdown</span><span>ISK</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>Material ({buyHubName} - {pricingMode}):</span><span className="text-slate-200">{formatIsk(calculation.totalMaterialCost)}</span></div>
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
            <div className="flex justify-between text-slate-400 items-center">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-400" /> {revenueBasis === 'buyOrder' ? 'Buy Order Price (instant sell) (' : 'Sell Order Price ('}
                  <a
                    href={`https://evetycoon.com/market/${currentBp.outputTypeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    {currentBp.outputName}
                  </a>
                ):</span>
              <span className="text-amber-400 font-bold">{formatIsk(calculation.outputUnitPrice)} ISK / unit</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>Output ({calculation.totalUnits}x @ {sellHubName}):</span><span className="text-slate-200">{formatIsk(calculation.grossRevenue)}</span></div>
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

