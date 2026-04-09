# ImportSuccessPanel

## Purpose

Render the completed import state for a lane.

## Responsibilities

- show success icon or confirmation state
- summarize returned counts
- show lane result details without hardcoded per-lane markup
- expose optional next action such as importing another file

## Inputs

- import result summary
- lane key or config
- optional next action callback

## Reuse

- shared across all three lanes
