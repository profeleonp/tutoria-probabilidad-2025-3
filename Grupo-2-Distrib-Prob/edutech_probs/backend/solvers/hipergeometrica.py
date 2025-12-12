# solvers/hipergeometrica.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_hiper_media_var(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Produce:
      - media_hipergeometrica
      - var_hipergeometrica
    Todo desde expression_symbolic.
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output