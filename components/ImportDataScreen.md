# ImportDataScreen

## Purpose

Route-level owner for `/import`.

## Owns

- page layout
- lane registry for invoices, payments, and Timely
- lane state
- import counts
- reconciliation readiness
- Timely role mapping dialog state

## Responsibilities

- render `ImportPageHeader`
- render three `ImportLaneCard` instances
- render `ImportStatusPanel`
- load import status on screen entry
- refresh counts after successful imports
- coordinate IPC calls through a page-level orchestration layer

## Does Not Own

- drag-and-drop DOM behavior
- preview table rendering
- mapping table rendering

## Children

- `ImportPageHeader`
- `ImportLaneCard`
- `ImportStatusPanel`
- `RoleMappingDialog`
