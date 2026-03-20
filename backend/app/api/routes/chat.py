from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas.requests import ChatRequest, ChatResponse
from app.api.services.chat_store import add_chat_message, get_chat_history
from app.api.services.chat_tutor import build_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
	history = get_chat_history(request.session_id)
	add_chat_message(session_id=request.session_id, role="user", content=request.message)

	context = {
		"mode": request.mode,
		"expression": request.expression,
		"result": request.result,
		"explanation": request.explanation,
	}

	reply = build_chat_reply(
		tutor_mode=request.tutor_mode,
		user_message=request.message,
		context=context,
		history=[{"role": message.role, "content": message.content} for message in history],
	)
	add_chat_message(session_id=request.session_id, role="assistant", content=reply)

	updated_history = get_chat_history(request.session_id)
	return ChatResponse(
		session_id=request.session_id,
		reply=reply,
		tutor_mode=request.tutor_mode,
		history=updated_history,
	)
