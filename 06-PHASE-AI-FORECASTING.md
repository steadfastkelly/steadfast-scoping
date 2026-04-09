# Phase 6: AI + Forecasting

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 5 verified and passing. Ollama installed on the machine with `llama3.1:8b` model pulled.

**Goal:** User pastes or uploads meeting notes → local AI extracts project characteristics → app finds comparable past projects with 1-5 similarity scores → generates three forecast scenarios with hours, cost, and margin → flags risks from past project overages. This is the core feature of the entire app.

**Estimated effort:** 3 days

---

## Step-by-Step Instructions

### 6.1 Build the Ollama client

Create `python/ai/ollama_client.py`:

```python
import httpx
import json

OLLAMA_URL = "http://localhost:11434"

def check_ollama_health() -> dict:
    """Check if Ollama is running and the model is available."""
    try:
        response = httpx.get(f"{OLLAMA_URL}/api/tags", timeout=5.0)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m["name"] for m in models]
            has_model = any("llama3.1" in name for name in model_names)
            return {
                "online": True,
                "models": model_names,
                "ready": has_model,
                "message": "Ready" if has_model else "Model llama3.1:8b not found. Run: ollama pull llama3.1:8b"
            }
        return {"online": False, "ready": False, "message": "Ollama returned unexpected status"}
    except httpx.ConnectError:
        return {"online": False, "ready": False, "message": "Ollama is not running. Open the Ollama app or run: ollama serve"}
    except Exception as e:
        return {"online": False, "ready": False, "message": str(e)}


def generate(prompt: str, temperature: float = 0.1) -> str:
    """Send a prompt to Ollama and return the response text."""
    response = httpx.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": "llama3.1:8b",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 2000
            }
        },
        timeout=120.0
    )
    result = response.json()
    return result.get("response", "")


def parse_json_response(text: str) -> dict:
    """Extract JSON from model response, handling markdown fences."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    return json.loads(text)
```

### 6.2 Build the note parsing prompt

Create `python/ai/prompts.py`:

```python
NOTES_PARSING_PROMPT = """You are a project scoping assistant for Steadfast Design Firm, a healthcare-focused design agency.

Read the following raw meeting notes and extract structured project information.

MEETING NOTES:
---
{notes_text}
---

Extract the following as a JSON object. Use null for anything not clearly stated or implied in the notes. Do not guess — only extract what the notes actually say or strongly imply.

{{
  "client_name": "string or null",
  "client_industry": "pharma" | "medtech" | "ophthalmology" | "non_healthcare" | null,
  "project_types": ["list of types from: sales_aid, whitepaper, website, brand_identity, presentation, email, social_media, one_pager, brochure, product_label, exhibition_booth, ad_campaign, video_animation, powerpoint_template"],
  "deliverables": [
    {{
      "type": "one of the project_types above",
      "quantity": "number or null",
      "page_count": "number or null (for multi-page deliverables)",
      "description": "brief description of what this deliverable is"
    }}
  ],
  "content_situation": "client_provides" | "refinement" | "strategy_creation" | null,
  "brand_situation": "template_exists" | "brand_aligned_custom" | "bespoke" | null,
  "has_regulatory_review": true | false | null,
  "estimated_timeline_weeks": "number or null",
  "stakeholder_count": "number or null",
  "is_rush": true | false | null,
  "is_new_client": true | false | null,
  "budget_mentioned": "number or null (dollar amount if mentioned)",
  "additional_context": "one sentence summarizing anything else relevant to scoping"
}}

Return ONLY the JSON object. No explanation, no preamble, no markdown formatting."""


PROJECT_COMPARISON_PROMPT = """You are analyzing project similarity for a design agency.

Given this NEW project description:
{new_project_json}

And this PAST project with actual results:
Client: {past_client}
Type: {past_type}
Industry: {past_industry}
Design Level: {past_level}
Revenue: ${past_revenue}
Cost: ${past_cost}
Margin: {past_margin}%
Hours breakdown: {past_hours_json}
Duration: {past_duration}

Rate the similarity on a scale of 1-5 and explain why.

Return JSON:
{{
  "score": 1-5,
  "reasons": ["list of 2-4 specific reasons for the score"],
  "key_differences": ["list of 1-3 important differences"],
  "risk_note": "one sentence about what to watch out for based on this past project, or null"
}}

Return ONLY JSON."""
```

### 6.3 Build the notes parser

Create `python/ingestion/notes_parser.py`:

**Function: `extract_text_from_file(file_path: str) -> str`**

Handles three file types:
- `.txt`: read as UTF-8 text
- `.docx`: use `python-docx` to extract all paragraph text
- `.pdf`: use `pdfplumber` to extract text from all pages

Returns the extracted text as a single string.

**Function: `parse_meeting_notes(text: str) -> dict`**

1. Call `ollama_client.generate()` with the `NOTES_PARSING_PROMPT`
2. Parse the JSON response with `parse_json_response()`
3. Validate the response: ensure required fields are present, types are correct
4. If the AI returned invalid JSON, retry once with a simpler prompt
5. Return the parsed characteristics dict

### 6.4 Build the project matcher

Create `python/forecast/project_matcher.py`:

**Function: `find_comparable_projects(characteristics: dict) -> list`**

1. Load all completed projects from the database (with profitability data)
2. For each past project, calculate a raw similarity score across 5 axes:

**Axis 1: Project type match (weight: 30%)**
- Exact type match: 1.0
- Same category (e.g., both are collateral, both are digital): 0.5
- No match: 0.0
- If the new project has multiple types, score against the best-matching type

Category groupings:
- Collateral: sales_aid, whitepaper, one_pager, brochure
- Digital: website, email, social_media
- Brand: brand_identity, powerpoint_template, product_label
- Campaign: ad_campaign, exhibition_booth, video_animation, presentation

**Axis 2: Client industry match (weight: 15%)**
- Exact industry: 1.0
- Same regulatory class (pharma+medtech+ophthalmology are all "regulated"): 0.5
- No match: 0.0

**Axis 3: Deliverable format match (weight: 20%)**
- Count of overlapping deliverable types between new and past project
- Score = overlap_count / max(new_deliverable_count, past_deliverable_count)

**Axis 4: Estimated scope similarity (weight: 20%)**
- Compare estimated total hours (from new project characteristics applied to Steadfast hour ranges) to past project's actual total hours
- If within 20%: 1.0
- If within 50%: 0.5
- Beyond 50%: 0.0

**Axis 5: Complexity level proximity (weight: 15%)**
- Derive the expected design level from the new project's content_situation × brand_situation using the two-axis matrix:

|  | template_exists | brand_aligned_custom | bespoke |
|--|----------------|---------------------|---------|
| client_provides | L1 | L1-L2 | L2 |
| refinement | L1-L2 | L2 | L2-L3 |
| strategy_creation | L2 | L2-L3 | L3 |

- Same level: 1.0, ±1 level: 0.5, ±2 levels: 0.0

3. Calculate weighted score: sum of (axis_score × weight) → produces 0.0 to 1.0
4. Map to 1-5 scale:
   - 0.9–1.0 → 5 (near-exact match)
   - 0.7–0.89 → 4 (strong match)
   - 0.5–0.69 → 3 (moderate match)
   - 0.3–0.49 → 2 (weak match)
   - Below 0.3 → 1 (poor match)

5. Sort by score descending, return top 5

6. For top 3 comparable projects, optionally run the `PROJECT_COMPARISON_PROMPT` through Ollama for richer AI-generated reasoning (this is slower, so make it optional — the algorithmic scoring above is the primary system)

Return:
```python
[
    {
        "project_id": int,
        "project_name": str,
        "client_name": str,
        "similarity_score": int,  # 1-5
        "raw_score": float,  # 0.0-1.0
        "match_reasons": ["Same project type (sales_aid)", "Same industry (pharma)", ...],
        "key_differences": ["Past project was L2, new appears to be L3", ...],
        "past_margin": float,
        "past_revenue": float,
        "past_cost": float,
        "past_hours": {"strategy": float, "design": float, ...},
        "went_over_scope": bool,
        "risk_note": str or None
    },
    ...
]
```

### 6.5 Build the scenario builder

Create `python/forecast/scenario_builder.py`:

**Function: `build_scenarios(characteristics: dict, comparables: list) -> dict`**

Uses Steadfast's format-specific hour ranges (from the quoting skill) combined with what comparable projects actually took.

**Step 1: Estimate hours from characteristics using Steadfast benchmarks**

For each deliverable in `characteristics["deliverables"]`, look up the hour range from these benchmarks:

```python
HOUR_RANGES = {
    "social_media": {"L1": 0.5, "L2": 1.0, "L3": 1.5, "unit": "per_graphic"},
    "sales_aid": {"L1": 2.0, "L2": 4.0, "L3": 6.0, "unit": "per_page", "min_floor": 8},
    "whitepaper": {"L1": 3.0, "L2": 5.0, "L3": 8.0, "unit": "per_page", "min_floor": 20},
    "presentation": {"L1": 0.5, "L2": 1.0, "L3": 1.5, "unit": "per_slide"},
    "powerpoint_template": {"L1": 8, "L2": 16, "L3": 28, "unit": "flat"},
    "email": {"L1": 2, "L2": 4, "L3": 7, "unit": "per_template"},
    "website_homepage": {"L1": 40, "L2": 60, "L3": 80, "unit": "flat"},
    "website_secondary": {"L1": 6, "L2": 12, "L3": 20, "unit": "per_page"},
    "one_pager": {"L1": 4, "L2": 8, "L3": 12, "unit": "per_piece"},
    "brochure": {"L1": 2, "L2": 4, "L3": 6, "unit": "per_page", "min_floor": 12},
    "product_label": {"L1": 4, "L2": 8, "L3": 14, "unit": "per_face"},
    "exhibition_booth": {"L1": 12, "L2": 20, "L3": 32, "unit": "flat"},
    "brand_identity": {"L1": 52, "L2": 100, "L3": 168, "unit": "flat"},
    "ad_campaign": {"L1": 17, "L2": 34, "L3": 59, "unit": "flat"},
}
```

Determine the design level from the two-axis matrix (content_situation × brand_situation).
Multiply by quantity/page count from the characteristics.

**Step 2: Adjust using comparable data**

For each role, look at what comparable projects actually spent:
- Calculate the average actual hours per role across top 3 comparables
- If the benchmark estimate is more than 30% lower than comparable average, increase to the comparable average
- If the benchmark estimate is more than 30% higher, keep the benchmark (don't reduce — under-promise)

**Step 3: Apply content and strategy hours**

Based on `content_situation`:
- `client_provides`: 0 content hours, 0 strategy hours
- `refinement`: content hours = 15% of design hours, 0 strategy hours
- `strategy_creation`: content hours = 25% of design hours, strategy hours = 20% of design hours

**Step 4: Calculate AM hours**

Use the AM Hours Scale from the Foundation doc. Apply modifiers if characteristics indicate new client, large committee, regulatory review, or rush.

**Step 5: Build three scenarios**

```python
def build_three(base_design_hours, base_other_hours, rates):
    scenarios = {}

    # Best case: tight, efficient
    best = {
        "strategy_hours": base_other_hours["strategy"] * 0.85,
        "design_hours": base_design_hours * 0.85,
        "development_hours": base_other_hours["development"] * 0.85,
        "content_hours": base_other_hours["content"] * 0.85,
        "am_hours": base_other_hours["am"],  # AM doesn't shrink
    }

    # Suggested: standard
    suggested = {
        "strategy_hours": base_other_hours["strategy"],
        "design_hours": base_design_hours,
        "development_hours": base_other_hours["development"],
        "content_hours": base_other_hours["content"],
        "am_hours": base_other_hours["am"],
    }

    # Worst case: buffer for overruns
    worst = {
        "strategy_hours": base_other_hours["strategy"] * 1.25,
        "design_hours": base_design_hours * 1.25,
        "development_hours": base_other_hours["development"] * 1.25,
        "content_hours": base_other_hours["content"] * 1.15,
        "am_hours": base_other_hours["am"] * 1.15,
    }

    for name, hours in [("best_case", best), ("suggested", suggested), ("worst_case", worst)]:
        total_hours = sum(hours.values())
        total_cost = sum(hours[role] * rates[role.replace("_hours", "")] for role in hours)
        recommended_price = total_cost / (1 - 0.35)  # target 35% margin
        projected_margin = (recommended_price - total_cost) / recommended_price

        scenarios[name] = {
            **hours,
            "total_hours": round(total_hours, 1),
            "total_cost": round(total_cost, 2),
            "recommended_price": round(recommended_price, 2),
            "projected_margin": round(projected_margin, 4),
        }

    return scenarios
```

**Step 6: Add assumptions text to each scenario**

- Best Case: "Uninterrupted focus, client responds in 24-48hrs, no direction changes. Design hours assume [L-level] complexity with [content_situation] content."
- Suggested: "Standard workload, feedback in 3-5 days, one minor content adjustment. This is the recommended scope for the SOW."
- Worst Case: "Meetings and side projects, delayed feedback, one significant direction change. Includes [X]% buffer over suggested."

### 6.6 Build the risk flagger

Create `python/forecast/risk_flagger.py`:

**Function: `generate_risk_flags(characteristics: dict, comparables: list) -> list`**

Check each condition and generate a flag if it applies:

```python
flags = []

# 1. Past projects went over scope
over_scope = [c for c in comparables if c["went_over_scope"]]
if len(over_scope) >= 2:
    avg_overage = avg of overage percentages
    flags.append({
        "severity": "high",
        "message": f"Similar projects averaged {avg_overage:.0f}% over scope",
        "detail": f"Based on {len(over_scope)} comparable projects",
        "source_projects": [c["project_name"] for c in over_scope]
    })

# 2. Specific role underestimated
for role in ["design", "strategy", "development", "content", "am"]:
    over_in_role = [c for c in comparables if role hours > expected for that project type]
    if len(over_in_role) >= 2:
        flags.append({
            "severity": "medium",
            "message": f"{role.title()} hours were consistently underestimated in similar projects",
            "detail": f"Average {role} overage: {avg}%",
            "source_projects": [c["project_name"] for c in over_in_role]
        })

# 3. Regulatory review
if characteristics.get("has_regulatory_review") or characteristics.get("client_industry") in ["pharma", "medtech", "ophthalmology"]:
    flags.append({
        "severity": "medium",
        "message": "MLR/regulatory review will add timeline but not billable hours",
        "detail": "Expect 1-2 weeks per review cycle. This is timeline only — does not affect cost.",
        "source_projects": []
    })

# 4. Known underscoped project types
if any(t in ["sales_aid", "whitepaper"] for t in characteristics.get("project_types", [])):
    flags.append({
        "severity": "high",
        "message": "This project type is historically underscoped at Steadfast",
        "detail": "Sales aids and whitepapers are the #1 and #2 most underscoped types. Apply custom graphics buffer if figures or infographics are involved.",
        "source_projects": []
    })

# 5. Custom graphics
if any(d.get("description", "").lower() in ["infographic", "figure", "illustration", "custom graphic", "icon set"]
       for d in characteristics.get("deliverables", [])):
    flags.append({
        "severity": "medium",
        "message": "Custom graphics complexity buffer recommended (40-50%)",
        "detail": "Apply to affected design hours only, not total project",
        "source_projects": []
    })

# 6. Content as cost driver
content_heavy = [c for c in comparables if c["past_hours"].get("content", 0) > c["past_hours"].get("design", 0) * 0.3]
if content_heavy:
    flags.append({
        "severity": "medium",
        "message": "Content was a significant cost driver in similar projects",
        "detail": "Consider confirming content source with the client before scoping",
        "source_projects": [c["project_name"] for c in content_heavy]
    })

return flags
```

### 6.7 Register IPC methods

Add to `python/main.py`:

```python
elif method == "check_ollama":
    return check_ollama_health()

elif method == "parse_notes":
    # params: { text: str } or { filePath: str }
    if "filePath" in params:
        text = extract_text_from_file(params["filePath"])
    else:
        text = params["text"]
    return parse_meeting_notes(text)

elif method == "find_comparables":
    # params: { characteristics: dict }
    comparables = find_comparable_projects(params["characteristics"])
    return {"comparables": comparables}

elif method == "generate_forecast":
    # params: { characteristics: dict, comparables: list }
    scenarios = build_scenarios(params["characteristics"], params["comparables"])
    risk_flags = generate_risk_flags(params["characteristics"], params["comparables"])
    return {"scenarios": scenarios, "risk_flags": risk_flags}

elif method == "save_forecast":
    # params: { name: str, clientId: int, rawNotes: str, characteristics: dict, comparables: list, scenarios: dict }
    return save_forecast(params)
```

### 6.8 Build the New Forecast screen UI

Replace the placeholder `NotesInput.tsx` with a full two-panel layout.

**Left Panel — Input (40% width):**

**Step 1: Notes Input**
- Large text area (minimum 200px height, resizable vertically)
- Placeholder: "Paste your meeting notes here. Include any details about deliverables, timeline, client name, and project type..."
- Below the textarea: "Or upload a file" with a small FileDropZone accepting .txt, .docx, .pdf
- If a file is uploaded, show the filename and a "Remove" button. The textarea becomes read-only showing extracted text.

**Step 2: Optional Client Select**
- A Select dropdown with all existing clients + "New Client" option
- Pre-selects if the AI detects a known client name

**Step 3: Analyze Button**
- Large teal button: "Analyze Notes"
- Disabled until notes are entered (paste or upload)
- On click: triggers the full pipeline

**Loading state during analysis:**
- Button changes to a spinner with sequential status messages:
  1. "Reading notes..." (2s)
  2. "Extracting project details..." (Ollama call, may take 10-30s)
  3. "Finding comparable projects..." (fast)
  4. "Building forecast scenarios..." (fast)
  5. "Checking for risks..." (fast)
- Each step gets a green checkmark when complete

**Right Panel — Results (60% width, appears after analysis):**

**Block 1: "What We Found" — Extracted Characteristics Card**

A card with a grid of labeled fields showing what the AI extracted:
- Client: [name or "Unknown"]
- Industry: [badge]
- Project Type(s): [badges]
- Deliverables: [list with quantities]
- Content Situation: [badge]
- Brand Situation: [badge]
- Regulatory Review: [Yes/No badge]
- Timeline: [weeks or "Not specified"]
- Rush: [Yes/No]
- New Client: [Yes/No]

Each field is clickable to edit. When edited, show a "Re-analyze with changes" button that re-runs the comparables and forecast without re-running Ollama.

**Block 2: "Similar Past Projects" — Comparable Cards**

3-5 cards in a vertical stack. Each card:
- **Left section (70%):**
  - Project name (subtitle)
  - Client name (caption, muted)
  - Match reasons as small badges: "Same type", "Same industry", "Similar hours"
  - Key differences in muted text
  - Risk note in amber text (if present)
- **Right section (30%):**
  - Large similarity score (1-5) in a circular badge
    - 5: green
    - 4: teal
    - 3: gold
    - 2: amber
    - 1: red
  - Actual margin % below the score (color-coded)
  - "Over scope" badge in red if applicable

Clicking a comparable card opens the Project Detail screen for that project.

**Block 3: "Forecast" — Tabbed Scenario View**

Three tabs: "Best Case" | "Suggested" (selected by default) | "Worst Case"

Each tab shows:

**Hours + Cost Table:**
| Role | Hours | Rate | Cost |
|------|-------|------|------|
| Strategy | 12.0 | $225 | $2,700.00 |
| Design | 32.0 | $150 | $4,800.00 |
| Development | 0.0 | $180 | $0.00 |
| Content | 8.0 | $140 | $1,120.00 |
| AM | 10.0 | $120 | $1,200.00 |
| **Total** | **62.0** | — | **$9,820.00** |

**Below the table, three large numbers side by side:**
- Recommended Price: $15,107.69 (teal, large)
- Projected Margin: 35.0% (green)
- Timeline: ~11 business days

**Assumptions text** below in muted italic.

The "Suggested" tab content is the one that would go into a SOW.

**Block 4: "Risk Flags" — Warnings**

Below the forecast, a list of flags:
- Each flag is a horizontal card with:
  - Left: severity icon (red triangle for high, amber circle for medium)
  - Center: message (bold) + detail text + source project names as links
  - No action buttons — these are informational

**Block 5: "Save Forecast" Button**

At the bottom of the right panel:
- Text input for forecast name (default: "[Client] — [Date]")
- "Save Forecast" button (teal)
- Saves everything to the forecasts, forecast_comparables, and forecast_scenarios tables

### 6.9 Ollama offline fallback

If Ollama is not running when the user clicks "Analyze Notes":
- Show an alert: "Ollama is not running. The AI needs Ollama to analyze your notes."
- Below the alert, show setup instructions:
  1. "Open the Ollama app (in your Applications folder)"
  2. "Or run in Terminal: `ollama serve`"
  3. "Then run: `ollama pull llama3.1:8b`"
- A "Retry Connection" button that re-checks Ollama health

The rest of the app (dashboard, projects, import) works fine without Ollama. Only the forecast screen requires it.

---

## Verification Checklist

Before moving to Phase 7, confirm ALL of the following:

- [ ] Pasting text into the notes area and clicking "Analyze" triggers the full pipeline
- [ ] The loading state shows sequential progress messages
- [ ] Extracted characteristics appear and are reasonable given the input notes
- [ ] Each characteristic field is editable
- [ ] Re-analyzing after editing characteristics updates comparables and forecast without re-calling Ollama
- [ ] 3-5 comparable projects appear with 1-5 similarity scores
- [ ] Comparable cards show match reasons, key differences, and actual margins
- [ ] Clicking a comparable card navigates to its Project Detail
- [ ] Three forecast tabs show different hour/cost scenarios
- [ ] The "Suggested" tab numbers are between Best Case and Worst Case
- [ ] Recommended price assumes 35% target margin (configurable in settings)
- [ ] Risk flags appear with correct severity levels
- [ ] Uploading a .txt, .docx, or .pdf file works as an alternative to pasting
- [ ] When Ollama is offline, a clear error message and setup instructions appear
- [ ] Saving a forecast stores it in the database
- [ ] No NaN, undefined, or $0.00 values appear when they shouldn't

**When all checks pass:** Tell Codex "Phase 6 is verified. Stop here."
