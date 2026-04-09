# Phase 2: Data Import + Database

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 1 verified and passing.

**Goal:** User can upload Invoice Excel sheets, Payment Excel sheets, and Timely CSV files through a drag-and-drop UI. Data is parsed, validated, previewed, and stored in a local SQLite database.

**Estimated effort:** 2 days

---

## Step-by-Step Instructions

### 2.1 Create the SQLite database

Create `python/db/schema.py`:
- On first run, create the SQLite database file at `data/steadfast.db`
- Execute all CREATE TABLE statements from the Foundation doc
- Add a `schema_version` table to track migrations:
  ```sql
  CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  INSERT OR IGNORE INTO schema_version (version) VALUES (1);
  ```
- Export a function `init_db()` that creates the database if it doesn't exist and runs any pending migrations
- Export a function `get_connection()` that returns a sqlite3 connection with `row_factory = sqlite3.Row`

Call `init_db()` from `python/main.py` at startup, before entering the stdin loop.

### 2.2 Build the Excel parser for Invoices

Create `python/ingestion/excel_parser.py`:

**Function: `parse_invoices(file_path: str) -> dict`**

Expected Excel columns (match exactly to the uploaded PDFs):
- `Status` — text: Paid, Unpaid, Void, Overdue
- `Invoice Date` — date
- `Due Date` — date
- `Invoice#` — text (the invoice number)
- `Customer Name` — text
- `Total` — currency string like "$2,880.00" → parse to float
- `Balance` — currency string → parse to float

Steps:
1. Read the Excel file with pandas (`pd.read_excel`)
2. Validate that all required columns exist. If any are missing, return an error listing the missing columns.
3. Normalize customer names (lowercase, strip punctuation, collapse whitespace) — reuse the `normalize_customer` function from the existing Python script
4. Parse currency strings (strip `$` and `,`, convert to float) — reuse `parse_amount`
5. Parse dates with `pd.to_datetime`
6. Auto-create or match `clients` entries: for each unique normalized customer name, check if a client already exists in the database. If not, create one.
7. Insert rows into the `invoices` table. Skip rows where `Status` is "Void".
8. Return: `{"imported": count, "skipped_void": count, "clients_created": count, "preview": first_10_rows_as_list_of_dicts}`

### 2.3 Build the Excel parser for Payments

**Function: `parse_payments(file_path: str) -> dict`**

Expected Excel columns:
- `Payment Number` — text
- `Date` — date
- `Reference Number` — text (may be empty)
- `Customer Name` — text
- `Payment Mode` — text
- `Notes` — text (may be empty)
- `Invoice#` — text (may contain comma-separated invoice numbers)
- `Deposit To` — text
- `Amount` or `Amount (FCY)` — currency string → parse to float

Steps:
1. Read with pandas
2. Validate required columns. Accept either `Amount` or `Amount (FCY)` or `Amount (BCY)`.
3. Normalize customer names
4. Parse currency strings
5. Parse dates
6. Auto-create or match clients (same logic as invoices)
7. Insert into `payments` table
8. Return: `{"imported": count, "clients_created": count, "preview": first_10_rows_as_list_of_dicts}`

### 2.4 Build the Timely CSV parser

Create `python/ingestion/timely_parser.py`:

**Function: `parse_timely(file_path: str) -> dict`**

Timely CSV exports typically contain columns like:
- `User` or `Person` — the team member name
- `Project` or `Client` — the project/client name
- `Hours` or `Duration` — decimal hours
- `Date` — entry date
- `Tags` or `Labels` or `Note` — may contain role info

Since Timely CSV format may vary, this parser must be flexible:
1. Read the CSV with pandas
2. Auto-detect columns by checking for known header names (case-insensitive). Map:
   - User/Person/Team Member → `user_name`
   - Project/Client → client lookup
   - Hours/Duration/Logged → `hours`
   - Date → `date`
   - Tags/Labels/Note/Description → `description`
3. **Role detection:** Timely won't have Steadfast's 5 role categories directly. Implement a role mapping step:
   - Check if any column contains role information
   - If not, default all entries to role `"unassigned"`
   - The UI will show a role mapping screen where the user can assign roles to team members
4. Match or create clients based on project/client name
5. Insert into `time_entries` table
6. Return: `{"imported": count, "users_found": list, "needs_role_mapping": bool, "preview": first_10_rows_as_list_of_dicts}`

### 2.5 Register IPC methods

Add these methods to `python/main.py`:

```python
if method == "import_invoices":
    return parse_invoices(params["filePath"])

elif method == "import_payments":
    return parse_payments(params["filePath"])

elif method == "import_timely":
    return parse_timely(params["filePath"])

elif method == "get_import_status":
    # Returns counts of records in each table
    return get_table_counts()
```

### 2.6 Build the Import Data screen UI

Replace the placeholder `ImportWizard.tsx` with the full implementation.

**Layout:** Three vertical cards stacked, one per data type.

**Each card contains:**
1. **Header:** Icon + title ("Invoices", "Payments", "Timely Hours") + record count badge (shows "0 records" initially, updates after import)
2. **FileDropZone component:** A dashed-border rectangle that accepts drag-and-drop or click-to-browse. Accept `.xlsx` for invoices/payments, `.csv` for Timely.
3. **After file selected but before import:**
   - Show filename and file size
   - Show a preview table (first 5 rows) using shadcn/ui Table component
   - Show detected column mappings
   - "Import" button (teal) and "Cancel" button (muted)
4. **During import:** Replace the preview with a Progress bar and status text
5. **After import:** Show success message with counts ("142 invoices imported, 3 void skipped, 5 new clients created"). Show a green checkmark.
6. **On error:** Show error message in a red-bordered alert with the specific problem (e.g., "Missing required column: Invoice#")

**FileDropZone component (`src/components/data-import/FileDropZone.tsx`):**
- Uses HTML5 drag-and-drop API
- Visual states: default (dashed border, muted text "Drop file here or click to browse"), hover (teal border, teal background at 10% opacity), error (red border)
- File type validation on drop (reject wrong extensions)
- Calls `window.api.invoke("import_invoices", { filePath })` etc.

**ImportStatus component (`src/components/data-import/ImportStatus.tsx`):**
- Shows current database record counts for all tables
- "Run Reconciliation" button appears only when invoices AND payments have been imported
- The reconciliation button is disabled/hidden until Phase 3

**Role mapping dialog (for Timely import):**
- If `needs_role_mapping` is true, show a Dialog/Sheet with a table
- Table columns: User Name | Current Role | Assign Role
- Assign Role is a Select dropdown with options: Strategy, Design, Development, Content, AM
- "Save Mapping" button updates the `time_entries` table
- This mapping should persist (save to a `role_mappings` table or JSON in the database) so future imports auto-apply it

### 2.7 Add role_mappings table

Add to the schema:
```sql
CREATE TABLE role_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

When importing Timely data, check this table first. If a user already has a mapping, apply it automatically.

### 2.8 Handle file paths in Electron

In `electron/main.ts`, add an IPC handler that opens a native file dialog:
```typescript
ipcMain.handle("select-file", async (event, { filters }) => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: filters  // e.g., [{ name: "Excel", extensions: ["xlsx"] }]
    });
    return result.filePaths[0] || null;
});
```

Expose this in the preload script as `window.api.selectFile(filters)`.

The FileDropZone should support both drag-and-drop (which gives a file path) AND a "Browse" button that calls `window.api.selectFile()`.

---

## Verification Checklist

Before moving to Phase 3, confirm ALL of the following:

- [ ] The Import Data screen shows three cards (Invoices, Payments, Timely Hours)
- [ ] Dragging an .xlsx file onto the Invoices card shows a preview table
- [ ] Clicking "Import" processes the file and shows a success message with counts
- [ ] The Payments card works the same way
- [ ] Dragging a .csv file onto the Timely Hours card shows a preview
- [ ] If Timely import needs role mapping, a dialog appears with user names and role dropdowns
- [ ] After role mapping is saved, the roles persist for future imports
- [ ] The "Browse" button opens a native macOS file picker
- [ ] Dragging a wrong file type (e.g., .pdf onto the Excel card) shows an error
- [ ] The record count badges update after each import
- [ ] Importing the same file twice does not create duplicate records (use invoice_number + date as uniqueness check for invoices, payment_number for payments)
- [ ] Opening the SQLite database file (`data/steadfast.db`) with a tool like DB Browser for SQLite shows the imported data in the correct tables

**If any check fails:** Copy the exact error and give it back to Codex.

**When all checks pass:** Tell Codex "Phase 2 is verified. Stop here."
