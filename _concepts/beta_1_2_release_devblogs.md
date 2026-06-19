# Beta 1.2 — Release Devblogs

Three platform-tailored writeups for the **Beta 1.2 — "Cinematic Polish"** release. Each is copy-paste ready for its target surface.

- [Reddit Devblog](#reddit-devblog) — long-form, narrative, dev-story tone
- [Itch.io Devlog](#itchio-devlog) — structured patch-notes with section taxonomy
- [Discord Announcement](#discord-announcement) — short, scannable, emoji-tagged

---

## Reddit Devblog

> Suggested target subs: r/IndieGaming, r/IndieDev, r/RPGdesign, r/WebGames, r/IndieGameDevs

---

# Beta 1.2 — The Cinematic Polish Pass | RPG+ (Shattered Nexus)

Hey folks — solo dev here. Pushing Beta 1.2 this week and wanted to share the highlights because this patch is mostly the result of one question I kept asking myself: *"why does winning a boss fight in my game feel exactly as flat as winning a random encounter?"* The answer was: because mechanically, it was. This patch fixes that.

## The "you won something" problem

When the Void Knight finally fell in Beta 1.1, the camera just… cut to the loot panel. Same fade, same beep, same UI as if you'd killed a goblin. Beta 1.2 splits the two with what I'm calling the **Shatter Flash**:

- On any boss death, the entire screen whitewashes for ~750ms
- The battle container shakes hard (`shake-heavy` CSS keyframe, 560ms)
- Reward logs are gated behind a 1200ms delay so the impact has room to breathe
- Then — and only then — the EXP / loot / level-up cascade plays

It sounds small. It is not small. Players A/B-tested it and three of four asked if there was new music too. (There wasn't. The pause makes everything hit harder.)

## Cinematic Weapon Acquisition

Tied to the above: when a boss drops a signature weapon (Rei's *Chain of Ten Thousand Nights*, Lulu's *Tide Caller*), the game now opens a **glassmorphic full-screen overlay** with:

- Radial backdrop blur + conic gradient sweep behind the weapon card
- Border + glow themed to the weapon's element (ice → cyan, fire → orange, etc.)
- Active passive list, character resonance line, weapon stats grid
- A single EQUIP button — no "do you want to use this?" friction

And the boss now actually *says something* before you fight them. The Demon Lord introduces himself ("You are smaller than I expected"), the dialogue panel auto-injects him into the cast row, and his full-body sprite scales next to the party heroes at 80vh on landscape / 55vh on portrait.

## The 5-cast layout fix

A community member pointed out that with the boss added to the cast row, the cutscene composition packed five portraits into a layout designed for four. Fixed in patch — the system now has explicit positioning for 5 (8/28/50/72/92% horizontal anchors), with dimmed non-speaking siblings scaling to 0.78 on desktop and 0.62 on iPhone SE so nobody bumps shoulders. Mobile boss intros finally read clean.

## Combat got teeth

Random encounters used to be **filler**. Now Arc 1-2 standard enemies carry real status threats:

- **Spore Mushroom** — *Spore Cloud* puts a party member to sleep for 2 turns (60% chance)
- **Poison Spider** — *Venom Strike* applies poison for 3 turns at 8% Max HP per tick
- **Lost Wisp** — *Haunt* drains 12 MP. Disrupts your caster mid-combo.
- **Rotting Zombie / Void-Hollowed Soldier** — Rotten Grasp / Void Shriek now stun (35%/25%)
- **Gemstone Mimic** — new *Greed Bind* ability: drains 8 MP **and** applies Slow

Sleep is the marquee addition: a new status that skips a unit's turn but **immediately dispels on any damage**. So your party can wake each other up by hitting the sleeping ally — but you also lose a turn doing it. Tradeoffs.

Boss AI also got smarter — enemies stop spamming self-buffs when the buff is already active with more than 1 turn left. Spectral Guardian no longer wastes 4 turns recasting Starlit Shield. King Galdor doesn't loop *Galdor's Rage* into oblivion anymore.

## Character buffs (Tao + Rei)

- **Tao** was a glass cannon that one-shotted herself with *Paramita Papilio*. Bumped base HP 50→55, base DEF 7→9, class DEF growth 1→2, and *Spirit Flame* life-steal 15% → 22%. She's still fragile, just survivable now.
- **Rei** had `growthPerLevel.spd: 0` — at higher levels his Karmic Barrier and Mastery of Pain couldn't refresh in time. Bumped SPD growth 0→1 and base SPD 13→15. He actually gets turns now.

## Economy QoL

The "Beta 1.1 gold problem" — where you needed 2,500g to ascend a weapon but only got 5-20g per random kill — got compressed:

- All gold drops ×2.5
- Tier 1 elemental material drop rate **50% → 75%**
- Tier 2 elemental material drop rate **15% → 35%**
- Smoother weapon refining curve (no more 50g→500g cliff at Lv 10)

Combined with reduced random encounter density (8% → 3.5% per step, longer post-battle grace) — fewer pointless fights, but each one matters more.

## The Verdant Vale softlock (hotfix bundled in)

A player reported they couldn't re-trigger the Void Knight battle. Traced it to a timing bug: `clearedMaps` was being flagged the moment you stepped onto the objective tile — *before* the boss fight. If you lost or quit, Lira's second-quest offering point would spawn onto the objective tile (NPCs are solid), and the Void Knight chapter became unreachable.

Three-layer fix:
1. `clearedMaps` only flags after actual boss victory (or `kill_boss` floor objectives in multi-floor dungeons)
2. Moved the offering point one tile south as defense-in-depth
3. **Save migration** strips the stale flag on load — existing softlocked saves heal silently. No new-game required.

## Quick polish drop

A few more things landed after the cinematic pass.

**Original lore.** The Summoned 8 used to have backstories that echoed other RPGs a little too closely. They now have their own homelands — Aya the blossom-shrine warden, Tao the spirit-walker, Lulu the oasis priestess, and so on — with fresh names for their signature abilities. Same combat kits, original names.

**Smaller download.** Character art moved to WebP. The art payload dropped from ~96 MB to ~12 MB. Same look, much faster install.

**Time of day actually means something.** The clock used to tick in real time — the day would cycle while you stared at the menu. Now it only advances when you play: 15 in-game minutes per 10 steps, 30 minutes per battle round. There's a clock on the HUD that tints with the phase. Some enemies only show up at certain times, so you can plan around it.

**NPCs sound like people.** Gate guards used to monologue about "the loneliness of the gate." They now talk about collapsed bridge timbers, refugees coming in, and scouts named Mira and Tem who didn't come back from the fog. Added 8 new campfire exchanges between party members — they tease each other now.

## The boss in the bushes

A player flagged seeing King Galdor — the Verdant Vale boss — chilling in a normal goblin-and-bat encounter. Yeah, that wasn't supposed to happen. Random groups were pulling from the map's full enemy list including bosses. Fixed. Bosses now only show up when you actually walk up to them.

While in there, also fixed enemies hanging around at the wrong time of day. Bats that spawned at midnight used to keep patrolling at noon — you couldn't fight them, but they'd still be visible wandering past. They now properly hide and freeze until their phase comes back.

## What's next (Beta 1.3 thinking)

- Weapon acquisition path for Aya & Tao — they're the Arc 1 founders but currently have no in-game weapon hook (audit caught it)
- Crystal Cavern wind-mat drops so Rei's chain can be leveled in-arc without backtracking
- More side-boss weapon chains for Arcs 3-4

Try the build [link to itch.io] — would love crash reports / pacing feedback.

---


## Discord Announcement

> Drop in `#announcements`, post-pin in `#patch-notes`

---

**🎬 Beta 1.2 — Cinematic Polish is LIVE**

@everyone — five-phase polish pass + a critical Verdant Vale softlock hotfix. Here's the short version:

**✨ Cinematic Layer**
- Boss deaths now trigger a **white shatter-flash + heavy screen shake** before rewards resolve
- New **Cinematic Weapon Acquisition** overlay — signature weapons drop with element-themed glow and a single EQUIP button
- Bosses (Void Knight, Demon Lord) now appear as **full-height portraits** in cutscenes and **actually speak** before the fight
- Fixed 5-cast cutscene crowding on mobile (boss + 4 heroes)
- Widescreen typography scaling for desktop

**⚔️ Combat Got Teeth**
- New **Sleep status** — skips turns, breaks on damage
- New **MP Drain** mechanic — enemies can now disrupt your casters
- Standard enemies in Arc 1-2 now actually threaten you:
  - Spore Mushroom: 60% Sleep
  - Poison Spider: 75% Poison (3t, 8%/tick)
  - Lost Wisp: 12 MP Drain
  - Gem Mimic: new Greed Bind ability
- **Smarter boss AI** — no more wasted self-buff spam
- **Tao buff** — HP/DEF bumped, life-steal 15% → 22%
- **Rei buff** — finally has SPD growth, Karmic Barrier refreshes properly

**💰 Economy & Pacing**
- Gold ×2.5 across the board
- Material drop rates: T1 **75%**, T2 **35%**
- Smoother weapon refining cost curve
- Random encounters reduced 8% → 3.5%
- Enemy chase speeds increased

**🌊 Side Bosses**
- **River King → Chain of Ten Thousand Nights** (Rei)
- **Sunken Leviathan → Tide Caller** (Lulu)
- Both with custom recruitment dialogue, one-time only

**🔧 Verdant Vale Softlock — FIXED**
If you couldn't re-trigger the Void Knight battle, your save was hitting a timing bug. **Existing softlocked saves heal silently on load.** Just open your save — no new-game needed.

**🌅 Late Polish**
- **Original character origins** — Summoned 8 got their own homelands (Hanamori, Kozuka, Zanara, etc.). Signature abilities also renamed.
- **Smaller download** — Character art moved to WebP. 96 MB → 12 MB.
- **Time of day works now** — Clock advances when you play, not in real time. HUD shows current time + phase tint.
- **NPCs talk like people** — Gate guards mention collapsed bridges and missing scouts instead of monologuing.
- **8 new camp banter exchanges** between party members.

**🐛 Bonus Bugs Squashed**
- King Galdor was sneaking into random goblin encounters. He's not anymore — bosses only spawn when you walk up to them.
- Phantom enemies (bats at noon, etc.) stayed visible after their time of day passed. Now they hide properly.

**🐛 Found something?** Drop it in `#bug-reports` — Beta 1.3 starts next week and weapon acquisition for Aya & Tao is top of the list.

🔗 [Play Beta 1.2 on Itch.io]

---

## Format Notes (for the dev — not for posting)

- **Reddit** opens with the dev-story hook ("why did winning feel flat"), uses headers, leans narrative. Reddit upvotes when you sound like a human, not a press release.
- **Itch.io** uses structured patch notes with section taxonomy (Cinematic / Combat / Economy / Side / Bugfix / Technical). Itch readers are already game-aware and skim — clear hierarchy beats prose.
- **Discord** uses short scannable bullets, emoji section markers, ends with a call-to-action and a teaser for the next patch. Discord posts get glanced, not read — leading every line with a verb/noun makes them land.

All three reference the same patch but tell the same story with three different shapes.
