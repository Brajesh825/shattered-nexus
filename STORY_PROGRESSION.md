# Story Progression and World Map Unlocks

This document defines how the world map should communicate story progression, map unlocks, and future geography. It is a design reference for `js/story.js`, story arc JSON, and future map files.

## Core Rule

The world map is a place-based progression surface. Players select locations on the illustrated map, not abstract chapter nodes.

Story locations unlock in arc order. A player may view completed, current, and next story locations, but the next story location only becomes travel-ready after the current arc boss is defeated.

## Main Story Route

The first three locations are final and should not be reordered without explicit approval:

1. Verdant Vale
2. Crystal Cavern
3. Ember Wastes

Full current story route:

1. Verdant Vale
   - Arc: 1
   - Map ID: `verdant_vale`
   - Unlock state at new game: current/active
   - Purpose: Starting region, forest, village, Sacred Ruins approach.

2. Crystal Cavern
   - Arc: 2
   - Map ID: `crystal_cavern`
   - Unlocks after: Arc 1 boss clear
   - Purpose: Central pass between Verdant Vale and Ember Wastes.

3. Ember Wastes
   - Arc: 3
   - Map ID: `ember_wastes`
   - Unlocks after: Arc 2 boss clear
   - Purpose: Southeast desert/fire region.

4. Sunken Temple
   - Arc: 4
   - Map ID: `sunken_temple`
   - Unlocks after: Arc 3 boss clear
   - Note: This is geographically far from Ember Wastes. Treat the transition as a magical/Seal-driven route, sea current, ancient leyline, or other deliberate story jump rather than normal walking distance.

5. Shadow Reach
   - Arc: 5
   - Map ID: `shadow_reach`
   - Unlocks after: Arc 4 boss clear
   - Purpose: The route turns from elemental recovery toward direct corruption.

6. Void Citadel
   - Arc: 6
   - Map ID: `void_citadel`
   - Unlocks after: Arc 5 boss clear
   - Purpose: Outer fortress/void approach.

7. Fortress Ramparts
   - Arc: 7
   - Map ID: `fortress_ramparts`
   - Unlocks after: Arc 6 boss clear
   - Purpose: Fortress breach and inner approach.

8. Eternal Void
   - Arc: 8
   - Map ID: `eternal_void`
   - Unlocks after: Arc 7 boss clear
   - Purpose: Final void space and Valdris endgame.

## Unlock States

World map story nodes should use these states:

- `current`: The active arc location. Can open the region panel. May allow explore/skirmish depending on existing story state.
- `done`: A completed arc location. Can open the region panel and allow revisit/skirmish/explore.
- `next`: The next arc location. Can open the region panel, but travel is disabled until the current arc boss is defeated.
- `locked`: Later story location. Visible but dimmed; no travel.
- `charted`: Non-story geography visible on the map. Clickable for lore/info only, not playable yet.

## Travel Gate

The next story location becomes travel-ready only when `Story.phase` is:

- `arc_end`
- `epilogue`

If the player clicks the next story location before that, show the region panel with a disabled action such as `DEFEAT CURRENT BOSS`.

## Existing Map IDs

These map IDs exist now and are tied to the main story route:

- `verdant_vale`
- `crystal_cavern`
- `ember_wastes`
- `sunken_temple`
- `shadow_reach`
- `void_citadel`
- `fortress_ramparts`
- `eternal_void`

## Charted Future Locations

These locations are visible on the world map and may become future maps, side quests, or optional route nodes. They should not block story progression until they are implemented.

1. Lighthouse Isles
   - Geography: Northwest sea islands and tower.
   - Unlocks after: Sunken Temple clear.
   - Suggested use: Optional sea route, lighthouse dungeon, navigation relic, storm encounter.

2. Northern Highlands
   - Geography: Pale uplands north of Verdant Vale.
   - Unlocks after: Sunken Temple clear.
   - Suggested use: Old kingdom road, border shrine, highland ruins, early/mid-game optional map.

3. Ashen Foothills
   - Geography: Transition between Crystal Cavern and Ember Wastes.
   - Unlocks after: Ember Wastes clear.
   - Suggested use: Excellent bridge map if the route needs less of a jump from cavern to desert.

4. Eastern Wetlands
   - Geography: Marshy green-blue region below the void storm.
   - Unlocks after: Shadow Reach clear.
   - Suggested use: Poison, spirits, undead patrols, post-Sunken Temple transition toward Shadow Reach.

5. Sky Ruins
   - Geography: Floating shards around the Void Citadel.
   - Unlocks after: Void Citadel clear.
   - Suggested use: Sky bridge trials, fortress approach variant, late-game optional challenge.

6. Southern Isles
   - Geography: Small southern islands.
   - Unlocks after: Sunken Temple clear.
   - Suggested use: Treasure island, exile shrine, sea monster side quest.

7. Riverlands Crossing
   - Geography: Central river road between forest, mountains, and desert.
   - Unlocks after: Crystal Cavern clear.
   - Suggested use: Bridge battle, ambush route, travel hub, caravan encounter.

## Side Map Unlock Chain

Side locations should unlock one by one from related story locations. They are optional branches, not required gates for the main story.

Suggested side unlock chain:

1. Crystal Cavern clear unlocks Riverlands Crossing.
2. Riverlands Crossing clear unlocks Ashen Foothills.
3. Ember Wastes clear also unlocks Ashen Foothills if Riverlands Crossing has not been cleared yet.
4. Sunken Temple clear unlocks Northern Highlands.
5. Northern Highlands clear unlocks Lighthouse Isles.
6. Lighthouse Isles clear unlocks Southern Isles.
7. Shadow Reach clear unlocks Eastern Wetlands.
8. Void Citadel clear unlocks Sky Ruins.

Side map state rules:

- Side maps start hidden or charted-only.
- A side map becomes selectable when its parent story map or parent side map is cleared.
- Clearing a side map may reveal the next side map in its chain.
- Side map clears should never be required to unlock the next main story arc unless explicitly changed later.
- If a side map has no playable map file yet, keep it as `charted` and show lore only.

Suggested side map parent links:

| Side Location | Primary Unlock | Chain Unlock |
| --- | --- | --- |
| Riverlands Crossing | Crystal Cavern clear | None |
| Ashen Foothills | Ember Wastes clear | Riverlands Crossing clear |
| Northern Highlands | Sunken Temple clear | None |
| Lighthouse Isles | Northern Highlands clear | Sunken Temple clear fallback |
| Southern Isles | Lighthouse Isles clear | Sunken Temple clear fallback |
| Eastern Wetlands | Shadow Reach clear | None |
| Sky Ruins | Void Citadel clear | None |

## Suggested Future Route Improvements

If we want the world route to feel more geographically grounded, add optional or mandatory bridge maps in this order:

1. Verdant Vale
2. Riverlands Crossing
3. Crystal Cavern
4. Ashen Foothills
5. Ember Wastes
6. Sunken Temple via Seal current or sea route
7. Eastern Wetlands
8. Shadow Reach
9. Void Citadel
10. Sky Ruins or Fortress Ramparts
11. Eternal Void

The current story does not require these bridge maps. They are expansion candidates.

## Implementation Notes

- Story place data currently lives in `js/story.js` as `MAP_PLACES`.
- Main route line data currently lives in `MAP_MAIN_ROUTE`.
- Optional/charted route hints currently live in `MAP_SIDE_ROUTES`.
- Arc-to-map mapping currently lives in `ARC_MAP_ID`.
- Future charted nodes should remain lore/info-only until a real map file exists in `js/map/data/` and is registered in `MAP_DEFS`.
