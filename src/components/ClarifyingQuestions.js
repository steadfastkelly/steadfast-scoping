import React from "react";

export function generateClarifyingQuestions(inputs) {
  const questions = [];

  if (inputs.hasContent) {
    questions.push("Who owns final copy approval?");
    questions.push("Is all content finalized before design begins?");
  }

  if (inputs.regulated) {
    questions.push("What is the MLR review timeline?");
    questions.push("Can feedback be consolidated?");
  }

  if (inputs.multipleStakeholders) {
    questions.push("Who is the single decision-maker?");
  }

  if (inputs.vendorDependencies) {
    questions.push("What are vendor turnaround times?");
  }

  if (inputs.newClient) {
    questions.push("Are brand assets complete and approved?");
  }

  if (inputs.customGraphics) {
    questions.push("How many infographics are required?");
  }

  return questions;
}

export default function ClarifyingQuestions({ questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Clarify Before Scoping</h3>
      <ul>
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}