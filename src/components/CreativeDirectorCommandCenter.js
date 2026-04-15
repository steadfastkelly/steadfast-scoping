import React from 'react';
import useIsCompact from '../hooks/useIsCompact';
import { C } from '../theme';

function hoursPerPerson(hours, headcount) {
  if (!headcount) return 0;
  return hours / headcount;
}

function getLoadTone(hoursPerDesigner) {
  if (hoursPerDesigner >= 45) return { label: 'Overloaded', color: C.danger };
  if (hoursPerDesigner >= 32) return { label: 'Tight', color: C.gold };
  return { label: 'Healthy', color: C.green };
}

function total(items) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export default function CreativeDirectorCommandCenter({ estimate, planning, clickupSummary }) {
  const isCompact = useIsCompact();
  if (!estimate || !planning) return null;

  const designHours = Number(estimate.hoursByCategory?.design || 0);
  const strategyHours = Number(estimate.hoursByCategory?.strategy || 0);
  const contentHours = Number(estimate.hoursByCategory?.content || 0);
  const amHours = Number(estimate.hoursByCategory?.am || 0);

  const designHeadcount = Number(planning.team?.design || 0);
  const perDesignerLoad = hoursPerPerson(designHours, designHeadcount);
  const loadTone = getLoadTone(perDesignerLoad);

  const qualityRisk = [];
  if (planning.risks?.multipleStakeholders) qualityRisk.push('Stakeholder sprawl can cause contradictory feedback rounds.');
  if (planning.risks?.newClient) qualityRisk.push('New client ramp-up increases art direction ambiguity in week 1.');
  if (planning.risks?.vendorDependencies) qualityRisk.push('External handoffs may break visual consistency if guardrails are weak.');

  if (clickupSummary?.tasks_overdue > 0) {
    qualityRisk.push(`ClickUp reports ${clickupSummary.tasks_overdue} overdue tasks: protect quality by reducing parallel design streams.`);
  }

  if (!qualityRisk.length) qualityRisk.push('No major quality risk signals detected for the current scope.');

  const workloadRows = [
    { label: 'Design production', value: designHours, owner: 'Design' },
    { label: 'Strategic direction', value: strategyHours, owner: 'Creative Strategy' },
    { label: 'Content coordination', value: contentHours, owner: 'Content Design' },
    { label: 'PM + approvals overhead', value: amHours, owner: 'Design Ops' },
  ];

  const weeklyActions = [];
  if (perDesignerLoad >= 45) {
    weeklyActions.push('Rebalance: split top-priority screens across two designers by Monday.');
  }
  if (planning.risks?.multipleStakeholders) {
    weeklyActions.push('Enforce one feedback channel and one approver before next review cycle.');
  }
  if (planning.risks?.vendorDependencies) {
    weeklyActions.push('Lock design system tokens before any vendor handoff this week.');
  }
  if (clickupSummary?.tasks_overdue > 0) {
    weeklyActions.push('Run a ClickUp triage pass and close overdue tasks before accepting new design requests.');
  }
  if (!weeklyActions.length) {
    weeklyActions.push('Protect focus blocks for design production; avoid adding new review rituals.');
  }

  return (
    <section
      style={{
        marginTop: 16,
        padding: isCompact ? 14 : 18,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        background: C.card,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: isCompact ? 20 : 22 }}>Creative Director Command Center</h3>
      <p style={{ color: C.muted, marginTop: 0, marginBottom: 14, lineHeight: 1.45 }}>
        Team load, quality risk, and weekly actions for design leadership.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 12, flexDirection: isCompact ? 'column' : 'row' }}>
        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Per-designer load</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{perDesignerLoad.toFixed(1)}h</div>
          <div style={{ color: loadTone.color, fontSize: 13, fontWeight: 600 }}>{loadTone.label}</div>
        </div>

        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Design headcount</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{designHeadcount || 0}</div>
          <div style={{ color: C.muted, fontSize: 13 }}>assigned designers</div>
        </div>

        <div>
          <div style={{ color: C.muted, fontSize: 13 }}>Total scoped hours</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{estimate.totalHours.toFixed(1)}h</div>
          <div style={{ color: C.muted, fontSize: 13 }}>across design + support roles</div>
        </div>
      </div>

      <h4 style={{ margin: '10px 0 8px' }}>Workload split</h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {workloadRows.map((row) => (
          <li
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isCompact ? 'flex-start' : 'center',
              flexDirection: isCompact ? 'column' : 'row',
              gap: 6,
              padding: '8px 0',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span style={{ minWidth: 0 }}>
              <strong>{row.label}</strong>
              <span style={{ color: C.muted }}> · {row.owner}</span>
            </span>
            <span>{row.value.toFixed(1)}h</span>
          </li>
        ))}
        <li style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 8 }}>
          <strong>Total</strong>
          <strong>{total(workloadRows).toFixed(1)}h</strong>
        </li>
      </ul>

      <h4 style={{ margin: '14px 0 8px' }}>Quality risks</h4>
      <ul style={{ margin: 0, paddingLeft: 18, wordBreak: 'break-word' }}>
        {qualityRisk.map((risk) => (
          <li key={risk} style={{ marginBottom: 6 }}>
            {risk}
          </li>
        ))}
      </ul>

      <h4 style={{ margin: '14px 0 8px' }}>Creative director actions this week</h4>
      <ul style={{ margin: 0, paddingLeft: 18, wordBreak: 'break-word' }}>
        {weeklyActions.map((action) => (
          <li key={action} style={{ marginBottom: 6 }}>
            {action}
          </li>
        ))}
      </ul>
    </section>
  );
}
