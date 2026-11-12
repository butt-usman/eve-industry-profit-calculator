'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TRADE_HUBS } from '@/data/hubs';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface ScannerItem {
  id: string;
  name: string;
  category: string;
  outputTypeId: number;
  outputName: string;
  outputQuantity: number;
  buildCost: number;
  netSellRevenue: number;
  netProfit: number;
  marginPercent: number;
  iskPerSlotHour: number;
  avgDailyVolume: number;
  estDailyIskPotential: number;
  outputUnitPrice: number;
}

type SortField = 'iskPerSlotHour' | 'marginPercent' | 'netProfit' | 'avgDailyVolume' | 'estDailyIskPotential' | 'name';

export default function ScannerPage() {
  const [hub, setHub] = useState<string>('dodixie');
  const [pricingMode, setPricingMode] = useState<'buy' | 'sell'>('buy');
  const [results, setResults] = useState<ScannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const [minVolume, setMinVolume] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('iskPerSlotHour');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchScannerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scanner?hub=${hub}`);
      const data = await res.json();
      if (data && data.results) {
        setResults(data.results);
        setTimestamp(data.timestamp || Date.now());
      }
    } catch (err) {
      console.error('Failed to fetch scanner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScannerData();
  }, [hub]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    const safeResults = Array.isArray(results) ? results : [];
    safeResults.forEach(r => {
      if (r && r.category) set.add(r.category);
    });
    return ['All', ...Array.from(set)];
  }, [results]);

  const filteredAndSortedResults = useMemo(() => {
    const safeResults = Array.isArray(results) ? results : [];
    let list = [...safeResults];

    if (selectedCategory !== 'All') {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (minVolume > 0) {
      list = list.filter(item => item.avgDailyVolume >= minVolume);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(term) || item.outputName.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return list;
  }, [results, selectedCategory, minVolume, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };
  return (
    <div className="min-h-screen bg-eve-dark text-slate-100">
      <Header
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
        buyHub={hub}
        setBuyHub={setHub}
        sellHub={hub}
        setSellHub={setHub}
        fetchMarketPrices={fetchScannerData}
        loadingPrices={loading}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-wide">What Should I Build? Profit Scanner</h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {TRADE_HUBS[hub]?.name || 'Dodixie'} Hub
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Rank high-demand EVE blueprints by ISK per slot-hour, net profit margin, and daily trade volume.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search blueprint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full md:w-48"
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Min Vol:</span>
              <select
                value={minVolume}
                onChange={(e) => setMinVolume(Number(e.target.value))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-slate-900">All Volumes</option>
                <option value={10} className="bg-slate-900">&gt; 10 / day</option>
                <option value={50} className="bg-slate-900">&gt; 50 / day</option>
                <option value={100} className="bg-slate-900">&gt; 100 / day</option>
                <option value={500} className="bg-slate-900">&gt; 500 / day</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Blueprint / Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-right">Build Cost</th>
                  <th className="py-4 px-4 text-right">Net Revenue</th>
                  <th className="py-4 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('netProfit')}>Net Profit</th>
                  <th className="py-4 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('marginPercent')}>Margin</th>
                  <th className="py-4 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('avgDailyVolume')}>Daily Vol</th>
                  <th className="py-4 px-4 text-right cursor-pointer hover:text-white text-amber-400" onClick={() => handleSort('iskPerSlotHour')}>ISK / Hour</th>
                  <th className="py-4 px-4 text-right cursor-pointer hover:text-white text-emerald-400" onClick={() => handleSort('estDailyIskPotential')}>Daily Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {loading ? (
                  <tr><td colSpan={9} className="py-12 text-center text-slate-400">Scanning ESI live market orders and trade history...</td></tr>
                ) : filteredAndSortedResults.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-slate-500">No blueprints match the current filters.</td></tr>
                ) : (
                  filteredAndSortedResults.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition group">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                            {item.outputName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 group-hover:text-amber-400 transition">{item.outputName}</div>
                            <div className="text-[10px] text-slate-400">Type ID: {item.outputTypeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50">{item.category}</span></td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">{formatIsk(item.buildCost)} ISK</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">{formatIsk(item.netSellRevenue)} ISK</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold ${item.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatIsk(item.netProfit)} ISK</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-medium ${item.marginPercent >= 10 ? 'text-emerald-400' : item.marginPercent >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>{item.marginPercent.toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">{item.avgDailyVolume.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400 bg-amber-500/5">{formatIsk(item.iskPerSlotHour)} ISK/hr</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 bg-emerald-500/5">{formatIsk(item.estDailyIskPotential)} ISK</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
