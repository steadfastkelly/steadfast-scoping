# Data Import Component Architecture

## Purpose

This document defines the complete component architecture for the data-import flow using the existing screen specifications as the source of truth.

It follows the repository rule:

- Flow -> Screen -> Component

This document does not redefine behavior already captured in the flow and screen files. It translates those behaviors into a reusable implementation structure.

## Source of Truth

### Bootstrap

- `codex/bootstrap.md`

### Flow

- `flows/data-import.md`

### Screens

- `screens/data-import-upload.md`
- `screens/data-import-validation.md`

### Data Models Read For Context

- `data-models/job.md`
- `data-models/estimate.md`
- `data-models/actual.md`

### System Guidance

- `system/design-principles.md`
- `system/naming-conventions.md`
- `system/ui-rules.md`

The current `system` files are empty, so this architecture is constrained by the bootstrap, flow, and screen documents.

## Architecture Goals

- Use one reusable lane pattern for invoices, payments, and Timely
- Keep screen behavior aligned to the current upload and validation specs
- Avoid duplicate card, table, banner, and status components
- Keep IPC and parsing orchestration out of presentational components
- Support Timely-specific role mapping without forking the full lane architecture

## Screen-Driven Architecture

There is one route-level screen:

- `/import`

The current screen specs describe two visual states within that same route:

1. Upload state
2. Validation state

The architecture therefore uses:

- one page component for the route
- one reusable lane card for each import lane
- one reusable validation panel for post-parse review
- one reusable status panel for counts and reconciliation readiness
- one Timely-only role mapping dialog extension

## Canonical Component Tree

```text
ImportDataScreen
├── ImportPageHeader
├── ImportLaneCard (invoices)
│   ├── FileDropZone
│   ├── SelectedFileSummary
│   ├── ImportFeedbackBanner
│   ├── ImportValidationPanel
│   │   ├── ImportFeedbackBanner
│   │   ├── ColumnMappingTable
│   │   ├── PreviewDataTable
│   │   └── ImportActionRow
│   ├── ImportProgressPanel
│   └── ImportSuccessPanel
├── ImportLaneCard (payments)
├── ImportLaneCard (timely)
│   └── RoleMappingDialog
└── ImportStatusPanel
```

## Flow -> Screen -> Component Map

| Flow step | Screen area | Component owner |
|---|---|---|
| Open Import Data screen | Page header + three lanes + status summary | `ImportDataScreen` |
| Choose file by drag/drop or browse | Upload card interaction area | `FileDropZone` inside `ImportLaneCard` |
| Show accepted file and metadata | Upload card selected file state | `SelectedFileSummary` |
| Show upload-stage errors | Upload card error state | `ImportFeedbackBanner` inside `ImportLaneCard` |
| Show preview and mappings | Validation card body | `ImportValidationPanel` |
| Show expected field to source column mapping | Validation mapping section | `ColumnMappingTable` |
| Show first 5 preview rows | Validation preview section | `PreviewDataTable` |
| Confirm import, cancel, replace file | Validation action row | `ImportActionRow` |
| Show import progress | Importing state | `ImportProgressPanel` |
| Show import success counts | Success state | `ImportSuccessPanel` |
| Show role assignment for Timely | Timely post-import extension | `RoleMappingDialog` |
| Show record counts and reconciliation readiness | Bottom summary panel | `ImportStatusPanel` |

## Component Inventory

This is the complete recommended component set for the current data-import flow.

```text
src/components/data-import/
├── ImportDataScreen.tsx
├── ImportPageHeader.tsx
├── ImportLaneCard.tsx
├── FileDropZone.tsx
├── SelectedFileSummary.tsx
├── ImportValidationPanel.tsx
├── ImportFeedbackBanner.tsx
├── ColumnMappingTable.tsx
├── PreviewDataTable.tsx
├── ImportActionRow.tsx
├── ImportProgressPanel.tsx
├── ImportSuccessPanel.tsx
├── ImportStatusPanel.tsx
├── RoleMappingDialog.tsx
├── import-lane.config.ts
├── import-lane.types.ts
└── import-lane.utils.ts
```

## Components Not To Create

Do not create lane-specific duplicates such as:

- `InvoiceUploadCard`
- `PaymentsUploadCard`
- `TimelyUploadCard`
- `InvoicePreviewTable`
- `PaymentsPreviewTable`
- `TimelyPreviewTable`
- `ValidationBanner`
- `ImportErrorAlert`
- `ImportStatusMetricList`
- `ReconciliationReadiness`

Those concerns are already covered by reusable shared components in this architecture.

## Component Responsibilities

### `ImportDataScreen`

Role:

- Route-level owner for `/import`
- Loads import counts on mount
- Owns state for all three lanes
- Refreshes counts after successful imports
- Opens Timely role mapping when required

Owns:

- overall page layout
- lane registry
- lane state dictionary
- global import counts
- reconciliation readiness state

Does not own:

- drag-and-drop DOM handling
- preview table rendering
- field mapping table rendering

### `ImportPageHeader`

Role:

- Renders page title and supporting copy from the upload screen spec

Reusable:

- yes, as a simple page-top block

### `ImportLaneCard`

Role:

- Reusable container for one import lane
- Renders lane header, lane instructions, and state-specific child content
- Switches between `idle`, `file_selected`, `preview_ready`, `importing`, `success`, and `error`

Owns:

- lane-level view switching
- lane header/title/count rendering
- lane-specific helper copy from config

Does not own:

- backend operations
- file parsing
- database state refresh

### `FileDropZone`

Role:

- Handles drag/drop and Browse interaction
- Enforces lane-specific extension rules before handoff
- Displays idle, hover, focus, and local file-type error styles

Reusable:

- yes

### `SelectedFileSummary`

Role:

- Displays selected filename, file size, and accepted type
- Exposes replace-file and cancel actions

Reusable:

- yes

### `ImportFeedbackBanner`

Role:

- Shared feedback surface for:
  - upload-stage errors
  - validation pass/warning/error messages
  - import-stage failure messages

Reusable:

- yes

This replaces separate banner and alert components.

### `ImportValidationPanel`

Role:

- Composes the validation screen state inside a lane card
- Renders feedback banner, mapping table, preview table, and action row

Reusable:

- yes, across all three lanes

### `ColumnMappingTable`

Role:

- Displays expected field -> detected source column mappings

Reusable:

- yes, config-driven

### `PreviewDataTable`

Role:

- Renders the first 5 preview rows for the active lane

Reusable:

- yes, config-driven

### `ImportActionRow`

Role:

- Displays `Import`, `Cancel`, and `Replace File` actions in validation state

Reusable:

- yes

### `ImportProgressPanel`

Role:

- Displays progress bar and current operation text during parsing/import

Reusable:

- yes

### `ImportSuccessPanel`

Role:

- Displays success icon, summary sentence, result counts, and optional next action

Reusable:

- yes

### `ImportStatusPanel`

Role:

- Displays clients, invoices, payments, and timely entry counts
- Displays next-step readiness for reconciliation
- Owns both metrics and readiness to avoid duplicated status components

Reusable:

- yes, for import-related operational summaries

### `RoleMappingDialog`

Role:

- Timely-only extension component for unresolved user-role assignment
- Owns the user table, per-row role selects, and save/cancel actions

Reusable:

- specific to Timely role mapping in this domain

This is the only lane-specific component in the architecture.

## Lane Configuration

Differences between invoices, payments, and Timely must be expressed through configuration, not through separate component trees.

Create `import-lane.config.ts`:

```ts
export type ImportLaneKey = "invoices" | "payments" | "timely";

export type ImportLaneConfig = {
  key: ImportLaneKey;
  title: string;
  acceptedExtensions: string[];
  selectFileFilters: { name: string; extensions: string[] }[];
  instructions: string[];
  expectedFields: string[];
  previewColumns: string[];
  importMethod: "import_invoices" | "import_payments" | "import_timely";
};
```

This config drives:

- title
- instructions
- accepted file types
- native file picker filters
- field mapping labels
- preview table columns
- backend IPC method

## Shared State Model

Create `import-lane.types.ts` with one canonical lane state.

```ts
export type ImportLaneStatus =
  | "idle"
  | "file_selected"
  | "preview_ready"
  | "importing"
  | "success"
  | "error";

export type SelectedFile = {
  path: string;
  name: string;
  sizeLabel: string;
  extension: string;
};

export type ValidationTone = "success" | "warning" | "error";

export type ValidationMessage = {
  tone: ValidationTone;
  title: string;
  description: string;
};

export type ColumnMappingRow = {
  expectedField: string;
  sourceColumn: string | null;
};

export type PreviewRow = Record<string, string | number | null>;

export type ImportResultSummary = {
  imported?: number;
  skippedVoid?: number;
  clientsCreated?: number;
  usersFound?: string[];
  needsRoleMapping?: boolean;
};

export type ImportLaneState = {
  status: ImportLaneStatus;
  selectedFile: SelectedFile | null;
  feedback: ValidationMessage | null;
  columnMappings: ColumnMappingRow[];
  previewRows: PreviewRow[];
  progressLabel: string | null;
  result: ImportResultSummary | null;
  errorMessage: string | null;
};
```

## Page-Level State Shape

`ImportDataScreen` should hold:

```ts
type ImportCounts = {
  clients: number;
  invoices: number;
  payments: number;
  timeEntries: number;
};

type ImportPageState = {
  counts: ImportCounts;
  lanes: Record<ImportLaneKey, ImportLaneState>;
  roleMappingOpen: boolean;
  roleMappingUsers: string[];
  roleMappingValues: Record<string, string>;
  roleMappingSaving: boolean;
  roleMappingError: string | null;
};
```

## Screen-State Mapping

### Upload Screen

Mapped from `screens/data-import-upload.md`.

#### `idle`

Components:

- `ImportLaneCard`
- `FileDropZone`

#### `file_selected`

Components:

- `ImportLaneCard`
- `SelectedFileSummary`
- `ImportProgressPanel`

Use this state for the handoff from file acquisition to preview generation.

#### Upload-stage `error`

Components:

- `ImportLaneCard`
- `FileDropZone`
- `ImportFeedbackBanner`

### Validation Screen

Mapped from `screens/data-import-validation.md`.

#### `preview_ready`

Components:

- `ImportLaneCard`
- `SelectedFileSummary`
- `ImportValidationPanel`

#### `importing`

Components:

- `ImportLaneCard`
- `SelectedFileSummary`
- `ImportProgressPanel`

#### `success`

Components:

- `ImportLaneCard`
- `ImportSuccessPanel`

#### Validation/import `error`

Components:

- `ImportLaneCard`
- `SelectedFileSummary`
- `ImportFeedbackBanner`

#### Timely role mapping

Components:

- `RoleMappingDialog`

## Minimal Component Contracts

### `ImportLaneCard`

```ts
type ImportLaneCardProps = {
  config: ImportLaneConfig;
  state: ImportLaneState;
  recordCount: number;
  onBrowse: (lane: ImportLaneKey) => void;
  onDropFile: (lane: ImportLaneKey, filePath: string) => void;
  onCancel: (lane: ImportLaneKey) => void;
  onReplaceFile: (lane: ImportLaneKey) => void;
  onConfirmImport: (lane: ImportLaneKey) => void;
  onRetry: (lane: ImportLaneKey) => void;
};
```

### `ImportValidationPanel`

```ts
type ImportValidationPanelProps = {
  feedback: ValidationMessage | null;
  mappings: ColumnMappingRow[];
  previewRows: PreviewRow[];
  previewColumns: string[];
  onImport: () => void;
  onCancel: () => void;
  onReplaceFile: () => void;
};
```

### `ImportStatusPanel`

```ts
type ImportStatusPanelProps = {
  counts: {
    clients: number;
    invoices: number;
    payments: number;
    timeEntries: number;
  };
  reconciliationReady: boolean;
};
```

### `RoleMappingDialog`

```ts
type RoleMappingDialogProps = {
  open: boolean;
  users: string[];
  values: Record<string, string>;
  saving: boolean;
  errorMessage: string | null;
  onChangeRole: (userName: string, role: string) => void;
  onSave: () => void;
  onClose: () => void;
};
```

## Event Ownership

### Page-Level Events

Owned by `ImportDataScreen`:

- `loadImportStatus`
- `refreshImportStatus`
- `handleBrowse`
- `handleFileSelected`
- `handleImportConfirmed`
- `handleImportSuccess`
- `handleRoleMappingSaved`

### Lane-Level Events

Owned by `ImportLaneCard` and bubbled upward:

- `onBrowse`
- `onDropFile`
- `onCancel`
- `onReplaceFile`
- `onConfirmImport`
- `onRetry`

### Dialog-Level Events

Owned by `RoleMappingDialog`:

- `onChangeRole`
- `onSave`
- `onClose`

## IPC Boundary

Presentational components must not call IPC directly.

Recommended orchestration locations:

- `ImportDataScreen`
- or a dedicated hook such as `useImportLanes`

That orchestration layer is responsible for:

- `select-file`
- `import_invoices`
- `import_payments`
- `import_timely`
- `get_import_status`
- role mapping persistence call

## Reuse Rules

- `ImportLaneCard` is reused for all three lanes
- `FileDropZone` is the only file acquisition surface
- `ImportValidationPanel` is reused for all three lanes
- `ColumnMappingTable` is reused for all three lanes
- `PreviewDataTable` is reused for all three lanes
- `ImportFeedbackBanner` is the only warning/error/pass feedback surface
- `ImportStatusPanel` is the only bottom-of-page summary component
- `RoleMappingDialog` is the only Timely-specific extension

## Naming Rules

- Screen-facing components start with `Import`
- Timely-specific role assignment component starts with `RoleMapping`
- Shared helpers and types use `import-lane.*`
- Avoid generic names like `Uploader`, `ReviewBox`, or `SummaryWidget`

## Build Order

1. `import-lane.types.ts`
2. `import-lane.config.ts`
3. `ImportDataScreen.tsx`
4. `ImportLaneCard.tsx`
5. `FileDropZone.tsx`
6. `SelectedFileSummary.tsx`
7. `ImportFeedbackBanner.tsx`
8. `ImportValidationPanel.tsx`
9. `ColumnMappingTable.tsx`
10. `PreviewDataTable.tsx`
11. `ImportActionRow.tsx`
12. `ImportProgressPanel.tsx`
13. `ImportSuccessPanel.tsx`
14. `ImportStatusPanel.tsx`
15. `RoleMappingDialog.tsx`

## Acceptance Criteria

This architecture is complete only if:

- every section in the existing upload and validation screens maps to a defined component
- every flow step in `flows/data-import.md` has a clear owning component
- all three lanes share the same lane card architecture
- lane differences are fully config-driven
- there are no duplicate lane-specific cards or tables
- there is exactly one shared feedback surface
- there is exactly one shared status panel
- Timely role mapping remains the only lane-specific branch
