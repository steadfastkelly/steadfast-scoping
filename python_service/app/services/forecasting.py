from datetime import date

from app.models import ForecastRequest, ForecastResult


def forecast_placeholder(_: ForecastRequest) -> ForecastResult:
  return ForecastResult(
    expected_cost=0.0,
    recommended_price=0.0,
    projected_margin=0.0,
    generated_on=date.today(),
  )
