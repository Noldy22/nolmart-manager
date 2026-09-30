// js/calculator.js - Perfume Formulation, Compounding & Costing Calculator
import { addBatch } from './db.js';

export function calculatePerfumeBatch({
  bottleSizeMl = 30,
  bottleCount = 10,
  oilPercentage = 25,
  fixativePercentage = 5,
  oilCostPerMl = 150,
  ethanolCostPerLiter = 12000,
  fixativeCostPerMl = 180,
  emptyBottleCost = 2000,
  labelCost = 250,
  packagingBagCost = 350
}) {
  const totalVolumeMl = bottleSizeMl * bottleCount;
  const ethanolPercentage = Math.max(0, 100 - oilPercentage - fixativePercentage);

  const oilVolumeMl = (totalVolumeMl * (oilPercentage / 100));
  const fixativeVolumeMl = (totalVolumeMl * (fixativePercentage / 100));
  const ethanolVolumeMl = (totalVolumeMl * (ethanolPercentage / 100));

  // Costs
  const ethanolCostPerMl = ethanolCostPerLiter / 1000;
  const totalOilCost = oilVolumeMl * oilCostPerMl;
  const totalFixativeCost = fixativeVolumeMl * fixativeCostPerMl;
  const totalEthanolCost = ethanolVolumeMl * ethanolCostPerMl;
  const totalPackagingCost = bottleCount * (emptyBottleCost + labelCost + packagingBagCost);

  const totalBatchCost = totalOilCost + totalFixativeCost + totalEthanolCost + totalPackagingCost;
  const costPerBottle = bottleCount > 0 ? (totalBatchCost / bottleCount) : 0;

  // Expected Selling Price based on size
  let defaultSellingPrice = 35000;
  if (bottleSizeMl <= 6) defaultSellingPrice = 7000;
  else if (bottleSizeMl <= 15) defaultSellingPrice = 15000;

  const totalRevenue = bottleCount * defaultSellingPrice;
  const totalNetProfit = totalRevenue - totalBatchCost;
  const profitMarginPercent = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100) : 0;

  return {
    totalVolumeMl: Math.round(totalVolumeMl * 10) / 10,
    oilVolumeMl: Math.round(oilVolumeMl * 10) / 10,
    fixativeVolumeMl: Math.round(fixativeVolumeMl * 10) / 10,
    ethanolVolumeMl: Math.round(ethanolVolumeMl * 10) / 10,
    ethanolPercentage,
    costPerBottle: Math.round(costPerBottle),
    totalBatchCost: Math.round(totalBatchCost),
    sellingPricePerBottle: defaultSellingPrice,
    totalRevenue: Math.round(totalRevenue),
    totalNetProfit: Math.round(totalNetProfit),
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10
  };
}

export async function saveFormulationBatch(batchDetails, autoUpdateInventory = true) {
  const result = await addBatch({
    ...batchDetails,
    autoUpdateInventory
  });
  return result;
}
