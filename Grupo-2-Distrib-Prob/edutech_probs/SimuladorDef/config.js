// config.js
// Lee el DOM de la pestaña Configuración y valida los datos

import { parseProbStrict } from "./utils.js";

function clearErrors() {
  const errorBox = document.getElementById("errorBox");
  if (errorBox) {
    errorBox.innerHTML = "";
  }
  ["pA", "pB", "pC"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
}

function showErrors(errors) {
  const errorBox = document.getElementById("errorBox");
  if (!errorBox) return;
  if (!errors || errors.length === 0) {
    errorBox.innerHTML = "";
    return;
  }
  const list = `<ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`;
  errorBox.innerHTML = list;
}

export function getConfigFromInputs() {
  clearErrors();
  const errors = [];

  const nameA = (document.getElementById("nameAInput").value || "").trim() || "A";
  const nameB = (document.getElementById("nameBInput").value || "").trim() || "B";
  const nameC = (document.getElementById("nameCInput").value || "").trim() || "C";

  const probs = {};
  const names = { A: nameA, B: nameB, C: nameC };

  const probFields = [
    { key: "A", inputId: "pA", label: nameA },
    { key: "B", inputId: "pB", label: nameB },
    { key: "C", inputId: "pC", label: nameC },
  ];

  for (const pf of probFields) {
    const input = document.getElementById(pf.inputId);
    const parsed = parseProbStrict(input.value);
    if (!parsed.ok) {
      errors.push(`Probabilidad de ${pf.label}: ${parsed.error}`);
      input.classList.add("input-error");
    } else {
      probs[pf.key] = parsed.value;
    }
  }

  const strategies = {
    A: document.getElementById("sA").value,
    B: document.getElementById("sB").value,
    C: document.getElementById("sC").value,
  };

  const turnMode = document.getElementById("turnMode").value;

  const fixed1 = document.getElementById("fixed1").value;
  const fixed2 = document.getElementById("fixed2").value;
  const fixed3 = document.getElementById("fixed3").value;
  const fixedOrder = [fixed1, fixed2, fixed3];

  if (turnMode === "fixed") {
    const set = new Set(fixedOrder);
    if (set.size !== 3 || !set.has("A") || !set.has("B") || !set.has("C")) {
      errors.push(
        "En orden fijo, debes usar exactamente una vez a A, B y C (por ejemplo A → B → C)."
      );
    }
  }

  if (Object.values(strategies).every((s) => s === "skip")) {
    errors.push("Al menos un jugador debe intentar disparar (no pueden los tres fallar a propósito).");
  }

  if (errors.length > 0) {
    showErrors(errors);
    return null;
  }

  return { probs, strategies, names, turnMode, fixedOrder };
}
