# solvers/torneo.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_torneo_segundo_gana(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prob segundo gana = sum desde k_min a n de binom(n, x)(1-p)^x p^(n-x)
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output