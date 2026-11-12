'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_BLUEPRINTS } from '@/data/blueprints';
import { TRADE_HUBS, DEFAULT_HUB_ID } from '@/data/hubs';
import { Calculator, TrendingUp, DollarSign, Clock, RefreshCw, Layers, Settings } from 'lucide-react';
import { Header } from '@/components/Header';
import { BlueprintSelector } from '@/components/BlueprintSelector';
import { IndustryParameters } from '@/components/IndustryParameters';
import { Dashboard } from '@/components/Dashboard';
import { MaterialTable } from '@/components/MaterialTable';

export default function Home() {
  const [selectedBpId, setSelectedBpId] = useState<string>(SAMPLE_BLUEPRINTS[0].id);
  const currentBp = SAMPLE_BLUEPRINTS.find(b => b.id === selectedBpId) || SAMPLE_BLUEPRINTS[0];

  const [meLevel, setMeLevel] = useState<number>(10);
  const [teLevel, setTeLevel] = useState<number>(20);
  const [structureMeBonus, setStructureMeBonus] = useState<number>(0.01);
  const [structureTeBonus, setStructureTeBonus] = useState<number>(0.20);
  const [systemCostIndex, setSystemCostIndex] = useState<number>(4.5);
  const [facilityTax, setFacilityTax] = useState<number>(1.0);
  const [brokerFee, setBrokerFee] = useState<number>(3.0);
  const [salesTax, setSalesTax] = useState<number>(3.6);
  const [sccSurcharge] = useState<number>(4.0);
  const [runs, setRuns] = useState<number>(10);
  const [pricingMode, setPricingMode] = useState<'buy' | 'sell'>('buy');

  const [buyHub, setBuyHub] = useState<string>(DEFAULT_HUB_ID);
  const [sellHub, setSellHub] = useState<string>(DEFAULT_HUB_ID);

  const [buyHubPrices, setBuyHubPrices] = useState<Record<number, { buy: number; sell: number }>>({});
  const [sellHubPrices, setSellHubPrices] = useState<Record<number, { buy: number; sell: number }>>({});
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);
  const [priceTimestamp, setPriceTimestamp] = useState<number | null>(null);

  const fetchMarketPrices = async () => {
    setLoadingPrices(true);
    try {
      const typeIds = currentBp.materials.map(m => m.typeId).concat([currentBp.outputTypeId]);
      const res = await fetch(`/api/market?buyHub=${buyHub}&sellHub=${sellHub}&type_ids=${typeIds.join(',')}`);
      const data = await res.json();
      if (data) {
        if (data.buyHubPrices) setBuyHubPrices(data.buyHubPrices);
        if (data.sellHubPrices) setSellHubPrices(data.sellHubPrices);
        if (data.prices && !data.buyHubPrices) setBuyHubPrices(data.prices);
        setPriceTimestamp(data.timestamp || Date.now());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
  }, [selectedBpId, buyHub, sellHub]);

  const calculation = useMemo(() => {
    let totalMaterialCost = 0;
    const materialBreakdown = currentBp.materials.map(mat => {
      const meBonusRate = meLevel * 0.01;
      const rawPerRun = mat.quantity * (1 - meBonusRate) * (1 - structureMeBonus);
      const perRunQty = Math.max(1, Math.ceil(rawPerRun));
      const totalQty = perRunQty * runs;
      const unitPrice = buyHubPrices[mat.typeId]?.[pricingMode] || 100;
      const totalCost = totalQty * unitPrice;
      totalMaterialCost += totalCost;
      return { ...mat, perRunQty, totalQty, unitPrice, totalCost };
    });

    const estimatedBaseMaterialValue = currentBp.materials.reduce((acc, mat) => {
      const sellPrice = buyHubPrices[mat.typeId]?.sell || 100;
      return acc + (mat.quantity * runs * sellPrice);
    }, 0);

    const jobCost = estimatedBaseMaterialValue * (systemCostIndex / 100);
    const sccFee = jobCost * (sccSurcharge / 100);
    const taxFee = jobCost * (facilityTax / 100);
    const totalManufacturingFees = jobCost + sccFee + taxFee;
    const totalProductionCost = totalMaterialCost + totalManufacturingFees;

    const outputUnitPrice = sellHubPrices[currentBp.outputTypeId]?.sell || sellHubPrices[currentBp.outputTypeId]?.buy || 1000;
    const totalUnits = currentBp.outputQuantity * runs;
    const grossRevenue = totalUnits * outputUnitPrice;
    const brokerFeeAmount = grossRevenue * (brokerFee / 100);
    const salesTaxAmount = (grossRevenue - brokerFeeAmount) * (salesTax / 100);
    const netRevenue = grossRevenue - brokerFeeAmount - salesTaxAmount;
    const netProfit = netRevenue - totalProductionCost;
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    const teBonusRate = teLevel * 0.01;
    const singleRunTimeSeconds = currentBp.baseBuildTimeSeconds * (1 - teBonusRate) * (1 - structureTeBonus);
    const totalBuildTimeHours = Math.max(1, singleRunTimeSeconds * runs) / 3600;
    const iskPerHour = totalBuildTimeHours > 0 ? netProfit / totalBuildTimeHours : 0;

    return {
      materialBreakdown, totalMaterialCost, jobCost, sccFee, taxFee,
      totalManufacturingFees, totalProductionCost, grossRevenue,
      brokerFeeAmount, salesTaxAmount, netRevenue, netProfit, profitMargin,
      totalUnits, outputUnitPrice, totalBuildTimeHours, iskPerHour
    };
  }, [currentBp, meLevel, teLevel, structureMeBonus, structureTeBonus, systemCostIndex, facilityTax, brokerFee, salesTax, sccSurcharge, runs, pricingMode, buyHubPrices, sellHubPrices]);

  const formatIsk = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);

  return (
    <div className="min-h-screen bg-eve-dark">
      <Header
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
        buyHub={buyHub}
        setBuyHub={setBuyHub}
        sellHub={sellHub}
        setSellHub={setSellHub}
        fetchMarketPrices={fetchMarketPrices}
        loadingPrices={loadingPrices}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <BlueprintSelector
              selectedBpId={selectedBpId}
              setSelectedBpId={setSelectedBpId}
              currentBp={currentBp}
            />
            <IndustryParameters
              meLevel={meLevel}
              setMeLevel={setMeLevel}
              teLevel={teLevel}
              setTeLevel={setTeLevel}
              structureMeBonus={structureMeBonus}
              setStructureMeBonus={setStructureMeBonus}
              structureTeBonus={structureTeBonus}
              setStructureTeBonus={setStructureTeBonus}
              runs={runs}
              setRuns={setRuns}
              systemCostIndex={systemCostIndex}
              setSystemCostIndex={setSystemCostIndex}
              facilityTax={facilityTax}
              setFacilityTax={setFacilityTax}
              brokerFee={brokerFee}
              setBrokerFee={setBrokerFee}
              salesTax={salesTax}
              setSalesTax={setSalesTax}
            />
          </aside>

          <section className="lg:col-span-3 space-y-6">
            <Dashboard
              calculation={calculation}
              formatIsk={formatIsk}
              sccSurcharge={sccSurcharge}
              facilityTax={facilityTax}
              brokerFee={brokerFee}
              salesTax={salesTax}
              pricingMode={pricingMode}
              currentBp={currentBp}
              buyHub={buyHub}
              sellHub={sellHub}
            />

            <MaterialTable
              calculation={calculation}
              runs={runs}
              pricingMode={pricingMode}
              formatIsk={formatIsk}
              buyHub={buyHub}
            />

            {priceTimestamp && (
              <div className="text-xs text-slate-500 text-center py-2">
                Market prices updated: {new Date(priceTimestamp).toLocaleString()}
                {loadingPrices && <span className="ml-2 text-amber-400">(updating...)</span>}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
