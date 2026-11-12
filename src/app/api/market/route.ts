import { NextResponse } from 'next/server';

// In-memory cache for market prices (10 minutes TTL)
interface CacheEntry {
  data: Record<number, { buy: number; sell: number }>;
  timestamp: number;
}

let marketCache: CacheEntry | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Fallback default prices in ISK if ESI fails or is unreachable
const DEFAULT_PRICES: Record<number, { buy: number; sell: number }> = {
  34: { buy: 5.50, sell: 6.20 },     // Tritanium
  35: { buy: 18.00, sell: 21.50 },   // Pyerite
  36: { buy: 85.00, sell: 98.00 },   // Mexallon
  37: { buy: 240.00, sell: 285.00 }, // Isogen
  38: { buy: 850.00, sell: 960.00 }, // Nocxium
  39: { buy: 4200.00, sell: 4850.00 }, // Zydrine
  40: { buy: 12500.00, sell: 14200.00 }, // Megacyte
  11399: { buy: 18500.00, sell: 21000.00 }, // Morphite
  3330: { buy: 45000000.00, sell: 52000000.00 }, // Capital Core Temperature Regulator
  32800: { buy: 1800000.00, sell: 2200000.00 }, // Warp Disruptor II
  622: { buy: 12000000.00, sell: 14500000.00 }, // Thorax
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeIdsParam = url.searchParams.get('type_ids');
  const typeIds = typeIdsParam 
    ? typeIdsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    : Object.keys(DEFAULT_PRICES).map(Number);

  const now = Date.now();
  if (marketCache && (now - marketCache.timestamp < CACHE_TTL)) {
    const result: Record<number, { buy: number; sell: number }> = {};
    for (const id of typeIds) {
      result[id] = marketCache.data[id] || DEFAULT_PRICES[id] || { buy: 100, sell: 110 };
    }
    return NextResponse.json({ prices: result, cached: true, timestamp: marketCache.timestamp });
  }

  try {
    const esiRes = await fetch('https://esi.evetech.net/latest/markets/prices/?datasource=tranquility', {
      headers: { 'User-Agent': 'EVE-Industry-Profit-Calculator' },
      next: { revalidate: 600 }
    });

    const pricesData: Array<{ type_id: number; adjusted_price?: number; average_price?: number }> = esiRes.ok ? await esiRes.json() : [];
    
    const newCacheData: Record<number, { buy: number; sell: number }> = { ...DEFAULT_PRICES };

    if (Array.isArray(pricesData)) {
      for (const item of pricesData) {
        if (item.type_id && item.average_price) {
          newCacheData[item.type_id] = {
            buy: item.average_price * 0.92,
            sell: item.average_price * 1.05
          };
        }
      }
    }

    marketCache = {
      data: newCacheData,
      timestamp: now
    };

    const result: Record<number, { buy: number; sell: number }> = {};
    for (const id of typeIds) {
      result[id] = marketCache.data[id] || DEFAULT_PRICES[id] || { buy: 100, sell: 110 };
    }

    return NextResponse.json({ prices: result, cached: false, timestamp: now });
  } catch (error) {
    console.error('Failed to fetch ESI market prices:', error);
    const result: Record<number, { buy: number; sell: number }> = {};
    for (const id of typeIds) {
      result[id] = DEFAULT_PRICES[id] || { buy: 100, sell: 110 };
    }
    return NextResponse.json({ prices: result, cached: false, fallback: true, timestamp: now });
  }
}
