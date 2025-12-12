// main.js
// Orquestador de la UI

import {
  speedValueToDelay,
  speedValueToLabel,
  describeStrategy,
} from "./utils.js";
import {
  createGameState,
  stepGame,
  simulateManyGames,
  simulateOneGame,
  computeOptimalInitialTarget,
} from "./engine.js";
import { getConfigFromInputs } from "./config.js";
import { renderShotGraphOn } from "./graph.js";
import { renderArena } from "./arena.js";

document.addEventListener("DOMContentLoaded", () => {
  const numSimInput = document.getElementById("numSim");
  const runStatsBtn = document.getElementById("runStatsBtn");
  const pauseStatsBtn = document.getElementById("pauseStatsBtn");
  const runOneBtn = document.getElementById("runOneBtn");
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");
  const logPre = document.getElementById("log");
  const demoModeCheckbox = document.getElementById("demoMode");
  const demoLogPre = document.getElementById("demoLog");
  const turnModeSelect = document.getElementById("turnMode");
  const fixedOrderConfig = document.getElementById("fixedOrderConfig");

  const demoSpeedInput = document.getElementById("demoSpeed");
  const demoSpeedLabel = document.getElementById("demoSpeedLabel");
  const animSpeedInput = document.getElementById("animSpeed");
  const animSpeedLabel = document.getElementById("animSpeedLabel");

  const startAnimatedBtn = document.getElementById("startAnimatedBtn");
  const stopAnimatedBtn = document.getElementById("stopAnimatedBtn");
  const animatedInfo = document.getElementById("animatedInfo");
  const animatedLogPre = document.getElementById("animatedLog");

  // NAV principal
  const navButtons = document.querySelectorAll(".nav-btn");
  const views = {
    config: document.getElementById("view-config"),
    standard: document.getElementById("view-standard"),
    single: document.getElementById("view-single"),
  };

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view-target");
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      Object.keys(views).forEach((key) => {
        views[key].classList.remove("active-view");
      });
      if (views[target]) {
        views[target].classList.add("active-view");
      }
    });
  });

  // NAV secundaria (texto vs animado)
  const singleNavButtons = document.querySelectorAll(".single-nav-btn");
  const singlePanels = {
    text: document.getElementById("single-text"),
    anim: document.getElementById("single-anim"),
  };

  singleNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-single-target");
      singleNavButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      Object.keys(singlePanels).forEach((key) => {
        singlePanels[key].classList.remove("active-single");
      });
      if (singlePanels[target]) {
        singlePanels[target].classList.add("active-single");
      }
    });
  });

  // Mostrar/ocultar orden fijo
  function updateFixedVisibility() {
    const mode = turnModeSelect.value;
    if (mode === "fixed") {
      fixedOrderConfig.classList.remove("hidden");
    } else {
      fixedOrderConfig.classList.add("hidden");
    }
  }
  updateFixedVisibility();
  turnModeSelect.addEventListener("change", updateFixedVisibility);

  // Etiquetas de velocidad
  function updateSpeedLabels() {
    demoSpeedLabel.textContent = speedValueToLabel(demoSpeedInput.value);
    animSpeedLabel.textContent = speedValueToLabel(animSpeedInput.value);
  }
  updateSpeedLabels();
  demoSpeedInput.addEventListener("input", updateSpeedLabels);
  animSpeedInput.addEventListener("input", updateSpeedLabels);

  // Estado de animaciones
  let animInterval = null;
  let animState = null;
  let demoInterval = null;
  let pendingNewGame = false;
  let textInterval = null;
  let textState = null;
  let demoPaused = false;

  // Mostrar tabla + análisis
  function showFinalResultsTable(config, wins, numGames) {
    const pAwin = wins.A / numGames;
    const pBwin = wins.B / numGames;
    const pCwin = wins.C / numGames;

    let html = `
      <p>Total de partidas: <strong>${numGames.toLocaleString()}</strong></p>
      <table class="results-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre</th>
            <th>Prob. acierto</th>
            <th>Estrategia</th>
            <th>Victorias</th>
            <th>Prob. estimada de ganar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>${config.names.A}</td>
            <td>${config.probs.A.toFixed(3)}</td>
            <td>${describeStrategy(config.strategies.A)}</td>
            <td>${wins.A.toLocaleString()}</td>
            <td>${(pAwin * 100).toFixed(2)} %</td>
          </tr>
          <tr>
            <td>B</td>
            <td>${config.names.B}</td>
            <td>${config.probs.B.toFixed(3)}</td>
            <td>${describeStrategy(config.strategies.B)}</td>
            <td>${wins.B.toLocaleString()}</td>
            <td>${(pBwin * 100).toFixed(2)} %</td>
          </tr>
          <tr>
            <td>C</td>
            <td>${config.names.C}</td>
            <td>${config.probs.C.toFixed(3)}</td>
            <td>${describeStrategy(config.strategies.C)}</td>
            <td>${wins.C.toLocaleString()}</td>
            <td>${(pCwin * 100).toFixed(2)} %</td>
          </tr>
        </tbody>
      </table>
    `;

    const opt = computeOptimalInitialTarget(config);
    if (opt) {
      const e1 = Object.keys(opt.results)[0];
      const e2 = Object.keys(opt.results)[1];
      html += `
        <p class="small" style="margin-top:0.6rem;">
          <strong>Análisis del primer disparo (orden fijo):</strong><br/>
          El primer tirador es <strong>${opt.shooterName}</strong>. Simulando diferentes objetivos iniciales,
          la mejor opción para maximizar su probabilidad de ganar es disparar primero a
          <strong>${opt.bestTargetName}</strong>.<br/>
          Prob. estimada de que gane ${opt.shooterName} si dispara primero a ${
        config.names[e1]
      }: ${(opt.results[e1] * 100).toFixed(2)} %;<br/>
          si dispara primero a ${config.names[e2]}: ${(opt.results[e2] * 100).toFixed(2)} %.
        </p>
      `;
    } else {
      html += `
        <p class="small" style="margin-top:0.6rem;">
          <strong>Análisis del primer disparo:</strong> en modo de turno aleatorio no hay un “primer tirador”
          fijo, así que no se analiza un objetivo inicial óptimo único.
        </p>
      `;
    }

    resultsDiv.innerHTML = html;
  }

  // SIMULACIÓN ESTÁNDAR
  runStatsBtn.addEventListener("click", () => {
    const config = getConfigFromInputs();
    if (!config) return;

    let numSim = parseInt(numSimInput.value, 10);
    if (!Number.isInteger(numSim) || numSim <= 0) {
      alert("El número de partidas debe ser un entero positivo.");
      return;
    }

    demoPaused = false;
    pauseStatsBtn.textContent = "Pausar simulación";
    pauseStatsBtn.disabled = true;

    if (demoInterval) {
      clearInterval(demoInterval);
      demoInterval = null;
    }

    resultsDiv.innerHTML = "";
    logPre.textContent = "";
    statusDiv.textContent = "";
    renderShotGraphOn("graphCanvas", null, null, "Grafo de disparos (sin demo)");
    if (demoLogPre) demoLogPre.textContent = "";

    const demoMode = demoModeCheckbox.checked;

    if (demoMode && numSim > 1000) {
      alert(
        "Para la demostración visual es mejor usar un máximo de 1000 partidas. Ajustaré el valor a 1000."
      );
      numSim = 1000;
    }

    const totalGames = numSim;

    if (demoMode) {
      const wins = { A: 0, B: 0, C: 0 };
      let currentGame = 1;
      let demoState = createGameState(config);
      const delay = speedValueToDelay(demoSpeedInput.value);
      pendingNewGame = false;
      demoPaused = false;
      pauseStatsBtn.disabled = false;
      pauseStatsBtn.textContent = "Pausar simulación";

      renderShotGraphOn(
        "graphCanvas",
        demoState,
        null,
        `Partida ${currentGame} de ${totalGames} (inicio)`
      );
      statusDiv.textContent = `Demostración visual: partida ${currentGame} de ${totalGames}`;
      if (demoLogPre) demoLogPre.textContent = "";

      demoInterval = setInterval(() => {
        if (demoPaused) return;

        if (pendingNewGame) {
          pendingNewGame = false;
          demoState = createGameState(config);
          renderShotGraphOn(
            "graphCanvas",
            demoState,
            null,
            `Partida ${currentGame} de ${totalGames} (inicio)`
          );
          if (demoLogPre) demoLogPre.textContent = "";
          return;
        }

        const action = stepGame(demoState);
        const title = `Partida ${currentGame} de ${totalGames} · Turno ${action.turn}`;
        renderShotGraphOn("graphCanvas", demoState, action, title);

        if (demoLogPre) {
          demoLogPre.textContent = demoState.logs.join("\n");
        }

        if (action.done) {
          if (action.winner && wins.hasOwnProperty(action.winner)) {
            wins[action.winner]++;
          }

          if (currentGame >= totalGames) {
            clearInterval(demoInterval);
            demoInterval = null;
            showFinalResultsTable(config, wins, totalGames);
            statusDiv.textContent = "Demostración completada.";
            pauseStatsBtn.disabled = true;
            pauseStatsBtn.textContent = "Pausar simulación";
            demoPaused = false;
          } else {
            currentGame++;
            statusDiv.textContent = `Demostración visual: partida ${currentGame} de ${totalGames}`;
            pendingNewGame = true;
          }
        }
      }, delay);
    } else {
      statusDiv.textContent = `Simulando ${totalGames.toLocaleString()} partidas (modo rápido)...`;

      setTimeout(() => {
        const wins = simulateManyGames(config, totalGames);
        showFinalResultsTable(config, wins, totalGames);
        statusDiv.textContent = "Simulación completada (modo rápido).";
      }, 30);
    }
  });

  // Pausar / reanudar demo estándar
  pauseStatsBtn.addEventListener("click", () => {
    if (!demoInterval) return;
    demoPaused = !demoPaused;
    if (demoPaused) {
      pauseStatsBtn.textContent = "Reanudar simulación";
      statusDiv.textContent = "Simulación estándar pausada (demostración visual).";
    } else {
      pauseStatsBtn.textContent = "Pausar simulación";
      statusDiv.textContent = "Simulación estándar en curso (demostración visual).";
    }
  });

  // SIMULACIÓN TEXTUAL DE UNA PARTIDA
  runOneBtn.addEventListener("click", () => {
    const config = getConfigFromInputs();
    if (!config) return;

    if (textInterval) {
      clearInterval(textInterval);
      textInterval = null;
    }

    textState = createGameState(config);
    logPre.textContent = "";
    runOneBtn.disabled = true;
    runOneBtn.textContent = "Simulando partida...";

    const delay = 600;

    textInterval = setInterval(() => {
      const action = stepGame(textState);
      logPre.textContent = textState.logs.join("\n");

      if (action.done) {
        clearInterval(textInterval);
        textInterval = null;
        runOneBtn.disabled = false;
        runOneBtn.textContent = "Simular una partida (texto)";
      }
    }, delay);
  });

  // PARTIDA ANIMADA
  startAnimatedBtn.addEventListener("click", () => {
    const config = getConfigFromInputs();
    if (!config) return;

    if (animInterval) {
      clearInterval(animInterval);
      animInterval = null;
    }

    animState = createGameState(config);
    renderArena(animState, null);
    animatedInfo.textContent = "Iniciando partida animada...";
    animatedLogPre.textContent = "";
    renderShotGraphOn(
      "animGraphCanvas",
      animState,
      null,
      "Grafo de disparos de la partida (inicio)"
    );

    const delay = speedValueToDelay(animSpeedInput.value);

    animInterval = setInterval(() => {
      const action = stepGame(animState);
      renderArena(animState, action);

      const shooterName = action.shooter ? animState.names[action.shooter] : "";
      const targetName = action.target ? animState.names[action.target] : "";

      let msg = `Turno ${action.turn}: `;

      if (!action.shooter && animState.finished) {
        msg = "La partida ha terminado.";
      } else if (!action.target) {
        msg += `${shooterName} no dispara (${describeStrategy(action.strategy)}).`;
      } else {
        msg += `${shooterName} dispara a ${targetName} → ${
          action.hit ? "¡impacto!" : "fallo."
        }`;
      }

      animatedInfo.textContent = msg;
      animatedLogPre.textContent = animState.logs.join("\n");

      const title = `Turno ${action.turn} de la partida animada`;
      renderShotGraphOn("animGraphCanvas", animState, action, title);

      if (action.done) {
        clearInterval(animInterval);
        animInterval = null;
        if (action.winner) {
          const winnerName = animState.names[action.winner];
          animatedInfo.textContent += `  Ganador: ${winnerName}.`;
        } else {
          animatedInfo.textContent += `  La partida terminó sin ganador claro.`;
        }
      }
    }, delay);
  });

  stopAnimatedBtn.addEventListener("click", () => {
    if (animInterval) {
      clearInterval(animInterval);
      animInterval = null;
      animatedInfo.textContent = "Animación detenida.";
    }
  });
});
