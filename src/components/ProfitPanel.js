import React from "react";

function formatCurrency(val) {
  return `$${Math.round(val).toLocaleString()}`;
}

function getMarginColor(margin) {
  if (margin > 0.35) return "green";
  if (margin > 0.2) return "orange";
  return "red";
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
    dailyCost,
    riskAdjustedMargin,
    breakEvenHours,
  } = profitData;

  return (
    <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd" }}>
      <h3>Profit Snapshot</h3>

      <p>Revenue: {formatCurrency(revenue)}</p>
      <p>Internal Cost: {formatCurrency(internalCost)}</p>
      <p style={{ color: getMarginColor(margin) }}>
        Profit: {formatCurrency(profit)} ({(margin * 100).toFixed(1)}%)
      </p>

      <hr />

      <h4>Capacity</h4>
      <p>
        Required: {requiredDays.toFixed(1)} days | Planned: {plannedDays} days
      </p>

      {overload && (
        <p style={{ color: "red" }}>
          Over capacity by {overageDays.toFixed(1)} days
        </p>
      )}

      <p>Burn Rate: {formatCurrency(dailyCost)}/day</p>

      <hr />

      <h4>Risk Impact</h4>
      <p>
        Risk Adjusted Margin: {(riskAdjustedMargin * 100).toFixed(1)}%
      </p>

      <hr />

      <h4>Break-even</h4>
      <p>{Math.round(breakEvenHours)} hours</p>
    </div>
  );
}