# solvers/defectuosos.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_defectuosos(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Produce:
      - P(X > k_excede)
      - P(X < k_menor)
    según lo definido en question.json
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output