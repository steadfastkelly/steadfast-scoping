import React from "react";

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getHealthColor(value, warningThreshold, healthyThreshold) {
  if (value >= healthyThreshold) return "#188038";
  if (value >= warningThreshold) return "#b06000";
  return "#b3261e";
}

export default function ProfitPanel({ profitData }) {
  if (!profitData) return null;

  const {
    revenue,
    internalCost,
    profit,
    margin,
    requiredDays,
    plannedDays,
    overload,
    overageDays,
    burnRate,
    delayCost,
    riskAdjustedMargin,
    breakEvenHours,
  } = profitData;

  const marginColor = getHealthColor(margin, 0.2, 0.35);
  const riskMarginColor = getHealthColor(riskAdjustedMargin, 0.15, 0.3);
  const capacityColor = overload ? "#b3261e" : "#188038";

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd" }}>
      <h3>Profit Snapshot</h3>

      <p>Revenue: {formatCurrency(revenue)}</p>
      <p>Internal Cost: {formatCurrency(internalCost)}</p>
      <p style={{ color: marginColor }}>
        Profit: {formatCurrency(profit)} ({formatPercent(margin)})
      </p>

      <hr />

      <h4>Capacity</h4>
      <p style={{ color: capacityColor }}>
        Required: {requiredDays.toFixed(1)} days | Planned: {plannedDays.toFixed(1)} days
      </p>
      {overload ? (
        <p style={{ color: "#b3261e" }}>
          Risk: Over capacity by {overageDays.toFixed(1)} days (delay cost {formatCurrency(delayCost)}).
        </p>
      ) : (
        <p style={{ color: "#188038" }}>Healthy: Team capacity supports current timeline.</p>
      )}

      <p>Burn Rate: {formatCurrency(burnRate)}/day</p>

      <hr />

      <h4>Risk</h4>
      <p style={{ color: riskMarginColor }}>
        Risk-Adjusted Margin: {formatPercent(riskAdjustedMargin)}
      </p>

      <hr />

      <h4>Break-even</h4>
      <p>{breakEvenHours.toFixed(1)} hours</p>
    </section>
  );
}
