from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


DataSource = Literal['timely', 'invoices', 'payments']


class IngestionResult(BaseModel):
  source: DataSource
  rows_processed: int = 0
  warnings: list[str] = Field(default_factory=list)


class ReconcileRequest(BaseModel):
  file_path: str
  output_path: Optional[str] = None


class ReconcileResult(BaseModel):
  rows_processed: int
  matched_records: int
  unmatched_records: int
  discrepancy_records: int
  confidence_score: float
  match_rate: float
  discrepancy_rate: float
  unmatched_rate: float
  risk_status: str
  leadership_alerts: list[str] = Field(default_factory=list)
  output_path: str


class ProfitabilityResult(BaseModel):
  revenue: float
  cost: float
  profit: float
  margin: float


class ForecastRequest(BaseModel):
  project_id: Optional[str] = None
  horizon_months: int = 3


class ForecastResult(BaseModel):
  expected_cost: float
  recommended_price: float
  projected_margin: float
  generated_on: date


class ClickUpWorkloadRequest(BaseModel):
  team_id: str
  list_ids: list[str] = Field(default_factory=list)
  horizon_days: int = 14
  token: Optional[str] = None


class AssigneeWorkload(BaseModel):
  assignee_id: str
  assignee_name: str
  open_tasks: int
  overdue_tasks: int
  due_soon_tasks: int


class ClickUpWorkloadResult(BaseModel):
  source: Literal['clickup'] = 'clickup'
  team_id: str
  horizon_days: int
  total_open_tasks: int
  tasks_due_soon: int
  tasks_overdue: int
  assignees: list[AssigneeWorkload] = Field(default_factory=list)
  warnings: list[str] = Field(default_factory=list)
