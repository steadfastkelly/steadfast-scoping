# Data Import Flow

## Purpose

This flow defines the full Phase 02 import experience for invoices, payments, and Timely hours. It covers:

- UI behavior on the Import Data screen
- Electron file selection behavior
- Python parser and database actions
- Success, error, and recovery paths
- Role mapping requirements for Timely imports
- Record count and readiness state updates for downstream phases

## Scope

Included:

- SQLite initialization on app startup
- Invoice Excel import
- Payment Excel import
- Timely CSV import
- Preview, validation, import execution, and post-import status
- Role mapping persistence
- Import status summary

Not included:

- Reconciliation execution logic from Phase 03
- Project generation and profitability logic from Phase 04

## Primary Actors

- User
- React Import UI
- Electron IPC bridge
- Python ingestion services
- SQLite database

## Entry Conditions

- Phase 01 shell/navigation is already working
- App launches successfully
- `python/main.py` calls `init_db()` before handling IPC requests
- Database file is available at `data/steadfast.db`

## Exit Conditions

- Imported records are stored in SQLite
- Import counts are visible in the UI
- Timely role mappings are saved if required
- The screen clearly shows whether reconciliation can run next

## High-Level Flow

1. App starts.
2. Database initialization runs.
3. User opens the Import Data screen.
4. User chooses one of three import lanes:
   - Invoices
   - Payments
   - Timely Hours
5. User selects a file by drag-and-drop or native file picker.
6. UI validates the file type.
7. Backend parses and validates file contents.
8. UI shows preview, mapping information, and import action.
9. User confirms import.
10. Backend writes valid records into SQLite.
11. UI shows success or error feedback.
12. Import status counts refresh.
13. If Timely roles are unresolved, user completes role mapping.
14. Once invoices and payments exist, reconciliation becomes available for the next phase.

## Screen Structure

The Import Data screen contains three vertically stacked cards:

1. Invoices
2. Payments
3. Timely Hours

Each card contains:

- Header with icon, title, and record count badge
- File drop zone
- Preview state
- Progress state
- Success state
- Error state

Below the cards:

- Import status summary
- Reconciliation button placeholder/state indicator

## App Startup Flow

### A. Database Initialization

1. Electron launches Python process.
2. `python/main.py` starts.
3. `init_db()` runs before the IPC loop starts.
4. If `data/steadfast.db` does not exist:
   - Create the file
   - Create all foundation tables
   - Create `schema_version`
   - Insert version `1` if missing
   - Create `role_mappings`
5. If the database already exists:
   - Open connection
   - Confirm schema is present
   - Apply pending migrations if any exist
6. App proceeds to normal UI rendering.

### Failure Path

- If database initialization fails:
  - Python returns an error to the frontend
  - Import screen shows blocking error state
  - No import actions are allowed until the issue is resolved

## Shared Import Card State Machine

Each card follows the same state model:

- `idle`
  - No file selected
  - Shows drop zone prompt
- `file_selected`
  - File path accepted
  - Filename and file size shown
- `preview_ready`
  - Parsed preview and detected mappings shown
  - Import and cancel actions enabled
- `importing`
  - Progress bar and status text shown
  - Inputs disabled
- `success`
  - Success summary with counts shown
  - Record badge updates
- `error`
  - Error alert shown
  - User can cancel, replace file, or retry

## Shared File Selection Flow

### Option 1: Drag and Drop

1. User drags file over card.
2. Drop zone enters hover state:
   - Teal border
   - Teal background at 10% opacity
3. User drops file.
4. UI reads file path from drop event.
5. UI validates extension against the card’s allowed types.

### Option 2: Browse

1. User clicks Browse.
2. Frontend calls `window.api.selectFile(filters)`.
3. Electron opens native file picker.
4. User chooses a file or cancels.
5. If a file is returned, UI validates extension.

### Shared Validation Rules

- Invoices: `.xlsx` only
- Payments: `.xlsx` only
- Timely Hours: `.csv` only

### Shared File Type Error Path

If extension is invalid:

- Card moves to `error`
- Message should clearly state the allowed file type
- No backend import method is called

## Invoice Import Flow

### Happy Path

1. User selects an invoice Excel file.
2. Invoices card enters `file_selected`.
3. Frontend invokes `import_invoices` with `filePath`.
4. Python `parse_invoices(file_path)` runs:
   - Read Excel with `pd.read_excel`
   - Validate required columns:
     - `Status`
     - `Invoice Date`
     - `Due Date`
     - `Invoice#`
     - `Customer Name`
     - `Total`
     - `Balance`
   - Normalize customer names
   - Parse total and balance currency values
   - Parse dates
   - Resolve or create `clients`
   - Skip rows where `Status == "Void"`
   - Insert remaining rows into `invoices`
5. Backend returns:
   - `imported`
   - `skipped_void`
   - `clients_created`
   - `preview`
6. UI enters `preview_ready` if preview is shown before confirmation, or `success` if import happens immediately after review depending on implementation split.
7. User confirms import if a confirmation step is present.
8. UI enters `importing`.
9. Import completes.
10. Invoices card enters `success`.
11. Success message displays counts.
12. Record count badge refreshes.
13. Global import status refreshes.

### Invoice-Specific Error Paths

- Missing required columns
  - Show exact list of missing columns
- Excel parse failure
  - Show readable import error
- Invalid currency format
  - Show row-level parsing problem if available
- Invalid date parsing
  - Show date parsing error with field context if available
- Duplicate invoice import
  - Must not create duplicates
  - Use `invoice_number + invoice_date` uniqueness logic
  - Return imported/skipped counts clearly

## Payment Import Flow

### Happy Path

1. User selects a payments Excel file.
2. Payments card enters `file_selected`.
3. Frontend invokes `import_payments` with `filePath`.
4. Python `parse_payments(file_path)` runs:
   - Read Excel with pandas
   - Validate required columns:
     - `Payment Number`
     - `Date`
     - `Reference Number`
     - `Customer Name`
     - `Payment Mode`
     - `Notes`
     - `Invoice#`
     - `Deposit To`
     - one of `Amount`, `Amount (FCY)`, `Amount (BCY)`
   - Normalize customer names
   - Parse amount
   - Parse dates
   - Resolve or create `clients`
   - Insert into `payments`
5. Backend returns:
   - `imported`
   - `clients_created`
   - `preview`
6. UI shows preview and mappings.
7. User confirms import.
8. UI enters `importing`.
9. Import completes.
10. Payments card enters `success`.
11. Count badge refreshes.
12. Global import status refreshes.

### Payment-Specific Error Paths

- Missing required columns
- No amount column found among accepted variants
- Invalid amount parsing
- Invalid date parsing
- Duplicate payment import
  - Must not create duplicates
  - Use `payment_number` uniqueness logic

## Timely Import Flow

### Happy Path Without Role Mapping

1. User selects a Timely CSV file.
2. Timely card enters `file_selected`.
3. Frontend invokes `import_timely` with `filePath`.
4. Python `parse_timely(file_path)` runs:
   - Read CSV with pandas
   - Auto-detect known headers case-insensitively
   - Map source columns to canonical fields:
     - user
     - project/client
     - hours
     - date
     - description
   - Detect role information if available
   - Resolve stored `role_mappings`
   - Resolve or create `clients`
   - Insert into `time_entries`
5. Backend returns:
   - `imported`
   - `users_found`
   - `needs_role_mapping = false`
   - `preview`
6. UI shows preview and mappings.
7. User confirms import.
8. UI enters `importing`.
9. Import completes.
10. Timely card enters `success`.
11. Global import status refreshes.

### Happy Path With Role Mapping

1. Steps 1-5 above occur.
2. Backend returns `needs_role_mapping = true`.
3. UI shows success for raw import, but immediately opens role mapping dialog before the flow is considered complete.
4. Dialog shows a table with:
   - User Name
   - Current Role
   - Assign Role
5. For each unmapped user, user selects one of:
   - Strategy
   - Design
   - Development
   - Content
   - AM
6. User clicks Save Mapping.
7. Frontend sends mapping payload to backend.
8. Backend stores mappings in `role_mappings`.
9. Backend updates relevant `time_entries` rows to replace `unassigned`.
10. Dialog closes.
11. Timely import flow is now complete.
12. Future Timely imports auto-apply these mappings.

### Timely-Specific Error Paths

- CSV cannot be read
- Required conceptual fields cannot be detected from headers
- Hours column cannot be interpreted numerically
- Date column cannot be parsed
- Role mapping save fails
  - Dialog stays open
  - Error appears inline
  - User can retry save

## Preview Behavior

For all three card types, preview state should show:

- Filename
- File size
- First 5 rows in a table
- Detected column mappings
- Import button
- Cancel button

Preview is the last safe checkpoint before database mutation.

If parsing succeeds but data quality issues are found:

- Prefer explicit warning messages
- Do not silently coerce ambiguous fields without surfacing that behavior

## Import Status Flow

`ImportStatus` reflects current database state across tables.

### On Screen Load

1. Frontend calls `get_import_status`.
2. Backend returns record counts for:
   - clients
   - invoices
   - payments
   - time_entries
   - role_mappings if useful for diagnostics
3. UI renders badges and status summary.

### After Any Successful Import

1. Frontend re-calls `get_import_status`.
2. Counts update immediately.
3. The matching card’s badge updates.
4. Global readiness state recalculates.

## Reconciliation Readiness Rules

This phase does not run reconciliation, but the import flow must expose whether the app is ready for it.

### Rule

- Reconciliation becomes available only when:
  - invoice count > 0
  - payment count > 0

### UI Behavior

- Before readiness:
  - show disabled or hidden reconciliation action
- After readiness:
  - show enabled `Run Reconciliation` button placeholder/state for Phase 03

Timely import is not required for reconciliation readiness.

## Backend Command Map

The import flow depends on these IPC methods:

```ts
import_invoices({ filePath })
import_payments({ filePath })
import_timely({ filePath })
get_import_status()
select-file({ filters })
```

Additional backend persistence for Timely role mapping is also required even if the exact IPC method name is defined later.

## Data Mutation Summary

### Invoices Import Writes

- `clients`
- `invoices`

### Payments Import Writes

- `clients`
- `payments`

### Timely Import Writes

- `clients`
- `time_entries`
- `role_mappings` when user saves assignments

## Idempotency Rules

- Importing the same invoice file twice must not duplicate invoices.
- Importing the same payment file twice must not duplicate payments.
- Timely imports should avoid duplicate rows if a stable deduplication strategy exists; if not, this must be explicitly flagged as unresolved.
- Repeated role mapping saves must update existing mappings rather than create duplicate user-role rows.

## Error Handling Standards

All import errors should be:

- Specific
- Actionable
- Visible on the relevant card
- Non-destructive to previously imported records

### Error Message Examples

- `Missing required column: Invoice#`
- `Expected .xlsx file for invoices`
- `Could not parse Amount column`
- `Could not detect a valid hours column in Timely CSV`
- `Failed to save role mappings`

## Recovery Paths

From any card-level error state, user must be able to:

- Cancel current attempt
- Pick a different file
- Retry the same file

From role mapping failure, user must be able to:

- Edit assignments
- Retry save
- Keep the dialog open until successful completion

## QA Checklist Embedded In Flow

The completed flow is correct only if all of the following are true:

- Import screen shows three cards
- Invoices accept `.xlsx`
- Payments accept `.xlsx`
- Timely accepts `.csv`
- Wrong file types are rejected before import
- Preview appears before import confirmation
- Success state shows counts
- Error state shows specific validation failures
- Count badges update after each successful import
- Role mapping appears when Timely roles cannot be resolved
- Role mappings persist for future imports
- SQLite contains imported rows in correct tables
- Reconciliation readiness appears only after invoices and payments exist

## Open Implementation Notes

- Phase 02 implies preview and import are distinct UI steps, but parser return shapes also include `preview`. The implementation should keep preview generation and final persistence behavior cleanly separated, even if the same backend function provides both.
- The Timely parser should treat header detection as flexible, but canonical stored fields must remain stable.
- The app should prefer deterministic normalization and parsing rules over hidden heuristics.

## Recommended File Ownership

- Frontend flow orchestration:
  - `src/components/data-import/ImportWizard.tsx`
  - `src/components/data-import/FileDropZone.tsx`
  - `src/components/data-import/ImportStatus.tsx`
- Electron bridge:
  - `electron/main.ts`
  - `electron/preload.ts`
- Python import services:
  - `python/ingestion/excel_parser.py`
  - `python/ingestion/timely_parser.py`
  - `python/main.py`
  - `python/db/schema.py`
