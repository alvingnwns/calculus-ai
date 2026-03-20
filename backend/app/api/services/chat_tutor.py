from __future__ import annotations

import os
from typing import Any

from app.api.schemas.requests import TutorMode


def _mode_instruction(tutor_mode: TutorMode) -> str:
	if tutor_mode == "hint":
		return "Give only a short hint, not the full final derivation."
	if tutor_mode == "full":
		return "Provide a full, clear, step-by-step solution with concise math explanations."
	return "Use Socratic tutoring: ask guiding questions first, then provide the next step if needed."


def build_chat_reply(
	*,
	tutor_mode: TutorMode,
	user_message: str,
	context: dict[str, Any],
	history: list[dict[str, str]],
) -> str:
	api_key = os.getenv("GEMINI_API_KEY")
	model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

	history_text = "\n".join([f"{turn['role']}: {turn['content']}" for turn in history[-10:]]) or "(no prior chat)"
	prompt = (
		"You are a calculus tutor inside a learning app. Be concise, accurate, and student-friendly.\n"
		f"Tutoring style: {_mode_instruction(tutor_mode)}\n\n"
		f"Current problem context: {context}\n"
		f"Recent chat history:\n{history_text}\n\n"
		f"Student message: {user_message}\n"
	)

	if api_key:
		try:
			from google import genai

			client = genai.Client(api_key=api_key)
			response = client.models.generate_content(model=model_name, contents=prompt)
			text = getattr(response, "text", None)
			if text:
				return text.strip()
		except Exception:
			pass

	return (
		"Tutor fallback mode is active. "
		f"Given your message '{user_message}', start by identifying the target operation and variable, "
		"then isolate one next symbolic step before simplifying."
	)
