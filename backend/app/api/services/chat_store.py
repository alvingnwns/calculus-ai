from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime

from app.api.schemas.requests import ChatMessage

_MAX_MESSAGES = 20
_SESSIONS: defaultdict[str, deque[ChatMessage]] = defaultdict(lambda: deque(maxlen=_MAX_MESSAGES))


def add_chat_message(*, session_id: str, role: str, content: str) -> ChatMessage:
	message = ChatMessage(role=role, content=content, timestamp=datetime.utcnow())
	_SESSIONS[session_id].append(message)
	return message


def get_chat_history(session_id: str) -> list[ChatMessage]:
	return list(_SESSIONS.get(session_id, []))
