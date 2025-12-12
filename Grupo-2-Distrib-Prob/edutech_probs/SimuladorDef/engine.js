// engine.js
// Motor probabilístico del truel (sin tocar DOM)

import { choice, describeStrategy } from "./utils.js";

export function chooseTarget(shooter, alive, probs, strategy) {
  const enemies = alive.filter((x) => x !== shooter);
  if (enemies.length === 0) return null;

  switch (strategy) {
    case "strongest": {
      let best = enemies[0];
      let bestProb = probs[best];
      for (const e of enemies) {
        if (probs[e] > bestProb) {
          best = e;
          bestProb = probs[e];
        }
      }
      return best;
    }
    case "weakest": {
      let worst = enemies[0];
      let worstProb = probs[worst];
      for (const e of enemies) {
        if (probs[e] < worstProb) {
          worst = e;
          worstProb = probs[e];
        }
      }
      return worst;
    }
    case "random":
      return choice(enemies);
    case "skip":
      return null;
    default:
      return choice(enemies);
  }
}

export function createGameState(config) {
  return {
    probs: config.probs,
    strategies: config.strategies,
    names: config.names,
    turnMode: config.turnMode, // "fixed" | "random"
    alive: ["A", "B", "C"],
    fixedOrder:
      config.turnMode === "fixed" && config.fixedOrder && config.fixedOrder.length === 3
        ? config.fixedOrder.slice()
        : ["A", "B", "C"],
    fixedIndex: 0,
    turn: 1,
    maxTurns: 1000,
    logs: [],
    finished: false,
    winner: null,
    forcedShooter: config.forcedShooter || null,
    forcedTarget: config.forcedTarget || null,
    forcedShotDone: false,
  };
}

export function stepGame(state) {
  if (state.finished) {
    return { done: true, winner: state.winner, turn: state.turn };
  }

  if (state.alive.length <= 1) {
    state.finished = true;
    state.winner = state.alive[0] || null;
    return { done: true, winner: state.winner, turn: state.turn };
  }

  if (state.turn > state.maxTurns) {
    state.logs.push(
      "Máximo de turnos alcanzado; se detiene la partida sin ganador definido (demasiados disparos sin resolver)."
    );
    state.finished = true;
    state.winner = null;
    return { done: true, winner: null, turn: state.turn };
  }

  const turnNum = state.turn;
  state.logs.push(`--- Turno ${turnNum} ---`);

  let shooter;
  if (state.turnMode === "fixed") {
    shooter = state.fixedOrder[state.fixedIndex];
    state.fixedIndex = (state.fixedIndex + 1) % state.fixedOrder.length;

    if (!state.alive.includes(shooter)) {
      state.logs.push(`${state.names[shooter]} ya no está en juego, se salta este turno.`);
      state.turn++;
      return {
        done: false,
        shooter,
        target: null,
        hit: false,
        r: null,
        turn: turnNum,
        strategy: state.strategies[shooter],
      };
    }
  } else {
    shooter = choice(state.alive);
  }

  const strat = state.strategies[shooter];

  let target = null;
  let forcedNow = false;

  if (
    state.forcedShooter &&
    !state.forcedShotDone &&
    shooter === state.forcedShooter &&
    state.alive.includes(state.forcedTarget)
  ) {
    target = state.forcedTarget;
    forcedNow = true;
  } else {
    target = chooseTarget(shooter, state.alive, state.probs, strat);
  }

  const result = {
    done: false,
    shooter,
    target,
    hit: false,
    r: null,
    turn: turnNum,
    strategy: strat,
    winner: null,
  };

  const shooterName = state.names[shooter];

  if (!target) {
    state.logs.push(`${shooterName} decide no disparar (${describeStrategy(strat)}).`);
    if (forcedNow) state.forcedShotDone = true;
    state.turn++;
    return result;
  }

  const targetName = state.names[target];
  const pShot = state.probs[shooter];
  const r = Math.random();
  const hit = r < pShot;

  result.r = r;
  result.hit = hit;

  state.logs.push(
    `${shooterName} dispara a ${targetName} (p=${pShot.toFixed(3)}, r=${r.toFixed(3)}) => ${
      hit ? "ACIERTO" : "FALLO"
    }`
  );

  if (hit) {
    state.alive = state.alive.filter((x) => x !== target);
    state.logs.push(
      `💥 ${targetName} ha sido eliminado. Siguen en juego: [${state.alive
        .map((id) => state.names[id])
        .join(", ")}]`
    );
  }

  if (forcedNow) {
    state.forcedShotDone = true;
  }

  if (state.alive.length <= 1) {
    state.finished = true;
    state.winner = state.alive[0] || null;
    if (state.winner) {
      state.logs.push(`\nGanador: ${state.names[state.winner]}`);
    } else {
      state.logs.push("\nLa partida terminó sin ganador claro.");
    }
    result.done = true;
    result.winner = state.winner;
  }

  state.turn++;
  return result;
}

export function simulateOneGame(config) {
  const state = createGameState(config);
  while (!state.finished) {
    stepGame(state);
  }
  return { winner: state.winner, log: state.logs.join("\n"), state };
}

export function simulateManyGames(config, numGames) {
  const wins = { A: 0, B: 0, C: 0 };
  for (let i = 0; i < numGames; i++) {
    const { winner } = simulateOneGame(config);
    if (winner && wins.hasOwnProperty(winner)) {
      wins[winner]++;
    }
  }
  return wins;
}

export function computeOptimalInitialTarget(config, trialsPerChoice = 1500) {
  if (config.turnMode !== "fixed") {
    return null;
  }

  const shooter = config.fixedOrder[0];
  const enemies = ["A", "B", "C"].filter((id) => id !== shooter);

  const results = {};

  for (const enemy of enemies) {
    let winsShooter = 0;
    for (let i = 0; i < trialsPerChoice; i++) {
      const cfg = JSON.parse(JSON.stringify(config));
      cfg.forcedShooter = shooter;
      cfg.forcedTarget = enemy;
      const { winner } = simulateOneGame(cfg);
      if (winner === shooter) winsShooter++;
    }
    results[enemy] = winsShooter / trialsPerChoice;
  }

  let bestTarget = enemies[0];
  for (const e of enemies) {
    if (results[e] > results[bestTarget]) bestTarget = e;
  }

  return {
    shooter,
    shooterName: config.names[shooter],
    bestTarget,
    bestTargetName: config.names[bestTarget],
    results,
  };
}
