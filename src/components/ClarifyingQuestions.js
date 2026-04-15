import React from 'react';
import useIsCompact from '../hooks/useIsCompact';
import { C } from '../theme';

export function generateClarifyingQuestions(inputs = {}) {
  const questions = [];

  questions.push('Is there one named creative approver for final visual sign-off?');
  questions.push('What is the non-negotiable quality bar for this deliverable set?');

  if (inputs.stakeholders) {
    questions.push('How will design feedback be merged into one consolidated round per cycle?');
  }

  if (inputs.vendorDependencies) {
    questions.push('Which design tokens/components must vendors use without alteration?');
  }

  if (inputs.newClient) {
    questions.push('Has the client approved mood/style direction before production starts?');
  }

  if (inputs.tightTimeline) {
    questions.push('Which screens/assets are quality-critical vs. safe to simplify this sprint?');
  }

  return questions;
}

export default function ClarifyingQuestions({ questions }) {
  const isCompact = useIsCompact();
  if (!questions || questions.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 16,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: isCompact ? 14 : 18,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isCompact ? 20 : 22 }}>Creative Alignment Checklist</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 0 }}>
        {questions.map((question, index) => (
          <li key={question} style={{ marginBottom: 10, color: C.text }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', minWidth: 0 }}>
              <input type="checkbox" style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ wordBreak: 'break-word' }}>
                <span style={{ color: C.muted }}>{index + 1}.</span> {question}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
