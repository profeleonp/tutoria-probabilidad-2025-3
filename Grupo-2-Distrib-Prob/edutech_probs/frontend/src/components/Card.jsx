export default function Card({ title, children }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "15px"
    }}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}