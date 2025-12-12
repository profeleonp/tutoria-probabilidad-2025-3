# solvers/exponencial.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_prob_falla_antes(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Usa expression_symbolic para:
      P(T < t) = 1 - exp(-lambda * t)
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output