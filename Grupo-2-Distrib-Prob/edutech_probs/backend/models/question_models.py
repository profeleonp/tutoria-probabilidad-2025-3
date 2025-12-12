from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Literal, Union


# ============================================================
# 1. MODELOS BÁSICOS (compatibilidad con versión vieja)
# ============================================================

class ProblemRequest(BaseModel):
    id: str
    mode: str
    params_override: Optional[Dict[str, Any]] = None


class GeneratedProblem(BaseModel):
    id: str
    statement: str
    params: Dict[str, Any]
    correct_answer: Optional[Any] = None


class TestRequest(BaseModel):
    num_questions: int = 5


class TestQuestion(BaseModel):
    id: str
    statement: str
    options: List[float]


class GradeItem(BaseModel):
    id: str
    selected: float
    correct: float


class GradeRequest(BaseModel):
    answers: List[GradeItem]


class GradeResponse(BaseModel):
    score: float
    details: List[Dict[str, Any]]


# ============================================================
# 2. MODELOS NUEVOS (estructura del questions.json)
# ============================================================

class ParamConfig(BaseModel):
    min: float
    max: Union[float, str]
    type: Literal["int", "float"] = "float"


class VariableMeta(BaseModel):
    latex: str
    description: str


class NumericFormat(BaseModel):
    type: Literal["decimal"] = "decimal"
    decimals: int = 4
    rounding: Literal["half_up", "half_even"] = "half_up"  # alineado con utils/render.py


class ResultMathConfig(BaseModel):
    id: str
    label: str
    general_formula_latex: str
    expression_latex_template: str
    expression_symbolic: Optional[str] = None
    numeric_format: NumericFormat


class MathConfig(BaseModel):
    results: List[ResultMathConfig]


class QuestionDefinition(BaseModel):
    id: str
    version: int
    topic: str
    doc_url: Optional[str]
    doc_summary: Optional[str]
    solver: str
    template: str
    params: Dict[str, ParamConfig]
    variables: Dict[str, VariableMeta]
    math: MathConfig


# ============================================================
# 3. RESULTADOS YA COMPUTADOS (para /generate-problem)
# ============================================================

class ComputedResult(BaseModel):
    result_id: str
    label: str
    general_formula_latex: str
    instantiated_expression_latex: str
    numeric_result: float
    numeric_result_formatted: str


class GeneratedProblemLatex(BaseModel):
    id: str
    topic: str
    statement: str
    doc_url: Optional[str]
    doc_summary: Optional[str]
    params: Dict[str, Any]
    results: List[ComputedResult]