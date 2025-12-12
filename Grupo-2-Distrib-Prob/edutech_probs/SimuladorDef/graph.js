// graph.js
// Dibujo del grafo de disparos en un <canvas>

export function renderShotGraphOn(canvasId, state, action, titleText) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, w, h);

  const positions = {
    A: { x: w * 0.18, y: h * 0.5 },
    B: { x: w * 0.78, y: h * 0.27 },
    C: { x: w * 0.78, y: h * 0.73 },
  };

  if (titleText) {
    ctx.fillStyle = "#4b5563";
    ctx.font = "11px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(titleText, 6, 4);
  }

  if (!state) {
    ["A", "B", "C"].forEach((id) => {
      const pos = positions[id];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#e5e7eb";
      ctx.fill();
      ctx.strokeStyle = "#d1d5db";
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(id, pos.x, pos.y);
    });
    return;
  }

  // Flecha actual
  if (action && action.shooter && action.target) {
    const from = positions[action.shooter];
    const to = positions[action.target];

    ctx.strokeStyle = action.hit ? "#16a34a" : "#f97316";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLen = 10;
    const arrowAngle = Math.PI / 7;
    const endX = to.x;
    const endY = to.y;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLen * Math.cos(angle - arrowAngle),
      endY - arrowLen * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      endX - arrowLen * Math.cos(angle + arrowAngle),
      endY - arrowLen * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  // Nodos
  ["A", "B", "C"].forEach((id) => {
    const pos = positions[id];
    const alive = state.alive.includes(id);
    const isShooter = action && action.shooter === id;
    const isTarget = action && action.target === id;
    const isWinner = state.finished && state.winner === id;

    const baseRadius = 18;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = alive ? "#eef2ff" : "#e5e7eb";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#9ca3af";
    ctx.stroke();

    if (alive && isShooter) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (alive && isTarget) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (isWinner) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = alive ? "#111827" : "#9ca3af";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const name = state.names ? state.names[id] : id;
    ctx.fillText(name, pos.x, pos.y - 2);

    ctx.fillStyle = "#6b7280";
    const prob = state.probs ? state.probs[id] : null;
    if (prob != null) {
      ctx.fillText(`p=${prob.toFixed(2)}`, pos.x, pos.y + 12);
    }
  });
}
