export default function ParamInput({ label, value, setValue, type="number" }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ marginLeft: "10px" }}
      />
    </div>
  );
}