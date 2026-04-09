# FileDropZone

## Purpose

Single file acquisition surface for an import lane.

## Responsibilities

- handle drag-enter, drag-over, drag-leave, and drop
- trigger native file picker through Browse
- validate file extension before handoff
- render idle, hover, focus, and local file-type error states

## Inputs

- accepted extensions
- browse callback
- file-selected callback
- local error message

## Does Not Own

- backend parsing
- lane success state
- import status refresh

## Reuse

- shared across all three lanes
