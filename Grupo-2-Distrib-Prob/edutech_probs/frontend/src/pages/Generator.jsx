import { useState, useEffect } from "react";
import backend from "../api/backend";
import TeX from "@matejmazur/react-katex";

export default function Generator() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState("");

  const [resolvedId, setResolvedId] = useState(null);
  const [result, setResult] = useState(null);

  const [customParams, setCustomParams] = useState(null);
  const [paramRanges, setParamRanges] = useState(null);

  // ------------------------------
  // Cargar lista de preguntas
  // ------------------------------
  useEffect(() => {
    fetch("http://127.0.0.1:8000/questions")
      .then((r) => r.json())
      .then((data) => setQuestions(data))
      .catch((e) => console.error("Error cargando /questions:", e));
  }, []);

  // Resolve min/max cuando hay dependencias dinámicas
  function resolveRange(key) {
    if (!paramRanges || !customParams) return { min: null, max: null };

    const rule = paramRanges[key];
    if (!rule) return { min: null, max: null };

    let minVal = rule.min;
    let maxVal = rule.max;

    if (typeof minVal === "string") minVal = customParams[minVal];
    if (typeof maxVal === "string") maxVal = customParams[maxVal];

    // fallback por si quedan null/undefined
    if (minVal === undefined || minVal === null) minVal = 0;
    if (maxVal === undefined || maxVal === null) maxVal = 1;

    return { min: minVal, max: maxVal };
  }

  // ------------------------------
  // Generar ejercicio normal
  // ------------------------------
  async function handleGenerate() {
    if (!selected) return;

    const qInfo = questions.find((q) => q.id === selected);
    if (!qInfo) return;

    try {
      setResolvedId(selected);

      // Guardamos ranges del JSON
      const fullData = await backend.getFullQuestion(selected);
      setParamRanges(fullData.params);

      const data = await backend.generateProblem(selected, null, "repaso");
      setResult(data);
      setCustomParams(data.params);
    } catch (e) {
      console.error("Error generando ejercicio:", e);
    }
  }

  // ------------------------------
  // Actualizar parámetro manual
  // ------------------------------
  function updateParam(key, value) {
    const numeric = Number(value);
    setCustomParams((prev) => ({
      ...(prev || {}),
      [key]: isNaN(numeric) ? value : numeric,
    }));
  }

  // ------------------------------
  // Resolver con valores cambiados
  // ------------------------------
  async function handleSolveCustom() {
    if (!resolvedId || !customParams) return;

    try {
      const data = await backend.generateProblem(resolvedId, customParams, "repaso");
      setResult(data);
    } catch (e) {
      console.error("Error resolviendo con params personalizados:", e);
    }
  }

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "32px" }}>⚙️ Generar Ejercicio</h2>

      {/* SELECTOR */}
      <div className="card">
        <label>Seleccione ejercicio:</label>

        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setResult(null);
            setCustomParams(null);
            setParamRanges(null);
            setResolvedId(null);
          }}
          style={{ width: "100%", marginTop: "12px" }}
        >
          <option value="">Seleccione una opción</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.id} — {q.topic}
            </option>
          ))}
        </select>

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          style={{ marginTop: "18px" }}
        >
          Generar ejercicio
        </button>
      </div>

      {/* RESULTADO */}
      {result && (
        <div className="card" style={{ marginTop: "25px" }}>
          <h3>Enunciado</h3>

          {/* ✅ Enunciado es texto normal (NO KaTeX) */}
          <p style={{ whiteSpace: "pre-wrap", marginTop: "10px", lineHeight: 1.5 }}>
            {result.statement}
          </p>

          {/* PARÁMETROS EDITABLES */}
          <h4 style={{ marginTop: "30px" }}>Modificar parámetros</h4>

          {customParams &&
            Object.keys(customParams).map((key) => {
              const { min, max } = resolveRange(key);

              const rule = paramRanges?.[key];
              const isInt = rule?.type === "int";

              return (
                <div key={key} style={{ marginBottom: "25px" }}>
                  <label style={{ fontWeight: "600" }}>
                    {key}: {customParams[key]}{" "}
                    <span style={{ color: "#777" }}>
                      ({min} – {max})
                    </span>
                  </label>

                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={isInt ? 1 : "any"}
                    value={customParams[key]}
                    onChange={(e) => updateParam(key, e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <input
                    type="number"
                    value={customParams[key]}
                    min={min}
                    max={max}
                    step={isInt ? 1 : "any"}
                    onChange={(e) => updateParam(key, e.target.value)}
                    style={{ width: "140px", marginTop: "6px" }}
                  />
                </div>
              );
            })}

          <button className="btn btn-success" onClick={handleSolveCustom}>
            Resolver con parámetros personalizados
          </button>

          {/* ================================ */}
          {/*    MOSTRAR RESULTADOS EN LATEX    */}
          {/* ================================ */}
          <h3 style={{ marginTop: "30px" }}>Resultados</h3>

          {result.results.map((res) => (
            <div
              key={res.result_id}
              style={{
                background: "#eef4ff",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <strong>{res.label}</strong>

              <div style={{ marginTop: "10px" }}>
                <TeX block math={res.general_formula_latex} />
              </div>

              <div style={{ marginTop: "10px" }}>
                <TeX block math={res.instantiated_expression_latex} />
              </div>

              <p>
                <strong>Valor numérico:</strong> {res.numeric_result_formatted}
              </p>
            </div>
          ))}

          {/* DOCUMENTACIÓN */}
          {result.doc_url && (
            <>
              <h4>📚 Documentación</h4>
              {/* ✅ doc_url es string */}
              <a href={result.doc_url} target="_blank" rel="noreferrer">
                Ver documentación completa - Nota: La documentacion se encuentra en multiples lenguajes, la
                traduccion de esta se encuentra fuera del rango de la aplicacion
              </a>
              <p style={{ marginTop: "10px" }}>{result.doc_summary}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}