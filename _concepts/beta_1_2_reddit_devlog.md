<!--
Reddit Devlog — Beta 1.2 — copy-paste ready

Title: [Devlog · Beta 1.2] Cinematic boss deaths, smarter AI, and a softlock fix
Crosspost: r/IndieGaming, r/IndieDev, r/RPGdesign, r/WebGames, r/IndieGameDevs
-->

Hey folks — week two of the weekly devlog. Last week was the onboarding pass; this one is everything I caught playing my own game and thinking *"…that's not right."* Quick intro for anyone new:

Shattered Nexus is a tactical RPG I'm building in the open. Eight summoned strangers from eight broken worlds are the only thing standing between Aethoria and the rifts tearing it apart. Diamond formation combat, elemental reactions, phased boss fights. Runs in the browser, installs as a PWA.

One question drove the whole patch: *"why does winning a boss fight feel the same as winning a goblin scrap?"* Because mechanically, it was. So I went through the game, found the bits that were lying to the player, and fixed them.

---

**🎬 The boss-fight pass (the big one)**

**Boss deaths felt small.** The camera would just cut to the loot panel — same fade, same beep, same UI as if you'd killed a goblin. Added a whiteout flash on every boss kill, a heavy screen shake, and a held beat before rewards roll in. That single pause was the hardest part — I kept wanting to shorten it. Three of four playtesters thought I'd added new music. I hadn't.

**Legendary weapons dropped like herb potions.** Rei's *Chain of Ten Thousand Nights* used to show up in the standard loot scroll. Now it lands in a full-screen reveal — glowing element-themed border, stats and passives laid out clean, one button to equip. Same treatment for Lulu's *Tide Caller*. Picking up a legendary finally feels like picking up a legendary.

**Bosses showed up without saying a word.** The Demon Lord and the rest used to just appear and start swinging. Gave them proper cutscene appearances — full-body portraits next to the party, real dialogue, then the fight starts. The dialogue itself was the slow part. The Demon Lord went through four drafts.

**Mobile boss shots were crowded.** A community member spotted that the boss + 4-hero composition was packing five portraits into a layout built for four — heads overlapping on small screens. Tightened the spacing, dimmed the non-speaking heroes. Took longer than the cutscene work itself because every device renders the layout slightly differently.

---

**⚔️ Combat got teeth**

**Random encounters were filler.** Goblin, slime, slime, slime — they hit you for 4 damage and you hit them for 50. Gave standard mobs real status threats: Spore Mushrooms sleep you (60%), Poison Spiders bleed you for 3 turns, Lost Wisps drain MP, Gem Mimics got a new Greed Bind that drains MP and slows you. The Arc 1–2 mob rotation finally pressures your status bar.

**Sleep needed to be risky, not punishing.** Skipping a turn would feel terrible if it was a hard lock. So Sleep breaks instantly on any damage — your party can wake a sleeping ally by hitting them, but they burn a turn doing it. Real tradeoff. First version had it break too easily; second pass landed it.

**Bosses wasted turns on themselves.** Spectral Guardian was looping Starlit Shield for four turns straight while the buff was already up. King Galdor was Galdor's-Rage-ing into oblivion. Simple fix — don't refresh a self-buff if it's still got time on it — but it took watching a Spectral Guardian fight in slow-mo to realize what he was doing.

**Tao kept killing herself with Spirit Flame.** Her ultimate has a self-damage cost and her HP/defense were too low to survive it. Bumped both up. Also pushed her life-steal from 15% to 22% so the ability pays back faster. She's still fragile, just survivable now.

**Rei's barriers couldn't refresh in time.** His speed wasn't going up on level-ups at all — I'd left his speed growth at zero way back and never caught it. Fixed. Karmic Barrier actually comes back online when he needs it now.

---

**💰 Economy & pacing**

The numbers between fights and rewards were broken. Weapon ascension wanted 2,500g and a goblin dropped 8g. Crafting materials had a 15% drop rate so refining a weapon was a three-arc grind. Went through and rebalanced: gold ×2.5 across the board, common materials to 75%, rare to 35%, and the refining cost curve smoothed out (no more 50g→500g cliff at Level 10). Then I cut the random encounter rate roughly in half — fewer fights, each one matters more. Bosses and elites also chase you faster now, so when they spot you across the map it actually feels like a chase.

---

**🐛 The bugs**

**The Verdant Vale softlock.** A player reported they couldn't re-trigger the Void Knight battle. Traced it to a chain of bad luck — if you lost or quit during the fight, an NPC named Lira would later spawn on the same tile you needed to step on to retry. NPCs are solid, so the tile was blocked forever. Three-layer fix: the "map cleared" flag only sets after an actual boss win, I moved Lira's spawn one tile south as a safety net, and existing softlocked saves auto-heal on load. No new game needed.

**Losing to a side boss made them vanish.** If you lost to River King, the Leviathan, or the Spectral Guardian, they'd disappear off the map for the rest of the session. Turned out the defeat code was nuking every enemy on the map instead of just clearing the encounter you were in. Now it only releases the handles. Walk back, fight them again.

**The Chain cutscene was firing on random bandits.** A leftover trace from a previous River King encounter was sticking around. Every random kill afterward would check that stale reference and think Rei had just killed River King again. The reference now gets cleared on every battle and every map change.

**Crystal Cavern F3 could skip the Demon Lord intro.** Beating the floor's objective would sometimes land on the wrong post-fight dialogue and miss the Demon Lord transition entirely. Took me about an hour to retrace which internal pointer was drifting out of sync as the player descended floors.

**Bats at noon.** Enemies that spawn at midnight kept patrolling at noon — you couldn't fight them, but they were still visible wandering past. They properly hide when their phase passes now.

---

**🎮 Play it**

https://brajesh825.itch.io/shattered-nexus

Side notes worth knowing: optional side bosses (River King, Sunken Leviathan, Spectral Guardian) now anchor the off-path content with their own recruitment scenes and signature weapon drops. Character art got recompressed — the download dropped from ~96 MB to ~12 MB at no visible quality loss. And time of day now only ticks while you actually play, instead of in real seconds — small change, surprising effect on how the world feels.

---

**💬 What I want feedback on**

Three things specifically, if you have a minute:

The boss-death pause — does the held beat before rewards feel like a moment, or does it drag?

Sleep and MP Drain on standard mobs — fun-disruptive, or just annoying? I want them to make you think about which enemy to drop first, not feel like cheap shots.

The trimmed encounter rate — does exploration feel more breathable now, or are the gaps between fights too long?

Thanks for sticking around. Week three is in motion — Aya & Tao weapon paths are top of the queue.

— [Brajesh825]
