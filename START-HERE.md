# How to Use These Files — Read This First

You have 9 files. Here's what they are and exactly how to use them.

---

## The Files

| File | What It Is | When to Use It |
|------|-----------|---------------|
| `00-FOUNDATION.md` | Constants, tokens, schema, rates — the shared reference | **Every time.** Always include this alongside whichever phase you're on. |
| `01-PHASE-SCAFFOLD.md` | Phase 1: Empty app that launches and navigates | Start here. |
| `02-PHASE-DATA-IMPORT.md` | Phase 2: Upload Excel + CSV files into the database | After Phase 1 passes. |
| `03-PHASE-RECONCILIATION.md` | Phase 3: Match payments to invoices automatically | After Phase 2 passes. |
| `04-PHASE-PROJECTS-PROFITABILITY.md` | Phase 4: Group data into projects, calculate profit | After Phase 3 passes. |
| `05-PHASE-DASHBOARD.md` | Phase 5: Firm-wide profitability overview with charts | After Phase 4 passes. |
| `06-PHASE-AI-FORECASTING.md` | Phase 6: The core feature — notes → comparable projects → forecast | After Phase 5 passes. |
| `07-PHASE-SETTINGS-POLISH.md` | Phase 7: Settings, error handling, edge cases | After Phase 6 passes. |
| `08-PHASE-PACKAGE-SHIP.md` | Phase 8: Package as a .dmg installer for macOS | After Phase 7 passes. |

---

## Step-by-Step Process

### For each phase, do this:

1. **Give Codex (or Claude Code) exactly 2 files:**
   - `00-FOUNDATION.md` (always)
   - The current phase file (e.g., `01-PHASE-SCAFFOLD.md`)

2. **Use this prompt:**
   > "Build Phase [N] of this plan. Follow the instructions exactly. Use the design tokens and schema from the Foundation document. Stop after the verification checklist and tell me how to verify each item."

3. **When Codex says it's done, run through the verification checklist** at the bottom of the phase file. Every item has a checkbox.

4. **If something fails:**
   - Copy the exact error message
   - Paste it back to Codex with: "This verification check failed: [describe which one]. Here is the error: [paste error]. Fix this without changing anything else."

5. **When ALL checks pass:**
   - Tell Codex: "Phase [N] is verified. Stop here."
   - Move to the next phase. Give Codex the Foundation + the next phase file.

6. **Never give Codex a future phase file.** It doesn't need to know what's coming. This prevents it from making premature decisions or over-engineering.

---

## Important Rules

**DO NOT:**
- Give all phase files at once
- Skip phases
- Let Codex "refactor" or "improve" the architecture from the Foundation doc
- Let Codex install different packages than what's specified
- Approve changes you don't understand — ask Codex to explain first

**DO:**
- Run every verification check before moving on
- Keep the Foundation file attached to every phase
- Save working snapshots after each phase (copy the project folder)
- Ask Codex to explain anything you don't understand before it runs

---

## Before You Start

You need these things on your Mac:

1. **Terminal** — already installed (Applications → Utilities → Terminal)
2. **Node.js** — download from https://nodejs.org (LTS version)
3. **Git** — comes with macOS, or install via Xcode Command Line Tools: `xcode-select --install`
4. **Python 3.11+** — download from https://python.org (for development; the final app won't need it)
5. **Ollama** — download from https://ollama.ai (needed for Phase 6+)

If you're using Codex in a cloud environment, it handles Node.js and Python itself. You only need Ollama locally for testing Phase 6+.

---

## Your Data Files (Have These Ready)

- Invoice Excel sheets (.xlsx) — the files that match your "Invoice Details" PDF structure
- Payment Excel sheets (.xlsx) — the files that match your "Payments Received" PDF structure  
- Timely CSV exports (.csv) — time entries with user, project, hours, date columns

You'll need these starting in Phase 2.
