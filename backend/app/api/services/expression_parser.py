from __future__ import annotations

from sympy import oo as infinity
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)


TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


def parse_math_expression(raw: str):
    return parse_expr(raw, transformations=TRANSFORMATIONS, local_dict={"oo": infinity})
