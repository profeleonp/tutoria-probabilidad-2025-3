// arena.js
// Actualiza las tarjetas de la “arena” animada (no el canvas)

export function renderArena(state, action) {
  ["A", "B", "C"].forEach((id) => {
    const box = document.querySelector(`.fighter[data-player="${id}"]`);
    if (!box) return;

    box.classList.remove("shooter", "target", "dead");

    const nameEl = document.getElementById(`arenaName${id}`);
    const probEl = document.getElementById(`arenaProb${id}`);
    const stEl = document.getElementById(`arenaState${id}`);

    nameEl.textContent = state.names[id];
    probEl.textContent = `p = ${state.probs[id].toFixed(3)}`;

    if (state.alive.includes(id)) {
      stEl.textContent = "En juego";
      stEl.style.background = "#e0f2fe";
      stEl.style.color = "#111827";
    } else {
      stEl.textContent = "Fuera";
      stEl.style.background = "#fee2e2";
      stEl.style.color = "#7f1d1d";
      box.classList.add("dead");
    }

    if (state.finished && state.winner === id) {
      stEl.textContent = "Ganador";
      stEl.style.background = "#facc15";
      stEl.style.color = "#7c2d12";
    }
  });

  if (action && action.shooter) {
    const sBox = document.querySelector(`.fighter[data-player="${action.shooter}"]`);
    if (sBox) sBox.classList.add("shooter");
  }
  if (action && action.target) {
    const tBox = document.querySelector(`.fighter[data-player="${action.target}"]`);
    if (tBox) tBox.classList.add("target");
  }
}
