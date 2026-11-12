import { NextResponse } from 'next/server';
import { TRADE_HUBS, DEFAULT_HUB_ID } from '@/data/hubs';

interface CacheEntry {
  orders: Record<number, any[]>;
  timestamp: number;
}

const regionCaches: Record<number, CacheEntry> = {};
const CACHE_TTL = 10 * 60 * 1000;
let globalPricesCache: { data: Record<number, number>; timestamp: number } | null = null;

const DEFAULT_PRICES: Record<number, { buy: number; sell: number }> = {
  34: { buy: 5.50, sell: 6.20 },
  35: { buy: 18.00, sell: 21.50 },
  36: { buy: 85.00, sell: 98.00 },
  37: { buy: 240.00, sell: 285.00 },
  38: { buy: 850.00, sell: 960.00 },
  39: { buy: 4200.00, sell: 4850.00 },
  40: { buy: 12500.00, sell: 14200.00 },
  11399: { buy: 18500.00, sell: 21000.00 },
  3330: { buy: 45000000.00, sell: 52000000.00 },
  32800: { buy: 1800000.00, sell: 2200000.00 },
  622: { buy: 12000000.00, sell: 14500000.00 },
};

async function getGlobalAverages(): Promise<Record<number, number>> {
  const now = Date.now();
  if (globalPricesCache && (now - globalPricesCache.timestamp < CACHE_TTL)) return globalPricesCache.data;
  try {
    const res = await fetch('https://esi.evetech.net/latest/markets/prices/?datasource=tranquility', {
      headers: { 'User-Agent': 'EVE-Industry-Profit-Calculator' },
      next: { revalidate: 600 }
    });
    if (res.ok) {
      const data: Array<{ type_id: number; average_price?: number }> = await res.json();
      const map: Record<number, number> = {};
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type_id && item.average_price) map[item.type_id] = item.average_price;
        }
      }
      globalPricesCache = { data: map, timestamp: now };
      return map;
    }
  } catch (err) {
    console.error('Failed global ESI prices:', err);
  }
  return {};
}

async function fetchRegionOrders(regionId: number, typeIds: number[]) {
  const now = Date.now();
  if (!regionCaches[regionId]) regionCaches[regionId] = { orders: {}, timestamp: 0 };
  const cache = regionCaches[regionId];
  const missing = typeIds.filter(id => !cache.orders[id]);
  if ((now - cache.timestamp < CACHE_TTL) && missing.length === 0) return cache.orders;

  const fetchIds = (now - cache.timestamp >= CACHE_TTL) ? typeIds : missing;
  await Promise.all(
    fetchIds.map(async (typeId) => {
      try {
        const res = await fetch(`https://esi.evetech.net/latest/markets/${regionId}/orders/?datasource=tranquility&order_type=all&type_id=${typeId}`, {
          headers: { 'User-Agent': 'EVE-Industry-Profit-Calculator' }
        });
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders)) cache.orders[typeId] = orders;
        }
      } catch (err) {
        console.error(`Failed region ${regionId} orders for type ${typeId}:`, err);
      }
    })
  );
  cache.timestamp = now;
  return cache.orders;
}

function computePrices(hubId: string, typeIds: number[], ordersMap: Record<number, any[]>, globalAverages: Record<number, number>) {
  const hub = TRADE_HUBS[hubId] || TRADE_HUBS[DEFAULT_HUB_ID];
  const stationId = hub.stationId;
  const result: Record<number, { buy: number; sell: number }> = {};

  for (const id of typeIds) {
    const orders = ordersMap[id] || [];
    const stationOrders = orders.filter((o: any) => o.location_id === stationId);
    const targetOrders = stationOrders.length > 0 ? stationOrders : orders;
    const sellOrders = targetOrders.filter((o: any) => !o.is_buy_order);
    const buyOrders = targetOrders.filter((o: any) => o.is_buy_order);

    let buyPrice = sellOrders.length > 0 ? Math.min(...sellOrders.map((o: any) => o.price)) : 0;
    let sellPrice = buyOrders.length > 0 ? Math.max(...buyOrders.map((o: any) => o.price)) : 0;

    const globalAvg = globalAverages[id];
    const defaultEntry = DEFAULT_PRICES[id];

    if (buyPrice <= 0) buyPrice = globalAvg ? globalAvg * 0.92 : (defaultEntry ? defaultEntry.buy : 100);
    if (sellPrice <= 0) sellPrice = globalAvg ? globalAvg * 1.05 : (defaultEntry ? defaultEntry.sell : 110);
    result[id] = { buy: buyPrice, sell: sellPrice };
  }
  return result;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeIdsParam = url.searchParams.get('type_ids');
  const typeIds = typeIdsParam 
    ? typeIdsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    : Object.keys(DEFAULT_PRICES).map(Number);

  const buyHubParam = url.searchParams.get('buyHub') || url.searchParams.get('buy_hub') || DEFAULT_HUB_ID;
  const sellHubParam = url.searchParams.get('sellHub') || url.searchParams.get('sell_hub') || DEFAULT_HUB_ID;
  const buyHub = TRADE_HUBS[buyHubParam] ? buyHubParam : DEFAULT_HUB_ID;
  const sellHub = TRADE_HUBS[sellHubParam] ? sellHubParam : DEFAULT_HUB_ID;

  try {
    const globalAverages = await getGlobalAverages();
    const buyRegionId = TRADE_HUBS[buyHub].regionId;
    const sellRegionId = TRADE_HUBS[sellHub].regionId;

    const [buyOrdersMap, sellOrdersMap] = await Promise.all([
      fetchRegionOrders(buyRegionId, typeIds),
      buyRegionId === sellRegionId ? Promise.resolve(null) : fetchRegionOrders(sellRegionId, typeIds)
    ]);
    const effectiveSellOrdersMap = sellOrdersMap || buyOrdersMap;

    const buyHubPrices = computePrices(buyHub, typeIds, buyOrdersMap, globalAverages);
    const sellHubPrices = computePrices(sellHub, typeIds, effectiveSellOrdersMap, globalAverages);

    return NextResponse.json({ buyHubPrices, sellHubPrices, prices: buyHubPrices, cached: false, timestamp: Date.now() });
  } catch (error) {
    console.error('ESI multi-hub market API error:', error);
    const fallback: Record<number, { buy: number; sell: number }> = {};
    typeIds.forEach(id => { fallback[id] = DEFAULT_PRICES[id] || { buy: 100, sell: 110 }; });
    return NextResponse.json({ buyHubPrices: fallback, sellHubPrices: fallback, prices: fallback, cached: false, fallback: true, timestamp: Date.now() });
  }
}

