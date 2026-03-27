const INTERNAL_COSTS = {
  design: 65,
  am: 55,
  strategy: 90,
  content: 50,
  development: 75,
};

export function calcProfitEstimate(estimate = {}, planning = {}) {
  const {
    team = { design: 1, am: 1 },
    hoursPerDay = 6.5,
    plannedDays = 20,
    risks = {},
  } = planning;

  const hoursByCategory = estimate.hoursByCategory || {};
  const revenue = Number(estimate.totalCost || 0);
  const totalHours = Number(estimate.totalHours || 0);

  const internalCost = Object.keys(hoursByCategory).reduce((sum, role) => {
    const hours = Number(hoursByCategory[role] || 0);
    const rate = Number(INTERNAL_COSTS[role] || 0);
    return sum + hours * rate;
  }, 0);

  const profit = revenue - internalCost;
  const margin = revenue > 0 ? profit / revenue : 0;

  const teamMembers = Object.values(team).reduce(
    (sum, count) => sum + Math.max(0, Number(count || 0)),
    0
  );

  const dailyCapacity = teamMembers * Math.max(0, Number(hoursPerDay || 0));
  const requiredDays = dailyCapacity > 0 ? totalHours / dailyCapacity : 0;
  const normalizedPlannedDays = Math.max(0, Number(plannedDays || 0));

  const overload = normalizedPlannedDays > 0 ? requiredDays > normalizedPlannedDays : requiredDays > 0;
  const overageDays = overload
    ? Math.max(0, requiredDays - normalizedPlannedDays)
    : 0;

  const burnRate = requiredDays > 0 ? internalCost / requiredDays : 0;
  const delayCost = overageDays * burnRate;

  let riskFactor = 0;
  if (risks.unclearScope) riskFactor += 0.1;
  if (risks.multipleStakeholders) riskFactor += 0.1;
  if (risks.regulatoryConstraints) riskFactor += 0.1;
  if (risks.vendorDependencies) riskFactor += 0.1;
  if (risks.newClient) riskFactor += 0.05;

  const riskAdjustedCost = internalCost * (1 + riskFactor);
  const riskAdjustedProfit = revenue - riskAdjustedCost;
  const riskAdjustedMargin = revenue > 0 ? riskAdjustedProfit / revenue : 0;

  const avgInternalRate = totalHours > 0 ? internalCost / totalHours : 0;
  const breakEvenHours = avgInternalRate > 0 ? revenue / avgInternalRate : 0;

  return {
    revenue,
    internalCost,
    profit,
    margin,
    requiredDays,
    plannedDays: normalizedPlannedDays,
    dailyCapacity,
    overload,
    overageDays,
    burnRate,
    delayCost,
    riskAdjustedProfit,
    riskAdjustedMargin,
    breakEvenHours,
  };
}
