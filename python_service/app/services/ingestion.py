from app.models import DataSource, IngestionResult


def ingest_placeholder(source: DataSource, payload: dict) -> IngestionResult:
  rows = len(payload.get('rows', [])) if isinstance(payload, dict) else 0

  return IngestionResult(
    source=source,
    rows_processed=rows,
    warnings=['Phase 1 scaffold: parser pipeline not implemented yet.'],
  )
