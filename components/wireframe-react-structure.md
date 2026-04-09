# Wireframe To React Structure

## Purpose

This document converts [wireframe.json](/Users/steadfast/steadfast-scoping/exports/wireframe.json) into a React component structure using reusable components.

It aligns the wireframe with the existing import architecture instead of introducing a second component system.

## Source Frames

From the wireframe export:

- `Screen/DataImport-Upload`
- `Screen/DataImport-Validation`
- `Screen/DataImport-Complete`

Reusable wireframe primitives:

- `Component/Button/Primary`
- `Component/Button/Secondary`
- `Component/InputField`
- `Component/UploadZone`
- `Component/ProgressBar`
- `Component/StatusBadge`
- `Component/NavItem`
- `Component/ValidationRow`

## Conversion Rule

Wireframe primitives should map into reusable React building blocks first, then compose into screen-level import components.

## React File Structure

```text
src/components/
├── app-shell/
│   ├── AppShell.tsx
│   ├── SidebarNav.tsx
│   └── SidebarNavItem.tsx
├── ui/
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── StatusBadge.tsx
│   ├── ProgressBar.tsx
│   ├── StepIndicator.tsx
│   ├── FileSummaryCard.tsx
│   ├── StatCard.tsx
│   └── ValidationCheckRow.tsx
└── data-import/
    ├── ImportDataScreen.tsx
    ├── ImportPageHeader.tsx
    ├── ImportLaneCard.tsx
    ├── FileDropZone.tsx
    ├── SelectedFileSummary.tsx
    ├── ImportFeedbackBanner.tsx
    ├── ImportValidationPanel.tsx
    ├── ColumnMappingTable.tsx
    ├── PreviewDataTable.tsx
    ├── ImportActionRow.tsx
    ├── ImportProgressPanel.tsx
    ├── ImportSuccessPanel.tsx
    ├── ImportStatusPanel.tsx
    └── RoleMappingDialog.tsx
```

## Primitive Mapping

| Wireframe primitive | React component | Notes |
|---|---|---|
| `Component/Button/Primary` | `ui/Button` | use `variant="primary"` |
| `Component/Button/Secondary` | `ui/Button` | use `variant="secondary"` |
| `Component/InputField` | `ui/TextField` | shared labeled text input |
| `Component/UploadZone` | `data-import/FileDropZone` | keep import-specific behavior here |
| `Component/ProgressBar` | `ui/ProgressBar` | wrapped by `ImportProgressPanel` |
| `Component/StatusBadge` | `ui/StatusBadge` | shared badge primitive |
| `Component/NavItem` | `app-shell/SidebarNavItem` | shared navigation item |
| `Component/ValidationRow` | `ui/ValidationCheckRow` | reusable checklist/status row |

## Screen Composition

### `Screen/DataImport-Upload`

```text
ImportDataScreen
└── AppShell
    ├── SidebarNav
    │   └── SidebarNavItem[]
    └── main
        ├── ImportPageHeader
        ├── StepIndicator
        ├── ImportLaneCard[]
        │   ├── FileDropZone
        │   ├── SelectedFileSummary
        │   ├── ImportFeedbackBanner
        │   └── ImportProgressPanel
        └── ImportStatusPanel
```

### `Screen/DataImport-Validation`

```text
ImportDataScreen
└── AppShell
    ├── SidebarNav
    └── main
        ├── ImportPageHeader
        ├── StepIndicator
        ├── FileSummaryCard
        ├── ImportValidationPanel
        │   ├── ImportFeedbackBanner
        │   ├── ValidationCheckRow[]
        │   ├── ColumnMappingTable
        │   ├── PreviewDataTable
        │   └── ImportActionRow
        └── ImportStatusPanel
```

### `Screen/DataImport-Complete`

```text
ImportDataScreen
└── AppShell
    ├── SidebarNav
    └── main
        ├── ImportPageHeader
        ├── StepIndicator
        └── ImportSuccessPanel
            ├── StatusBadge
            ├── StatCard[]
            └── Button[]
```

## Reuse Decisions

### Shared Across The App

- `AppShell`
- `SidebarNav`
- `SidebarNavItem`
- `Button`
- `TextField`
- `StatusBadge`
- `ProgressBar`
- `StepIndicator`
- `FileSummaryCard`
- `StatCard`
- `ValidationCheckRow`

### Shared Across Data Import

- `ImportDataScreen`
- `ImportPageHeader`
- `ImportLaneCard`
- `FileDropZone`
- `SelectedFileSummary`
- `ImportFeedbackBanner`
- `ImportValidationPanel`
- `ColumnMappingTable`
- `PreviewDataTable`
- `ImportActionRow`
- `ImportProgressPanel`
- `ImportSuccessPanel`
- `ImportStatusPanel`

### Timely-Only

- `RoleMappingDialog`

## Consolidation Notes

The wireframe suggests a few separate visual blocks that should not become duplicate React components.

Use these consolidations:

- primary and secondary buttons remain one `Button` component with variants
- upload-zone visuals stay inside `FileDropZone`; do not create a second `UploadCard`
- progress visuals use `ui/ProgressBar`, while import copy and state belong to `ImportProgressPanel`
- success badges and validation badges both use one `StatusBadge`
- validation checklist items use one `ValidationCheckRow`

## Screen State Mapping

| Wireframe screen | React state | Owner |
|---|---|---|
| `Screen/DataImport-Upload` | `idle`, `file_selected`, upload-stage `error` | `ImportLaneCard` |
| `Screen/DataImport-Validation` | `preview_ready`, `importing`, validation/import `error` | `ImportValidationPanel` and `ImportProgressPanel` |
| `Screen/DataImport-Complete` | `success` | `ImportSuccessPanel` |

## Notes For Implementation

- The wireframe uses one sidebar and step pattern across all three screens, so those should be extracted into `AppShell`, `SidebarNav`, and `StepIndicator`.
- The wireframe file summary block in validation should become a reusable `FileSummaryCard`, not a one-off validation-only block.
- The stat tiles in the complete screen should become reusable `StatCard` components.
- The existing import architecture remains valid; this wireframe conversion mainly adds app-shell and shared UI primitives around it.
