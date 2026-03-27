import React from "react";
import { C } from "../theme";

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getHealthColor(value, warningThreshold, healthyThreshold) {
  if (value >= healthyThreshold) return C.green;
  if (value >= warningThreshold) return C.gold;
  return C.danger;
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
  const capacityColor = overload ? C.danger : C.green;

  return (
    <section
      style={{
        marginTop: 16,
        padding: 18,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        background: C.card,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Profit Snapshot</h3>

      <p style={{ margin: "6px 0" }}>Revenue: {formatCurrency(revenue)}</p>
      <p style={{ margin: "6px 0" }}>Internal Cost: {formatCurrency(internalCost)}</p>
      <p style={{ margin: "8px 0", color: marginColor, fontWeight: 600 }}>
        Profit: {formatCurrency(profit)} ({formatPercent(margin)})
      </p>

      <hr style={{ borderColor: C.border, opacity: 0.7, margin: "14px 0" }} />

      <h4 style={{ margin: "6px 0 10px" }}>Capacity</h4>
      <p style={{ color: capacityColor, margin: "6px 0" }}>
        Required: {requiredDays.toFixed(1)} days | Planned: {plannedDays.toFixed(1)} days
      </p>
      {overload ? (
        <p style={{ color: C.danger, margin: "6px 0" }}>
          Risk: Over capacity by {overageDays.toFixed(1)} days (delay cost {formatCurrency(delayCost)}).
        </p>
      ) : (
        <p style={{ color: C.green, margin: "6px 0" }}>
          Healthy: Team capacity supports current timeline.
        </p>
      )}

      <p style={{ margin: "6px 0" }}>Burn Rate: {formatCurrency(burnRate)}/day</p>

      <hr style={{ borderColor: C.border, opacity: 0.7, margin: "14px 0" }} />

      <h4 style={{ margin: "6px 0 10px" }}>Risk</h4>
      <p style={{ color: riskMarginColor, margin: "6px 0", fontWeight: 600 }}>
        Risk-Adjusted Margin: {formatPercent(riskAdjustedMargin)}
      </p>

      <hr style={{ borderColor: C.border, opacity: 0.7, margin: "14px 0" }} />

      <h4 style={{ margin: "6px 0 10px" }}>Break-even</h4>
      <p style={{ margin: "6px 0" }}>{breakEvenHours.toFixed(1)} hours</p>
    </section>
  );
}
