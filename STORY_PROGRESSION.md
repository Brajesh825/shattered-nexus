# Story Progression and World Map Unlocks

This document defines how the world map should communicate story progression, map unlocks, and future geography. It is a design reference for `js/story.js`, story arc JSON, and future map files.

## Core Rule

The world map is a place-based progression surface. Players select locations on the illustrated map, not abstract chapter nodes.

Story locations unlock in arc order. A player may view completed, current, and next story locations, but the next story location only becomes travel-ready after the current arc boss is defeated.

## Master Story Progression & Unlock Table

| Arc | Arc Name | Main Map | Side Map Unlocks | Requirements |
| --- | --- | --- | --- | --- |
| **Arc 1** | The Rift Awakening | `verdant_vale` | `riverlands_crossing`, `northern_highlands` | Starts at New Game |
| **Arc 2** | Beneath the Ashes | `crystal_cavern` | `ashen_foothills` | Clear Arc 1 Boss |
| **Arc 3** | The Scorched Spiral | `ember_wastes` | None | Clear Arc 2 Boss |
| **Arc 4** | The Weeping Depths | `sunken_temple` | `lighthouse_isles`, `southern_isles` | Clear Arc 3 Boss |
| **Arc 5** | The Shadow's Heart | `shadow_reach` | `eastern_wetlands` | Clear Arc 4 Boss |
| **Arc 6** | The Fortress Gates | `void_citadel` | `sky_ruins` | Clear Arc 5 Boss |
| **Arc 7** | The Inner Sanctum | `fortress_ramparts` | None | Clear Arc 6 Boss |
| **Arc 8** | The Shadow Emperor | `eternal_void` | None | Clear Arc 7 Boss |

## Main Arc Details

1. **Arc 1: Verdant Vale**
   - **Map ID**: `verdant_vale`
   - **Story Focus**: The summoning of the four heroes and the recovery of the first Seal Fragment.
   - **Side Branches**: Unlocks `riverlands_crossing` (central hub) and `northern_highlands` (optional high-level challenge).

2. **Arc 2: Crystal Cavern**
   - **Map ID**: `crystal_cavern`
   - **Story Focus**: Navigating the mountain pass to reach the burning kingdom of Ashveil.
   - **Side Branches**: Unlocks `ashen_foothills` (the bridge to the desert wastes).

3. **Arc 3: Ember Wastes**
   - **Map ID**: `ember_wastes`
   - **Story Focus**: Facing the Dark Phoenix and reclaiming the Seal Fragment of Fire.
   - **Side Branches**: None (focused desert trek).

4. **Arc 4: Sunken Temple**
   - **Map ID**: `sunken_temple`
   - **Story Focus**: Diving into the depths to free the Kraken and claim the Wind Fragment.
   - **Side Branches**: Unlocks the sea routes to `lighthouse_isles` and `southern_isles`.

5. **Arc 6: Void Citadel**
   - **Map ID**: `void_citadel`
   - **Story Focus**: Breaching the outer ring of Valdris's fortress.
   - **Side Branches**: Unlocks `sky_ruins` (the floating debris around the citadel).

6. **Arc 5: Shadow Reach**
   - **Map ID**: `shadow_reach`
   - **Story Focus**: The first direct confrontation with the Shadow Emperor's influence.
   - **Side Branches**: Unlocks `eastern_wetlands` (the marsh beneath the void storm).

7. **Arc 7: Fortress Ramparts**
   - **Map ID**: `fortress_ramparts`
   - **Story Focus**: Climbing the inner walls toward the Core Chamber.
   - **Side Branches**: None (final fortress ascent).

8. **Arc 8: Eternal Void**
   - **Map ID**: `eternal_void`
   - **Story Focus**: The final truth and the confrontation with Valdris's true form.
   - **Side Branches**: None (The end of eternity).

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

## Playable Side Locations

These locations are optional branches that provide lore, unique upgrades, and tactical challenges. They unlock as the main story progresses.

1. **Riverlands Crossing**
   - Geography: Central river road between forest, mountains, and desert.
   - Unlocks after: Crystal Cavern clear.
   - Description: A strategic junction of rushing rivers and crumbling bridges contested by rogue spirits and bandits.
   - **Critical**: Repair the **Great Stone Bridge** to unlock fast-travel between main arcs and defeat the **River King**.

2. **Ashen Foothills**
   - Geography: Transition between Crystal Cavern and Ember Wastes.
   - Unlocks after: Ember Wastes clear.
   - Description: A volcanic transition zone where lava meets ash, creating a hazardous, shifting landscape.
   - **Critical**: Navigate the **Basalt Labyrinth** to find the **Fire-Forged Key** and defeat the **Molten Golem**.

3. **Northern Highlands**
   - Geography: Pale uplands north of Verdant Vale.
   - Unlocks after: Sunken Temple clear.
   - Description: A desolate, high-altitude plateau with ancient watchtowers that drain stamina.
   - **Critical**: Discover the **Highland Shrine** for elemental resistance and face the **Sky-Drake** guardian.

4. **Lighthouse Isles**
   - Geography: Northwest sea islands and tower.
   - Unlocks after: Northern Highlands clear.
   - Description: Mist-shrouded islands featuring a spectral lighthouse that guides lost souls through the fog.
   - **Critical**: Obtain the **Navigator's Compass** and defeat the **Ghost Ship** mini-boss.

5. **Southern Isles**
   - Geography: Small southern islands.
   - Unlocks after: Lighthouse Isles clear.
   - Description: A tropical archipelago masking a deep-sea trench where the First Summoner's remains lie.
   - **Critical**: Use the **Tide-Caller Shell** to reveal the **Abyssal Gate** and face the **Sunken Leviathan**.

6. **Eastern Wetlands**
   - Geography: Marshy green-blue region below the void storm.
   - Unlocks after: Shadow Reach clear.
   - Description: A poisonous, neon-lit marshland filled with bioluminescent flora and hidden pitfalls.
   - **Critical**: Collect **Glow-Spore Essence** to craft anti-toxins and survive the **Swamp Horror's** ambush.

7. **Sky Ruins**
   - Geography: Floating shards around the Void Citadel.
   - Unlocks after: Void Citadel clear.
   - Description: Crumbling floating islands suspended in a perpetual storm requiring wind-navigation.
   - **Critical**: Align the **Aerolith Crystals** to stabilize the path and defeat the **Storm Sentinel**.


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
