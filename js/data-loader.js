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
    "id":"ayaka","name":"Ayaka","title":"The Cryo Princess","icon":"❄️",
    "description":"Eldest daughter of the Kamisato Clan, summoned mid-prayer to a world unknown.",
    "personality":"Graceful, noble, quietly fierce",
    "portrait_color":"#7dd3fc","hair_color":"#c0e8ff",
    "skin_color":"#f8e8ff","armor_color":"#4b9fce",
    "base_stats":{"hp":65,"mp":30,"atk":16,"def":12,"spd":18,"mag":14},
    "stat_bonuses":{"spd":3,"atk":2},
    "class_affinity":["cryo_bladestorm"],
    "passive":{"id":"frostflake","name":"Frostflake Dance","description":"Always acts first. +3 SPD bonus and attacks carry a cryo edge."},
    "lore":"Torn from her world mid-prayer. The last thing she saw was cherry blossoms."
  },
  {
    "id":"hutao","name":"Hu Tao","title":"The Ghost Guide","icon":"🔥",
    "description":"Director of the Wangsheng Funeral Parlor. Chasing a spirit when the rift swallowed her.",
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
    "id":"nilou","name":"Nilou","title":"The Star Dancer","icon":"💧",
    "description":"A dancer of the Grand Bazaar, beloved by all. Summoned from the sacred pool mid-performance.",
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
    "id":"xiao","name":"Xiao","title":"The Last Yaksha","icon":"🌀",
    "description":"A guardian yaksha carrying two thousand years of karmic debt.",
    "personality":"Stoic, solitary, fiercely protective",
    "portrait_color":"#4ade80","hair_color":"#1a6040",
    "skin_color":"#d8e8c0","armor_color":"#0a4030",
    "base_stats":{"hp":80,"mp":18,"atk":18,"def":16,"spd":13,"mag":8},
    "stat_bonuses":{"atk":3,"def":3},
    "class_affinity":["yaksha_protector"],
    "passive":{"id":"yakshas_valor","name":"Yaksha's Valor","description":"10% reduced damage. ATK +15% from karmic resolve."},
    "lore":"He has slain ten thousand demons and does not speak of it."
  }
];

// ── CLASSES ───────────────────────────────────────────────────
window.CLASSES_DATA = [
  {
    "id":"cryo_bladestorm","name":"Cryo Bladestorm","icon":"❄️","tag":"Ice / Swift Strike",
    "description":"Ayaka's elegant frozen combat style. Swift ice-infused strikes that freeze enemies.",
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
    "description":"Hu Tao's pyromantic guide art. Harness ghost energy to incinerate foes while draining vitality.",
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
    "description":"Nilou's star-blessed dance. Graceful water magic that heals and supports the party.",
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
    "id":"yaksha_protector","name":"Yaksha Protector","icon":"🌀","tag":"Guardian / Karmic",
    "description":"Xiao's ancient yaksha power. Protective stance with karmic resolution and damage reduction.",
    "color":"#0a4030",
    "role":"Knight",
    "stat_multipliers":{"hp":1.4,"mp":0.8,"atk":1.1,"def":1.4,"spd":0.85,"mag":0.7},
    "abilities":[
      {"id":"lancing_strike","name":"Lancing Strike","icon":"⚡","mp":0,"type":"physical","description":"1.4x ATK, ignore 20% DEF","effect":{"dmgMultiplier":1.4,"element":"physical"}},
      {"id":"yaksha_valor_active","name":"Yaksha's Valor","icon":"🛡","mp":6,"type":"buff","description":"3-turn: -25% damage, +15% reflect","effect":{"stat":"def","multiplier":1.3,"duration":3}},
      {"id":"karmic_barrier","name":"Karmic Barrier","icon":"🌀","mp":8,"type":"buff","description":"Party: DEF +40%, allies -10% damage","effect":{"aoe":true}},
      {"id":"mastery_of_pain","name":"Mastery of Pain","icon":"⚡","mp":14,"type":"magic_damage","description":"3.5x magic, scales with DEF","effect":{"dmgMultiplier":3.5,"element":"anemo"}}
    ],
    "growthPerLevel":{"hp":16,"mp":2,"atk":3,"def":5,"spd":0,"mag":1}
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
  {"id":"potion","name":"Potion","icon":"🧪","effect":{"type":"heal_hp","amount":30}},
  {"id":"hi_potion","name":"Hi-Potion","icon":"💊","effect":{"type":"heal_hp","amount":80}},
  {"id":"ether","name":"Ether","icon":"🫙","effect":{"type":"heal_mp","amount":20}},
  {"id":"elixir","name":"Elixir","icon":"✨","effect":{"type":"heal_all"}},
  {"id":"phoenix_down","name":"Phoenix Down","icon":"🪶","effect":{"type":"revive","hpPercent":0.5}}
];

console.log('[DataLoader] All data loaded.');
