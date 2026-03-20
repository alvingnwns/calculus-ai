from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas.requests import HistoryResponse
from app.api.services.history_store import get_history_items

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryResponse)
def history() -> HistoryResponse:
	items = get_history_items()
	return HistoryResponse(total=len(items), items=items)
