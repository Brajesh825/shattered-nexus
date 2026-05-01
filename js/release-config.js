/**
 * release-config.js
 * Centralized configuration for itch.io arc-based releases.
 */
const ReleaseConfig = {
  // Current release version string
  VERSION: "v1.0.0-beta",

  // The index of the last reachable arc in this specific build.
  // 0 = Arc 1 (Verdant Vale)
  // 1 = Arc 2 (Crystal Caverns)
  // 7 = Arc 8 (Final Arc)
  MAX_REACHABLE_ARC: 1,
  SAVE_VERSION: "4.0",

  // Toggle for demo/beta specific UI behavior
  IS_BETA: true,

  // Toggle for the "Boss Mode" (Gauntlet) button on the title screen
  ENABLE_BOSS_MODE: true,

  // Development mode: set to false for production
  // Can be overridden via ?debug=true URL parameter
  IS_DEV: false,

  // UI Strings for the "End of Version" screen
  BETA_END_TITLE: "ARC 2 COMPLETE",
  BETA_END_SUBTITLE: "THE VOID IS RECOLLECTING...",
  BETA_END_TEXT: "The Spectral Guardian has fallen, and the Resonance of the Crystal Caverns is restored. But the Demon Lord's influence spreads to the Ember Wastes.\n\nThank you for playing the Shattered Nexus Beta! Arc 3 development is underway.",

  // External link for the "Under Development" screen
  ITCH_URL: "https://brajesh825.itch.io/shattered-nexus"
};

// Global helper to check if an arc is released
function isArcReleased(arcIdx) {
  return arcIdx <= ReleaseConfig.MAX_REACHABLE_ARC;
}
