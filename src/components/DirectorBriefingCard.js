import React from 'react';
import { C } from '../theme';

function pct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function currency(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function getMarginStatus(value) {
  if (value >= 0.35) return { label: 'Healthy margin', color: C.green };
  if (value >= 0.2) return { label: 'Watch margin', color: C.gold };
  return { label: 'At risk margin', color: C.danger };
}

export default function DirectorBriefingCard({ profitData, reconciliationSummary }) {
  if (!profitData) return null;

  const marginStatus = getMarginStatus(profitData.riskAdjustedMargin);
  const matchRate = reconciliationSummary?.rowsProcessed
    ? reconciliationSummary.matchedRecords / reconciliationSummary.rowsProcessed
    : null;

  const priorities = [];
  if (profitData.overload) {
    priorities.push(`Capacity shortfall: add ${profitData.overageDays.toFixed(1)} days or reduce scope now.`);
  }

  if (profitData.riskAdjustedMargin < 0.2) {
    priorities.push('Pricing is likely too low for current delivery risk. Reprice before sign-off.');
  }

  if (matchRate !== null && matchRate < 0.8) {
    priorities.push('Financial data confidence is below 80%. Review invoice and payment mapping.');
  }

  if (priorities.length === 0) {
    priorities.push('No critical blockers detected. Move to execution with weekly margin review.');
  }

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
      <h3 style={{ marginTop: 0, marginBottom: 6 }}>Director Briefing</h3>
      <p style={{ color: C.muted, marginTop: 0, marginBottom: 14 }}>
        One-screen decision view for pricing, staffing, and delivery confidence.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Risk-adjusted margin</div>
          <div style={{ color: marginStatus.color, fontWeight: 700, fontSize: 22 }}>
            {pct(profitData.riskAdjustedMargin)}
          </div>
          <div style={{ color: marginStatus.color, fontSize: 13 }}>{marginStatus.label}</div>
        </div>

        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Projected profit</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{currency(profitData.riskAdjustedProfit)}</div>
          <div style={{ color: C.muted, fontSize: 13 }}>after risk loading</div>
        </div>

        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Capacity status</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: profitData.overload ? C.danger : C.green }}>
            {profitData.overload ? 'Overloaded' : 'On plan'}
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>
            Required {profitData.requiredDays.toFixed(1)}d / Planned {profitData.plannedDays.toFixed(1)}d
          </div>
        </div>

        {reconciliationSummary && (
          <div>
            <div style={{ color: C.muted, fontSize: 13 }}>Reconciliation confidence</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{Math.round(reconciliationSummary.confidenceScore)} / 100</div>
            <div style={{ color: C.muted, fontSize: 13 }}>
              Match rate: {pct(matchRate || 0)}
            </div>
          </div>
        )}
      </div>

      <hr style={{ borderColor: C.border, opacity: 0.7, margin: '14px 0' }} />

      <h4 style={{ margin: '0 0 8px' }}>Leadership actions this week</h4>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {priorities.map((priority) => (
          <li key={priority} style={{ marginBottom: 8 }}>
            {priority}
          </li>
        ))}
      </ul>
    </section>
  );
}
