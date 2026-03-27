import React from "react";

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
    <section style={{ marginTop: 24 }}>
      <h3>Clarify Before Scoping</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {questions.map((question, index) => (
          <li key={question} style={{ marginBottom: 8 }}>
            <label>
              <input type="checkbox" style={{ marginRight: 8 }} />
              {index + 1}. {question}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
