# ImportLaneCard

## Purpose

Reusable container for one import lane.

## Responsibilities

- render lane header, instructions, and count badge from config
- switch lane UI by status:
  - `idle`
  - `file_selected`
  - `preview_ready`
  - `importing`
  - `success`
  - `error`
- delegate file acquisition, validation, progress, success, and error subviews

## Inputs

- lane config
- lane state
- record count
- browse, drop, cancel, replace, import, retry callbacks

## Children

- `FileDropZone`
- `SelectedFileSummary`
- `ImportFeedbackBanner`
- `ImportValidationPanel`
- `ImportProgressPanel`
- `ImportSuccessPanel`

## Reuse Rule

- use this same component for invoices, payments, and Timely
