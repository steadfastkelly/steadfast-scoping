# ImportValidationPanel

## Purpose

Compose the validation-state review UI inside a lane card.

## Responsibilities

- render validation feedback
- render field mappings
- render preview rows
- render import actions

## Inputs

- feedback message
- mapping rows
- preview rows
- preview columns
- import, cancel, replace callbacks

## Children

- `ImportFeedbackBanner`
- `ColumnMappingTable`
- `PreviewDataTable`
- `ImportActionRow`

## Reuse

- shared across all three lanes
