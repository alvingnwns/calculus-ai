from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas.requests import CalculationRequest, CalculationResponse
from app.api.services.history_store import add_history_item
from app.api.services.llm_explainer import build_explanation
from app.api.services.math_engine import solve_calculus

router = APIRouter(prefix="/calculate", tags=["calculate"])


@router.post("", response_model=CalculationResponse)
def calculate(request: CalculationRequest) -> CalculationResponse:
	solved = solve_calculus(request)
	explanation = build_explanation(request.mode, request.model_dump(), solved) if request.explain else None

	add_history_item(
		mode=request.mode,
		input_payload=request.model_dump(),
		result=solved["result"],
		details=solved.get("details", {}),
		explanation=explanation,
	)

	return CalculationResponse(
		mode=request.mode,
		result=solved["result"],
		details=solved.get("details", {}),
		explanation=explanation,
	)
