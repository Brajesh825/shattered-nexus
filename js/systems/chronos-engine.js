/**
 * chronos-engine.js — The heartbeat of the Nexus.
 * Manages the 24-minute real-world cycle (1 min = 1 Nexus hour).
 * Handles atmospheric phase detection and HSL filter strings.
 */
const ChronosEngine = (() => {
  // 1 minute real time = 1 hour Nexus time.
  // 24 minutes = 1 full day.
  // 1 second = 1/60 hours (0.0166... hours).
  const TIME_SCALE = 1 / 60; 

  function init() {
    if (typeof G === 'undefined') return;
    if (G.nexusTime === undefined) G.nexusTime = 8.0; // Default to morning
  }

  function update(dt) {
    if (typeof G === 'undefined') return;
    G.nexusTime += dt * TIME_SCALE;
    if (G.nexusTime >= 24.0) G.nexusTime -= 24.0;
  }

  function getPhase() {
    const t = G.nexusTime || 0;
    if (t >= 4 && t < 8)   return 'dawn';
    if (t >= 8 && t < 17)  return 'noon';
    if (t >= 17 && t < 20) return 'dusk';
    return 'midnight';
  }

  function getFilter() {
    const t = G.nexusTime || 0;
    const phase = getPhase();
    
    // Simple block transitions for now; future can interpolate
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
    const t = G.nexusTime || 0;
    const hours = Math.floor(t);
    const mins = Math.floor((t % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  return { init, update, getPhase, getFilter, formatTime };
})();

if (typeof window !== 'undefined') window.ChronosEngine = ChronosEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = ChronosEngine;
