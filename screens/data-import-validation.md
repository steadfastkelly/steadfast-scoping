# Data Import Validation Screen

## Purpose

This screen spec defines the review and validation state that appears after a file is accepted and parsed. It is where users verify that the app understood the file correctly before the import is committed.

This screen covers:

- Preview tables
- Detected column mappings
- Import confirmation
- Progress state during database write
- Success and failure outcomes
- Timely role mapping handoff

## Route Context

- Lives within `/import`
- Appears inline inside each import card after parsing

## Primary User Goal

- Confirm the file was interpreted correctly
- Catch missing or incorrect columns before import
- Proceed confidently with database write

## Validation Card States

- `preview_ready`
- `importing`
- `success`
- `error`

## Preview Layout

Each card in validation mode contains:

1. Card header
2. File summary row
3. Validation result banner
4. Detected column mapping section
5. Preview table
6. Action row

## File Summary Row

Show:

- Filename
- File size
- Accepted format label
- Replace file action

This row anchors the review state and reminds users which file they are validating.

## Validation Result Banner

### Passing State

- Green or teal-tinted neutral success banner
- Message example:
  - `File structure looks valid. Review the preview and import when ready.`

### Warning State

Use for non-blocking issues:

- fallback amount column used
- some rows skipped
- role assignment still needed after Timely import

### Blocking Error State

Use a red alert when import cannot proceed:

- missing required columns
- unreadable amounts
- no detectable date column
- invalid file structure

## Detected Column Mapping Section

This section should make the parser’s interpretation explicit.

### Format

Two-column definition list or compact table:

| Expected Field | Detected Source Column |
|---|---|
| Customer Name | `Customer Name` |
| Invoice Number | `Invoice#` |
| Amount | `Amount (FCY)` |

### Lane-Specific Rules

#### Invoices

Must show mappings for:

- Status
- Invoice Date
- Due Date
- Invoice Number
- Customer Name
- Total
- Balance

#### Payments

Must show mappings for:

- Payment Number
- Date
- Reference Number
- Customer Name
- Payment Mode
- Notes
- Invoice Number
- Deposit To
- Amount

#### Timely

Must show mappings for:

- User Name
- Project or Client
- Hours
- Date
- Description
- Role source if detected

## Preview Table

Show the first 5 rows on screen, even if the backend returns up to 10 rows.

### Table Goals

- Let the user spot obvious formatting problems
- Confirm the parser selected the right columns
- Confirm currency and date values look sane

### Suggested Columns by Lane

#### Invoices Preview

- Status
- Invoice Date
- Due Date
- Invoice Number
- Customer Name
- Total
- Balance

#### Payments Preview

- Payment Number
- Date
- Customer Name
- Invoice Number
- Payment Mode
- Amount

#### Timely Preview

- User Name
- Client or Project
- Hours
- Date
- Description
- Role

## Action Row

### Primary Action

- `Import`

### Secondary Actions

- `Cancel`
- `Replace File`

## Importing State

When the user clicks `Import`:

- Inputs disable
- Preview table is replaced or partially overlaid by a progress region
- Status copy updates as work proceeds

### Example Status Text

- `Validating rows...`
- `Matching clients...`
- `Writing records to database...`
- `Finalizing import...`

## Success State

After database write completes, show:

- Green checkmark or equivalent success icon
- Summary sentence with counts
- Refreshed record badge
- Option to import another file for the same lane

### Invoices Success Copy

- `142 invoices imported, 3 void skipped, 5 new clients created`

### Payments Success Copy

- `97 payments imported, 2 new clients created`

### Timely Success Copy

- `684 time entries imported`

## Success Detail Rules

The success block should include all meaningful counters returned by the backend, such as:

- imported
- skipped
- clients created
- users found
- needs role mapping

## Error State

If validation or import fails, keep the user inside the card and show:

- Alert title
- Specific error message
- Retry action
- Replace file action
- Cancel action

### Common Error Cases

- Missing required column
- Could not parse amount
- Could not parse date
- Duplicate import conflict
- Could not write to database

### Example Messages

- `Missing required column: Invoice#`
- `Could not detect a valid hours column in Timely CSV`
- `Could not save imported records`

## Timely Role Mapping Handoff

If Timely import succeeds but roles are unresolved:

1. Timely card enters success-adjacent state
2. Role mapping dialog opens immediately
3. Dialog shows all unresolved users
4. User assigns roles
5. User clicks `Save Mapping`
6. Backend persists mappings and updates `time_entries`
7. Screen returns to completed success state

## Role Mapping Dialog Spec

### Dialog Structure

- Title: `Assign Team Roles`
- Supporting copy: explain that these mappings will be reused for future imports
- Table with:
  - User Name
  - Current Role
  - Assign Role
- Footer actions:
  - `Save Mapping`
  - `Cancel`

### Assign Role Options

- Strategy
- Design
- Development
- Content
- AM

### Dialog Error State

If saving fails:

- Keep dialog open
- Show inline error
- Preserve user selections

## Validation Decision Rules

### Allow Import

If:

- file type is correct
- required columns are present
- parser can map needed fields
- preview generation succeeds

### Block Import

If:

- required columns are missing
- conceptual fields cannot be detected
- numeric or date parsing fails hard enough to make results unreliable
- backend cannot reach the database

## Status Badge Updates

After successful import:

- lane record badge updates immediately
- global Import Status panel refreshes
- reconciliation readiness recalculates

## UX Priorities

- Validation should reduce anxiety, not add friction
- Mapping clarity matters more than visual flourish
- The user should never wonder what the app inferred
- Success messaging should be operational and specific

## Component Inventory

- `Table`
- `Alert`
- `Badge`
- `Button`
- `Progress`
- `Dialog` or `Sheet`
- `Select`

## Accessibility Requirements

- Table headers must be semantic
- Validation alerts must be announced
- Progress updates must be available to screen readers
- Dialog focus must be trapped correctly
- Select controls in the role mapping dialog must be keyboard operable

## Acceptance Conditions

This screen is complete when:

- each lane shows a clear preview and mapping section
- import cannot proceed on blocking validation failures
- success messaging reflects backend counts
- Timely role mapping is handled without leaving the import flow
- error recovery is possible without reloading the page
