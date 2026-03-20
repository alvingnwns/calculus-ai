from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


CalculationMode = Literal["limits", "derivatives", "integral", "series"]
DerivativeType = Literal["explicit", "implicit", "parametric"]
IntegralType = Literal["definite", "indefinite"]
SeriesType = Literal["maclaurin", "taylor"]
SeriesPreset = Literal["sin", "cos", "ln", "exp"]
LimitDirection = Literal["+", "-", "+-"]


class CalculationRequest(BaseModel):
	mode: CalculationMode

	expression: str | None = Field(
		default=None,
		description="Primary expression for limits, explicit derivatives, and integrals.",
	)
	variable: str = Field(default="x", min_length=1, max_length=5)

	point: str | None = Field(default=None, description="Limit point, e.g. 0, 2, oo")
	limit_direction: LimitDirection = "+-"

	derivative_type: DerivativeType = "explicit"
	derivative_order: int = Field(default=1, ge=1, le=3)
	parametric_x: str | None = None
	parametric_y: str | None = None

	integral_type: IntegralType = "indefinite"
	lower_bound: str | None = None
	upper_bound: str | None = None

	series_type: SeriesType = "maclaurin"
	series_order: int = Field(default=6, ge=1, le=20)
	series_center: str | None = None
	series_preset: SeriesPreset | None = None

	explain: bool = True


class CalculationResponse(BaseModel):
	mode: CalculationMode
	result: str
	details: dict[str, Any] = Field(default_factory=dict)
	explanation: str | None = None


class HistoryItem(BaseModel):
	id: str
	timestamp: datetime
	mode: CalculationMode
	input: dict[str, Any]
	result: str
	details: dict[str, Any] = Field(default_factory=dict)
	explanation: str | None = None


class HistoryResponse(BaseModel):
	total: int
	items: list[HistoryItem]
