# solvers/utilidad.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_utilidad_maxima(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Umax = tasa^2 / (4*costo).
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output