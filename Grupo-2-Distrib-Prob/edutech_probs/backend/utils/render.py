# utils/render.py

import ast
import math
from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_EVEN
from typing import Any, Dict


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _to_string(value: Any) -> str:
    """
    Convierte valores numéricos a string limpio,
    evitando notación científica para floats.
    """
    if isinstance(value, float):
        return f"{value:.10g}"
    return str(value)


# ---------------------------------------------------------
# TEMPLATE RENDERING (LATEX + PYTHON FORMAT SEGURO)
# ---------------------------------------------------------

def render_template(template: str, params: Dict[str, Any]) -> str:
    """
    Safe LaTeX + Python format renderer:

    1. Escapa TODAS las llaves LaTeX ({ -> {{, } -> }})
    2. Restaura ONLY placeholders reales {n}, {p}, etc.
    """
    safe = template.replace("{", "{{").replace("}", "}}")

    for key in params.keys():
        safe = safe.replace("{{" + key + "}}", "{" + key + "}")

    safe_params = {k: _to_string(v) for k, v in params.items()}
    return safe.format(**safe_params)


# ---------------------------------------------------------
# SAFE MATH ENVIRONMENT
# ---------------------------------------------------------

SAFE_MATH_FUNCS = {
    "exp": math.exp,
    "log": math.log,
    "sqrt": math.sqrt,
    "factorial": math.factorial,
    "binom": math.comb,
    "comb": math.comb,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "pi": math.pi,
    "e": math.e,
    "Phi": lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2))),  # Normal CDF
}

# Necesarios para tus expression_symbolic: sum(... for x in range(...))
SAFE_BUILTINS = {
    "sum": sum,
    "range": range,
    "min": min,
    "max": max,
    "abs": abs,
}


# ---------------------------------------------------------
# TYPE RESOLUTION (Pydantic o dict)
# ---------------------------------------------------------

def _get_param_type(q: Any, k: str) -> Any:
    """
    Retorna "int" o "float" si está definido en q.params[k].type
    Soporta:
      - q como Pydantic model (QuestionDefinition)
      - q como dict (JSON crudo)
    """
    try:
        if q is None:
            return None

        # Pydantic
        if hasattr(q, "params") and q.params and k in q.params:
            return getattr(q.params[k], "type", None)

        # dict
        if isinstance(q, dict) and "params" in q and k in q["params"]:
            return q["params"][k].get("type")

    except Exception:
        return None

    return None


# ---------------------------------------------------------
# SYMBOLIC EXPRESSION EVALUATOR (statements + expressions)
# ---------------------------------------------------------

def eval_symbolic_expression(expr: str, params: Dict[str, Any], q: Any = None) -> float:
    """
    Evalúa expression_symbolic con múltiples statements separados por ';'
    y soporta genexpr/comprehensions (sum/range) sin NameError.

    CLAVE:
      - Usa UN SOLO dict `env` como globals y locals: eval(st, env, env)
        (esto evita el bug de scopes en comprehensions con eval()).
    """
    statements = [s.strip() for s in (expr or "").split(";") if s.strip()]
    if not statements:
        raise ValueError("expression_symbolic vacío o inválido")

    # Env único (globals=locals) para que comprehensions vean params
    env: Dict[str, Any] = {
        "__builtins__": {},
        **SAFE_MATH_FUNCS,
        **SAFE_BUILTINS,
    }

    # Cargar params tipados en env
    for k, v in params.items():
        t = _get_param_type(q, k)

        if t == "int":
            env[k] = int(round(float(v)))
        else:
            if isinstance(v, int) and not isinstance(v, bool):
                env[k] = v
            else:
                env[k] = float(v)

    last_value = None

    for i, st in enumerate(statements):
        is_last = (i == len(statements) - 1)

        try:
            # Expresión (incluye sum(... for x in range(...)))
            last_value = eval(st, env, env)

        except SyntaxError:
            # Statement (asignación, etc.)
            exec(st, env, env)
            last_value = None

            # Si el último statement fue asignación, intenta devolver algo útil
            if is_last:
                if "result" in env:
                    last_value = env["result"]
                else:
                    # intenta identificar variable asignada (n=..., z=..., etc.)
                    try:
                        node = ast.parse(st)
                        assigns = [
                            n for n in node.body
                            if isinstance(n, (ast.Assign, ast.AnnAssign))
                        ]
                        if assigns:
                            a = assigns[-1]
                            target = a.targets[0] if isinstance(a, ast.Assign) else a.target
                            if isinstance(target, ast.Name) and target.id in env:
                                last_value = env[target.id]
                    except Exception:
                        pass

    if not isinstance(last_value, (int, float)):
        raise ValueError(f"Expresión no produjo un número: {expr} -> got={type(last_value)}")

    return float(last_value)


# ---------------------------------------------------------
# NUMERIC FORMATTING
# ---------------------------------------------------------

ROUNDING_MODES = {
    "half_up": ROUND_HALF_UP,
    "half_even": ROUND_HALF_EVEN,
}


def format_numeric(value: float, spec: Dict[str, Any]) -> str:
    """
    Formatea el número final para UI.
    """
    spec = spec or {"type": "decimal", "decimals": 4}
    n_dec = spec.get("decimals", 4)
    rounding = spec.get("rounding", "half_up")

    q_dec = Decimal(str(value)).quantize(
        Decimal("1." + ("0" * n_dec)),
        rounding=ROUNDING_MODES.get(rounding, ROUND_HALF_UP),
    )

    return str(q_dec)


# ---------------------------------------------------------
# MASTER RENDER FOR EACH MATH RESULT
# ---------------------------------------------------------

def render_math_result(math_def: Dict[str, Any], params: Dict[str, Any], q: Any = None) -> Dict[str, Any]:
    expr_latex = render_template(math_def["expression_latex_template"], params)

    expr_sym = math_def.get("expression_symbolic")
    if not expr_sym:
        raise ValueError(f"math result '{math_def.get('id')}' no tiene expression_symbolic")

    raw_value = eval_symbolic_expression(expr_sym, params, q)

    numeric_fmt = math_def.get("numeric_format", {"type": "decimal", "decimals": 4})
    formatted = format_numeric(raw_value, numeric_fmt)

    return {
        "id": math_def["id"],
        "label": math_def["label"],
        "general_formula_latex": math_def["general_formula_latex"],
        "expression_latex": expr_latex,
        "numeric_value": formatted,
        "raw_numeric": raw_value,
    }
