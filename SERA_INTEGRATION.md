# Sera Integration — Remaining Work

## What's Already Live

All narrative data and map wiring for Sera's Arc 1 recruitment are committed or in the working tree:

- Sera entry in `data/character-unlocks.json` (arc 1, chapter "boss")
- `azure_commander` NPC in `data/npcs.js` with Verdant Vale pre-boss dialogue
- Azure Commander placed in `js/map/data/map-verdant-vale.js` at x:29, y:13, gated by `hideIfUnlocked: 'sera'`
- `hideIfUnlocked` filter wired into `js/map/map-entities.js`
- Arc 1 `onVictory` recruit event + full character moment dialogue in `data/story/arc_1.json`
- Light Seal Fragment shard rename applied in `data/story/arc_1.json`
- `azure_commander` class definition added to `data/classes.json`

---

## Remaining: Combat Ability Verification

These abilities exist in class data but have not been verified against the actual engine handlers:

- `BOSS_DAMAGE_REDUCTION` — Azure Resolve passive requires this trait type to be handled in `PassiveSystem`. Check that `hasTrait(unit, 'BOSS_DAMAGE_REDUCTION')` returns correctly and that `CombatEngine` applies it when the attacker is a boss-flagged enemy.
- `glacial_aegis.damageReduction` — Confirm this applies a real temporary defensive status that `CombatEngine.getStat` respects, not a no-op field.
- `gravity_anchor.evasion` — Confirm `evasion` debuff on an enemy is read by the hit-roll path. If not supported, replace with an accuracy-down or spd-down status that achieves the same effect.
- `cryo_phalanx` — Confirm party-wide DEF buff applies to all alive party slots, not just the caster.

---

## Remaining: Assets

- `images/characters/map/sheets/sera_sheet.png` is present as an untracked file. Decide: promote to production and register, or keep it gitignored until final art is ready.
- If promoted: add both PNG (normal) and WebP (low) variants to `SPRITES_NORMAL` / `SPRITES_LOW` in `sw.js` and bump `CACHE_NAME`.
- If `data/move-animations.json` requires entries for Sera's abilities, add them before Arc 2 testing.

---

## Remaining: Testing

These have not been verified against a running build:

- New game still starts with only Aya, Tao, Lulu, and Rei.
- Sera appears in party selection UI after Arc 1 boss is cleared.
- Arc 2 can be started with Sera in the available roster.
- A save made before Arc 1 boss does not break after Sera's recruit data is live.
- A save made after recruiting Sera persists her unlock correctly on reload.
- Battle UI renders Sera's passive tooltip and all four class abilities without errors.
- Content validation (characters, classes, unlocks, story references, lore fragments) passes cleanly.

---

## Balance Note

Sera's low-level profile is approximately HP 147 / DEF 39 / SPD 8. This is intentional for a post-Arc-1 tank. Test Arc 2 encounters with Sera in the party before release — if she trivializes early Arc 2 fights, reduce her base DEF growth in `classes.json` rather than touching `characters.json` base stats.
