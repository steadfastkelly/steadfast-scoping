# Data Import Upload Screen

## Purpose

This screen spec defines the primary upload experience for Phase 02. It is the first screen users interact with when bringing source data into the app.

The screen supports three import lanes:

- Invoices
- Payments
- Timely Hours

Its job is to let users choose files safely, understand what each lane expects, and move into preview/validation without ambiguity.

## Route

- `/import`

## Primary User Goal

- Select the correct file for each data type
- See whether the file is accepted
- Move cleanly into validation and import

## Screen Hierarchy

1. Page header
2. Import overview copy
3. Three import cards stacked vertically
4. Import status summary
5. Reconciliation readiness area

## Layout

### Page Header

- Title: `Import Data`
- Supporting copy: short explanation that all data stays local and is stored in the desktop app database

### Import Cards Stack

Three full-width cards in this order:

1. Invoices
2. Payments
3. Timely Hours

Each card should feel like a self-contained lane with its own file handling state.

### Bottom Summary Area

- Import status counts
- Readiness message for the next step
- Disabled or hidden reconciliation CTA until invoices and payments both exist

## Card Anatomy

Each card contains these regions:

1. Header row
2. Instruction block
3. Drop zone
4. Selected file metadata
5. Inline error or helper text
6. Transition area into validation state

## Header Row

Each card header includes:

- Leading icon
- Title
- Record count badge

### Titles

- `Invoices`
- `Payments`
- `Timely Hours`

### Count Badge Format

- `0 records`
- `142 records`

The badge reflects current database totals, not pending file row counts.

## Instruction Block

Each card should briefly tell the user what file it expects.

### Invoices Card Copy

- Accepts `.xlsx`
- Requires invoice number, customer name, dates, total, and balance

### Payments Card Copy

- Accepts `.xlsx`
- Requires payment number, customer name, date, invoice reference, and amount

### Timely Card Copy

- Accepts `.csv`
- Flexible column detection for person, project/client, hours, date, and description

## Drop Zone

### Default State

- Large dashed rectangle
- Neutral border
- Muted helper text
- Browse button inside or directly below the zone

### Default Prompt

- `Drop file here or click to browse`

### Hover State

- Border changes to teal
- Background shifts to teal at low opacity
- Helper text becomes stronger

### Focus State

- Visible keyboard focus ring
- Border remains high-contrast and accessible

### Error State

- Border turns red
- Helper text replaced by specific error

## Accepted File Types

- Invoices: `.xlsx`
- Payments: `.xlsx`
- Timely Hours: `.csv`

## Upload Interaction Flow

### Drag-and-Drop Path

1. User drags file over card.
2. Card enters hover state.
3. User drops file.
4. Frontend validates extension.
5. If valid, selected-file state appears.
6. If invalid, card shows inline error and remains on upload screen.

### Browse Path

1. User clicks Browse.
2. Native file picker opens.
3. User selects a file or cancels.
4. If canceled, no state changes.
5. If file is selected, frontend validates extension.

## Selected File State

Once a valid file is chosen, the card should replace the empty prompt with a compact file summary.

### File Metadata Row

- Filename
- File size
- File type label
- Replace file action
- Cancel action

### Example

- `Invoices_Aug_2025.xlsx`
- `84 KB`

## Pre-Validation Messaging

Before backend parsing completes, the card should show a transient status such as:

- `Checking file structure...`

This makes the handoff from selection to validation explicit.

## Inline Error States

Upload-stage errors happen before the structured validation preview is shown.

### Error Cases

- Wrong extension
- Missing file path from OS dialog
- File no longer exists
- File locked or unreadable
- Backend unavailable

### Error Message Style

- Red bordered alert
- Short title plus specific message
- Retry and replace-file actions

### Example Messages

- `Expected .xlsx file for invoices`
- `Could not access selected file`
- `The import service is not available`

## Card Footer Actions

Depending on state, the card can show:

- `Browse`
- `Replace File`
- `Cancel`
- `Continue`

`Continue` should only appear if upload and validation are intentionally split into separate UI steps. If validation starts automatically, the footer should instead move directly into loading state.

## Loading State

When backend parsing begins:

- Inputs disable
- Drop zone becomes inactive
- Progress bar appears
- Status text explains current action

### Example Status Text

- `Reading spreadsheet...`
- `Detecting required columns...`
- `Preparing preview...`

## Empty Page Behavior

On first visit, all three cards show:

- `0 records`
- idle drop zone
- import status summary indicating no data imported yet

## Import Status Summary

Below the cards, show a compact summary panel:

- Clients count
- Invoices count
- Payments count
- Timely entries count

Also show a next-step status:

- `Import invoices and payments to unlock reconciliation`
- or
- `Ready for reconciliation`

## Reconciliation CTA State

### Locked State

- Hidden or disabled button
- Supporting text explains invoices and payments are required

### Ready State

- Button is visible and enabled
- Exact action is part of Phase 03, but this screen must reserve space for it

## Visual Priorities

- Upload actions should be obvious before any dense table content appears
- Cards should feel operational and trustworthy, not marketing-like
- The active card can have slightly stronger emphasis than the other two
- Error styling must be clear without overwhelming the rest of the page

## Component Inventory

- `ImportWizard`
- `FileDropZone`
- `Button`
- `Badge`
- `Alert`
- `Progress`
- `Card`

## Accessibility Requirements

- Full keyboard support for Browse, Replace, Cancel, and Continue
- Visible focus states on all interactive controls
- Drop zone instructions readable by screen readers
- File-type errors announced in an `aria-live` region
- Progress status announced during loading

## Success Transition

The upload screen does not end the flow by itself. On successful parsing, the relevant card transitions into the validation/review state defined in the validation screen spec.
