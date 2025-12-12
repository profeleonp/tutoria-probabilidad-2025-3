# solvers/comisiones.py

from typing import Dict, Any
from utils.render import render_math_result

def solve_valor_esperado_comisiones(question_def: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Valor esperado: E = p1*c1 + p2*c2
    Todo viene del expression_symbolic.
    """
    output = {}

    for math_def in question_def["math"]["results"]:
        rendered = render_math_result(math_def, params)
        output[math_def["id"]] = rendered

    return output