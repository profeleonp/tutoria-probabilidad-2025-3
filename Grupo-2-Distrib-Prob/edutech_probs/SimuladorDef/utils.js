// utils.js
// Funciones de ayuda genéricas (no tocan el DOM)

export function choice(arr) {
  if (!arr || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// Parseo de probabilidad: decimal o fracción "a/b", con 0 < p < 1.
export function parseProbStrict(raw) {
  const value = (raw || "").toString().trim().replace(/\s+/g, "");
  if (!value) {
    return { ok: false, error: "Vacío: escribe un valor decimal o fraccionario." };
  }

  let p;

  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length !== 2) {
      return { ok: false, error: "Fracción inválida. Usa formato a/b." };
    }
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (!isFinite(num) || !isFinite(den) || den === 0) {
      return { ok: false, error: "Fracción inválida. Revisa numerador y denominador." };
    }
    p = num / den;
  } else {
    p = parseFloat(value);
    if (!isFinite(p)) {
      return { ok: false, error: "Número inválido. Usa algo como 0.7 o 2/3." };
    }
  }

  if (p <= 0 || p >= 1) {
    return {
      ok: false,
      error: "La probabilidad debe estar entre 0 y 1, sin incluirlos (0 < p < 1).",
    };
  }

  return { ok: true, value: p };
}

export function describeStrategy(code) {
  switch (code) {
    case "strongest":
      return "disparar al oponente con mejor puntería";
    case "weakest":
      return "disparar al oponente más débil";
    case "random":
      return "disparar a un oponente aleatorio";
    case "skip":
      return "fallar a propósito";
    default:
      return code;
  }
}

// Slider de velocidad → delay en ms
export function speedValueToDelay(value) {
  const v = parseInt(value, 10) || 3;
  switch (v) {
    case 1:
      return 200; // muy rápida
    case 2:
      return 400; // rápida
    case 3:
      return 700; // media
    case 4:
      return 1000; // lenta
    case 5:
      return 1400; // muy lenta
    default:
      return 700;
  }
}

export function speedValueToLabel(value) {
  const v = parseInt(value, 10) || 3;
  switch (v) {
    case 1:
      return "muy rápida";
    case 2:
      return "rápida";
    case 3:
      return "media";
    case 4:
      return "lenta";
    case 5:
      return "muy lenta";
    default:
      return "media";
  }
}
