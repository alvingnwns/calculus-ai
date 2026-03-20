from __future__ import annotations

from fastapi import HTTPException
from sympy import Symbol, diff, lambdify, sympify

from app.api.schemas.requests import PlotRequest, PlotResponse, PlotTrace
from app.api.services.expression_parser import parse_math_expression


SUPERSCRIPT_MAP = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
}


def _to_superscript(value: int) -> str:
    return "".join(SUPERSCRIPT_MAP[digit] for digit in str(value))


def _derivative_trace_name(order: int) -> str:
    if order == 1:
        return "df/dx"
    superscript = _to_superscript(order)
    return f"d{superscript}f/dx{superscript}"


def _sample_expression(expr, variable: Symbol, x_min: float, x_max: float, points: int) -> tuple[list[float], list[float]]:
    function = lambdify(variable, expr, modules=["math"])
    step = (x_max - x_min) / (points - 1)
    x_values: list[float] = []
    y_values: list[float] = []

    for index in range(points):
        x_value = x_min + (step * index)
        try:
            y_value = function(x_value)
            y_float = float(y_value)
            if y_float != y_float or y_float in (float("inf"), float("-inf")):
                continue
            x_values.append(float(x_value))
            y_values.append(y_float)
        except Exception:
            continue

    return x_values, y_values


def _build_derivative_traces(request: PlotRequest) -> list[PlotTrace]:
    if request.derivative_type != "explicit" or not request.expression:
        return []

    variable = Symbol(request.variable)
    expression = parse_math_expression(request.expression)

    traces: list[PlotTrace] = []

    x_values, y_values = _sample_expression(expression, variable, request.x_min, request.x_max, request.points)
    traces.append(PlotTrace(name="f(x)", x=x_values, y=y_values))

    current = expression
    for order in range(1, request.derivative_order + 1):
        current = diff(current, variable)
        x_values, y_values = _sample_expression(current, variable, request.x_min, request.x_max, request.points)
        traces.append(PlotTrace(name=_derivative_trace_name(order), x=x_values, y=y_values))

    return traces


def _build_integral_traces(request: PlotRequest) -> list[PlotTrace]:
    if not request.expression:
        return []

    variable = Symbol(request.variable)
    expression = parse_math_expression(request.expression)
    traces: list[PlotTrace] = []

    x_values, y_values = _sample_expression(expression, variable, request.x_min, request.x_max, request.points)
    traces.append(PlotTrace(name="f(x)", x=x_values, y=y_values))

    if request.integral_type != "definite" or request.lower_bound is None or request.upper_bound is None:
        return traces

    lower = float(parse_math_expression(request.lower_bound))
    upper = float(parse_math_expression(request.upper_bound))
    integral_min = min(lower, upper)
    integral_max = max(lower, upper)

    area_x = [value for value in x_values if integral_min <= value <= integral_max]
    area_y = [y_values[idx] for idx, value in enumerate(x_values) if integral_min <= value <= integral_max]
    if area_x and area_y:
        traces.append(PlotTrace(name="Definite Area", x=area_x, y=area_y, fill="tozeroy"))

    return traces


def build_plot_data(request: PlotRequest) -> PlotResponse:
    try:
        if request.mode == "derivatives":
            traces = _build_derivative_traces(request)
            if not traces:
                return PlotResponse(mode=request.mode, traces=[], message="Graphing is currently available for explicit derivatives only.")
            return PlotResponse(mode=request.mode, traces=traces)

        if request.mode == "integral":
            traces = _build_integral_traces(request)
            return PlotResponse(mode=request.mode, traces=traces)

        return PlotResponse(mode=request.mode, traces=[], message="Graphing is currently enabled for derivatives and integrals.")
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Could not generate plot data: {error}") from error
