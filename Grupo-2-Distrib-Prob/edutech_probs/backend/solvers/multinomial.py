# solvers/multinomial.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_multinomial_prob(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prob multinomial: n!/(c1!c2!...ck!) p1^c1...
    Pero ahora TODO viene de expression_symbolic.
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output