/**
 * chronos-engine.js — The heartbeat of the Nexus.
 * Step- and battle-round-driven temporal advancement.
 *
 *   • 10 player steps         → 15 in-game minutes (0.25 hours)
 *   • 1 battle round          → 30 in-game minutes (0.5 hours)
 *
 * Real-time drift is intentionally removed. The world's clock only
 * advances when the player acts. `update(dt)` is preserved as a no-op
 * so legacy callers don't NPE — do NOT reintroduce real-time advancement.
 *
 * Persisted state:
 *   • G.nexusTime         — current in-game hour (0..24, float)
 *   • G.nexusStepCounter  — fractional step accumulator (0..9), so partial
 *                           progress toward the next tick survives saves.
 *
 * Phase boundaries (per overhaul plan):
 *   06:00–12:00 → dawn
 *   12:00–18:00 → noon
 *   18:00–24:00 → dusk
 *   00:00–06:00 → midnight
 */
const ChronosEngine = (() => {
  const STEPS_PER_TICK = 10;              // 10 steps = 1 tick
  const HOURS_PER_STEP_TICK = 0.25;       // 15 minutes per tick
  const HOURS_PER_BATTLE_ROUND = 0.5;     // 30 minutes per round

  const PHASE_LABELS = {
    dawn:     'Promise of Dawn',
    noon:     'Vitality of Noon',
    dusk:     'Veil of Dusk',
    midnight: 'Hush of Midnight'
  };

  function init() {
    if (typeof G === 'undefined') return;
    if (G.nexusTime === undefined) G.nexusTime = 8.0; // Default to morning — boot default, not a mutation
    if (G.nexusStepCounter === undefined) G.nexusStepCounter = 0;
  }

  function _wrap(t) {
    while (t >= 24.0) t -= 24.0;
    while (t < 0)     t += 24.0;
    return t;
  }

  /**
   * Real-time drift is OFF. Retained as a no-op so external callers
   * (map-engine main loop) don't throw and can be cleaned up later.
   */
  function update(_dt) { /* intentionally empty — see file header */ }

  /**
   * Advance the clock by `n` player steps. Accumulates fractional progress
   * so partial steps roll over between sessions / saves.
   */
  function advanceBySteps(n) {
    if (typeof G === 'undefined') return;
    if (!n || n <= 0) return;
    if (G.nexusStepCounter === undefined) G.nexusStepCounter = 0;
    if (G.nexusTime === undefined) G.nexusTime = 8.0;

    // nexusStepCounter is a fractional accumulator and not a protected root prop;
    // direct mutation is fine. We only route nexusTime advancement through StateManager.
    G.nexusStepCounter += n;
    while (G.nexusStepCounter >= STEPS_PER_TICK) {
      G.nexusStepCounter -= STEPS_PER_TICK;
      if (typeof StateManager !== 'undefined') {
        StateManager.advanceTime(HOURS_PER_STEP_TICK);
      } else {
        G.nexusTime = _wrap(G.nexusTime + HOURS_PER_STEP_TICK);
      }
    }
  }

  /** Advance the clock by one battle round (30 in-game minutes). */
  function advanceByBattleRound() {
    if (typeof G === 'undefined') return;
    if (G.nexusTime === undefined) G.nexusTime = 8.0;
    if (typeof StateManager !== 'undefined') {
      StateManager.advanceTime(HOURS_PER_BATTLE_ROUND);
    } else {
      G.nexusTime = _wrap(G.nexusTime + HOURS_PER_BATTLE_ROUND);
    }
  }

  function getPhase() {
    const t = G.nexusTime ?? 8.0;
    if (t >= 6  && t < 12) return 'dawn';
    if (t >= 12 && t < 18) return 'noon';
    if (t >= 18 && t < 24) return 'dusk';
    return 'midnight';   // 00:00 – 06:00
  }

  function getPhaseLabel() {
    return PHASE_LABELS[getPhase()] || getPhase();
  }

  function getFilter() {
    const phase = getPhase();
    switch (phase) {
      case 'dawn':
        return 'hue-rotate(10deg) sepia(20%) brightness(95%)';
      case 'dusk':
        return 'hue-rotate(-20deg) saturate(140%) brightness(90%)';
      case 'midnight':
        return 'brightness(55%) hue-rotate(190deg) saturate(75%)';
      default:
        return 'none';
    }
  }

  function formatTime() {
    const t = G.nexusTime ?? 8.0;
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  return {
    init,
    update,                  // no-op kept for backward compat
    advanceBySteps,
    advanceByBattleRound,
    getPhase,
    getPhaseLabel,
    getFilter,
    formatTime
  };
})();

if (typeof window !== 'undefined') window.ChronosEngine = ChronosEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = ChronosEngine;
