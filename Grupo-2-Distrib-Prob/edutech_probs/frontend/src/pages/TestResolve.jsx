import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TeX from "@matejmazur/react-katex";

// Detectar si un texto contiene LaTeX
function isLatex(text) {
  return /\\|\\$|\\^|\\_/.test(text);
}

// Cargar Chart.js dinámicamente
function loadChartJs() {
  return new Promise((resolve) => {
    if (window.Chart) return resolve();

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export default function TestResolve() {
  const { state } = useLocation();
  if (!state) return <div>No hay resultados.</div>;

  const { results, questions } = state;

  // Agrupar fallos por tema
  const topicStats = {};
  results.details.forEach((d) => {
    const q = questions.find((q) => q.id === d.id);
    if (!q) return;

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, wrong: 0 };
    }
    if (d.is_correct) topicStats[q.topic].correct++;
    else topicStats[q.topic].wrong++;
  });

  const topics = Object.keys(topicStats);
  const correctCounts = topics.map((t) => topicStats[t].correct);
  const wrongCounts = topics.map((t) => topicStats[t].wrong);

  // Gráficas
  useEffect(() => {
    loadChartJs().then(() => {

      new window.Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
          labels: ["Correctas", "Incorrectas"],
          datasets: [
            {
              data: [
                results.details.filter((d) => d.is_correct).length,
                results.details.filter((d) => !d.is_correct).length
              ],
              backgroundColor: ["#28A745", "#DC3545"]
            }
          ]
        }
      });

      new window.Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels: topics,
          datasets: [
            {
              label: "Correctas",
              data: correctCounts,
              backgroundColor: "#28A745"
            },
            {
              label: "Incorrectas",
              data: wrongCounts,
              backgroundColor: "#DC3545"
            }
          ]
        },
        options: {
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true } }
        }
      });
    });
  }, []);

  return (
    <div className="page-container">
      <h2 style={{ fontSize: "32px", marginBottom: "5px" }}>📊 Resultados del Test</h2>
      <p style={{ fontSize: "18px", color: "#555" }}>
        Tu desempeño general y retroalimentación detallada
      </p>

      {/* SCORE CARD */}
      <div
        className="card"
        style={{
          padding: "25px",
          marginTop: "25px",
          textAlign: "center",
          borderLeft: results.score >= 60 ? "5px solid #28A745" : "5px solid #DC3545",
        }}
      >
        <h3 style={{ fontSize: "26px", marginBottom: "12px" }}>Puntaje total</h3>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: results.score >= 60 ? "#28A745" : "#DC3545",
          }}
        >
          {results.score}%
        </div>

        <p style={{ marginTop: "10px", fontSize: "16px", color: "#666" }}>
          {results.score >= 60
            ? "Excelente trabajo, sigue así 💪"
            : "Puedes mejorar, revisa los temas sugeridos 📘"}
        </p>
      </div>

      {/* GRÁFICAS */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
          marginTop: "40px",
          marginBottom: "40px"
        }}
      >
        <div className="card" style={{ width: "300px" }}>
          <h4 style={{ marginBottom: "12px" }}>Distribución</h4>
          <canvas id="pieChart"></canvas>
        </div>

        <div className="card" style={{ width: "500px", maxWidth: "100%" }}>
          <h4 style={{ marginBottom: "12px" }}>Aciertos por tema</h4>
          <canvas id="barChart"></canvas>
        </div>
      </div>

      {/* LISTA DE PREGUNTAS */}
      <h3 style={{ marginBottom: "18px" }}>Detalles de tus respuestas</h3>

      {results.details.map((d, idx) => {
        const q = questions.find((q) => q.id === d.id);
        const isCorrect = d.is_correct;

        return (
          <div
            key={idx}
            className="card"
            style={{
              borderLeft: isCorrect ? "5px solid #28A745" : "5px solid #DC3545",
              background: isCorrect ? "#f1fff4" : "#fff5f5",
              padding: "20px",
              marginBottom: "25px",
              animation: "fadeIn 0.2s ease"
            }}
          >
            {/* Enunciado seguro */}
            <p style={{ fontSize: "17px", marginBottom: "10px" }}>
              <strong>{idx + 1}. </strong>

              {isLatex(q.statement) ? (
                <TeX block math={q.statement} />
              ) : (
                <span>{q.statement}</span>
              )}
            </p>

            {/* Respuestas */}
            <p style={{ marginBottom: "10px" }}>
              <strong>Seleccionado:</strong> {d.selected} <br />
              <strong>Correcto:</strong> {d.correct}
            </p>

            {isCorrect ? (
              <span style={{ color: "#28A745", fontWeight: "700" }}>
                ✔ Respuesta correcta
              </span>
            ) : (
              <span style={{ color: "#DC3545", fontWeight: "700" }}>
                ✘ Respuesta incorrecta
              </span>
            )}

            {/* BLOQUE DE REPASO */}
            {!isCorrect && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #dcdcdc",
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: "8px" }}>
                  📘 Repaso recomendado
                </h4>

                <p style={{ margin: 0 }}>
                  <strong>Tema:</strong> {q.topic}
                </p>

                {q.doc_summary && (
                  <p style={{ marginTop: "8px", fontStyle: "italic", color: "#666" }}>
                    {q.doc_summary}
                  </p>
                )}

                {q.doc_url && (
                  <a
                    href={q.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      fontWeight: "600",
                      color: "#1E88E5"
                    }}
                  >
                    Leer documentación
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}