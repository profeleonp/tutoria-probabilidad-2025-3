# solvers/resistores.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_resistores_media_var(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    E[X] = p1 + 2p2
    Var(X) = EX2 - EX^2
    Todo sale del symbolic.
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output