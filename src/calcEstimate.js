export function calcEstimate(inputs) {
  const {
    deliverables = [],
    complexity = 1,
    hourlyRate = 150,
    revisionRounds = 2,
  } = inputs;

  let totalHours = 0;
  const hoursByCategory = {
    design: 0,
    am: 0,
    strategy: 0,
    content: 0,
    development: 0,
  };

  deliverables.forEach((item) => {
    const base = item.baseHours || 10;
    const adjusted = base * complexity;

    hoursByCategory.design += adjusted;
    totalHours += adjusted;
  });

  // Add AM overhead (15%)
  const amHours = totalHours * 0.15;
  hoursByCategory.am += amHours;
  totalHours += amHours;

  // Add revisions (10% per round after 1)
  if (revisionRounds > 1) {
    const revisionMultiplier = 1 + (revisionRounds - 1) * 0.1;
    totalHours *= revisionMultiplier;
    hoursByCategory.design *= revisionMultiplier;
    hoursByCategory.am *= revisionMultiplier;
  }

  const totalCost = totalHours * hourlyRate;

  return {
    totalHours,
    totalCost,
    hours: hoursByCategory,
  };
}