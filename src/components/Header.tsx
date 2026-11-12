import React from 'react';
import { Calculator, RefreshCw } from 'lucide-react';

interface HeaderProps {
  pricingMode: 'buy' | 'sell';
  setPricingMode: (mode: 'buy' | 'sell') => void;
  fetchMarketPrices: () => void;
  loadingPrices: boolean;
}

export const Header: React.FC<HeaderProps> = ({ pricingMode, setPricingMode, fetchMarketPrices, loadingPrices }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/5">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            EVE Industry Profit Calculator
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">ESI Live</span>
          </h1>
          <p className="text-xs text-slate-400">Calculate manufacturing costs, material efficiency, fees, and ISK/hr</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-lg p-1 text-xs">
          <button
            onClick={() => setPricingMode('buy')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${pricingMode === 'buy' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Jita Buy (Materials)
          </button>
          <button
            onClick={() => setPricingMode('sell')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${pricingMode === 'sell' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Jita Sell (Materials)
          </button>
        </div>

        <button
          onClick={fetchMarketPrices}
          disabled={loadingPrices}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-700/80 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium transition text-slate-200"
          title="Refresh Market Prices from ESI"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span>{loadingPrices ? 'Updating...' : 'Refresh ESI'}</span>
        </button>
      </div>
    </header>
  );
};
