import React from "react";
import { C } from "../theme";

export function generateClarifyingQuestions(inputs = {}) {
  const questions = [];

  if (inputs.contentOwnership) {
    questions.push("Who owns final content approval and sign-off?");
    questions.push("Is all core content available before design starts?");
  }

  if (inputs.stakeholders) {
    questions.push("Who is the single decision-maker for scope changes?");
    questions.push("How will feedback be consolidated into one round?");
  }

  if (inputs.regulatoryConstraints) {
    questions.push("What compliance or legal review steps affect timeline?");
  }

  if (inputs.vendorDependencies) {
    questions.push("What vendor turnaround times and handoff dates are fixed?");
  }

  if (inputs.newClient) {
    questions.push("Are brand assets, access, and approvals complete for kickoff?");
  }

  return questions;
}

export default function ClarifyingQuestions({ questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 16,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>Clarify Before Scoping</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0, marginBottom: 0 }}>
        {questions.map((question, index) => (
          <li key={question} style={{ marginBottom: 10, color: C.text }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" style={{ marginTop: 3 }} />
              <span>
                <span style={{ color: C.muted }}>{index + 1}.</span> {question}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
