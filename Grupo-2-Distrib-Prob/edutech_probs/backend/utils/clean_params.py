# utils/clean_params.py

from typing import Dict, Union
from models.question_models import QuestionDefinition, ParamConfig

Number = Union[int, float]


def _normalize_probs(params: Dict[str, Number], prefix: str):
    """Normaliza probabilidades con prefijos p_, p1, p2, etc."""
    keys = [k for k in params if k.startswith(prefix)]
    if len(keys) >= 2:
        total = sum(params[k] for k in keys)
        if total > 0:
            for k in keys:
                params[k] = params[k] / total
    return params


def _fix_min_max_pair(params: Dict[str, Number], a: str, b: str):
    """Garantiza params[a] <= params[b] si ambos existen."""
    if a in params and b in params and params[a] > params[b]:
        params[a], params[b] = params[b], params[a]
    return params


def clean_params_for_question(q: QuestionDefinition, params: Dict[str, Number]) -> Dict[str, Number]:
    """
    Limpia y normaliza parámetros generados según la definición de la pregunta.
    - Normaliza probabilidades
    - Asegura relaciones lógicas
    - Corrige límites dependientes
    - Aplica type=int/float definido en el JSON
    """
    # =====================================================
    # 1. NORMALIZACIÓN AUTOMÁTICA (probabilidades múltiples)
    # =====================================================
    
    # Caso p_0, p_1, p_2 (resistores)
    _normalize_probs(params, prefix="p_")

    # Caso p1, p2, p3... (multinomial)
    _normalize_probs(params, prefix="p")

    # =====================================================
    # 2. FIXES ESPECÍFICOS POR NOMBRE DE PARÁMETRO
    # =====================================================

    # Normal batería: garantizar t_min <= t_max
    _fix_min_max_pair(params, "t_min", "t_max")

    # Defectuosos: límites <= n_muestra
    if {"n_muestra", "k_excede", "k_menor"} <= params.keys():
        n = params["n_muestra"]
        params["k_excede"] = min(params["k_excede"], n)
        params["k_menor"] = min(params["k_menor"], n)

    # Torneo: k_min <= n_partidos
    if {"n_partidos", "k_min"} <= params.keys():
        params["k_min"] = min(params["k_min"], params["n_partidos"])

    # Variables que deben ser positivas siempre
    for key in ["alpha", "desviacion_horas", "tasa", "anos"]:
        if key in params and params[key] < 0:
            params[key] = abs(params[key])

    # =====================================================
    # 3. APLICAR TYPE (int / float) DEFINIDO EN EL JSON
    # =====================================================

    cleaned: Dict[str, Number] = {}

    for name, value in params.items():
        if name not in q.params:
            cleaned[name] = value
            continue

        cfg: ParamConfig = q.params[name]

        if cfg.type == "int":
            cleaned[name] = int(round(value))
        else:
            cleaned[name] = float(value)

    # =====================================================
    # 4. REDONDEO FINAL PARA FLOATS (solo si corresponde)
    # =====================================================

    for name, value in cleaned.items():
        if isinstance(value, float):
            cleaned[name] = round(value, 5)

    return cleaned