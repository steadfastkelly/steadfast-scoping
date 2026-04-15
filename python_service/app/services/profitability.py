from app.models import ProfitabilityResult


def profitability_placeholder() -> ProfitabilityResult:
  revenue = 0.0
  cost = 0.0
  profit = revenue - cost
  margin = 0.0

  return ProfitabilityResult(revenue=revenue, cost=cost, profit=profit, margin=margin)
