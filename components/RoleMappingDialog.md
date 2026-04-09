# RoleMappingDialog

## Purpose

Timely-only extension for unresolved user-role assignment after import.

## Responsibilities

- open when Timely import returns `needsRoleMapping`
- show unresolved users
- render per-user role selection
- save or cancel mapping changes
- show inline save error if persistence fails

## Inputs

- open state
- user list
- current role values
- saving state
- error message
- role change, save, and close callbacks

## Reuse

- specific to Timely role mapping in this flow
