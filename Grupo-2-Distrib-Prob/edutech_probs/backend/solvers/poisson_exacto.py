# solvers/poisson_exacto.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_poisson_exacto(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    P(X = k) usando expression_symbolic:
        exp(-lambda_) * lambda_**k / factorial(k)
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output