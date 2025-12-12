# solvers/__init__.py

from .binomial import solve_binomial_exact
from .binomial_al_menos import solve_binomial_al_menos
from .comisiones import solve_valor_esperado_comisiones
from .defectuosos import solve_defectuosos
from .esferas import solve_proporcion_esferas
from .exponencial import solve_prob_falla_antes
from .hipergeometrica import solve_hiper_media_var
from .multinomial import solve_multinomial_prob
from .normal_bateria import solve_prob_bateria_entre
from .normal_mayor_que import solve_normal_mayor_que
from .poisson_exacto import solve_poisson_exacto
from .poisson import solve_poisson_mas_de_un
from .resistores import solve_resistores_media_var
from .torneo import solve_torneo_segundo_gana
from .utilidad import solve_utilidad_maxima
from .weibull import solve_prob_bateria_operacion

# Motor de render
from utils.render import render_math_result


# ======================================================
# REGISTRO DE SOLVERS "PUROS" (solo computan parámetros)
# ======================================================
SOLVER_REGISTRY = {
    "binomial_exact": solve_binomial_exact,
    "binomial_al_menos": solve_binomial_al_menos,
    "multinomial_prob": solve_multinomial_prob,
    "torneo_segundo_gana": solve_torneo_segundo_gana,
    "poisson_exacto": solve_poisson_exacto,
    "poisson_mas_de_un": solve_poisson_mas_de_un,
    "probs_defectuosos": solve_defectuosos,
    "prob_falla_antes": solve_prob_falla_antes,
    "prob_bateria_operacion": solve_prob_bateria_operacion,
    "prob_bateria_entre": solve_prob_bateria_entre,
    "normal_mayor_que": solve_normal_mayor_que,
    "media_var_resistores": solve_resistores_media_var,
    "hiper_media_var": solve_hiper_media_var,
    "valor_esperado_comisiones": solve_valor_esperado_comisiones,
    "utilidad_maxima": solve_utilidad_maxima,
}


# ======================================================
# FUNCIÓN MAESTRA —— EJECUTA CUALQUIER SOLVER + RENDER
# ======================================================
def run_solver(question_def: dict, params: dict) -> dict:
    """
    Ejecuta:
      1. solver clásico → calcula valores numéricos base
      2. motor render_math_result → produce latex + symbolic + numeric
    """

    solver_id = question_def["solver"]
    solver_fn = SOLVER_REGISTRY[solver_id]

    # 1. ejecutar solver clásico → devuelve dict con claves como "prob_exact"
    raw_results = solver_fn(question_def["id"], params)

    # 2. versionar los resultados según el JSON declarativo en question_def["math"]["results"]
    final_results = {}

    for math_def in question_def["math"]["results"]:
        result_id = math_def["id"]

        # params + resultado base para symbolic
        enriched_params = dict(params)
        if result_id in raw_results:
            enriched_params[result_id] = raw_results[result_id]

        rendered = render_math_result(math_def, enriched_params)
        final_results[result_id] = rendered

    return final_results