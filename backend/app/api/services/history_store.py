from __future__ import annotations

from collections import deque
from datetime import datetime
from typing import Any
from uuid import uuid4

from app.api.schemas.requests import HistoryItem

_MAX_ITEMS = 10
_HISTORY: deque[HistoryItem] = deque(maxlen=_MAX_ITEMS)


def add_history_item(
    *,
    mode: str,
    input_payload: dict[str, Any],
    result: str,
    details: dict[str, Any],
    explanation: str | None,
) -> HistoryItem:
    entry = HistoryItem(
        id=str(uuid4()),
        timestamp=datetime.utcnow(),
        mode=mode,
        input=input_payload,
        result=result,
        details=details,
        explanation=explanation,
    )
    _HISTORY.appendleft(entry)
    return entry


def get_history_items() -> list[HistoryItem]:
    return list(_HISTORY)
