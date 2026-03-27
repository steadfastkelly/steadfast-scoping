import React, { useMemo, useState } from "react";
import { calcEstimate } from "./calcEstimate";
import { calcProfitEstimate } from "./calcProfit";
import ProfitPanel from "./components/ProfitPanel";
import ClarifyingQuestions, {
  generateClarifyingQuestions,
} from "./components/ClarifyingQuestions";
import { C } from "./theme";

const SCENARIOS = {
  safe: { plannedDays: 24, hoursPerDay: 6 },
  aggressive: { plannedDays: 16, hoursPerDay: 7 },
};

function scenarioButtonStyle(active) {
  return {
    marginRight: 8,
    border: `1px solid ${active ? C.teal : C.border}`,
    background: active ? "rgba(78,205,196,0.18)" : C.inp,
    color: C.text,
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  };
}

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
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        fontFamily: 'Inter, "Segoe UI", sans-serif',
        padding: "28px 20px 40px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 36, letterSpacing: 0.2 }}>Estimator</h1>
        <p style={{ color: C.muted, marginTop: 8, marginBottom: 20 }}>
          Plan with confidence before project kickoff.
        </p>

        <section
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <strong style={{ marginRight: 8 }}>Scenario:</strong>
            <button type="button" onClick={() => setScenario("safe")} style={scenarioButtonStyle(scenario === "safe")}>
              Safe
            </button>
            <button type="button" onClick={() => setScenario("aggressive")} style={scenarioButtonStyle(scenario === "aggressive")}>
              Aggressive
            </button>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>
              <span style={{ color: C.muted }}>Total Hours:</span>{" "}
              <strong>{estimate.totalHours.toFixed(1)}</strong>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: C.muted }}>Revenue Estimate:</span>{" "}
              <strong>${Math.round(estimate.totalCost).toLocaleString()}</strong>
            </p>
          </div>
        </section>

        <ProfitPanel profitData={profitData} />
        <ClarifyingQuestions questions={questions} />
      </div>
    </div>
  );
}
