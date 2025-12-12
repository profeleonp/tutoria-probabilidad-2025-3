import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      background: "linear-gradient(90deg, #4A90E2 0%, #357ABD 100%)",
      padding: "15px 30px",
      marginBottom: "30px",
      color: "white",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
    }}>
      <div style={{ display: "flex", gap: "30px", fontWeight: "500" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>
        <Link to="/practice" style={{ color: "white" }}>Práctica</Link>
        <Link to="/generator" style={{ color: "white" }}>Generar Ejercicio</Link>
        <Link to="/test" style={{ color: "white" }}>Examen</Link>
      </div>
    </nav>
  );
}