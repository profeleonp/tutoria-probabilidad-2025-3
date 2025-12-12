import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "../api/backend";
import TeX from "@matejmazur/react-katex";

export default function Test() {
  const [num, setNum] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  // Detecta si un texto contiene LaTeX
  function isLatex(text) {
    return /\\|\\$|\\^|\\_/.test(text);
  }

  // ------------------------------------
  // GENERAR TEST
  // ------------------------------------
  async function generateTest() {
    const res = await backend.generateTest(num);
    setQuestions(res.questions);
    setAnswers({});
  }

  // ------------------------------------
  // SELECCIÓN DE RESPUESTA
  // ------------------------------------
  function selectAnswer(qid, selectedValue, correctValue) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        selected: parseFloat(selectedValue),
        correct: parseFloat(correctValue)
      }
    }));
  }

  // ------------------------------------
  // ENVIAR RESPUESTAS
  // ------------------------------------
  async function submitTest() {
    const payload = Object.entries(answers).map(([id, a]) => ({
      id,
      selected: a.selected,
      correct: a.correct
    }));

    const res = await backend.gradeTest(payload);

    navigate("/test/resolve", {
      state: {
        results: res,
        questions
      }
    });
  }

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "32px", marginBottom: "10px" }}>📝 Generar Test</h2>
      <p style={{ color: "#555", marginBottom: "25px", fontSize: "17px" }}>
        Define la cantidad de preguntas y responde el test para evaluar tu nivel.
      </p>

      {/* ---------------------- */}
      {/* CARD GENERACIÓN TEST   */}
      {/* ---------------------- */}
      <div className="card" style={{ marginBottom: "35px" }}>
        <label style={{ fontWeight: "600" }}>Número de preguntas:</label>

        <input
          type="number"
          value={num}
          min={1}
          max={10}
          onChange={(e) => setNum(parseInt(e.target.value))}
          style={{ width: "100%", marginTop: "10px" }}
        />

        <button
          className="btn btn-primary"
          onClick={generateTest}
          style={{ marginTop: "18px", width: "100%" }}
        >
          Generar Test
        </button>
      </div>

      {/* ---------------------- */}
      {/* PREGUNTAS DEL TEST     */}
      {/* ---------------------- */}
      {questions.length > 0 && (
        <div style={{ animation: "fadeIn 0.2s ease" }}>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="card"
              style={{
                padding: "22px",
                marginBottom: "25px",
                borderLeft: "6px solid #4A90E2",
                background: "white"
              }}
            >
              {/* Enunciado con Soporte LaTeX */}
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "12px"
                }}
              >
                {i + 1}.{" "}
                {isLatex(q.statement) ? (
                  <TeX block math={q.statement} />
                ) : (
                  <span>{q.statement}</span>
                )}
              </div>

              {/* OPCIONES */}
              <div style={{ marginTop: "10px" }}>
                {q.options.map((opt, idx) => {
                  return (
                    <label
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #dcdcdc",
                        marginBottom: "10px",
                        cursor: "pointer",
                        transition: "0.2s",
                        background:
                          answers[q.id]?.selected === parseFloat(opt)
                            ? "#e8f0ff"
                            : "white"
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        onChange={() => selectAnswer(q.id, opt, q.correct)}
                        style={{ transform: "scale(1.2)" }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* BOTÓN SUBMIT */}
          <button
            onClick={submitTest}
            className="btn btn-success"
            style={{
              marginTop: "25px",
              width: "100%",
              fontSize: "17px",
              padding: "12px"
            }}
          >
            Enviar examen
          </button>
        </div>
      )}
    </div>
  );
}