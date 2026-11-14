import React from 'react';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TRADE_HUBS } from '@/data/hubs';

interface HeaderProps {
  pricingMode?: 'buy' | 'sell';
  setPricingMode?: (mode: 'buy' | 'sell') => void;
  revenueBasis?: 'sellOrder' | 'buyOrder';
  setRevenueBasis?: (mode: 'sellOrder' | 'buyOrder') => void;
  buyHub?: string;
  setBuyHub?: (hubId: string) => void;
  sellHub?: string;
  setSellHub?: (hubId: string) => void;
  fetchMarketPrices?: () => void;
  loadingPrices?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pricingMode = 'buy',
  setPricingMode = () => {},
  revenueBasis = 'sellOrder',
  setRevenueBasis = () => {},
  buyHub = 'dodixie',
  setBuyHub = () => {},
  sellHub = 'dodixie',
  setSellHub = () => {},
  fetchMarketPrices = () => {},
  loadingPrices = false,
}) => {
  const pathname = usePathname();
  const isScanner = pathname?.includes('/scanner');
  const hubList = Object.values(TRADE_HUBS);
  const buyHubName = TRADE_HUBS[buyHub]?.name || 'Dodixie';
  const sellHubName = TRADE_HUBS[sellHub]?.name || 'Dodixie';

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/5">
          {isScanner ? <TrendingUp className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            {isScanner ? 'Dodixie Profit Scanner' : 'EVE Industry Profit Calculator'}
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">ESI Live</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isScanner ? 'What Should I Build? Multi-blueprint market scanner' : `Multi-hub manufacturing & arbitrage analysis (${buyHubName} ➔ ${sellHubName})`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-700/60 rounded-lg p-1 text-xs">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${!isScanner ? 'bg-amber-500 text-slate-950 shadow font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculator
          </Link>
          <Link
            href="/scanner"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${isScanner ? 'bg-amber-500 text-slate-950 shadow font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Scanner
          </Link>
        </div>

        {!isScanner && (
          <>
            <div className="flex flex-col text-xs">
              <label className="text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-wider">Material Source Hub</label>
              <select
                value={buyHub}
                onChange={(e) => setBuyHub(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500 transition"
              >
                {hubList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.regionName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-xs">
              <label className="text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-wider">Selling Hub</label>
              <select
                value={sellHub}
                onChange={(e) => setSellHub(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500 transition"
              >
                {hubList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.regionName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-lg p-1 text-xs self-end">
              <button
                onClick={() => setPricingMode('buy')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${pricingMode === 'buy' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Buy materials at lowest sell order"
              >
                {buyHubName} Buy
              </button>
              <button
                onClick={() => setPricingMode('sell')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${pricingMode === 'sell' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Acquire materials via buy orders"
              >
                {buyHubName} Sell
              </button>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-lg p-1 text-xs self-end" title="Revenue basis for the finished product">
              <span className="px-2 text-slate-500 uppercase text-[10px] tracking-wider">Sell At</span>
              <button
                onClick={() => setRevenueBasis('sellOrder')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${revenueBasis === 'sellOrder' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Sell product at the lowest sell order price (you list it)"
              >
                Sell Order
              </button>
              <button
                onClick={() => setRevenueBasis('buyOrder')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${revenueBasis === 'buyOrder' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Instant-sell product to the highest buy order"
              >
                Buy Order
              </button>
            </div>
          </>
        )}

        <button
          onClick={fetchMarketPrices}
          disabled={loadingPrices}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-700/80 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium transition text-slate-200 self-end"
          title="Refresh Market Prices from ESI"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span>{loadingPrices ? 'Updating...' : 'Refresh ESI'}</span>
        </button>
      </div>
    </header>
  );
};


