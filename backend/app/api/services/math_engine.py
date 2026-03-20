from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from sympy import Abs, Eq, Function, Symbol, diff, integrate, limit, log, series, simplify, sin, cos, exp
from sympy import oo as infinity
from sympy import sympify

from app.api.schemas.requests import CalculationRequest
from app.api.services.expression_parser import parse_math_expression


def _sympify_value(raw: str | None):
	if raw is None:
		return None
	return parse_math_expression(raw)


def _require_expression(request: CalculationRequest) -> str:
	if not request.expression:
		raise HTTPException(status_code=400, detail="`expression` is required for this mode.")
	return request.expression


def _solve_limit(request: CalculationRequest) -> dict[str, Any]:
	expression_text = _require_expression(request)
	if request.point is None:
		raise HTTPException(status_code=400, detail="`point` is required for limits.")

	variable = Symbol(request.variable)
	expression = parse_math_expression(expression_text)
	point = _sympify_value(request.point)
	direction = "+" if request.limit_direction == "+-" else request.limit_direction

	answer = simplify(limit(expression, variable, point, dir=direction))
	return {
		"result": str(answer),
		"details": {
			"expression": str(expression),
			"variable": request.variable,
			"point": str(point),
			"direction": request.limit_direction,
		},
	}


def _solve_explicit_derivative(request: CalculationRequest) -> dict[str, Any]:
	expression_text = _require_expression(request)
	variable = Symbol(request.variable)
	expression = parse_math_expression(expression_text)

	derivatives: list[str] = []
	current = expression
	for _ in range(request.derivative_order):
		current = simplify(diff(current, variable))
		derivatives.append(str(current))

	return {
		"result": derivatives[-1],
		"details": {
			"expression": str(expression),
			"lower_orders": derivatives,
		},
	}


def _solve_implicit_derivative(request: CalculationRequest) -> dict[str, Any]:
	expression_text = _require_expression(request)
	x = Symbol(request.variable)
	y = Symbol("y")

	if "=" in expression_text:
		lhs, rhs = expression_text.split("=", 1)
		equation = simplify(parse_math_expression(lhs) - parse_math_expression(rhs))
	else:
		equation = simplify(parse_math_expression(expression_text))

	fx = diff(equation, x)
	fy = diff(equation, y)

	if fy == 0:
		raise HTTPException(status_code=400, detail="Cannot compute implicit derivative because dF/dy = 0.")

	y_prime = simplify(-fx / fy)
	derivatives: list[Any] = [y_prime]

	for _ in range(2, request.derivative_order + 1):
		prev = derivatives[-1]
		total_derivative = simplify(diff(prev, x) + diff(prev, y) * y_prime)
		derivatives.append(total_derivative)

	return {
		"result": str(derivatives[-1]),
		"details": {
			"equation": str(equation),
			"lower_orders": [str(item) for item in derivatives],
		},
	}


def _solve_parametric_derivative(request: CalculationRequest) -> dict[str, Any]:
	if not request.parametric_x or not request.parametric_y:
		raise HTTPException(status_code=400, detail="`parametric_x` and `parametric_y` are required for parametric derivatives.")

	t = Symbol(request.variable)
	x_t = parse_math_expression(request.parametric_x)
	y_t = parse_math_expression(request.parametric_y)
	dx_dt = diff(x_t, t)

	if dx_dt == 0:
		raise HTTPException(status_code=400, detail="dx/dt is zero; cannot compute dy/dx.")

	derivatives: list[Any] = []
	current = simplify(diff(y_t, t) / dx_dt)
	derivatives.append(current)

	for _ in range(2, request.derivative_order + 1):
		current = simplify(diff(current, t) / dx_dt)
		derivatives.append(current)

	return {
		"result": str(derivatives[-1]),
		"details": {
			"x_t": str(x_t),
			"y_t": str(y_t),
			"lower_orders": [str(item) for item in derivatives],
		},
	}


def _solve_derivative(request: CalculationRequest) -> dict[str, Any]:
	if request.derivative_type == "explicit":
		return _solve_explicit_derivative(request)
	if request.derivative_type == "implicit":
		return _solve_implicit_derivative(request)
	return _solve_parametric_derivative(request)


def _solve_integral(request: CalculationRequest) -> dict[str, Any]:
	expression_text = _require_expression(request)
	variable = Symbol(request.variable)
	expression = parse_math_expression(expression_text)

	if request.integral_type == "indefinite":
		answer = simplify(integrate(expression, variable))
		return {
			"result": str(answer),
			"details": {
				"expression": str(expression),
				"type": "indefinite",
			},
		}

	if request.lower_bound is None or request.upper_bound is None:
		raise HTTPException(status_code=400, detail="`lower_bound` and `upper_bound` are required for definite integrals.")

	lower_bound = _sympify_value(request.lower_bound)
	upper_bound = _sympify_value(request.upper_bound)

	signed_integral = simplify(integrate(expression, (variable, lower_bound, upper_bound)))
	total_area = simplify(integrate(Abs(expression), (variable, lower_bound, upper_bound)))

	return {
		"result": str(total_area),
		"details": {
			"expression": str(expression),
			"type": "definite",
			"lower_bound": str(lower_bound),
			"upper_bound": str(upper_bound),
			"signed_integral": str(signed_integral),
			"total_area": str(total_area),
		},
	}


def _solve_series(request: CalculationRequest) -> dict[str, Any]:
	variable = Symbol(request.variable)

	if request.series_preset:
		presets = {
			"sin": sin(variable),
			"cos": cos(variable),
			"ln": log(1 + variable),
			"exp": exp(variable),
		}
		expression = presets[request.series_preset]
	elif request.expression:
		expression = parse_math_expression(request.expression)
	else:
		raise HTTPException(status_code=400, detail="Provide either `series_preset` or `expression` for series mode.")

	center = parse_math_expression("0") if request.series_type == "maclaurin" else _sympify_value(request.series_center)
	if center is None:
		raise HTTPException(status_code=400, detail="`series_center` is required for Taylor series.")

	expanded = series(expression, variable, center, request.series_order + 1).removeO()
	return {
		"result": str(simplify(expanded)),
		"details": {
			"expression": str(expression),
			"series_type": request.series_type,
			"center": str(center),
			"order": request.series_order,
		},
	}


def solve_calculus(request: CalculationRequest) -> dict[str, Any]:
	try:
		if request.mode == "limits":
			return _solve_limit(request)
		if request.mode == "derivatives":
			return _solve_derivative(request)
		if request.mode == "integral":
			return _solve_integral(request)
		return _solve_series(request)
	except HTTPException:
		raise
	except Exception as error:
		raise HTTPException(status_code=400, detail=f"Could not solve problem: {error}") from error
