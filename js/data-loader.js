/**
 * data-loader.js
 * Embeds all game data as JS variables so the game works
 * from a local file:// URL without a web server.
 *
 * When you edit the JSON files in /data/ or /characters/,
 * copy the updated content into the matching variable below.
 */

// ── CHARACTERS ────────────────────────────────────────────────
window.CHARACTERS_DATA = [
  {
    "id":"ayaka","name":"Ayaka","alias":"Aya","title":"The Cryo Princess","icon":"❄️",
    "description":"A noble warrior summoned mid-prayer to a world unknown. She fights with precise, frozen grace — every strike a bloom of ice.",
    "personality":"Graceful, noble, quietly fierce",
    "portrait_color":"#7dd3fc","hair_color":"#c0e8ff",
    "skin_color":"#f8e8ff","armor_color":"#4b9fce",
    "base_stats":{"hp":65,"mp":30,"atk":16,"def":12,"spd":18,"mag":14},
    "stat_bonuses":{"spd":3,"atk":2},
    "class_affinity":["cryo_bladestorm"],
    "passive":{"id":"frostflake","name":"Frostflake Dance","description":"Always acts first. +3 SPD bonus and attacks carry a cryo edge."},
    "lore":"Torn from her world mid-prayer at a sacred shrine. The last thing she saw was cherry blossoms."
  },
  {
    "id":"hutao","name":"Hu Tao","alias":"Tao","title":"The Ghost Guide","icon":"🔥",
    "description":"A spirit guide and amateur poet. She was chasing a runaway spirit when the rift swallowed her whole — she considers it a professional hazard.",
    "personality":"Mischievous, death-obsessed, surprisingly caring",
    "portrait_color":"#ef4444","hair_color":"#4a2020",
    "skin_color":"#f5c8a0","armor_color":"#c03010",
    "base_stats":{"hp":50,"mp":22,"atk":20,"def":7,"spd":14,"mag":12},
    "stat_bonuses":{"atk":4,"spd":2},
    "class_affinity":["spirit_incinerator"],
    "passive":{"id":"blood_blossom","name":"Blood Blossom","description":"Below 50% HP, ATK +35%. Life fuels the flame."},
    "lore":"She once wrote a poem about her own funeral and genuinely enjoyed it."
  },
  {
    "id":"nilou","name":"Nilou","alias":"Lulu","title":"The Star Dancer","icon":"💧",
    "description":"A beloved dancer whose grace captivates all who witness her. She was dancing at the edge of a sacred pool when the summoning light carried her away.",
    "personality":"Gentle, radiant, courageous at heart",
    "portrait_color":"#2dd4bf","hair_color":"#40d0c0",
    "skin_color":"#f0d8c0","armor_color":"#0e9080",
    "base_stats":{"hp":72,"mp":42,"atk":10,"def":13,"spd":11,"mag":20},
    "stat_bonuses":{"hp":8,"mp":8,"mag":4},
    "class_affinity":["hydro_performer"],
    "passive":{"id":"dance_of_haftkarsvar","name":"Dance of Haftkarsvar","description":"All healing effects amplified by 30%."},
    "lore":"Stepped through the rift sword-first. She stopped worrying about being grand enough."
  },
  {
    "id":"xiao","name":"Xiao","alias":"Rei","title":"The Ancient Warden","icon":"🌀",
    "description":"An ancient warden carrying two thousand years of karmic debt.",
    "personality":"Stoic, solitary, fiercely protective",
    "portrait_color":"#4ade80","hair_color":"#1a6040",
    "skin_color":"#d8e8c0","armor_color":"#0a4030",
    "base_stats":{"hp":80,"mp":18,"atk":18,"def":16,"spd":13,"mag":8},
    "stat_bonuses":{"atk":3,"def":3},
    "class_affinity":["yaksha_protector"],
    "passive":{"id":"yakshas_valor","name":"Warden's Valor","description":"10% reduced damage. ATK +15% from karmic resolve."},
    "lore":"He has slain ten thousand demons and does not speak of it."
  },
  {
    "id":"rydia","name":"Rydia","alias":"Ria","title":"The Summoner","icon":"✨",
    "description":"A powerful summoner blessed with the ability to call forth creatures from ancient realms. She channels ancient summons with graceful precision, commanding beasts of fire, ice, and thunder to do her bidding.",
    "personality":"Wise, compassionate, magically attuned",
    "portrait_color":"#a78bfa","hair_color":"#8b5cf6",
    "skin_color":"#fce7f3","armor_color":"#6d28d9",
    "base_stats":{"hp":58,"mp":48,"atk":8,"def":9,"spd":12,"mag":24},
    "stat_bonuses":{"mag":6,"mp":6},
    "class_affinity":["summoner_eidolon"],
    "passive":{"id":"eidolon_bond","name":"Eidolon Bond","description":"Summoned creatures gain +20% stats. MP efficiency increased by 15%."},
    "lore":"In her world, she commanded the mightiest creatures of ancient realms. When the rift opened, her summoned eidolons followed her through — loyal companions across worlds."
  },
  {
    "id":"lenneth","name":"Lenneth","alias":"Valka","title":"The Valkyrie","icon":"👑",
    "description":"A divine Valkyrie warrior who judges souls and claims the worthy. She wields sacred power and divine authority, her blade blessed by ancient power. Ageless and formidable in combat.",
    "personality":"Principled, commanding, divinely righteous",
    "portrait_color":"#e879f9","hair_color":"#c084fc",
    "skin_color":"#faf5ff","armor_color":"#a855f7",
    "base_stats":{"hp":88,"mp":28,"atk":19,"def":18,"spd":15,"mag":16},
    "stat_bonuses":{"atk":4,"def":4},
    "class_affinity":["valkyrie_guardian"],
    "passive":{"id":"divine_authority","name":"Divine Authority","description":"DEF increased by 20%. Reflects 10% of damage taken back to attacker."},
    "lore":"For millennia she walked between worlds, judging souls worthy of ascension. Now she stands in this shadowed realm, where even gods fear to tread — and she must decide if darkness itself can be redeemed."
  },
  {
    "id":"kain","name":"Kain","alias":"Drake","title":"The Dragoon","icon":"🐉",
    "description":"A noble Dragoon knight whose lance pierces the sky. He channels the power of dragons to perform devastating aerial attacks, his spear dancing through the air with lethal grace.",
    "personality":"Honorable, conflicted, steadfastly loyal",
    "portrait_color":"#0ea5e9","hair_color":"#0369a1",
    "skin_color":"#e0f2fe","armor_color":"#0c4a6e",
    "base_stats":{"hp":75,"mp":20,"atk":19,"def":14,"spd":16,"mag":10},
    "stat_bonuses":{"atk":3,"spd":3},
    "class_affinity":["dragoon_skyward"],
    "passive":{"id":"dragon_leap","name":"Dragon's Leap","description":"Every 3rd turn, perform a bonus aerial attack. SPD +2 during aerial combat."},
    "lore":"A Dragoon knight who swore oaths to a kingdom long since lost to the rift. But loyalties fracture when worlds collide. He came seeking redemption — instead, he found new purpose."
  },
  {
    "id":"leon","name":"Leon","alias":"Rex","title":"The Lionheart King","icon":"⚔️",
    "description":"An immortal warrior-king who ruled for two centuries, blessed by the gods themselves. He commands divine power and can summon gods through sacred rituals. His presence radiates ancient authority.",
    "personality":"Regal, stoic, divinely resolute",
    "portrait_color":"#fbbf24","hair_color":"#fcd34d",
    "skin_color":"#fef3c7","armor_color":"#b45309",
    "base_stats":{"hp":92,"mp":32,"atk":22,"def":20,"spd":14,"mag":18},
    "stat_bonuses":{"atk":5,"def":5,"hp":4},
    "class_affinity":["knight_king_divine"],
    "passive":{"id":"divine_blessing","name":"Divine Blessing","description":"As a demi-god, grants allies +15% HP regeneration. Takes 12% reduced damage from all sources."},
    "lore":"He lived 200 years as a king, commanding gods and demons alike. When he was pulled into this shadowed realm, even he felt the weight of something beyond his ken. Yet his blade still shines with purpose."
  }
];

// ── CLASSES ───────────────────────────────────────────────────
window.CLASSES_DATA = [
  {
    "id":"cryo_bladestorm","name":"Cryo Bladestorm","icon":"❄️","tag":"Ice / Swift Strike",
    "description":"An elegant frozen combat style. Swift ice-infused strikes that freeze enemies.",
    "color":"#4b9fce",
    "role":"Ranger",
    "stat_multipliers":{"hp":0.95,"mp":1.1,"atk":1.25,"def":0.85,"spd":1.6,"mag":1.0},
    "abilities":[
      {"id":"frostblossom","name":"Frostblossom Slash","icon":"❄","mp":0,"type":"physical","description":"1.5x ATK, 40% slow chance","effect":{"dmgMultiplier":1.5,"element":"ice"}},
      {"id":"glacial_waltz","name":"Glacial Waltz","icon":"❄","mp":8,"type":"magic_damage","description":"2.2x magic AoE, +1 SPD","effect":{"dmgMultiplier":2.2,"element":"ice","aoe":true}},
      {"id":"permafrost","name":"Permafrost","icon":"🧊","mp":6,"type":"debuff","description":"60% freeze chance, DEF -20%","effect":{"freezeChance":0.6}},
      {"id":"cryoclasm","name":"Cryoclasm","icon":"❄","mp":10,"type":"magic_damage","description":"3.0x magic, resets if enemy frozen","effect":{"dmgMultiplier":3.0,"element":"ice"}}
    ],
    "growthPerLevel":{"hp":6,"mp":5,"atk":3,"def":2,"spd":5,"mag":3}
  },
  {
    "id":"spirit_incinerator","name":"Spirit Incinerator","icon":"🔥","tag":"Fire / Life Force",
    "description":"A pyromantic guide art. Harness ghost energy to incinerate foes while draining vitality.",
    "color":"#c03010",
    "role":"Warrior",
    "stat_multipliers":{"hp":0.85,"mp":1.0,"atk":1.5,"def":0.7,"spd":1.15,"mag":1.1},
    "abilities":[
      {"id":"spirit_flame","name":"Spirit Flame","icon":"🔥","mp":4,"type":"physical","description":"1.7x ATK, 20% lifesteal","effect":{"dmgMultiplier":1.7,"element":"fire"}},
      {"id":"paramita_papilio","name":"Paramita Papilio","icon":"🔥","mp":7,"type":"magic_damage","description":"2.3x magic, ATK +50% next turn if HP<50%","effect":{"dmgMultiplier":2.3,"element":"fire"}},
      {"id":"blood_blossom_enhanced","name":"Blood Blossom Aura","icon":"🌸","mp":6,"type":"buff","description":"3-turn: ATK +40%, heal from fire","effect":{"stat":"atk","multiplier":1.4,"duration":3}},
      {"id":"guide_to_afterlife","name":"Guide to Afterlife","icon":"💀","mp":12,"type":"magic_damage","description":"4.0x magic, drain 30% enemy HP","effect":{"dmgMultiplier":4.0,"element":"fire"}}
    ],
    "growthPerLevel":{"hp":7,"mp":4,"atk":5,"def":1,"spd":3,"mag":4}
  },
  {
    "id":"hydro_performer","name":"Hydro Performer","icon":"💧","tag":"Water / Grace",
    "description":"A star-blessed dance. Graceful water magic that heals and supports the party.",
    "color":"#0e9080",
    "role":"Healer",
    "stat_multipliers":{"hp":1.15,"mp":1.4,"atk":0.8,"def":1.0,"spd":0.95,"mag":1.3},
    "abilities":[
      {"id":"dance_of_blessing","name":"Dance of Blessing","icon":"💚","mp":5,"type":"heal","description":"Heal 35-55 HP, +30% healing","effect":{"healBase":35,"healRandom":20}},
      {"id":"water_wheel","name":"Water Wheel","icon":"💧","mp":8,"type":"magic_damage","description":"2.0x magic AoE, heal allies 50%","effect":{"dmgMultiplier":2.0,"element":"water","aoe":true}},
      {"id":"harmony_preservation","name":"Harmony Preservation","icon":"🌊","mp":10,"type":"buff","description":"Party: ATK +20%, DEF +20%, regen 5 HP","effect":{"aoe":true}},
      {"id":"hajras_hymn","name":"Hajra's Hymn","icon":"✨","mp":12,"type":"heal","description":"50% max HP all, cleanse, +SPD","effect":{"aoe":true}}
    ],
    "growthPerLevel":{"hp":10,"mp":8,"atk":1,"def":2,"spd":1,"mag":5}
  },
  {
    "id":"yaksha_protector","name":"Ancient Warden","icon":"🌀","tag":"Guardian / Karmic",
    "description":"An ancient warden's power. Protective stance with karmic resolution and damage reduction.",
    "color":"#0a4030",
    "role":"Knight",
    "stat_multipliers":{"hp":1.4,"mp":0.8,"atk":1.1,"def":1.4,"spd":0.85,"mag":0.7},
    "abilities":[
      {"id":"lancing_strike","name":"Lancing Strike","icon":"⚡","mp":0,"type":"physical","description":"1.4x ATK, ignore 20% DEF","effect":{"dmgMultiplier":1.4,"element":"physical"}},
      {"id":"yaksha_valor_active","name":"Warden's Valor","icon":"🛡","mp":6,"type":"buff","description":"3-turn: -25% damage, +15% reflect","effect":{"stat":"def","multiplier":1.3,"duration":3}},
      {"id":"karmic_barrier","name":"Karmic Barrier","icon":"🌀","mp":8,"type":"buff","description":"Party: DEF +40%, allies -10% damage","effect":{"aoe":true}},
      {"id":"mastery_of_pain","name":"Mastery of Pain","icon":"⚡","mp":14,"type":"magic_damage","description":"3.5x magic, scales with DEF","effect":{"dmgMultiplier":3.5,"element":"anemo"}}
    ],
    "growthPerLevel":{"hp":16,"mp":2,"atk":3,"def":5,"spd":0,"mag":1}
  },
  {
    "id":"summoner_eidolon","name":"Summoner","icon":"✨","tag":"Magic / Eidolons",
    "description":"A summoner's prowess. Command mighty eidolons from the spirit realm to decimate foes and protect allies.",
    "color":"#6d28d9",
    "role":"Mage",
    "stat_multipliers":{"hp":0.95,"mp":1.5,"atk":0.6,"def":0.8,"spd":0.95,"mag":1.6},
    "abilities":[
      {"id":"summon_bahamut","name":"Summon Bahamut","icon":"🐉","mp":8,"type":"magic_damage","description":"Call the dragon king — 2.4x magic damage to all enemies, fire element","effect":{"dmgMultiplier":2.4,"element":"fire","aoe":true}},
      {"id":"summon_syldra","name":"Summon Syldra","icon":"🌊","mp":8,"type":"heal","description":"Invoke the water serpent — restore 40-60 HP to all allies, cure one debuff","effect":{"healBase":40,"healRandom":20,"aoe":true,"cleanse":true}},
      {"id":"eidolon_channel","name":"Eidolon Channel","icon":"✨","mp":10,"type":"buff","description":"Channel eidolon power — MAG +50%, summons gain +30% damage, 4 turns","effect":{"stat":"mag","multiplier":1.5,"summonBoost":1.3,"duration":4}},
      {"id":"absolute_summon","name":"Absolute Summon","icon":"🌟","mp":14,"type":"magic_damage","isUltimate":true,"description":"Ultimate eidolon — 3.8x magic damage to all, summon phantom guardian for 2 turns","effect":{"dmgMultiplier":3.8,"element":"summoning","aoe":true,"guardian":true}}
    ],
    "growthPerLevel":{"hp":5,"mp":10,"atk":0,"def":1,"spd":1,"mag":7}
  },
  {
    "id":"valkyrie_guardian","name":"Valkyrie","icon":"👑","tag":"Divine / Judgment",
    "description":"A divine valkyrie's power. Strike with sacred judgment while protecting allies with celestial authority.",
    "color":"#a855f7",
    "role":"Knight",
    "stat_multipliers":{"hp":1.3,"mp":1.1,"atk":1.3,"def":1.35,"spd":1.0,"mag":1.2},
    "abilities":[
      {"id":"valkyrie_strike","name":"Valkyrie Strike","icon":"⚔️","mp":0,"type":"physical","description":"Holy sword slash — 1.6x ATK damage, ignore 15% enemy DEF","effect":{"dmgMultiplier":1.6,"element":"holy","defPen":0.15}},
      {"id":"judgment_seal","name":"Judgment Seal","icon":"⚡","mp":7,"type":"debuff","description":"Judge the wicked — reduce enemy ATK by 30%, DEF by 20%, lasts 3 turns","effect":{"stat":"atk","multiplier":0.7,"defDebuff":0.8,"duration":3}},
      {"id":"transcendent_power","name":"Transcendent Power","icon":"✨","mp":9,"type":"buff","description":"Divine blessing — party ATK +25%, DEF +30%, holy aura for 4 turns","effect":{"aoe":true,"stat":"atk","multiplier":1.25,"defBuff":1.3,"duration":4}},
      {"id":"divine_execution","name":"Divine Execution","icon":"💫","mp":13,"type":"magic_damage","isUltimate":true,"description":"Execute judgment — 3.6x magic damage, scales with DEF, stuns if enemy HP low","effect":{"dmgMultiplier":3.6,"element":"holy","statScale":"def","stunLow":true}}
    ],
    "growthPerLevel":{"hp":12,"mp":4,"atk":4,"def":5,"spd":2,"mag":3}
  },
  {
    "id":"dragoon_skyward","name":"Divine Dragoon","icon":"🐉","tag":"Dragon / Sky",
    "description":"A dragoon's legacy elevated by divine power. Soar through the heavens with lance strikes and dragon-channeled attacks.",
    "color":"#0c4a6e",
    "role":"Ranger",
    "stat_multipliers":{"hp":1.15,"mp":0.9,"atk":1.35,"def":1.05,"spd":1.25,"mag":0.95},
    "abilities":[
      {"id":"dragoon_lance","name":"Dragoon Lance","icon":"🎯","mp":0,"type":"physical","description":"Soaring lance thrust — 1.8x ATK damage, +1 SPD for 2 turns","effect":{"dmgMultiplier":1.8,"element":"wind","spdBuff":1,"duration":2}},
      {"id":"dragon_jump","name":"Dragon Jump","icon":"✨","mp":6,"type":"physical","description":"Leap skyward — 2.2x ATK damage, evasion +20% next turn","effect":{"dmgMultiplier":2.2,"element":"wind","evasion":0.2}},
      {"id":"divine_flight","name":"Divine Flight","icon":"🌬️","mp":8,"type":"buff","description":"Take to the skies — evasion +40%, SPD +30%, party SPD +2 for 3 turns","effect":{"stat":"spd","multiplier":1.3,"evasion":0.4,"aoe":true,"duration":3}},
      {"id":"heavens_fall","name":"Heaven's Fall","icon":"⚡","mp":12,"type":"magic_damage","isUltimate":true,"description":"Descend with divine fury — 4.0x ATK damage, scales with SPD, area strike","effect":{"dmgMultiplier":4.0,"element":"wind","statScale":"spd","aoe":true}}
    ],
    "growthPerLevel":{"hp":9,"mp":2,"atk":5,"def":3,"spd":5,"mag":1}
  },
  {
    "id":"knight_king_divine","name":"Grail Guardian","icon":"⚔️","tag":"Holy / Divinity",
    "description":"A god-blessed kingship. Wield divine authority and summon the power of gods to protect and annihilate.",
    "color":"#b45309",
    "role":"Paladin",
    "stat_multipliers":{"hp":1.35,"mp":1.15,"atk":1.4,"def":1.4,"spd":0.95,"mag":1.25},
    "abilities":[
      {"id":"holy_strike","name":"Holy Strike","icon":"⚔️","mp":0,"type":"physical","description":"Divine sword strike — 1.7x ATK damage, holy element","effect":{"dmgMultiplier":1.7,"element":"holy"}},
      {"id":"divine_shield","name":"Divine Shield","icon":"🛡️","mp":7,"type":"buff","description":"Summon god's protection — DEF +45%, reduce damage taken by 20%, 3 turns","effect":{"stat":"def","multiplier":1.45,"damageReduction":0.2,"duration":3}},
      {"id":"grail_blessing","name":"Grail Blessing","icon":"✨","mp":9,"type":"heal","description":"Divine blessing of the grail — restore 50-70 HP to all allies, cleanse debuffs","effect":{"healBase":50,"healRandom":20,"aoe":true,"cleanse":true}},
      {"id":"lionheart_ascendant","name":"Lionheart Ascendant","icon":"👑","mp":14,"type":"magic_damage","isUltimate":true,"description":"Ascend as king eternal — 4.2x ATK damage, scales with ATK+DEF, blessing all allies","effect":{"dmgMultiplier":4.2,"element":"holy","statScale":"atk","partyBuff":true}}
    ],
    "growthPerLevel":{"hp":14,"mp":5,"atk":5,"def":6,"spd":1,"mag":3}
  }
];

// ── ENEMIES ───────────────────────────────────────────────────
// Tier 1 (1-15) → Tier 2 (16-35) → Tier 3 (36-50)
window.ENEMIES_DATA = [
  {"id":"goblin","name":"Goblin Scout","subtitle":"A sneaky little menace with a rusty blade","tier":1,"stats":{"hp":32,"atk":8,"def":4,"spd":13,"mag":3},"reward":{"exp":12,"gold":8},"palette":{"body":"#60a030","dark":"#3a6010","shine":"#90d050","eye":"#ffffff","pupil":"#201008"},"abilities":[{"id":"quick_slash","name":"Quick Slash","type":"physical","weight":50,"dmgMultiplier":0.9},{"id":"dirty_trick","name":"Dirty Trick","type":"debuff","weight":30},{"id":"stone_throw","name":"Stone Throw","type":"physical","weight":20,"dmgMultiplier":1.1}]},
  {"id":"bat","name":"Giant Bat","subtitle":"A shrieking beast that hunts in total darkness","tier":1,"stats":{"hp":28,"atk":7,"def":3,"spd":16,"mag":5},"reward":{"exp":11,"gold":6},"palette":{"body":"#2a1040","dark":"#100820","shine":"#5030a0","eye":"#ff2040","pupil":"#800010"},"abilities":[{"id":"bite","name":"Bite","type":"physical","weight":60},{"id":"screech","name":"Screech","type":"debuff","weight":25},{"id":"wing_slash","name":"Wing Slash","type":"physical","weight":15,"dmgMultiplier":1.2}]},
  {"id":"rat","name":"Giant Rat","subtitle":"A bloated sewer dweller with plague-ridden teeth","tier":1,"stats":{"hp":22,"atk":6,"def":2,"spd":15,"mag":2},"reward":{"exp":8,"gold":5},"palette":{"body":"#907060","dark":"#503020","shine":"#c0a080","eye":"#ff4040","pupil":"#200000"},"abilities":[{"id":"gnaw","name":"Gnaw","type":"physical","weight":65},{"id":"swarm","name":"Swarm","type":"debuff","weight":35}]},
  {"id":"mushroom","name":"Spore Mushroom","subtitle":"A toxic fungus that releases blinding clouds","tier":1,"stats":{"hp":38,"atk":5,"def":7,"spd":2,"mag":9},"reward":{"exp":15,"gold":9},"palette":{"body":"#c03040","dark":"#801020","shine":"#ff6080","eye":"#ffffff","pupil":"#400010"},"abilities":[{"id":"spore_cloud","name":"Spore Cloud","type":"magic_damage","weight":40,"dmgMultiplier":1.3},{"id":"root","name":"Root","type":"debuff","weight":35},{"id":"headbutt","name":"Headbutt","type":"physical","weight":25}]},
  {"id":"imp","name":"Fire Imp","subtitle":"A mischievous little devil with scorching hands","tier":1,"stats":{"hp":30,"atk":9,"def":4,"spd":12,"mag":9},"reward":{"exp":13,"gold":9},"palette":{"body":"#cc3020","dark":"#801010","shine":"#ff8060","eye":"#ffcc00","pupil":"#804000"},"abilities":[{"id":"scratch","name":"Scratch","type":"physical","weight":45},{"id":"fire_bolt","name":"Fire Bolt","type":"magic_damage","weight":35,"dmgMultiplier":1.4},{"id":"cackle","name":"Cackle","type":"debuff","weight":20}]},
  {"id":"crab","name":"Armored Crab","subtitle":"A coastal beast with nearly impenetrable shell","tier":1,"stats":{"hp":46,"atk":10,"def":12,"spd":3,"mag":2},"reward":{"exp":18,"gold":12},"palette":{"body":"#d06020","dark":"#803010","shine":"#ff9040","eye":"#303030","pupil":"#000000"},"abilities":[{"id":"pinch","name":"Pinch","type":"physical","weight":55,"dmgMultiplier":1.1},{"id":"shell_harden","name":"Shell Harden","type":"buff_def","weight":30},{"id":"claw_snap","name":"Claw Snap","type":"physical","weight":15,"dmgMultiplier":1.3}]},
  {"id":"wolf","name":"Dire Wolf","subtitle":"A massive black wolf that hunts in the shadow","tier":1,"stats":{"hp":38,"atk":12,"def":5,"spd":15,"mag":3},"reward":{"exp":16,"gold":10},"palette":{"body":"#303040","dark":"#101020","shine":"#6060a0","eye":"#ffcc00","pupil":"#806000"},"abilities":[{"id":"wolf_bite","name":"Bite","type":"physical","weight":50,"dmgMultiplier":1.1},{"id":"howl","name":"Howl","type":"buff_self","weight":25},{"id":"tackle","name":"Tackle","type":"physical","weight":25,"dmgMultiplier":1.2}]},
  {"id":"spider","name":"Poison Spider","subtitle":"A web-spinning predator coated in venom","tier":1,"stats":{"hp":32,"atk":8,"def":5,"spd":11,"mag":6},"reward":{"exp":14,"gold":9},"palette":{"body":"#201828","dark":"#100c18","shine":"#8040c0","eye":"#ff0000","pupil":"#600000"},"abilities":[{"id":"spider_bite","name":"Bite","type":"physical","weight":45},{"id":"web","name":"Web","type":"debuff","weight":35},{"id":"venom_strike","name":"Venom Strike","type":"magic_damage","weight":20,"dmgMultiplier":1.3}]},
  {"id":"zombie","name":"Rotting Zombie","subtitle":"A shambling undead spreading plague and misery","tier":1,"stats":{"hp":50,"atk":11,"def":7,"spd":3,"mag":4},"reward":{"exp":19,"gold":12},"palette":{"body":"#608040","dark":"#304020","shine":"#90c060","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"zombie_slam","name":"Slam","type":"physical","weight":50},{"id":"plague","name":"Plague","type":"magic_damage","weight":30,"dmgMultiplier":1.2},{"id":"rotten_grasp","name":"Rotten Grasp","type":"debuff","weight":20}]},
  {"id":"wisp","name":"Lost Wisp","subtitle":"A wayward soul radiating corrosive spectral light","tier":1,"stats":{"hp":25,"atk":6,"def":3,"spd":14,"mag":11},"reward":{"exp":16,"gold":10},"palette":{"body":"#60a0ff","dark":"#2040c0","shine":"#a0d0ff","eye":"#ffffff","pupil":"#8080ff"},"abilities":[{"id":"phase_bolt","name":"Phase Bolt","type":"magic_damage","weight":50,"dmgMultiplier":1.4},{"id":"flash","name":"Flash","type":"debuff","weight":30},{"id":"haunt","name":"Haunt","type":"magic_damage","weight":20,"dmgMultiplier":1.2}]},
  {"id":"lizardman","name":"Lizardman Scout","subtitle":"A scaled warrior from the swamp tribes","tier":1,"stats":{"hp":42,"atk":12,"def":7,"spd":10,"mag":4},"reward":{"exp":20,"gold":13},"palette":{"body":"#406030","dark":"#203010","shine":"#70a050","eye":"#ffaa00","pupil":"#805000"},"abilities":[{"id":"lizard_slash","name":"Slash","type":"physical","weight":50,"dmgMultiplier":1.1},{"id":"tail_whip","name":"Tail Whip","type":"debuff","weight":30},{"id":"scale_guard","name":"Scale Guard","type":"buff_def","weight":20}]},
  {"id":"bandit","name":"Road Bandit","subtitle":"A ruthless highwayman who fights dirty","tier":1,"stats":{"hp":40,"atk":11,"def":6,"spd":9,"mag":3},"reward":{"exp":18,"gold":14},"palette":{"body":"#8a6040","dark":"#503020","shine":"#c09060","eye":"#4040ff","pupil":"#000080"},"abilities":[{"id":"bandit_slash","name":"Slash","type":"physical","weight":50},{"id":"dirty_blow","name":"Dirty Blow","type":"debuff","weight":30},{"id":"throw_knife","name":"Throw Knife","type":"physical","weight":20,"dmgMultiplier":1.2}]},
  {"id":"scarecrow","name":"Cursed Scarecrow","subtitle":"An animated effigy imbued with harvest magic","tier":1,"stats":{"hp":36,"atk":9,"def":8,"spd":4,"mag":7},"reward":{"exp":17,"gold":11},"palette":{"body":"#c0a040","dark":"#806020","shine":"#e0d060","eye":"#ff4000","pupil":"#800000"},"abilities":[{"id":"straw_slash","name":"Straw Slash","type":"physical","weight":45},{"id":"curse","name":"Curse","type":"debuff","weight":35},{"id":"evil_eye","name":"Evil Eye","type":"magic_damage","weight":20,"dmgMultiplier":1.3}]},
  {"id":"slime","name":"Toxic Slime","subtitle":"A bubbling mass of corrosive ooze","tier":1,"stats":{"hp":40,"atk":7,"def":3,"spd":5,"mag":4},"reward":{"exp":14,"gold":10},"palette":{"body":"#50cc40","dark":"#289018","shine":"#90ff70","eye":"#ffffff","pupil":"#102008"},"abilities":[{"id":"ooze","name":"Ooze","type":"physical","weight":50},{"id":"acid","name":"Acid","type":"magic_damage","weight":30,"dmgMultiplier":1.4},{"id":"split","name":"Split","type":"buff_self","weight":20}]},
  {"id":"skeleton","name":"Bone Knight","subtitle":"An undead warrior animated by dark magic","tier":1,"stats":{"hp":52,"atk":13,"def":8,"spd":8,"mag":5},"reward":{"exp":22,"gold":15},"palette":{"bone":"#e8dfc0","shadow":"#a09060","dark":"#605030","armor":"#607090","eyes":"#60c0ff"},"abilities":[{"id":"slash","name":"Bone Slash","type":"physical","weight":60,"dmgMultiplier":1.1},{"id":"dark_aura","name":"Dark Aura","type":"magic_damage","weight":25,"dmgMultiplier":1.3},{"id":"intimidate","name":"Intimidate","type":"debuff","weight":15}]},
  {"id":"harpy","name":"Storm Harpy","subtitle":"A winged predator that rides lightning","tier":2,"stats":{"hp":68,"atk":15,"def":8,"spd":15,"mag":11},"reward":{"exp":30,"gold":20},"palette":{"body":"#c8a040","dark":"#806010","wing":"#503010","eye":"#40c0ff","shine":"#ffe080"},"abilities":[{"id":"talon_strike","name":"Talon Strike","type":"physical","weight":45,"dmgMultiplier":1.2},{"id":"wind_blade","name":"Wind Blade","type":"magic_damage","weight":35,"dmgMultiplier":1.4},{"id":"shriek","name":"Shriek","type":"debuff","weight":20}]},
  {"id":"ghost","name":"Phantom Ghost","subtitle":"A wailing spirit that chills the soul","tier":2,"stats":{"hp":58,"atk":12,"def":6,"spd":14,"mag":17},"reward":{"exp":29,"gold":18},"palette":{"body":"#80a0ff","dark":"#4060c0","shine":"#c0d0ff","eye":"#ffffff","pupil":"#8080ff"},"abilities":[{"id":"soul_touch","name":"Soul Touch","type":"magic_damage","weight":50,"dmgMultiplier":1.3},{"id":"phase_bolt2","name":"Phase Bolt","type":"magic_damage","weight":30,"dmgMultiplier":1.5},{"id":"wail","name":"Wail","type":"debuff","weight":20}]},
  {"id":"merman","name":"Deep Merman","subtitle":"A corrupted sea dweller from the abyss","tier":2,"stats":{"hp":70,"atk":14,"def":9,"spd":12,"mag":13},"reward":{"exp":31,"gold":20},"palette":{"body":"#208090","dark":"#104050","shine":"#40d0e0","eye":"#00ffcc","pupil":"#006040"},"abilities":[{"id":"trident_stab","name":"Trident Stab","type":"physical","weight":45,"dmgMultiplier":1.2},{"id":"tidal_wave","name":"Tidal Wave","type":"magic_damage","weight":35,"dmgMultiplier":1.4},{"id":"sea_curse","name":"Sea Curse","type":"debuff","weight":20}]},
  {"id":"witch","name":"Swamp Witch","subtitle":"A cackling crone who traffics in dark hexes","tier":2,"stats":{"hp":65,"atk":11,"def":8,"spd":10,"mag":20},"reward":{"exp":32,"gold":21},"palette":{"body":"#3a5020","dark":"#1a2810","shine":"#70a040","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"hex_bolt","name":"Hex Bolt","type":"magic_damage","weight":40,"dmgMultiplier":1.5},{"id":"witch_curse","name":"Curse","type":"debuff","weight":35},{"id":"dark_brew","name":"Dark Brew","type":"magic_damage","weight":25,"dmgMultiplier":1.3}]},
  {"id":"werewolf","name":"Werewolf","subtitle":"A cursed warrior who transforms under moonlight","tier":2,"stats":{"hp":80,"atk":18,"def":9,"spd":16,"mag":7},"reward":{"exp":36,"gold":23},"palette":{"body":"#504038","dark":"#201810","shine":"#907060","eye":"#ffcc00","pupil":"#806000"},"abilities":[{"id":"rending_claw","name":"Rending Claw","type":"physical","weight":45,"dmgMultiplier":1.3},{"id":"wolf_howl","name":"Howl","type":"buff_self","weight":25},{"id":"feral_bite","name":"Feral Bite","type":"physical","weight":30,"dmgMultiplier":1.5}]},
  {"id":"vampire","name":"Crimson Vampire","subtitle":"An ancient noble who feeds on life force","tier":2,"stats":{"hp":78,"atk":17,"def":10,"spd":11,"mag":14},"reward":{"exp":35,"gold":22},"palette":{"body":"#f0d8e8","dark":"#4010a0","cape":"#800020","eye":"#ff2020","shine":"#ff80b0"},"abilities":[{"id":"blood_drain","name":"Blood Drain","type":"physical","weight":40,"dmgMultiplier":1.2},{"id":"shadow_mist","name":"Shadow Mist","type":"magic_damage","weight":35,"dmgMultiplier":1.3},{"id":"dark_charm","name":"Dark Charm","type":"debuff","weight":25}]},
  {"id":"medusa","name":"Medusa","subtitle":"A serpentine gorgon whose gaze turns flesh to stone","tier":2,"stats":{"hp":72,"atk":13,"def":10,"spd":10,"mag":18},"reward":{"exp":33,"gold":21},"palette":{"body":"#508040","dark":"#284020","shine":"#90c060","eye":"#ff8000","pupil":"#804000"},"abilities":[{"id":"serpent_strike","name":"Serpent Strike","type":"physical","weight":40,"dmgMultiplier":1.1},{"id":"petrify_gaze","name":"Petrify Gaze","type":"debuff","weight":35},{"id":"snake_hair","name":"Snake Hair","type":"magic_damage","weight":25,"dmgMultiplier":1.4}]},
  {"id":"orc","name":"Orc Berserker","subtitle":"A raging brute who lives for the thrill of battle","tier":2,"stats":{"hp":82,"atk":18,"def":11,"spd":9,"mag":4},"reward":{"exp":34,"gold":22},"palette":{"body":"#508030","dark":"#283810","shine":"#80c050","eye":"#ff4000","pupil":"#801000"},"abilities":[{"id":"heavy_swing","name":"Heavy Swing","type":"physical","weight":50,"dmgMultiplier":1.3},{"id":"orc_rage","name":"Rage","type":"buff_self","weight":25},{"id":"headbutt","name":"Headbutt","type":"physical","weight":25,"dmgMultiplier":1.1}]},
  {"id":"naga","name":"Naga Warrior","subtitle":"A serpent-warrior who commands dark water magic","tier":2,"stats":{"hp":76,"atk":15,"def":11,"spd":12,"mag":14},"reward":{"exp":34,"gold":22},"palette":{"body":"#306080","dark":"#183040","shine":"#50a0c0","eye":"#ff8000","pupil":"#804000"},"abilities":[{"id":"serpent_slash","name":"Serpent Slash","type":"physical","weight":45,"dmgMultiplier":1.2},{"id":"poison_coil","name":"Poison Coil","type":"magic_damage","weight":35,"dmgMultiplier":1.3},{"id":"mystic_dance","name":"Mystic Dance","type":"debuff","weight":20}]},
  {"id":"centaur","name":"Centaur Archer","subtitle":"A half-human warrior with deadly aim and iron hooves","tier":2,"stats":{"hp":78,"atk":17,"def":10,"spd":14,"mag":10},"reward":{"exp":35,"gold":23},"palette":{"body":"#c09060","dark":"#806030","shine":"#e0c080","eye":"#404080","pupil":"#101030"},"abilities":[{"id":"arrow_volley","name":"Arrow Volley","type":"physical","weight":45,"dmgMultiplier":1.3},{"id":"centaur_charge","name":"Charge","type":"physical","weight":30,"dmgMultiplier":1.5},{"id":"war_cry","name":"War Cry","type":"buff_self","weight":25}]},
  {"id":"gargoyle","name":"Stone Gargoyle","subtitle":"A demonic sentinel carved from living rock","tier":2,"stats":{"hp":85,"atk":16,"def":17,"spd":7,"mag":8},"reward":{"exp":36,"gold":24},"palette":{"body":"#707080","dark":"#404050","shine":"#a0a0c0","eye":"#ff6020","pupil":"#801000"},"abilities":[{"id":"stone_smash","name":"Stone Smash","type":"physical","weight":45,"dmgMultiplier":1.3},{"id":"wing_dive","name":"Wing Dive","type":"physical","weight":30,"dmgMultiplier":1.4},{"id":"petrify_skin","name":"Petrify","type":"buff_def","weight":25}]},
  {"id":"cyclops","name":"Cave Cyclops","subtitle":"A one-eyed giant with devastating crushing power","tier":2,"stats":{"hp":95,"atk":19,"def":14,"spd":5,"mag":5},"reward":{"exp":39,"gold":26},"palette":{"body":"#b08060","dark":"#604020","shine":"#e0b080","eye":"#ff2000","pupil":"#800000"},"abilities":[{"id":"boulder_smash","name":"Boulder Smash","type":"physical","weight":50,"dmgMultiplier":1.5},{"id":"rock_throw","name":"Rock Throw","type":"physical","weight":30,"dmgMultiplier":1.2},{"id":"stomp","name":"Stomp","type":"debuff","weight":20}]},
  {"id":"minotaur","name":"Iron Minotaur","subtitle":"A bull-headed juggernaut clad in forged iron","tier":2,"stats":{"hp":88,"atk":20,"def":15,"spd":7,"mag":4},"reward":{"exp":37,"gold":24},"palette":{"body":"#705040","dark":"#402820","shine":"#a07050","eye":"#ff2000","pupil":"#800000"},"abilities":[{"id":"gore","name":"Gore","type":"physical","weight":50,"dmgMultiplier":1.4},{"id":"iron_skin","name":"Iron Skin","type":"buff_def","weight":25},{"id":"charge","name":"Charge","type":"physical","weight":25,"dmgMultiplier":1.6}]},
  {"id":"basilisk","name":"Stone Basilisk","subtitle":"A petrifying lizard of immense power","tier":2,"stats":{"hp":74,"atk":16,"def":12,"spd":8,"mag":12},"reward":{"exp":33,"gold":21},"palette":{"body":"#608050","dark":"#304028","shine":"#90c070","eye":"#ffcc00","pupil":"#806000"},"abilities":[{"id":"stone_breath","name":"Stone Breath","type":"magic_damage","weight":45,"dmgMultiplier":1.4},{"id":"tail_sweep","name":"Tail Sweep","type":"physical","weight":35,"dmgMultiplier":1.2},{"id":"petrify_touch","name":"Petrify","type":"debuff","weight":20}]},
  {"id":"ogre","name":"Armored Ogre","subtitle":"A mountain of muscle draped in stolen plate mail","tier":2,"stats":{"hp":96,"atk":21,"def":13,"spd":5,"mag":3},"reward":{"exp":40,"gold":27},"palette":{"body":"#908070","dark":"#504030","shine":"#c0b090","eye":"#ff0000","pupil":"#800000"},"abilities":[{"id":"bone_crush","name":"Bone Crush","type":"physical","weight":45,"dmgMultiplier":1.5},{"id":"overhead_smash","name":"Overhead Smash","type":"physical","weight":35,"dmgMultiplier":1.4},{"id":"iron_guard","name":"Iron Guard","type":"buff_def","weight":20}]},
  {"id":"troll","name":"Swamp Troll","subtitle":"A regenerating horror dredged from the bog","tier":2,"stats":{"hp":88,"atk":15,"def":11,"spd":6,"mag":5},"reward":{"exp":37,"gold":24},"palette":{"body":"#406030","dark":"#203010","shine":"#70a050","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"swamp_strike","name":"Swamp Strike","type":"physical","weight":45,"dmgMultiplier":1.2},{"id":"troll_regen","name":"Regenerate","type":"buff_self","weight":30},{"id":"mud_throw","name":"Mud Throw","type":"debuff","weight":25}]},
  {"id":"lesser_demon","name":"Lesser Demon","subtitle":"A fragment of hell given grotesque form","tier":2,"stats":{"hp":72,"atk":16,"def":9,"spd":13,"mag":15},"reward":{"exp":32,"gold":21},"palette":{"body":"#a02020","dark":"#600010","shine":"#ff4040","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"dark_slash","name":"Dark Slash","type":"physical","weight":40,"dmgMultiplier":1.2},{"id":"hellfire","name":"Hellfire","type":"magic_damage","weight":40,"dmgMultiplier":1.5},{"id":"terror","name":"Terror","type":"debuff","weight":20}]},
  {"id":"golem","name":"Stone Golem","subtitle":"An ancient construct of living rock","tier":2,"stats":{"hp":90,"atk":16,"def":18,"spd":4,"mag":3},"reward":{"exp":38,"gold":25},"palette":{"stone":"#8a8a9a","dark":"#555565","crack":"#404050","crystal":"#80c0ff","glow":"#c0e0ff"},"abilities":[{"id":"smash","name":"Ground Smash","type":"physical","weight":55,"dmgMultiplier":1.4},{"id":"boulder","name":"Boulder Toss","type":"physical","weight":30,"dmgMultiplier":1.2},{"id":"stone_skin","name":"Stone Skin","type":"buff_def","weight":15}]},
  {"id":"fire_elemental","name":"Fire Elemental","subtitle":"A living inferno with no mercy and no form","tier":2,"stats":{"hp":68,"atk":14,"def":7,"spd":11,"mag":21},"reward":{"exp":31,"gold":20},"palette":{"body":"#ff6020","dark":"#c02000","shine":"#ffcc00","eye":"#ffffff","pupil":"#ffff80"},"abilities":[{"id":"ember_strike","name":"Ember Strike","type":"physical","weight":35,"dmgMultiplier":1.1},{"id":"flame_burst","name":"Flame Burst","type":"magic_damage","weight":45,"dmgMultiplier":1.6},{"id":"ignite","name":"Ignite","type":"magic_damage","weight":20,"dmgMultiplier":1.3}]},
  {"id":"iron_golem","name":"Iron Golem","subtitle":"A construct of cold iron and ancient runes","tier":2,"stats":{"hp":100,"atk":17,"def":22,"spd":3,"mag":4},"reward":{"exp":42,"gold":28},"palette":{"body":"#708090","dark":"#405060","shine":"#a0c0d0","eye":"#40ff80","pupil":"#00a040"},"abilities":[{"id":"iron_fist","name":"Iron Fist","type":"physical","weight":50,"dmgMultiplier":1.4},{"id":"steel_body","name":"Steel Body","type":"buff_def","weight":30},{"id":"rivet_shot","name":"Rivet Shot","type":"physical","weight":20,"dmgMultiplier":1.2}]},
  {"id":"dark_knight","name":"Dark Knight","subtitle":"A fallen warrior consumed by shadow","tier":3,"stats":{"hp":118,"atk":23,"def":16,"spd":10,"mag":13},"reward":{"exp":58,"gold":40},"palette":{"body":"#1a1a2a","dark":"#0a0a15","armor":"#303060","eye":"#8040ff","shine":"#6030d0"},"abilities":[{"id":"shadow_cleave","name":"Shadow Cleave","type":"physical","weight":40,"dmgMultiplier":1.5},{"id":"doom_strike","name":"Doom Strike","type":"magic_damage","weight":40,"dmgMultiplier":1.6},{"id":"dark_presence","name":"Dark Presence","type":"buff_self","weight":20}]},
  {"id":"wyvern","name":"Venom Wyvern","subtitle":"A serpentine dragon dripping with acid","tier":3,"stats":{"hp":112,"atk":21,"def":10,"spd":14,"mag":16},"reward":{"exp":62,"gold":45},"palette":{"body":"#2a6020","dark":"#153010","scale":"#508040","eye":"#ffcc00","shine":"#80ff60"},"abilities":[{"id":"poison_fang","name":"Poison Fang","type":"physical","weight":40,"dmgMultiplier":1.3},{"id":"acid_breath","name":"Acid Breath","type":"magic_damage","weight":40,"dmgMultiplier":1.5},{"id":"wing_storm","name":"Wing Storm","type":"physical","weight":20,"dmgMultiplier":1.4}]},
  {"id":"lich","name":"Ancient Lich","subtitle":"An immortal sorcerer who cheated death itself","tier":3,"stats":{"hp":105,"atk":18,"def":11,"spd":9,"mag":26},"reward":{"exp":60,"gold":42},"palette":{"body":"#e0d8c0","dark":"#807050","robe":"#201850","eye":"#80ffff","shine":"#40d0d0"},"abilities":[{"id":"death_ray","name":"Death Ray","type":"magic_damage","weight":40,"dmgMultiplier":1.8},{"id":"soul_drain","name":"Soul Drain","type":"magic_damage","weight":35,"dmgMultiplier":1.6},{"id":"bone_wall","name":"Bone Wall","type":"buff_def","weight":25}]},
  {"id":"chimera","name":"Chimera Beast","subtitle":"A three-headed nightmare of lion, goat and dragon","tier":3,"stats":{"hp":125,"atk":22,"def":13,"spd":12,"mag":15},"reward":{"exp":64,"gold":46},"palette":{"body":"#c08040","dark":"#804010","scale":"#408040","eye":"#ff2000","shine":"#ffa040"},"abilities":[{"id":"triple_bite","name":"Triple Bite","type":"physical","weight":35,"dmgMultiplier":1.4},{"id":"dragon_breath_c","name":"Dragon Breath","type":"magic_damage","weight":40,"dmgMultiplier":1.6},{"id":"lion_maw","name":"Lion Maw","type":"physical","weight":25,"dmgMultiplier":1.5}]},
  {"id":"necromancer","name":"Death Necromancer","subtitle":"A master of death magic who raises the fallen","tier":3,"stats":{"hp":98,"atk":16,"def":10,"spd":9,"mag":25},"reward":{"exp":61,"gold":43},"palette":{"body":"#e0d0c0","dark":"#706050","robe":"#2a0840","eye":"#00ff80","shine":"#40c080"},"abilities":[{"id":"death_bolt","name":"Death Bolt","type":"magic_damage","weight":40,"dmgMultiplier":1.7},{"id":"life_drain","name":"Life Drain","type":"magic_damage","weight":35,"dmgMultiplier":1.5},{"id":"raise_dead","name":"Raise Dead","type":"buff_self","weight":25}]},
  {"id":"dark_phoenix","name":"Dark Phoenix","subtitle":"A reborn firebird twisted by shadow corruption","tier":3,"stats":{"hp":100,"atk":20,"def":10,"spd":17,"mag":22},"reward":{"exp":63,"gold":45},"palette":{"body":"#400060","dark":"#200030","wing":"#800080","eye":"#ff4000","fire":"#c000ff"},"abilities":[{"id":"dark_flame_p","name":"Dark Flame","type":"magic_damage","weight":45,"dmgMultiplier":1.7},{"id":"ash_nova","name":"Ash Nova","type":"magic_damage","weight":35,"dmgMultiplier":1.4},{"id":"rebirth_aura","name":"Rebirth Aura","type":"buff_self","weight":20}]},
  {"id":"kraken","name":"Sea Kraken","subtitle":"A colossal deep-sea terror with crushing tentacles","tier":3,"stats":{"hp":140,"atk":23,"def":15,"spd":7,"mag":16},"reward":{"exp":66,"gold":48},"palette":{"body":"#203060","dark":"#101830","shine":"#4060c0","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"tentacle_slam","name":"Tentacle Slam","type":"physical","weight":40,"dmgMultiplier":1.4},{"id":"ink_cloud","name":"Ink Cloud","type":"debuff","weight":25},{"id":"crushing_grip","name":"Crushing Grip","type":"physical","weight":35,"dmgMultiplier":1.6}]},
  {"id":"titan","name":"Stone Titan","subtitle":"A primordial giant who shakes the earth with each step","tier":3,"stats":{"hp":150,"atk":26,"def":20,"spd":5,"mag":8},"reward":{"exp":68,"gold":50},"palette":{"body":"#a09080","dark":"#605040","crack":"#404030","eye":"#ff8000","shine":"#e0c080"},"abilities":[{"id":"titan_smash","name":"Titan Smash","type":"physical","weight":45,"dmgMultiplier":1.8},{"id":"earthquake","name":"Earthquake","type":"physical","weight":35,"dmgMultiplier":1.5},{"id":"stone_barrier","name":"Stone Barrier","type":"buff_def","weight":20}]},
  {"id":"demon_lord","name":"Demon Lord","subtitle":"A prince of the underworld bathed in hellfire","tier":3,"stats":{"hp":135,"atk":25,"def":15,"spd":12,"mag":20},"reward":{"exp":67,"gold":49},"palette":{"body":"#800010","dark":"#400008","wing":"#200008","eye":"#ff8000","fire":"#ff2000"},"abilities":[{"id":"hell_strike","name":"Hell Strike","type":"physical","weight":40,"dmgMultiplier":1.6},{"id":"inferno","name":"Inferno","type":"magic_damage","weight":40,"dmgMultiplier":1.8},{"id":"demon_eye","name":"Demon Eye","type":"debuff","weight":20}]},
  {"id":"bone_dragon","name":"Bone Dragon","subtitle":"An undead leviathan whose breath reaps life","tier":3,"stats":{"hp":128,"atk":23,"def":14,"spd":10,"mag":17},"reward":{"exp":65,"gold":47},"palette":{"body":"#e0d8c0","dark":"#a09060","wing":"#605030","eye":"#40ff40","shine":"#80ff80"},"abilities":[{"id":"bone_fang","name":"Bone Fang","type":"physical","weight":40,"dmgMultiplier":1.5},{"id":"death_breath","name":"Death Breath","type":"magic_damage","weight":40,"dmgMultiplier":1.7},{"id":"undead_aura","name":"Undead Aura","type":"buff_self","weight":20}]},
  {"id":"abomination","name":"Flesh Abomination","subtitle":"A horrific mass of stitched bodies and madness","tier":3,"stats":{"hp":145,"atk":24,"def":16,"spd":6,"mag":12},"reward":{"exp":66,"gold":48},"palette":{"body":"#a06050","dark":"#603020","shine":"#d09070","eye":"#ffff00","pupil":"#808000"},"abilities":[{"id":"rend","name":"Rend","type":"physical","weight":40,"dmgMultiplier":1.5},{"id":"acid_spew","name":"Acid Spew","type":"magic_damage","weight":35,"dmgMultiplier":1.6},{"id":"mutate","name":"Mutate","type":"buff_self","weight":25}]},
  {"id":"void_knight","name":"Void Knight","subtitle":"A warrior erased from existence and reborn in darkness","tier":3,"stats":{"hp":120,"atk":24,"def":17,"spd":11,"mag":16},"reward":{"exp":63,"gold":45},"palette":{"body":"#0a0a20","dark":"#050510","armor":"#2020a0","eye":"#c080ff","shine":"#8040ff"},"abilities":[{"id":"void_slash","name":"Void Slash","type":"physical","weight":40,"dmgMultiplier":1.6},{"id":"null_field","name":"Null Field","type":"magic_damage","weight":35,"dmgMultiplier":1.5},{"id":"dark_edge","name":"Dark Edge","type":"debuff","weight":25}]},
  {"id":"fallen_angel","name":"Fallen Angel","subtitle":"A divine being cast down and corrupted beyond salvation","tier":3,"stats":{"hp":115,"atk":22,"def":13,"spd":15,"mag":20},"reward":{"exp":65,"gold":47},"palette":{"body":"#f0e8ff","dark":"#301840","wing":"#201030","eye":"#ff2060","shine":"#ff80c0"},"abilities":[{"id":"divine_slash","name":"Divine Slash","type":"physical","weight":35,"dmgMultiplier":1.5},{"id":"holy_burn","name":"Holy Burn","type":"magic_damage","weight":40,"dmgMultiplier":1.7},{"id":"fallen_grace","name":"Fallen Grace","type":"buff_self","weight":25}]},
  {"id":"shadow_emperor","name":"Shadow Emperor","subtitle":"The supreme ruler of all darkness — the final reckoning","tier":3,"stats":{"hp":155,"atk":27,"def":18,"spd":13,"mag":22},"reward":{"exp":80,"gold":60},"palette":{"body":"#100820","dark":"#080410","armor":"#2a0850","eye":"#ff00ff","shine":"#c000c0"},"abilities":[{"id":"imperial_strike","name":"Imperial Strike","type":"physical","weight":35,"dmgMultiplier":1.7},{"id":"void_consume","name":"Void Consume","type":"magic_damage","weight":45,"dmgMultiplier":2.0},{"id":"shadow_realm","name":"Shadow Realm","type":"debuff","weight":20}]},
  {"id":"dragon","name":"Shadow Dragon","subtitle":"A legendary beast of flame and darkness","tier":3,"stats":{"hp":130,"atk":24,"def":12,"spd":12,"mag":18},"reward":{"exp":70,"gold":55},"palette":{"body":"#2a1840","scale":"#4a2870","wing":"#1a0c2a","eye":"#ff4400","fire":"#ff8800","shine":"#8040d0"},"abilities":[{"id":"claw","name":"Shadow Claw","type":"physical","weight":35},{"id":"dark_fire","name":"Dark Flame","type":"magic_damage","weight":40,"dmgMultiplier":2.0},{"id":"wing_blast","name":"Wing Blast","type":"physical","weight":25,"dmgMultiplier":1.5}]}
];

// ── ITEMS ─────────────────────────────────────────────────────
window.ITEMS_DATA = [
  {"id":"potion","name":"Potion","icon":"🧪","type":"consumable","subtype":"heal_hp","value":50,"effect":{"target":"single","stat":"hp","amount":80,"percent":false},"usable_in":["battle","map"],"description":"Restores 80 HP to one party member.","rarity":"common"},
  {"id":"hi_potion","name":"Hi-Potion","icon":"💊","type":"consumable","subtype":"heal_hp","value":150,"effect":{"target":"single","stat":"hp","amount":200,"percent":false},"usable_in":["battle","map"],"description":"Restores 200 HP to one party member.","rarity":"uncommon"},
  {"id":"ether","name":"Ether","icon":"🔵","type":"consumable","subtype":"heal_mp","value":80,"effect":{"target":"single","stat":"mp","amount":40,"percent":false},"usable_in":["battle","map"],"description":"Restores 40 MP to one party member.","rarity":"common"},
  {"id":"hi_ether","name":"Hi-Ether","icon":"🫧","type":"consumable","subtype":"heal_mp","value":200,"effect":{"target":"single","stat":"mp","amount":100,"percent":false},"usable_in":["battle","map"],"description":"Restores 100 MP to one party member.","rarity":"uncommon"},
  {"id":"elixir","name":"Elixir","icon":"✨","type":"consumable","subtype":"heal_both","value":400,"effect":{"target":"single","stat":"both","amount":9999,"percent":false},"usable_in":["battle","map"],"description":"Fully restores HP and MP of one party member.","rarity":"rare"},
  {"id":"mega_elixir","name":"Mega Elixir","icon":"🌟","type":"consumable","subtype":"heal_both","value":1200,"effect":{"target":"all","stat":"both","amount":9999,"percent":false},"usable_in":["battle","map"],"description":"Fully restores HP and MP of the entire party.","rarity":"rare"},
  {"id":"antidote","name":"Antidote","icon":"🍃","type":"consumable","subtype":"cure_debuff","value":40,"effect":{"target":"single","stat":"debuff","amount":0,"percent":false},"usable_in":["battle","map"],"description":"Cures debuffs from one party member.","rarity":"common"},
  {"id":"phoenix_down","name":"Phoenix Down","icon":"🪶","type":"consumable","subtype":"revive","value":300,"effect":{"target":"single","stat":"revive","amount":25,"percent":true},"usable_in":["battle","map"],"description":"Revives a fallen party member with 25% HP.","rarity":"uncommon"},
  {"id":"smoke_bomb","name":"Smoke Bomb","icon":"💨","type":"consumable","subtype":"escape","value":60,"effect":{"target":"none","stat":"escape","amount":0,"percent":false},"usable_in":["battle"],"description":"Guarantees escape from any battle.","rarity":"common"},
  {"id":"strength_tonic","name":"Strength Tonic","icon":"💪","type":"consumable","subtype":"buff_atk","value":100,"effect":{"target":"single","stat":"atk","amount":20,"percent":true,"turns":3},"usable_in":["battle"],"description":"Raises one member's ATK by 20% for 3 turns.","rarity":"uncommon"},
  {"id":"barrier_stone","name":"Barrier Stone","icon":"🛡️","type":"consumable","subtype":"buff_def","value":100,"effect":{"target":"single","stat":"def","amount":20,"percent":true,"turns":3},"usable_in":["battle"],"description":"Raises one member's DEF by 20% for 3 turns.","rarity":"uncommon"},
  {"id":"soul_crystal","name":"Soul Crystal","icon":"🔮","type":"consumable","subtype":"grant_exp","value":500,"effect":{"target":"all","stat":"exp","amount":50,"percent":false},"usable_in":["map"],"description":"Grants 50 EXP to all party members.","rarity":"rare"},
  {"id":"golden_feather","name":"Golden Feather","icon":"🪙","type":"valuable","subtype":"sell_only","value":500,"effect":{"target":"none","stat":"none","amount":0,"percent":false},"usable_in":[],"description":"A rare feather worth 500 gold. Sell it to a merchant.","rarity":"rare"},
  {"id":"shard_fragment","name":"Shard Fragment","icon":"💎","type":"key_item","subtype":"story","value":0,"effect":{"target":"none","stat":"none","amount":0,"percent":false},"usable_in":[],"description":"A fragment of a Crystal Shard. Connected to the seals.","rarity":"rare"},
  {"id":"tent","name":"Tent","icon":"⛺","type":"consumable","subtype":"heal_hp","value":120,"effect":{"target":"all","stat":"hp","amount":50,"percent":true},"usable_in":["map"],"description":"Restores 50% HP to all party members. Map use only.","rarity":"common"}
];

console.log('[DataLoader] All data loaded.');

window.RELICS_DATA = [
  {"id":"echo_of_the_unmade","name":"Echo of the Unmade","icon":"🌑","rarity":"boss","arcDrop":1,"description":"A hollow fragment of the Void Knight's armor. It still hums with the ghost of an order it could not disobey.","flavour":"Something in it recognizes those who carry burdens they did not choose.","bonus":{"spd":0.12,"firstStrike":true},"bonusText":"SPD +12% · First strike chance in battle"},
  {"id":"cinder_of_ashveil","name":"Cinder of Ashveil","icon":"🔥","rarity":"boss","arcDrop":2,"description":"A coal-black shard from the Demon Lord's chest, where the Fire Fragment burned. It is warm to the touch and will never cool.","flavour":"Fire that remembers what it destroyed does not stop burning.","bonus":{"atk":0.10,"fireResist":0.20},"bonusText":"ATK +10% · Fire damage taken –20%"},
  {"id":"scorched_core","name":"Scorched Core","icon":"🌋","rarity":"boss","arcDrop":3,"description":"A fused knot of stone and heat pulled from the Ember Wastes boss. It has never stopped being warm.","flavour":"Some things burn so long they forget they were ever anything else.","bonus":{"atk":0.12,"def":0.06},"bonusText":"ATK +12% · DEF +6%"},
  {"id":"drowned_sigil","name":"Drowned Sigil","icon":"🌊","rarity":"boss","arcDrop":4,"description":"A barnacled crest torn from the Kraken's hide. It holds the memory of a tide that swallowed an entire coast.","flavour":"The sea does not mourn what it takes. It simply keeps it.","bonus":{"hp":0.15,"statusResist":0.25},"bonusText":"Max HP +15% · Status resistance +25%"},
  {"id":"tarnished_wing","name":"Tarnished Wing","icon":"🪶","rarity":"boss","arcDrop":5,"description":"A single feather from the Fallen Angel Commander — scorched at the edges, still bearing a seal that does not belong to them.","flavour":"The seal is not the commander's. Someone gave the order. Someone wanted them there.","bonus":{"def":0.12,"eliteResist":0.15},"bonusText":"DEF +12% · Damage from elites –15%"},
  {"id":"void_crown_shard","name":"Void Crown Shard","icon":"👁️","rarity":"boss","arcDrop":6,"description":"A fragment of Valdris's crown, cracked in the first moment he doubted himself. It predates the war by centuries.","flavour":"Even emperors are afraid of something.","bonus":{"mag":0.12,"mpRegen":0.10},"bonusText":"MAG +12% · MP regenerates 10% each turn"},
  {"id":"shattered_horizon","name":"Shattered Horizon","icon":"🌌","rarity":"uncommon","arcDrop":null,"description":"Glass from the edge of the Void Citadel where sky and nothing meet. Weightless. Colder than it should be.","flavour":"There are places where the world simply stops. This came from one of them.","bonus":{"spd":0.08,"atk":0.08,"def":0.08},"bonusText":"SPD +8% · ATK +8% · DEF +8%"},
  {"id":"rampart_oath","name":"Rampart Oath","icon":"🛡️","rarity":"boss","arcDrop":7,"description":"A stone oath-tablet from the fortress ramparts, carved by soldiers who knew they would not hold the line.","flavour":"They held it anyway. That is what the tablet is for.","bonus":{"def":0.18,"reviveOnce":true},"bonusText":"DEF +18% · Once per battle: one fallen ally revives at 1 HP"},
  {"id":"last_light_of_aethoria","name":"Last Light of Aethoria","icon":"✨","rarity":"boss","arcDrop":8,"description":"The final pulse of a world that refused to die quietly. It weighs nothing and everything at once.","flavour":"Carry it. That is all it asks.","bonus":{"hp":0.10,"atk":0.10,"mag":0.10,"spd":0.10},"bonusText":"HP +10% · ATK +10% · MAG +10% · SPD +10%"},
  {"id":"ashen_shard","name":"Ashen Shard","icon":"🪨","rarity":"common","arcDrop":null,"description":"A piece of scorched stone from the ruins.","flavour":"Even rubble remembers.","bonus":{"def":0.06},"bonusText":"DEF +6%"},
  {"id":"cracked_talisman","name":"Cracked Talisman","icon":"🧿","rarity":"common","arcDrop":null,"description":"A protective charm split down the middle. Half the ward still holds.","flavour":"Half a protection is better than none. Probably.","bonus":{"hp":0.08},"bonusText":"Max HP +8%"},
  {"id":"ember_token","name":"Ember Token","icon":"🔆","rarity":"common","arcDrop":null,"description":"A coin-sized disc that never goes cold.","flavour":"Warmth kept people alive long before weapons did.","bonus":{"atk":0.07},"bonusText":"ATK +7%"},
  {"id":"tide_remembrance","name":"Tide Remembrance","icon":"💧","rarity":"uncommon","arcDrop":null,"description":"A vial of water from a spring that no longer exists. Sealed with wax.","flavour":"Some things are worth preserving even when the world that made them is gone.","bonus":{"healAmp":0.20},"bonusText":"All healing +20%"},
  {"id":"warden_chain","name":"Warden's Chain","icon":"⛓️","rarity":"uncommon","arcDrop":null,"description":"A length of chain worn smooth by two thousand years of use.","flavour":"Some burdens become so familiar they stop feeling like weight.","bonus":{"def":0.10,"atk":0.05},"bonusText":"DEF +10% · ATK +5%"},
  {"id":"summoner_thread","name":"Summoner's Thread","icon":"🪢","rarity":"uncommon","arcDrop":null,"description":"A cord woven from eidolon hair, given freely.","flavour":"The creatures gave what they could. That is what loyalty looks like.","bonus":{"mag":0.10,"mp":0.08},"bonusText":"MAG +10% · Max MP +8%"}
];
