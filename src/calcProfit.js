const INTERNAL_COSTS = {
  design: 65,
  am: 55,
  strategy: 90,
  content: 50,
  development: 75,
};

export function calcProfitEstimate(estimate, planning) {
  const {
    team = { design: 1, am: 1 },
    hoursPerDay = 6.5,
    plannedDays = 20,
    risks = {},
  } = planning;

  const totalRevenue = estimate.totalCost;

  // Internal cost calculation
  let totalInternalCost = 0;

  Object.keys(estimate.hours).forEach((key) => {
    const hours = estimate.hours[key] || 0;
    const rate = INTERNAL_COSTS[key] || 0;
    totalInternalCost += hours * rate;
  });

  const profit = totalRevenue - totalInternalCost;
  const margin = profit / totalRevenue;

  // Capacity
  const totalTeamMembers =
    (team.design || 0) +
    (team.am || 0) +
    (team.strategy || 0) +
    (team.content || 0) +
    (team.development || 0);

  const capacityPerDay = totalTeamMembers * hoursPerDay;
  const requiredDays = estimate.totalHours / capacityPerDay;

  const overload = requiredDays > plannedDays;
  const overageDays = overload ? requiredDays - plannedDays : 0;

  const dailyCost = totalInternalCost / plannedDays;
  const delayCost = overageDays * dailyCost;

  // Risk factor
  let riskFactor = 0;

  if (risks.unclearScope) riskFactor += 0.1;
  if (risks.multipleStakeholders) riskFactor += 0.1;
  if (risks.clientDelaysLikely) riskFactor += 0.15;
  if (risks.vendorDependencies) riskFactor += 0.1;
  if (risks.newClient) riskFactor += 0.05;

  const riskAdjustedCost = totalInternalCost * (1 + riskFactor);
  const riskAdjustedProfit = totalRevenue - riskAdjustedCost;
  const riskAdjustedMargin = riskAdjustedProfit / totalRevenue;

  const avgRate = totalInternalCost / estimate.totalHours;
  const breakEvenHours = totalRevenue / avgRate;

  return {
    revenue: totalRevenue,
    internalCost: totalInternalCost,
    profit,
    margin,
    requiredDays,
    plannedDays,
    overload,
    overageDays,
    dailyCost,
    delayCost,
    riskAdjustedProfit,
    riskAdjustedMargin,
    breakEvenHours,
  };
}