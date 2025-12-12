# solvers/binomial_al_menos.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_binomial_al_menos(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Solver unificado usando expression_symbolic y render_math_result()
    para P(X >= k).
    """
    output = {}

    # iteramos por los math results del JSON
    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output