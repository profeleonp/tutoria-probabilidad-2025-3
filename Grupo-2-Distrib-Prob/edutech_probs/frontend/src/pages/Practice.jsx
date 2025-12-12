import { useState, useEffect } from "react";
import backend from "../api/backend";
import TeX from "@matejmazur/react-katex";

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState("");
  const [problem, setProblem] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    backend.getQuestions().then(setQuestions);
  }, []);

  async function generate() {
    if (!selected) return;
    const data = await backend.generateProblem(selected, null, "repaso");
    setProblem(data);
    setShowSolution(false);
  }

  // Detecta si el enunciado tiene LaTeX
  function isLatex(text) {
    return /\\|\\$|\\^|\\_/.test(text);
  }

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "32px", marginBottom: "10px" }}>🧠 Práctica Libre</h2>
      <p style={{ color: "#555", marginBottom: "30px", fontSize: "17px" }}>
        Selecciona un ejercicio y practica con parámetros aleatorios.
      </p>

      {/* SELECTOR */}
      <div className="card">
        <label style={{ fontWeight: "600" }}>Ejercicio:</label>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ width: "100%", marginTop: "12px" }}
        >
          <option value="">Seleccione un ejercicio…</option>

          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.topic} — {q.id}
            </option>
          ))}
        </select>

        <button
          className="btn btn-primary"
          onClick={generate}
          style={{ marginTop: "18px", width: "100%" }}
        >
          Generar ejercicio
        </button>
      </div>

      {/* RESULTADO */}
      {problem && (
        <div className="card" style={{ padding: "25px", marginTop: "25px" }}>
          <h3 style={{ marginTop: 0, fontSize: "24px" }}>Enunciado</h3>

          {/* Render híbrido LaTeX / Texto */}
          {isLatex(problem.statement) ? (
            <TeX block math={problem.statement} />
          ) : (
            <p style={{ fontSize: "18px", lineHeight: "1.6" }}>
              {problem.statement}
            </p>
          )}

          {/* RESUMEN TEÓRICO */}
          {problem.doc_summary && (
            <div
              style={{
                background: "#eaf3ff",
                padding: "18px",
                borderRadius: "10px",
                marginTop: "25px",
                borderLeft: "5px solid #4A90E2",
              }}
            >
              <h4 style={{ marginTop: 0, fontSize: "18px" }}>📘 Resumen teórico</h4>
              <p style={{ margin: 0 }}>{problem.doc_summary}</p>
            </div>
          )}

          {problem.doc_url && (
            <p style={{ marginTop: "20px" }}>
              <a
                href={problem.doc_url.value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: "600" }}
              >
                📚 Ver documentación completa ({problem.doc_url}) - Nota: La documentacion se encuentra en multiples lenguajes, la traduccion de esta se encuentra fuera del rango de la aplicacion.
              </a>
            </p>
          )}

          {/* SOLUCIÓN */}
          <div style={{ marginTop: "30px" }}>
            <button
              className={`btn ${showSolution ? "btn-gray" : "btn-success"}`}
              onClick={() => setShowSolution((v) => !v)}
            >
              {showSolution ? "Ocultar solución" : "Mostrar solución"}
            </button>

            {showSolution && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "18px",
                  borderRadius: "10px",
                  background: "#fafbff",
                }}
              >
                <h4>Solución detallada</h4>

                {problem.results.map((res) => (
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

                    <TeX block math={res.general_formula_latex} />
                    <TeX block math={res.instantiated_expression_latex} />

                    <p>
                      <strong>Valor numérico:</strong>{" "}
                      {res.numeric_result_formatted}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}