import React, { useState } from "react";
import { calcEstimate } from "./calcEstimate";
import { calcProfitEstimate } from "./calcProfit";
import ProfitPanel from "./components/ProfitPanel";
import ClarifyingQuestions, {
  generateClarifyingQuestions,
} from "./components/ClarifyingQuestions";

export default function App() {
  const [inputs, setInputs] = useState({
    deliverables: [{ baseHours: 12 }],
    complexity: 1.2,
    hourlyRate: 150,
    revisionRounds: 2,
  });

  const [planning] = useState({
    team: { design: 1, am: 1 },
    hoursPerDay: 6.5,
    plannedDays: 20,
    risks: {
      unclearScope: true,
      multipleStakeholders: true,
    },
  });

  const estimate = calcEstimate(inputs);
  const profitData = calcProfitEstimate(estimate, planning);

  const questions = generateClarifyingQuestions({
    multipleStakeholders: true,
    newClient: true,
    hasContent: true,
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>Estimator</h1>

      <p>Total Hours: {estimate.totalHours.toFixed(1)}</p>
      <p>Total Cost: ${Math.round(estimate.totalCost)}</p>

      <ProfitPanel profitData={profitData} />

      <ClarifyingQuestions questions={questions} />
    </div>
  );
}