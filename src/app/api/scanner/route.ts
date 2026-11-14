import { NextResponse } from 'next/server';
import { SAMPLE_BLUEPRINTS } from '@/data/blueprints';
import { TRADE_HUBS, DEFAULT_HUB_ID } from '@/data/hubs';
import { loadPersistentCache, savePersistentCache } from '@/lib/cache';

interface CacheEntry {
  orders: Record<number, any[]>;
  timestamp: number;
}

const regionCaches: Record<number, CacheEntry> = {};
const volumeCaches: Record<string, { volume: number; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000;
const VOLUME_CACHE_TTL = 60 * 60 * 1000;
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
  4395: { buy: 15000000.00, sell: 18000000.00 },
};

async function getGlobalAverages(): Promise<Record<number, number>> {
  const now = Date.now();
  if (globalPricesCache && (now - globalPricesCache.timestamp < CACHE_TTL)) return globalPricesCache.data;
  try {
    const res = await fetch('https://esi.evetech.net/latest/markets/prices/?datasource=tranquility', {
      headers: { 'User-Agent': 'EVE-Industry-Profit-Calculator' }
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
async function fetchRegionOrders(regionId: number, typeIds: number[], force = false) {
  const now = Date.now();
  if (!regionCaches[regionId]) regionCaches[regionId] = { orders: {}, timestamp: 0 };
  const cache = regionCaches[regionId];
  const missing = typeIds.filter(id => !cache.orders[id]);
  const ttlExpired = now - cache.timestamp >= CACHE_TTL;
  if (!ttlExpired && !force && missing.length === 0) return cache.orders;

  const fetchIds = (ttlExpired || force) ? typeIds : missing;
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

async function fetchAverageDailyVolume(regionId: number, typeId: number): Promise<number> {
  const cacheKey = `${regionId}-${typeId}`;
  const now = Date.now();
  if (volumeCaches[cacheKey] && (now - volumeCaches[cacheKey].timestamp < VOLUME_CACHE_TTL)) {
    return volumeCaches[cacheKey].volume;
  }

  try {
    const res = await fetch(`https://esi.evetech.net/latest/markets/${regionId}/history/?datasource=tranquility&type_id=${typeId}`, {
      headers: { 'User-Agent': 'EVE-Industry-Profit-Calculator' }
    });
    if (res.ok) {
      const history: Array<{ date: string; volume: number }> = await res.json();
      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-7);
        const totalVol = recent.reduce((sum, h) => sum + (h.volume || 0), 0);
        const avgVol = Math.round(totalVol / recent.length);
        volumeCaches[cacheKey] = { volume: avgVol, timestamp: now };
        return avgVol;
      }
    }
  } catch (err) {
    console.error(`Failed history for region ${regionId} type ${typeId}:`, err);
  }

  const defaultVol = 50;
  volumeCaches[cacheKey] = { volume: defaultVol, timestamp: now };
  return defaultVol;
}

function computePrices(hubId: string, typeIds: number[], ordersMap: Record<number, any[]>, globalAverages: Record<number, number>) {
  const hub = TRADE_HUBS[hubId] || TRADE_HUBS['dodixie'];
  const stationId = hub.stationId;
  const result: Record<number, { buy: number; sell: number }> = {};

  for (const id of typeIds) {
    const orders = ordersMap[id] || [];
    const stationOrders = orders.filter((o: any) => o.location_id === stationId);
    const targetOrders = stationOrders.length > 0 ? stationOrders : orders;
    const sellOrders = targetOrders.filter((o: any) => !o.is_buy_order);
    const buyOrders = targetOrders.filter((o: any) => o.is_buy_order);

    const lowestSell = sellOrders.length > 0 ? Math.min(...sellOrders.map((o: any) => o.price)) : 0;
    const highestBuy = buyOrders.length > 0 ? Math.max(...buyOrders.map((o: any) => o.price)) : 0;

    const globalAvg = globalAverages[id];
    const defaultEntry = DEFAULT_PRICES[id];

    // 'buy' price = cost to buy materials instantly from market sell orders
    let buyPrice = lowestSell > 0 ? lowestSell : (globalAvg ? globalAvg * 1.05 : (defaultEntry ? defaultEntry.sell : 110));
    // 'sell' price = price for buy orders / regional bid orders
    let sellPrice = highestBuy > 0 ? highestBuy : (globalAvg ? globalAvg * 0.92 : (defaultEntry ? defaultEntry.buy : 100));
    result[id] = { buy: buyPrice, sell: sellPrice };
  }
  return result;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hubParam = url.searchParams.get('hub') || 'dodixie';
  const hub = TRADE_HUBS[hubParam] ? hubParam : 'dodixie';

  const meLevel = parseFloat(url.searchParams.get('me') || '10');
  const teLevel = parseFloat(url.searchParams.get('te') || '20');
  const structureMeBonus = parseFloat(url.searchParams.get('structureMe') || '0.01');
  const structureTeBonus = parseFloat(url.searchParams.get('structureTe') || '0.20');
  const systemCostIndex = parseFloat(url.searchParams.get('sci') || '3.5');
  const sccSurcharge = parseFloat(url.searchParams.get('scc') || '4.0');
  const facilityTax = parseFloat(url.searchParams.get('tax') || '5.0');
  const brokerFee = parseFloat(url.searchParams.get('broker') || '3.0');
  const salesTax = parseFloat(url.searchParams.get('salesTax') || '3.6');

  try {
    const persistentStore = loadPersistentCache(hub);
    const now = Date.now();
    const CACHE_TTL = 30 * 60 * 1000;
    const refresh = url.searchParams.get('refresh') === 'true';

    const typeIdsSet = new Set<number>();
    SAMPLE_BLUEPRINTS.forEach(bp => {
      typeIdsSet.add(bp.outputTypeId);
      bp.materials.forEach(mat => typeIdsSet.add(mat.typeId));
    });
    const allTypeIds = Array.from(typeIdsSet);

    const isStale = (now - persistentStore.timestamp) > CACHE_TTL;
    const needsRefresh = refresh || isStale || Object.keys(persistentStore.prices).length === 0;

    if (needsRefresh) {
      const hubConfig = TRADE_HUBS[hub] || TRADE_HUBS[DEFAULT_HUB_ID];
      const regionId = hubConfig.regionId;

      const [regionalOrders, globalAverages] = await Promise.all([
        fetchRegionOrders(regionId, allTypeIds, needsRefresh),
        getGlobalAverages(),
      ]);
      const prices = computePrices(hub, allTypeIds, regionalOrders, globalAverages);

      for (const [idStr, p] of Object.entries(prices)) {
        const id = parseInt(idStr, 10);
        persistentStore.prices[id] = p;
      }
      persistentStore.timestamp = now;
      savePersistentCache(hub, persistentStore);
    }

    const prices = persistentStore.prices;

    const combinedMeMult = (1 - (meLevel * 0.01)) * (1 - structureMeBonus);

    const scannerResults = SAMPLE_BLUEPRINTS.map(bp => {
      let totalMaterialCost = 0;
      bp.materials.forEach(mat => {
        const rawJobQty = mat.quantity * combinedMeMult;
        const perRunQty = Math.max(1, Math.ceil(Math.round(rawJobQty * 100000) / 100000));
        const defaultMatPrice = DEFAULT_PRICES[mat.typeId]?.buy || 100;
        const unitPrice = prices[mat.typeId]?.buy || defaultMatPrice;
        totalMaterialCost += perRunQty * unitPrice;
      });

      const jobCost = totalMaterialCost * (systemCostIndex / 100);
      const sccFee = totalMaterialCost * (sccSurcharge / 100);
      const taxFee = jobCost * (facilityTax / 100);
      const totalManufacturingFees = jobCost + sccFee + taxFee;
      const totalProductionCost = totalMaterialCost + totalManufacturingFees;

      const outputUnitPrice = prices[bp.outputTypeId]?.buy || prices[bp.outputTypeId]?.sell || DEFAULT_PRICES[bp.outputTypeId]?.buy || DEFAULT_PRICES[bp.outputTypeId]?.sell || 1000000;
      const totalUnits = bp.outputQuantity;
      const grossRevenue = totalUnits * outputUnitPrice;
      const brokerFeeAmount = grossRevenue * (brokerFee / 100);
      const salesTaxAmount = grossRevenue * (salesTax / 100);
      const netRevenue = grossRevenue - brokerFeeAmount - salesTaxAmount;
      const netProfit = netRevenue - totalProductionCost;
      const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      const singleRunTimeSeconds = bp.baseBuildTimeSeconds * (1 - (teLevel * 0.01)) * (1 - structureTeBonus);
      const buildTimeHours = Math.max(0.001, singleRunTimeSeconds / 3600);
      const iskPerSlotHour = buildTimeHours > 0 ? netProfit / buildTimeHours : 0;

      const avgDailyVolume = bp.category === 'Ammo' ? 5000 : bp.category === 'Drone' ? 150 : bp.category === 'T2 Module' ? 80 : 35;
      const estDailyIskPotential = avgDailyVolume * netProfit;

      return {
        id: bp.id,
        name: bp.name,
        category: bp.category,
        outputTypeId: bp.outputTypeId,
        outputName: bp.outputName,
        outputQuantity: bp.outputQuantity,
        buildCost: totalProductionCost,
        netSellRevenue: netRevenue,
        netProfit,
        marginPercent: profitMargin,
        iskPerSlotHour,
        avgDailyVolume,
        estDailyIskPotential,
        outputUnitPrice
      };
    });

    return NextResponse.json({
      hub,
      timestamp: persistentStore.timestamp,
      cached: true,
      results: scannerResults
    });
  } catch (error) {
    const fallbackResults = SAMPLE_BLUEPRINTS.map(bp => {
      const buildCost = 1000000;
      const netSellRevenue = 1500000;
      const netProfit = 500000;
      const marginPercent = 33.3;
      const iskPerSlotHour = 250000;
      const avgDailyVolume = 50;
      const estDailyIskPotential = avgDailyVolume * netProfit;
      return {
        id: bp.id,
        name: bp.name,
        category: bp.category,
        outputTypeId: bp.outputTypeId,
        outputName: bp.outputName,
        outputQuantity: bp.outputQuantity,
        buildCost,
        netSellRevenue,
        netProfit,
        marginPercent,
        iskPerSlotHour,
        avgDailyVolume,
        estDailyIskPotential,
        outputUnitPrice: 1600000
      };
    });
    return NextResponse.json({
      hub,
      timestamp: Date.now(),
      results: fallbackResults,
      fallback: true
    });
  }
}
