export function calcEstimate(inputs = {}) {
  const {
    deliverables = [],
    complexity = 1,
    hourlyRate = 150,
    revisionRounds = 1,
  } = inputs;

  const hoursByCategory = {
    design: 0,
    am: 0,
    strategy: 0,
    content: 0,
    development: 0,
  };

  deliverables.forEach((item = {}) => {
    const baseHours = Number(item.baseHours ?? 10);
    const category = item.category || "design";
    const adjustedHours = Math.max(0, baseHours) * Math.max(complexity, 0);

    if (hoursByCategory[category] === undefined) {
      hoursByCategory.design += adjustedHours;
      return;
    }

    hoursByCategory[category] += adjustedHours;
  });

  const productionHours = Object.values(hoursByCategory).reduce(
    (sum, value) => sum + value,
    0
  );

  const amOverheadHours = productionHours * 0.15;
  hoursByCategory.am += amOverheadHours;

  const revisionMultiplier = revisionRounds > 1 ? 1 + (revisionRounds - 1) * 0.1 : 1;

  Object.keys(hoursByCategory).forEach((key) => {
    hoursByCategory[key] *= revisionMultiplier;
  });

  const totalHours = Object.values(hoursByCategory).reduce(
    (sum, value) => sum + value,
    0
  );
  const totalCost = totalHours * Math.max(hourlyRate, 0);

  return {
    totalHours,
    totalCost,
    hoursByCategory,
  };
}
