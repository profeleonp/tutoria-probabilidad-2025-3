import json
import random
from fastapi import FastAPI, HTTPException
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from models.question_models import (
    ProblemRequest,
    TestRequest,
    GradeRequest,
    GradeResponse,
    QuestionDefinition,
    ComputedResult,
    GeneratedProblemLatex
)

from solvers import SOLVER_REGISTRY  # (si no lo usas aún, lo puedes quitar)
from utils.clean_params import clean_params_for_question
from utils.render import render_template, render_math_result


# ======================================
# FASTAPI INIT
# ======================================
app = FastAPI(title="API Probabilidad LaTeX", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================
# CARGAR QUESTIONS JSON
# ======================================
with open("questions.json", "r") as f:
    raw = json.load(f)

QUESTIONS: Dict[str, QuestionDefinition] = {
    q["id"]: QuestionDefinition.model_validate(q) for q in raw
}


# ======================================
# GENERACIÓN DE PARÁMETROS
# ======================================
def generate_params_for_question(q: QuestionDefinition) -> Dict[str, Any]:
    params: Dict[str, Any] = {}

    for name, cfg in q.params.items():

        def resolve(val):
            if isinstance(val, str) and val in params:
                return params[val]
            return val

        min_v = resolve(cfg.min)
        max_v = resolve(cfg.max)

        if cfg.type == "int":
            params[name] = random.randint(int(min_v), int(max_v))
        else:
            params[name] = random.uniform(float(min_v), float(max_v))

    return params


# ======================================
# CRITERIO PARA USO EN TEST
# ======================================
def solver_is_numeric(q: QuestionDefinition) -> bool:
    """Una pregunta sirve para test si tiene UN solo resultado matemático."""
    return len(q.math.results) == 1


# ======================================
# ENDPOINTS
# ======================================

@app.get("/")
def root():
    return {"message": "Backend Probabilidad LaTeX v2 funcionando!"}


@app.get("/questions")
def list_questions():
    return [
        {"id": qid, "topic": q.topic, "doc_url": q.doc_url}
        for qid, q in QUESTIONS.items()
    ]


# ✅ NUEVO: Traer pregunta completa (para ranges/params en el frontend)
@app.get("/questions/{qid}")
def get_full_question(qid: str):
    q = QUESTIONS.get(qid)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q.model_dump()


# ======================================
# GENERATE PROBLEM
# ======================================
@app.post("/generate-problem")
def generate_problem(req: ProblemRequest):

    q = QUESTIONS.get(req.id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    # 1. parámetros
    params = req.params_override or generate_params_for_question(q)
    params = clean_params_for_question(q, params)

    # 2. enunciado
    statement = render_template(q.template, params)

    # 3. Procesar resultados matemáticos
    results_output = []
    for r in q.math.results:
        rendered = render_math_result(r.model_dump(), params, q)

        results_output.append(
            ComputedResult(
                result_id=rendered["id"],
                label=rendered["label"],
                general_formula_latex=rendered["general_formula_latex"],
                instantiated_expression_latex=rendered["expression_latex"],
                numeric_result=rendered["raw_numeric"],
                numeric_result_formatted=rendered["numeric_value"],
            )
        )

    return GeneratedProblemLatex(
        id=q.id,
        topic=q.topic,
        statement=statement,
        doc_url=q.doc_url,
        doc_summary=q.doc_summary,
        params=params,
        results=results_output
    )


# ======================================
# GENERATE TEST
# ======================================
@app.post("/generate-test")
def generate_test(req: TestRequest):

    valid_ids = [qid for qid, q in QUESTIONS.items() if solver_is_numeric(q)]

    if req.num_questions > len(valid_ids):
        raise HTTPException(status_code=400, detail="No hay suficientes preguntas numéricas para test.")

    selected = random.sample(valid_ids, req.num_questions)
    output = []

    for qid in selected:
        q = QUESTIONS[qid]

        params = generate_params_for_question(q)
        params = clean_params_for_question(q, params)

        statement = render_template(q.template, params)

        # Solo 1 resultado
        r = q.math.results[0]
        rendered = render_math_result(r.model_dump(), params, q)

        correct_val = rendered["numeric_value"]
        raw = rendered["raw_numeric"]

        spread = abs(raw) * 0.2 if raw != 0 else 0.1

        options = [
            correct_val,
            f"{raw + random.uniform(-spread, spread):.5f}",
            f"{raw + random.uniform(-spread, spread):.5f}",
            f"{raw + random.uniform(-spread, spread):.5f}",
        ]

        random.shuffle(options)

        output.append({
            "id": qid,
            "topic": q.topic,
            "statement": statement,
            "params": params,
            "options": options,
            "correct": correct_val,
        })

    return {"questions": output}


# ======================================
# GRADE TEST
# ======================================
@app.post("/grade-test", response_model=GradeResponse)
def grade_test(req: GradeRequest):

    total = len(req.answers)
    if total == 0:
        raise HTTPException(status_code=400, detail="No hay respuestas para calificar.")

    correct = 0
    details = []

    for a in req.answers:
        is_ok = abs(a.selected - a.correct) < 1e-6
        if is_ok:
            correct += 1

        details.append({
            "id": a.id,
            "selected": a.selected,
            "correct": a.correct,
            "is_correct": is_ok
        })

    score = round(correct / total * 100, 2)

    return GradeResponse(score=score, details=details)


# ======================================
# TOPICS
# ======================================
@app.get("/topics")
def list_topics():
    return {"topics": sorted({q.topic for q in QUESTIONS.values()})}