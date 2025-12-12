export default function Home() {
  return (
    <div className="page-container">
      {/* HERO */}
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "white",
          borderRadius: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          border: "1px solid #e2e6ef",
          marginBottom: "45px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
            background: "linear-gradient(90deg,#4A90E2,#357ABD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Plataforma de Probabilidad
        </h1>

        <p style={{ fontSize: "18px", color: "#555", marginTop: "10px" }}>
          Aprende probabilidad practicando, generando ejercicios y presentando exámenes.
        </p>
      </div>

      {/* CARDS MENU */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "25px",
          flexWrap: "wrap",
        }}
      >
        <a href="/practice" className="card" style={{ width: "280px" }}>
          <h3>📘 Práctica Libre</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Genera ejercicios aleatorios y mejora tu intuición probabilística.
          </p>
        </a>

        <a href="/generator" className="card" style={{ width: "280px" }}>
          <h3>⚙️ Generar Ejercicio</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Personaliza parámetros, modifica valores y explora cada distribución.
          </p>
        </a>

        <a href="/test" className="card" style={{ width: "280px" }}>
          <h3>📝 Examen</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Responde un test, obtén retroalimentación visual y mide tu progreso.
          </p>
        </a>
      </div>

      {/* CREDIT CARD */}
      <div
        className="card"
        style={{
          marginTop: "45px",
          padding: "25px",
          background: "linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%)",
          borderLeft: "6px solid #4A90E2",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
            marginBottom: "12px",
            color: "#1f2d3d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          📜 Proyecto Académico
        </h3>

        <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>
          Desarrollado por <strong>Juan Daniel Vanegas Mayorquín - 20222020077</strong> y{" "}
          <strong>Juan Sebastián Colorado Caro - 20202673001</strong>.
          <br />
          Año <strong>2025 - 3</strong>.
          <br />
          Para la asignatura de <strong>Probabilidad</strong> con el docente <strong>Fernando Leon Parada Doctor en Educación Matemática DIE-UD</strong>.
          <br />
          <strong>Ingeniería de Sistemas</strong> - Facultad de Ingeniería.
        </p>

        <p
          style={{
            marginTop: "10px",
            color: "#357ABD",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          Universidad Distrital Francisco José de Caldas
        </p>
      </div>
    </div>
  );
}