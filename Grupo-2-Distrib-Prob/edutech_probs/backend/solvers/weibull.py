# solvers/weibull.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_prob_bateria_operacion(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    P(T > t) = exp(-(t/alpha)^beta)
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output