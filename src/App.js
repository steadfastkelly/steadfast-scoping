import React, { useMemo, useState } from "react";
import { calcEstimate } from "./calcEstimate";
import { calcProfitEstimate } from "./calcProfit";
import ProfitPanel from "./components/ProfitPanel";
import ClarifyingQuestions, {
  generateClarifyingQuestions,
} from "./components/ClarifyingQuestions";

const SCENARIOS = {
  safe: { plannedDays: 24, hoursPerDay: 6 },
  aggressive: { plannedDays: 16, hoursPerDay: 7 },
};

export default function App() {
  const [scenario, setScenario] = useState("safe");

  const [inputs] = useState({
    deliverables: [
      { category: "strategy", baseHours: 10 },
      { category: "design", baseHours: 24 },
      { category: "content", baseHours: 16 },
      { category: "development", baseHours: 18 },
    ],
    complexity: 1.15,
    hourlyRate: 160,
    revisionRounds: 2,
  });

  const [planningBase] = useState({
    team: { strategy: 1, design: 2, content: 1, development: 1, am: 1 },
    plannedDays: 20,
    hoursPerDay: 6.5,
    risks: {
      unclearScope: true,
      multipleStakeholders: true,
      regulatoryConstraints: false,
      vendorDependencies: true,
      newClient: true,
    },
  });

  const planning = useMemo(() => {
    const profile = SCENARIOS[scenario] || SCENARIOS.safe;
    return {
      ...planningBase,
      plannedDays: profile.plannedDays,
      hoursPerDay: profile.hoursPerDay,
    };
  }, [planningBase, scenario]);

  const estimate = calcEstimate(inputs);
  const profitData = calcProfitEstimate(estimate, planning);

  const questions = generateClarifyingQuestions({
    contentOwnership: true,
    stakeholders: planning.risks.multipleStakeholders,
    regulatoryConstraints: planning.risks.regulatoryConstraints,
    vendorDependencies: planning.risks.vendorDependencies,
    newClient: planning.risks.newClient,
  });

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 900 }}>
      <h1>Estimator</h1>
      <p>Plan with confidence before project kickoff.</p>

      <div style={{ marginBottom: 16 }}>
        <strong>Scenario:</strong>{" "}
        <button
          type="button"
          onClick={() => setScenario("safe")}
          style={{
            marginRight: 8,
            backgroundColor: scenario === "safe" ? "#d9f2df" : "#fff",
          }}
        >
          Safe
        </button>
        <button
          type="button"
          onClick={() => setScenario("aggressive")}
          style={{ backgroundColor: scenario === "aggressive" ? "#ffe9cc" : "#fff" }}
        >
          Aggressive
        </button>
      </div>

      <p>Total Hours: {estimate.totalHours.toFixed(1)}</p>
      <p>Revenue Estimate: ${Math.round(estimate.totalCost).toLocaleString()}</p>

      <ProfitPanel profitData={profitData} />
      <ClarifyingQuestions questions={questions} />
    </div>
  );
}
