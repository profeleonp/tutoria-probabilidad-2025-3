# solvers/poisson.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_poisson_mas_de_un(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    P(X > 1) = 1 - exp(-lam)(1+lam), con lam = n*p*t
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output