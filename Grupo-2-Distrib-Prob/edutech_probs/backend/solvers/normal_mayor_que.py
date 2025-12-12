# solvers/normal_mayor_que.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_normal_mayor_que(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    P(X > limite) = 1 - Phi((limite - mu)/sigma)
    Todo viene del JSON.
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output