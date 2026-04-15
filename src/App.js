import React, { useMemo, useState } from 'react';
import { calcEstimate } from './calcEstimate';
import ClarifyingQuestions, {
  generateClarifyingQuestions,
} from './components/ClarifyingQuestions';
import CreativeDirectorCommandCenter from './components/CreativeDirectorCommandCenter';
import ClickUpWorkloadCard from './components/ClickUpWorkloadCard';
import useIsCompact from './hooks/useIsCompact';
import { C } from './theme';

const SPRINT_MODES = {
  balanced: { plannedDays: 20, hoursPerDay: 6.5 },
  launch: { plannedDays: 14, hoursPerDay: 7.0 },
};

function modeButtonStyle(active, isCompact) {
  return {
    marginRight: isCompact ? 0 : 8,
    border: `1px solid ${active ? C.teal : C.border}`,
    background: active ? 'rgba(78,205,196,0.18)' : C.inp,
    color: C.text,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    width: isCompact ? '100%' : 'auto',
    textAlign: 'center',
  };
}

export default function App() {
  const isCompact = useIsCompact();
  const [mode, setMode] = useState('balanced');
  const [clickupSummary, setClickupSummary] = useState(null);

  const [inputs] = useState({
    deliverables: [
      { category: 'strategy', baseHours: 8 },
      { category: 'design', baseHours: 34 },
      { category: 'content', baseHours: 14 },
      { category: 'development', baseHours: 10 },
    ],
    complexity: 1.1,
    hourlyRate: 160,
    revisionRounds: 2,
  });

  const [planningBase] = useState({
    team: { strategy: 1, design: 2, content: 1, development: 1, am: 1 },
    plannedDays: 20,
    hoursPerDay: 6.5,
    risks: {
      unclearScope: false,
      multipleStakeholders: true,
      regulatoryConstraints: false,
      vendorDependencies: true,
      newClient: true,
    },
  });

  const planning = useMemo(() => {
    const profile = SPRINT_MODES[mode] || SPRINT_MODES.balanced;
    return {
      ...planningBase,
      plannedDays: profile.plannedDays,
      hoursPerDay: profile.hoursPerDay,
    };
  }, [planningBase, mode]);

  const estimate = calcEstimate(inputs);

  const questions = generateClarifyingQuestions({
    stakeholders: planning.risks.multipleStakeholders,
    vendorDependencies: planning.risks.vendorDependencies,
    newClient: planning.risks.newClient,
    tightTimeline: mode === 'launch',
  });

  return (
    <div
      style={{
        background: C.bg,
        minHeight: '100vh',
        color: C.text,
        fontFamily: 'Inter, "Segoe UI", sans-serif',
        padding: isCompact ? '16px 12px 28px' : '28px 20px 40px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: isCompact ? 28 : 36, letterSpacing: 0.2, lineHeight: 1.15 }}>
          Creative Director Hub
        </h1>
        <p style={{ color: C.muted, marginTop: 8, marginBottom: 20, lineHeight: 1.45 }}>
          Keep the design team focused, aligned, and shipping at quality under real agency pressure.
        </p>

        <section
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: isCompact ? 14 : 18,
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <strong style={{ marginRight: 8, display: 'block', marginBottom: 8 }}>Sprint mode:</strong>
            <div style={{ display: 'flex', gap: 8, flexDirection: isCompact ? 'column' : 'row' }}>
              <button type="button" onClick={() => setMode('balanced')} style={modeButtonStyle(mode === 'balanced', isCompact)}>
                Balanced Delivery
              </button>
              <button type="button" onClick={() => setMode('launch')} style={modeButtonStyle(mode === 'launch', isCompact)}>
                Launch Push
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexDirection: isCompact ? 'column' : 'row' }}>
            <p style={{ margin: 0 }}>
              <span style={{ color: C.muted }}>Total scoped effort:</span>{' '}
              <strong>{estimate.totalHours.toFixed(1)} hours</strong>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: C.muted }}>Planned sprint length:</span>{' '}
              <strong>{planning.plannedDays} days</strong>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: C.muted }}>Review intensity:</span>{' '}
              <strong>{inputs.revisionRounds} rounds</strong>
            </p>
          </div>
        </section>

        <ClickUpWorkloadCard onSummaryLoaded={setClickupSummary} />
        <CreativeDirectorCommandCenter
          estimate={estimate}
          planning={planning}
          clickupSummary={clickupSummary}
        />
        <ClarifyingQuestions questions={questions} />
      </div>
    </div>
  );
}
