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
  MAX_REACHABLE_ARC: 0,

  // Toggle for demo/beta specific UI behavior
  IS_BETA: true,

  // Toggle for the "Boss Mode" (Gauntlet) button on the title screen
  ENABLE_BOSS_MODE: true,

  // Development mode: set to false for production
  // Can be overridden via ?debug=true URL parameter
  IS_DEV: true,

  // UI Strings for the "End of Version" screen
  BETA_END_TITLE: "ARC 1 COMPLETE",
  BETA_END_SUBTITLE: "THE ADVENTURE CONTINUES SOON",
  BETA_END_TEXT: "You have successfully restored the first Elemental Seal. The path to the Crystal Caverns remains shrouded in shadow... for now.\n\nThank you for playing the Shattered Nexus Beta! Follow the project on itch.io for the Arc 2 update.",

  // External link for the "Under Development" screen
  ITCH_URL: "https://brajesh825.itch.io/shattered-nexus"
};

// Global helper to check if an arc is released
function isArcReleased(arcIdx) {
  return arcIdx <= ReleaseConfig.MAX_REACHABLE_ARC;
}
