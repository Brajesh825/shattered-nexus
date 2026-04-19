/**
 * sprites.js — Shattered Nexus
 * Hand-crafted pixel art renderer for all characters and enemies.
 * Uses canvas 2D API with a 3px-per-pixel grid system.
 */
const SpriteRenderer = (() => {

  function p(ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x * 3, y * 3, w * 3, h * 3);
  }

  // ─── HERO SPRITES ──────────────────────────────────────────────
  // Canvas: 48x57  (16×19 grid @ 3px)
  // char: character data,  cls: class data

  const HEROES = {

    aria(ctx, char, cls) {
      const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
      // Hair (long, flowing)
      p(ctx, 4, 0, 8, 4, hc);
      p(ctx, 2, 3, 2, 10, hc);  // left side hair
      p(ctx, 12, 3, 2, 10, hc);  // right side hair
      p(ctx, 3, 0, 1, 2, hc);
      // Head
      p(ctx, 4, 2, 8, 5, sc);
      // Eyes (almond shaped)
      p(ctx, 5, 4, 2, 1, '#301010');
      p(ctx, 9, 4, 2, 1, '#301010');
      p(ctx, 5, 4, 1, 1, '#e06070');  // iris left
      p(ctx, 9, 4, 1, 1, '#e06070');  // iris right
      p(ctx, 6, 3, 1, 1, '#ffffff');  // glint l
      p(ctx, 10, 3, 1, 1, '#ffffff');  // glint r
      // Small nose / lips
      p(ctx, 7, 5, 1, 1, '#d09080');
      p(ctx, 7, 6, 2, 1, '#e08080');
      // Scarf / neck
      p(ctx, 4, 7, 8, 2, '#d04060');
      // Torso (light armor)
      p(ctx, 4, 9, 8, 5, ac);
      p(ctx, 3, 9, 1, 5, '#ffffff');  // chest trim
      // Belt
      p(ctx, 3, 13, 10, 2, '#7a3010');
      p(ctx, 5, 14, 2, 1, '#f0c040');  // buckle
      // Sleeves
      p(ctx, 2, 9, 2, 6, ac);
      p(ctx, 12, 9, 2, 6, sc);   // bare right arm
      // Glove
      p(ctx, 2, 14, 2, 2, '#c03040');
      // Legs
      p(ctx, 4, 15, 3, 4, '#301830');
      p(ctx, 9, 15, 3, 4, '#301830');
      // Boots
      p(ctx, 3, 17, 4, 2, '#401020');
      p(ctx, 9, 17, 4, 2, '#401020');
      // Dagger (right hip)
      p(ctx, 13, 10, 1, 8, '#c0c0c0');
      p(ctx, 12, 12, 3, 1, '#804010');
      p(ctx, 13, 9, 1, 2, '#e0e0e0');
    },

    kael(ctx, char, cls) {
      const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
      // Helmet (full plate)
      p(ctx, 3, 0, 10, 7, ac);
      p(ctx, 4, 0, 8, 2, '#b0c8e8');  // top plate
      // Visor slit
      p(ctx, 5, 4, 6, 2, '#c8e0ff');
      p(ctx, 6, 4, 4, 1, '#1a3060');  // dark visor
      // Cheek guards
      p(ctx, 3, 5, 2, 3, ac);
      p(ctx, 11, 5, 2, 3, ac);
      // Neck guard
      p(ctx, 4, 7, 8, 2, '#aab8c8');
      // Heavy breastplate
      p(ctx, 2, 9, 12, 7, ac);
      p(ctx, 3, 9, 1, 7, '#aac0e0');  // left edge
      p(ctx, 12, 9, 1, 7, '#aac0e0');  // right edge
      // Chest cross
      p(ctx, 7, 10, 2, 5, '#8090a0');
      p(ctx, 4, 12, 8, 1, '#8090a0');
      // Pauldrons
      p(ctx, 0, 9, 3, 4, ac);
      p(ctx, 13, 9, 3, 4, ac);
      // Gauntlets
      p(ctx, 0, 12, 3, 4, '#7090b0');
      p(ctx, 13, 12, 3, 4, '#7090b0');
      // Greaves
      p(ctx, 3, 16, 4, 3, ac);
      p(ctx, 9, 16, 4, 3, ac);
      // Boots
      p(ctx, 2, 17, 5, 2, '#4060a0');
      p(ctx, 9, 17, 5, 2, '#4060a0');
      // Shield (left)
      p(ctx, 0, 10, 2, 8, '#4070c0');
      p(ctx, 1, 9, 2, 2, '#e0c040');
      p(ctx, 0, 13, 2, 3, '#e0c040');
      // Sword hilt (right)
      p(ctx, 14, 9, 2, 3, '#c09040');
      p(ctx, 14, 12, 2, 7, '#b0b0c0');
      p(ctx, 13, 11, 4, 1, '#c09040');
    },

    sera(ctx, char, cls) {
      const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
      // Tall mage hat
      p(ctx, 6, 0, 4, 2, ac);
      p(ctx, 5, 1, 6, 2, ac);
      p(ctx, 4, 2, 8, 2, ac);
      // Hat brim
      p(ctx, 3, 4, 10, 1, ac);
      // Star on hat
      p(ctx, 7, 1, 2, 1, '#ffe060');
      p(ctx, 8, 0, 1, 1, '#ffe060');
      // Head
      p(ctx, 4, 5, 8, 5, sc);
      // Long hair sides
      p(ctx, 2, 5, 2, 9, hc);
      p(ctx, 12, 5, 2, 9, hc);
      p(ctx, 4, 9, 1, 5, hc);
      // Eyes (wide, expressive)
      p(ctx, 5, 7, 2, 1, '#1a0840');
      p(ctx, 9, 7, 2, 1, '#1a0840');
      p(ctx, 5, 7, 1, 1, '#9050d0');
      p(ctx, 9, 7, 1, 1, '#9050d0');
      p(ctx, 6, 6, 1, 1, '#ffffff');
      p(ctx, 10, 6, 1, 1, '#ffffff');
      // Small smile
      p(ctx, 6, 9, 4, 1, '#c08090');
      // Robe
      p(ctx, 3, 10, 10, 8, ac);
      p(ctx, 2, 11, 1, 6, ac);
      p(ctx, 13, 11, 1, 6, ac);
      // Robe trim (stars/sparkles)
      p(ctx, 4, 13, 1, 1, '#ffe060');
      p(ctx, 11, 15, 1, 1, '#ffe060');
      p(ctx, 6, 17, 1, 1, '#ffe060');
      p(ctx, 10, 12, 1, 1, '#c0a0ff');
      // Shoes
      p(ctx, 4, 17, 3, 2, '#1a0840');
      p(ctx, 9, 17, 3, 2, '#1a0840');
      // Staff
      p(ctx, 14, 0, 2, 17, '#8a6820');
      p(ctx, 13, 0, 4, 3, '#e0d040');
      p(ctx, 14, 18, 2, 1, '#c09820');
      // Crystal orb on staff
      p(ctx, 14, 1, 2, 2, '#c0a0ff');
      p(ctx, 15, 1, 1, 1, '#ffffff');
    },

    torin(ctx, char, cls) {
      const sc = char.skin_color, hc = char.hair_color, ac = cls ? cls.color : char.armor_color;
      // Hood (druid)
      p(ctx, 3, 0, 10, 5, ac);
      p(ctx, 2, 2, 2, 4, ac);
      p(ctx, 12, 2, 2, 4, ac);
      // Weathered face
      p(ctx, 4, 3, 8, 5, sc);
      // Beard
      p(ctx, 4, 7, 8, 4, hc);
      p(ctx, 5, 10, 6, 2, hc);
      // Eyes (calm, knowing)
      p(ctx, 5, 5, 2, 1, '#201808');
      p(ctx, 9, 5, 2, 1, '#201808');
      p(ctx, 5, 5, 1, 1, '#507030');
      p(ctx, 9, 5, 1, 1, '#507030');
      p(ctx, 6, 4, 1, 1, '#ffffff');
      p(ctx, 10, 4, 1, 1, '#ffffff');
      // Wrinkles (wisdom lines)
      p(ctx, 4, 6, 1, 1, '#c09060');
      p(ctx, 11, 6, 1, 1, '#c09060');
      // Druid robe with leaf motif
      p(ctx, 3, 9, 10, 9, ac);
      p(ctx, 2, 10, 1, 7, '#1a4020');
      p(ctx, 13, 10, 1, 7, '#1a4020');
      // Leaf clasp
      p(ctx, 6, 10, 4, 2, '#50a040');
      p(ctx, 7, 9, 2, 1, '#80c060');
      // Belt (rope/vine)
      p(ctx, 3, 13, 10, 2, '#806020');
      // Vine pattern on robe
      p(ctx, 4, 15, 1, 2, '#50a040');
      p(ctx, 11, 14, 1, 2, '#50a040');
      // Boots
      p(ctx, 3, 17, 4, 2, '#3a2008');
      p(ctx, 9, 17, 4, 2, '#3a2008');
      // Gnarled staff
      p(ctx, 14, 1, 2, 17, '#6a4010');
      p(ctx, 13, 0, 4, 2, '#80c040');  // leaf top
      p(ctx, 13, 3, 1, 1, '#50a020');
      p(ctx, 15, 5, 1, 1, '#50a020');
      p(ctx, 14, 8, 1, 1, '#50a020');
    }
  };

  // ─── ENEMY SPRITES ─────────────────────────────────────────────
  // Canvas: 72x84  (24×28 grid @ 3px)

  const ENEMIES = {

    slime(ctx, pal) {
      // Body (round blob shape)
      p(ctx, 7, 8, 10, 4, pal.body);
      p(ctx, 5, 7, 14, 6, pal.body);
      p(ctx, 4, 6, 16, 8, pal.body);
      p(ctx, 3, 5, 18, 10, pal.body);
      p(ctx, 4, 15, 16, 3, pal.body);
      p(ctx, 5, 17, 14, 2, pal.body);
      p(ctx, 7, 18, 10, 2, pal.body);
      // Dark underside (ground shadow)
      p(ctx, 5, 15, 14, 2, pal.dark);
      p(ctx, 7, 17, 10, 2, pal.dark);
      p(ctx, 8, 18, 8, 1, pal.dark);
      // Shine top-left
      p(ctx, 7, 6, 4, 2, pal.shine);
      p(ctx, 6, 7, 2, 3, pal.shine);
      p(ctx, 8, 5, 3, 2, pal.shine);
      // Bubble highlights
      p(ctx, 14, 7, 2, 2, pal.shine);
      p(ctx, 17, 9, 2, 2, pal.shine);
      // Eyes (cute)
      p(ctx, 8, 9, 3, 4, pal.eye);
      p(ctx, 13, 9, 3, 4, pal.eye);
      p(ctx, 9, 10, 2, 2, pal.pupil);
      p(ctx, 14, 10, 2, 2, pal.pupil);
      // Eye glints
      p(ctx, 9, 9, 1, 1, '#ffffff');
      p(ctx, 14, 9, 1, 1, '#ffffff');
      // Mouth (grin)
      p(ctx, 9, 14, 6, 1, pal.dark);
      p(ctx, 10, 15, 4, 1, pal.dark);
      p(ctx, 9, 15, 1, 1, pal.dark);
      p(ctx, 14, 15, 1, 1, pal.dark);
      // Drips
      p(ctx, 6, 18, 2, 3, pal.body);
      p(ctx, 7, 20, 1, 2, pal.dark);
      p(ctx, 16, 17, 2, 4, pal.body);
      p(ctx, 16, 20, 1, 2, pal.dark);
    },

    skeleton(ctx, pal) {
      // Skull
      p(ctx, 7, 2, 10, 8, pal.bone);
      p(ctx, 6, 3, 12, 7, pal.bone);
      p(ctx, 5, 4, 14, 5, pal.bone);
      // Skull shading
      p(ctx, 14, 3, 3, 6, pal.shadow);
      p(ctx, 6, 8, 12, 1, pal.shadow);
      // Eye sockets (hollow)
      p(ctx, 7, 4, 3, 3, '#101018');
      p(ctx, 14, 4, 3, 3, '#101018');
      // Glowing eyes
      p(ctx, 8, 5, 2, 2, pal.eyes);
      p(ctx, 15, 5, 2, 2, pal.eyes);
      // Nose cavity
      p(ctx, 11, 6, 2, 2, '#101018');
      // Jaw / teeth
      p(ctx, 7, 9, 10, 3, pal.bone);
      p(ctx, 8, 11, 1, 1, '#000000');
      p(ctx, 10, 11, 1, 1, '#000000');
      p(ctx, 12, 11, 1, 1, '#000000');
      p(ctx, 14, 11, 1, 1, '#000000');
      // Ribcage
      p(ctx, 7, 12, 10, 10, pal.armor);
      p(ctx, 8, 12, 8, 8, pal.bone);
      // Rib lines
      for (let r = 0; r < 4; r++) {
        p(ctx, 8, 13 + r * 2, 8, 1, pal.shadow);
      }
      // Spine
      p(ctx, 11, 12, 2, 10, pal.shadow);
      // Right arm (sword arm)
      p(ctx, 17, 12, 3, 8, pal.bone);
      p(ctx, 18, 20, 2, 4, pal.bone);
      // Left arm (shield arm)
      p(ctx, 4, 12, 3, 8, pal.bone);
      p(ctx, 4, 20, 2, 4, pal.bone);
      // Leg bones
      p(ctx, 7, 22, 3, 6, pal.bone);
      p(ctx, 14, 22, 3, 6, pal.bone);
      p(ctx, 7, 26, 4, 2, pal.dark);  // feet
      p(ctx, 13, 26, 4, 2, pal.dark);
      // Rusted sword
      p(ctx, 18, 8, 2, 14, '#9a7040');
      p(ctx, 16, 13, 6, 2, '#7a5020');
      p(ctx, 18, 7, 2, 2, '#c0b070');
      // Old shield
      p(ctx, 1, 13, 4, 8, pal.armor);
      p(ctx, 2, 14, 3, 6, '#708090');
      p(ctx, 3, 16, 1, 2, '#c0a030');
    },

    golem(ctx, pal) {
      // Main boulder body
      p(ctx, 4, 4, 16, 6, pal.stone);
      p(ctx, 3, 5, 18, 10, pal.stone);
      p(ctx, 4, 15, 16, 5, pal.stone);
      p(ctx, 6, 20, 12, 3, pal.stone);
      // Shading right / bottom
      p(ctx, 17, 5, 3, 14, pal.dark);
      p(ctx, 4, 17, 16, 4, pal.dark);
      // Big fist arms
      p(ctx, 0, 10, 4, 8, pal.stone);
      p(ctx, 0, 17, 5, 5, pal.stone);  // left fist
      p(ctx, 20, 10, 4, 8, pal.stone);
      p(ctx, 19, 17, 5, 5, pal.stone);  // right fist
      // Fist shading
      p(ctx, 1, 18, 4, 3, pal.dark);
      p(ctx, 20, 18, 4, 3, pal.dark);
      // Knuckle cracks
      p(ctx, 1, 19, 1, 1, pal.crack);
      p(ctx, 3, 20, 1, 1, pal.crack);
      p(ctx, 20, 19, 1, 1, pal.crack);
      p(ctx, 22, 20, 1, 1, pal.crack);
      // Cracks across body
      p(ctx, 7, 8, 1, 6, pal.crack);
      p(ctx, 8, 13, 3, 1, pal.crack);
      p(ctx, 14, 6, 1, 5, pal.crack);
      p(ctx, 13, 10, 4, 1, pal.crack);
      p(ctx, 10, 15, 1, 4, pal.crack);
      // Glowing crystal eyes
      p(ctx, 7, 8, 4, 4, '#101018');
      p(ctx, 13, 8, 4, 4, '#101018');
      p(ctx, 8, 9, 2, 2, pal.crystal);
      p(ctx, 14, 9, 2, 2, pal.crystal);
      p(ctx, 8, 9, 1, 1, pal.glow);
      p(ctx, 14, 9, 1, 1, pal.glow);
      // Mouth slot
      p(ctx, 8, 14, 8, 2, '#202028');
      p(ctx, 9, 15, 6, 1, '#101018');
      // Teeth (stone slabs)
      p(ctx, 9, 14, 1, 1, pal.stone);
      p(ctx, 11, 14, 1, 1, pal.stone);
      p(ctx, 13, 14, 1, 1, pal.stone);
      p(ctx, 15, 14, 1, 1, pal.stone);
      // Mossy patches
      p(ctx, 5, 18, 2, 2, '#406030');
      p(ctx, 15, 16, 3, 2, '#406030');
      p(ctx, 9, 21, 3, 1, '#406030');
    },

    dragon(ctx, pal) {
      // Wings (back, behind body)
      p(ctx, 0, 2, 6, 12, pal.wing);
      p(ctx, 1, 1, 5, 3, pal.wing);
      p(ctx, 0, 14, 4, 6, pal.wing);
      p(ctx, 18, 2, 6, 12, pal.wing);
      p(ctx, 18, 1, 5, 3, pal.wing);
      p(ctx, 20, 14, 4, 6, pal.wing);
      // Wing membrane pattern
      p(ctx, 2, 4, 1, 8, pal.scale);
      p(ctx, 4, 3, 1, 10, pal.scale);
      p(ctx, 20, 4, 1, 8, pal.scale);
      p(ctx, 18, 3, 1, 10, pal.scale);
      // Main body
      p(ctx, 6, 6, 12, 8, pal.body);
      p(ctx, 5, 7, 14, 10, pal.body);
      p(ctx, 6, 17, 12, 5, pal.body);
      // Underbelly (lighter)
      p(ctx, 8, 8, 8, 6, '#3a2050');
      p(ctx, 8, 14, 8, 6, '#3a2050');
      // Scale pattern
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          p(ctx, 6 + c * 3, 7 + r * 2, 2, 1, pal.scale);
        }
      }
      // Neck & head
      p(ctx, 8, 1, 8, 6, pal.body);
      p(ctx, 7, 3, 10, 5, pal.body);
      // Horns
      p(ctx, 8, 0, 2, 3, '#1a0c30');
      p(ctx, 7, 1, 1, 2, '#1a0c30');
      p(ctx, 14, 0, 2, 3, '#1a0c30');
      p(ctx, 15, 1, 1, 2, '#1a0c30');
      // Eyes (burning)
      p(ctx, 8, 4, 3, 2, '#100010');
      p(ctx, 13, 4, 3, 2, '#100010');
      p(ctx, 9, 4, 2, 2, pal.eye);
      p(ctx, 14, 4, 2, 2, pal.eye);
      p(ctx, 9, 4, 1, 1, '#ffcc00');
      p(ctx, 14, 4, 1, 1, '#ffcc00');
      // Snout / jaw
      p(ctx, 8, 6, 8, 3, pal.body);
      p(ctx, 9, 8, 6, 2, '#2a1840');
      // Teeth
      p(ctx, 9, 8, 1, 2, '#e0dcc0');
      p(ctx, 11, 8, 1, 2, '#e0dcc0');
      p(ctx, 13, 8, 1, 2, '#e0dcc0');
      // Fire breath glow
      p(ctx, 6, 9, 2, 2, pal.fire);
      p(ctx, 5, 10, 2, 2, pal.fire);
      p(ctx, 4, 11, 2, 1, pal.fire);
      p(ctx, 4, 10, 1, 1, '#ffff80');
      // Legs & claws
      p(ctx, 7, 22, 4, 4, pal.body);
      p(ctx, 13, 22, 4, 4, pal.body);
      p(ctx, 6, 25, 6, 2, pal.scale);
      p(ctx, 12, 25, 6, 2, pal.scale);
      // Claws
      for (let c = 0; c < 3; c++) {
        p(ctx, 6 + c * 2, 26, 1, 2, '#c0b080');
        p(ctx, 12 + c * 2, 26, 1, 2, '#c0b080');
      }
      // Tail
      p(ctx, 18, 20, 4, 3, pal.body);
      p(ctx, 20, 23, 3, 2, pal.body);
      p(ctx, 21, 25, 2, 2, pal.scale);
      // Purple magic aura shimmer
      p(ctx, 5, 5, 1, 1, pal.shine);
      p(ctx, 18, 7, 1, 1, pal.shine);
      p(ctx, 10, 20, 1, 1, pal.shine);
      p(ctx, 17, 15, 1, 1, pal.shine);
    },

    goblin(ctx, pal) {
      // ── Goblin: short hunched humanoid, big nose & ears, carries a club ──
      // Ears (wide, pointed)
      p(ctx, 4, 6, 3, 4, pal.body);
      p(ctx, 3, 5, 2, 3, pal.body);
      p(ctx, 17, 6, 3, 4, pal.body);
      p(ctx, 19, 5, 2, 3, pal.body);
      p(ctx, 4, 7, 1, 2, pal.dark);  // ear shadow l
      p(ctx, 19, 7, 1, 2, pal.dark);  // ear shadow r
      // Head (low, wide, hunched)
      p(ctx, 5, 5, 14, 8, pal.body);
      p(ctx, 4, 6, 16, 6, pal.body);
      // Skull shading
      p(ctx, 16, 5, 3, 7, pal.dark);
      p(ctx, 5, 11, 14, 1, pal.dark);
      // Brow ridge (heavy)
      p(ctx, 5, 6, 14, 2, pal.dark);
      // Eyes (small, beady, mean)
      p(ctx, 7, 7, 3, 3, pal.eye);
      p(ctx, 14, 7, 3, 3, pal.eye);
      p(ctx, 8, 8, 2, 2, pal.pupil);
      p(ctx, 15, 8, 2, 2, pal.pupil);
      p(ctx, 8, 7, 1, 1, '#ffffff');
      p(ctx, 15, 7, 1, 1, '#ffffff');
      // Big warty nose
      p(ctx, 9, 10, 6, 3, pal.body);
      p(ctx, 10, 9, 4, 5, pal.body);
      p(ctx, 14, 11, 2, 2, pal.dark);
      // Wide jagged grin
      p(ctx, 7, 13, 10, 2, pal.dark);
      p(ctx, 8, 12, 1, 1, '#e0d0a0');  // tooth l
      p(ctx, 10, 12, 1, 1, '#e0d0a0');
      p(ctx, 14, 12, 1, 1, '#e0d0a0');
      p(ctx, 13, 12, 1, 1, '#e0d0a0');  // fang
      // Neck
      p(ctx, 9, 13, 6, 2, pal.body);
      // Hunched torso (stocky)
      p(ctx, 6, 15, 12, 7, pal.body);
      p(ctx, 5, 16, 14, 5, pal.body);
      p(ctx, 15, 15, 3, 7, pal.dark);
      // Torn hide tunic
      p(ctx, 7, 15, 10, 6, pal.dark);
      p(ctx, 8, 16, 8, 4, '#5a3a1a');
      p(ctx, 9, 20, 2, 1, '#5a3a1a');
      p(ctx, 13, 20, 2, 1, '#5a3a1a');
      // Belt loincloth
      p(ctx, 6, 21, 12, 2, '#6a4010');
      p(ctx, 8, 22, 8, 1, '#4a2800');
      // Stubby legs
      p(ctx, 7, 23, 4, 4, pal.body);
      p(ctx, 13, 23, 4, 4, pal.body);
      p(ctx, 10, 24, 4, 3, pal.dark);
      // Feet
      p(ctx, 6, 26, 5, 2, pal.dark);
      p(ctx, 13, 26, 5, 2, pal.dark);
      // Left arm (raised, holding club)
      p(ctx, 2, 14, 4, 8, pal.body);
      p(ctx, 2, 21, 4, 3, pal.body);
      p(ctx, 2, 15, 1, 6, pal.dark);
      // Knuckles
      p(ctx, 2, 22, 4, 1, pal.dark);
      // Right arm (dangling)
      p(ctx, 18, 15, 4, 7, pal.body);
      p(ctx, 20, 15, 1, 6, pal.dark);
      // Club (left hand, raised)
      p(ctx, 1, 5, 3, 10, '#7a5020');
      p(ctx, 0, 3, 4, 5, '#6a3810');
      p(ctx, 0, 4, 1, 3, '#a07040');  // club shine
      // Shine on head
      p(ctx, 6, 6, 3, 2, pal.shine);
    },

    bat(ctx, pal) {
      // ── Bat: wings spread wide, small body, big ears, claws ──
      // Left wing (spread)
      p(ctx, 0, 6, 7, 8, pal.body);
      p(ctx, 0, 5, 5, 3, pal.body);
      p(ctx, 1, 14, 5, 5, pal.body);
      p(ctx, 0, 8, 3, 8, pal.dark);  // wing membrane shadow
      p(ctx, 2, 7, 4, 6, pal.dark);
      // Left wing finger bones
      p(ctx, 0, 6, 1, 12, pal.dark);
      p(ctx, 3, 5, 1, 10, pal.dark);
      p(ctx, 6, 7, 1, 7, pal.dark);
      // Right wing (spread, mirrored)
      p(ctx, 17, 6, 7, 8, pal.body);
      p(ctx, 18, 5, 5, 3, pal.body);
      p(ctx, 18, 14, 5, 5, pal.body);
      p(ctx, 21, 8, 3, 8, pal.dark);
      p(ctx, 18, 7, 4, 6, pal.dark);
      p(ctx, 23, 6, 1, 12, pal.dark);
      p(ctx, 20, 5, 1, 10, pal.dark);
      p(ctx, 17, 7, 1, 7, pal.dark);
      // Wing shine
      p(ctx, 4, 6, 2, 4, pal.shine);
      p(ctx, 18, 6, 2, 4, pal.shine);
      // Body (small, round)
      p(ctx, 8, 8, 8, 10, pal.body);
      p(ctx, 7, 9, 10, 8, pal.body);
      p(ctx, 9, 18, 6, 3, pal.body);
      // Belly (lighter)
      p(ctx, 9, 9, 6, 8, pal.shine);
      // Body shading
      p(ctx, 14, 8, 2, 10, pal.dark);
      // Ears (big, pointed)
      p(ctx, 8, 2, 3, 7, pal.body);
      p(ctx, 7, 3, 4, 5, pal.body);
      p(ctx, 9, 2, 1, 4, pal.dark);  // ear shadow
      p(ctx, 13, 2, 3, 7, pal.body);
      p(ctx, 13, 3, 4, 5, pal.body);
      p(ctx, 15, 2, 1, 4, pal.dark);
      // Inner ear
      p(ctx, 9, 4, 1, 3, '#ff8090');
      p(ctx, 14, 4, 1, 3, '#ff8090');
      // Eyes (red, large)
      p(ctx, 9, 9, 3, 3, pal.eye);
      p(ctx, 12, 9, 3, 3, pal.eye);
      p(ctx, 10, 10, 2, 2, pal.pupil);
      p(ctx, 13, 10, 2, 2, pal.pupil);
      p(ctx, 10, 9, 1, 1, '#ffffff');
      p(ctx, 13, 9, 1, 1, '#ffffff');
      // Snout / nose
      p(ctx, 10, 12, 4, 2, pal.dark);
      p(ctx, 11, 11, 2, 4, pal.dark);
      p(ctx, 11, 12, 1, 1, '#ff6070');  // nose tip
      // Small fangs
      p(ctx, 10, 14, 1, 2, '#e0ddc0');
      p(ctx, 13, 14, 1, 2, '#e0ddc0');
      // Wing thumb claws (tips)
      p(ctx, 0, 17, 2, 2, pal.dark);
      p(ctx, 22, 17, 2, 2, pal.dark);
      // Feet claws (hanging)
      p(ctx, 9, 20, 2, 4, pal.dark);
      p(ctx, 13, 20, 2, 4, pal.dark);
      p(ctx, 8, 22, 1, 2, pal.dark);
      p(ctx, 11, 22, 1, 2, pal.dark);
      p(ctx, 13, 22, 1, 2, pal.dark);
      p(ctx, 15, 22, 1, 2, pal.dark);
    },

    wolf(ctx, pal) {
      // ── Wolf: four-legged beast, snout, tail raised, haunched ──
      // Tail (up and curled)
      p(ctx, 18, 3, 3, 8, pal.body);
      p(ctx, 19, 2, 3, 4, pal.body);
      p(ctx, 21, 4, 2, 6, pal.body);
      p(ctx, 19, 3, 1, 6, pal.dark);
      p(ctx, 19, 2, 2, 2, pal.shine);  // tail tip
      // Main body (haunched, large)
      p(ctx, 5, 9, 14, 9, pal.body);
      p(ctx, 4, 10, 16, 8, pal.body);
      p(ctx, 5, 18, 12, 3, pal.body);
      // Body shading (right / underside)
      p(ctx, 17, 9, 3, 9, pal.dark);
      p(ctx, 5, 17, 14, 2, pal.dark);
      // Underbelly (lighter)
      p(ctx, 8, 12, 8, 5, pal.shine);
      // Fur texture
      p(ctx, 6, 9, 2, 1, pal.dark);
      p(ctx, 10, 9, 2, 1, pal.dark);
      p(ctx, 14, 9, 2, 1, pal.dark);
      p(ctx, 7, 10, 1, 1, pal.dark);
      p(ctx, 13, 10, 1, 1, pal.dark);
      // Neck & head (low, forward)
      p(ctx, 2, 8, 10, 6, pal.body);
      p(ctx, 1, 9, 11, 5, pal.body);
      // Head shading
      p(ctx, 10, 8, 2, 6, pal.dark);
      // Ears (pointed)
      p(ctx, 2, 5, 3, 5, pal.body);
      p(ctx, 1, 6, 2, 3, pal.body);
      p(ctx, 7, 5, 3, 5, pal.body);
      p(ctx, 9, 6, 2, 3, pal.body);
      p(ctx, 3, 6, 1, 3, pal.dark);  // ear shadow
      p(ctx, 8, 6, 1, 3, pal.dark);
      p(ctx, 3, 7, 1, 2, '#ff8090');  // inner ear l
      p(ctx, 8, 7, 1, 2, '#ff8090');  // inner ear r
      // Eyes (amber, fierce)
      p(ctx, 3, 9, 3, 2, pal.eye);
      p(ctx, 7, 9, 3, 2, pal.eye);
      p(ctx, 4, 9, 2, 2, pal.pupil);
      p(ctx, 8, 9, 2, 2, pal.pupil);
      p(ctx, 4, 9, 1, 1, '#ffffff');
      p(ctx, 8, 9, 1, 1, '#ffffff');
      // Long snout
      p(ctx, 1, 11, 8, 3, pal.body);
      p(ctx, 0, 12, 9, 2, pal.body);
      p(ctx, 7, 11, 3, 2, pal.dark);
      // Nose (wet, dark)
      p(ctx, 0, 11, 3, 2, pal.dark);
      p(ctx, 1, 10, 2, 1, pal.dark);
      p(ctx, 1, 11, 1, 1, pal.shine);  // nose shine
      // Bared teeth
      p(ctx, 1, 13, 8, 1, '#e0ddc0');
      p(ctx, 2, 14, 1, 1, '#e0ddc0');
      p(ctx, 4, 14, 1, 1, '#e0ddc0');
      p(ctx, 6, 14, 1, 1, '#e0ddc0');
      p(ctx, 1, 13, 1, 2, pal.dark);  // gum shadow
      // Front legs
      p(ctx, 6, 19, 3, 7, pal.body);
      p(ctx, 13, 19, 3, 7, pal.body);
      p(ctx, 7, 19, 1, 6, pal.dark);
      p(ctx, 14, 19, 1, 6, pal.dark);
      // Paws (front)
      p(ctx, 5, 25, 5, 2, pal.dark);
      p(ctx, 12, 25, 5, 2, pal.dark);
      p(ctx, 5, 25, 2, 1, pal.body);
      p(ctx, 12, 25, 2, 1, pal.body);
      // Back legs (haunched)
      p(ctx, 16, 17, 4, 5, pal.body);
      p(ctx, 16, 22, 3, 4, pal.body);
      p(ctx, 17, 22, 1, 3, pal.dark);
      // Paws (back)
      p(ctx, 15, 25, 5, 2, pal.dark);
      p(ctx, 15, 25, 2, 1, pal.body);
    },

    spider(ctx, pal) {
      // ── Spider: round body, 8 legs spread, multiple red eyes ──
      // Abdomen (large, round, rear)
      p(ctx, 11, 12, 10, 10, pal.body);
      p(ctx, 10, 11, 12, 12, pal.body);
      p(ctx, 9, 12, 14, 10, pal.body);
      p(ctx, 10, 22, 12, 2, pal.body);
      // Abdomen shading
      p(ctx, 18, 11, 4, 13, pal.dark);
      p(ctx, 10, 21, 12, 2, pal.dark);
      // Abdomen shine / pattern
      p(ctx, 12, 12, 4, 4, pal.shine);
      p(ctx, 12, 13, 1, 1, '#ffffff');
      // Hourglass marking
      p(ctx, 14, 16, 2, 6, '#cc2020');
      p(ctx, 13, 17, 4, 1, '#cc2020');
      p(ctx, 13, 20, 4, 1, '#cc2020');
      // Cephalothorax (front body, smaller)
      p(ctx, 10, 7, 8, 7, pal.body);
      p(ctx, 9, 8, 10, 6, pal.body);
      p(ctx, 10, 13, 8, 1, pal.dark);
      // Cephalothorax shading
      p(ctx, 17, 7, 2, 6, pal.dark);
      // Eyes (6 red eyes in arc)
      p(ctx, 10, 8, 2, 2, pal.eye);
      p(ctx, 16, 8, 2, 2, pal.eye);
      p(ctx, 12, 7, 2, 2, pal.eye);
      p(ctx, 14, 7, 2, 2, pal.eye);
      p(ctx, 11, 9, 2, 2, pal.eye);
      p(ctx, 15, 9, 2, 2, pal.eye);
      // Eye pupils
      p(ctx, 10, 8, 1, 1, pal.pupil);
      p(ctx, 16, 8, 1, 1, pal.pupil);
      p(ctx, 12, 7, 1, 1, pal.pupil);
      p(ctx, 14, 7, 1, 1, pal.pupil);
      p(ctx, 11, 9, 1, 1, pal.pupil);
      p(ctx, 15, 9, 1, 1, pal.pupil);
      // Chelicerae / fangs
      p(ctx, 11, 12, 3, 3, pal.dark);
      p(ctx, 14, 12, 3, 3, pal.dark);
      p(ctx, 12, 14, 1, 2, pal.shine);
      p(ctx, 15, 14, 1, 2, pal.shine);
      // 8 Legs (4 per side, angled outward)
      // Left legs (top to bottom)
      p(ctx, 0, 5, 9, 2, pal.body);   // leg 1 L (high)
      p(ctx, 0, 6, 2, 1, pal.dark);
      p(ctx, 1, 8, 8, 2, pal.body);   // leg 2 L
      p(ctx, 1, 9, 2, 1, pal.dark);
      p(ctx, 1, 11, 8, 2, pal.body);   // leg 3 L
      p(ctx, 1, 12, 2, 1, pal.dark);
      p(ctx, 2, 14, 7, 2, pal.body);   // leg 4 L (low)
      p(ctx, 2, 15, 2, 1, pal.dark);
      // Right legs
      p(ctx, 15, 5, 9, 2, pal.body);   // leg 1 R (high)
      p(ctx, 22, 6, 2, 1, pal.dark);
      p(ctx, 15, 8, 8, 2, pal.body);   // leg 2 R
      p(ctx, 21, 9, 2, 1, pal.dark);
      p(ctx, 15, 11, 8, 2, pal.body);   // leg 3 R
      p(ctx, 21, 12, 2, 1, pal.dark);
      p(ctx, 15, 14, 7, 2, pal.body);   // leg 4 R (low)
      p(ctx, 20, 15, 2, 1, pal.dark);
      // Leg tips / claws
      p(ctx, 0, 5, 2, 3, pal.dark);
      p(ctx, 0, 8, 2, 3, pal.dark);
      p(ctx, 0, 11, 2, 3, pal.dark);
      p(ctx, 1, 14, 2, 3, pal.dark);
      p(ctx, 22, 5, 2, 3, pal.dark);
      p(ctx, 22, 8, 2, 3, pal.dark);
      p(ctx, 22, 11, 2, 3, pal.dark);
      p(ctx, 21, 14, 2, 3, pal.dark);
      // Web strand hint
      p(ctx, 10, 0, 4, 7, pal.shine);
      p(ctx, 11, 0, 2, 7, '#ffffff');
    },

    imp(ctx, pal) {
      // ── Imp: small demon, horns, tail, fire in hands ──
      // Horns (curved)
      p(ctx, 7, 0, 2, 4, pal.dark);
      p(ctx, 6, 1, 2, 3, pal.dark);
      p(ctx, 8, 1, 1, 2, pal.body);
      p(ctx, 15, 0, 2, 4, pal.dark);
      p(ctx, 16, 1, 2, 3, pal.dark);
      p(ctx, 15, 1, 1, 2, pal.body);
      // Horn tips (bright)
      p(ctx, 6, 0, 2, 1, pal.shine);
      p(ctx, 16, 0, 2, 1, pal.shine);
      // Head (small, wide)
      p(ctx, 6, 3, 12, 7, pal.body);
      p(ctx, 5, 4, 14, 5, pal.body);
      // Head shading
      p(ctx, 16, 3, 2, 7, pal.dark);
      p(ctx, 6, 9, 12, 1, pal.dark);
      // Ears (pointed, demon)
      p(ctx, 4, 4, 3, 3, pal.body);
      p(ctx, 3, 5, 2, 2, pal.body);
      p(ctx, 4, 5, 1, 2, pal.dark);
      p(ctx, 17, 4, 3, 3, pal.body);
      p(ctx, 19, 5, 2, 2, pal.body);
      p(ctx, 19, 5, 1, 2, pal.dark);
      // Eyes (yellow, slitted, evil)
      p(ctx, 7, 5, 3, 3, pal.eye);
      p(ctx, 14, 5, 3, 3, pal.eye);
      p(ctx, 8, 6, 2, 2, pal.pupil);
      p(ctx, 15, 6, 2, 2, pal.pupil);
      p(ctx, 8, 5, 1, 1, '#ffffff');
      p(ctx, 15, 5, 1, 1, '#ffffff');
      // Slit pupils (vertical)
      p(ctx, 9, 5, 1, 4, '#100010');
      p(ctx, 16, 5, 1, 4, '#100010');
      // Nose (flat, wide)
      p(ctx, 9, 8, 6, 2, pal.dark);
      p(ctx, 10, 7, 4, 4, pal.body);
      p(ctx, 11, 8, 2, 1, pal.dark);
      // Mouth (wide, toothy grin)
      p(ctx, 7, 10, 2, 1, pal.dark);
      p(ctx, 9, 9, 10, 2, '#202020');
      p(ctx, 15, 10, 2, 1, pal.dark);
      // Teeth (sharp)
      p(ctx, 9, 9, 1, 1, '#e0ddc0');
      p(ctx, 11, 9, 1, 1, '#e0ddc0');
      p(ctx, 13, 9, 1, 1, '#e0ddc0');
      p(ctx, 15, 9, 1, 1, '#e0ddc0');
      // Neck
      p(ctx, 9, 10, 6, 2, pal.body);
      // Small winged body (torso)
      p(ctx, 6, 12, 12, 8, pal.body);
      p(ctx, 5, 13, 14, 6, pal.body);
      // Torso shading
      p(ctx, 15, 12, 3, 8, pal.dark);
      // Belly (round, lighter)
      p(ctx, 8, 13, 8, 5, pal.shine);
      // Tiny wings (vestigial, on back)
      p(ctx, 3, 12, 4, 6, pal.dark);
      p(ctx, 4, 11, 3, 5, pal.dark);
      p(ctx, 17, 12, 4, 6, pal.dark);
      p(ctx, 17, 11, 3, 5, pal.dark);
      p(ctx, 4, 12, 2, 4, pal.body);
      p(ctx, 18, 12, 2, 4, pal.body);
      // Arms (short, raised)
      p(ctx, 3, 14, 4, 5, pal.body);
      p(ctx, 3, 15, 1, 4, pal.dark);
      p(ctx, 17, 14, 4, 5, pal.body);
      p(ctx, 20, 15, 1, 4, pal.dark);
      // Hands / fists
      p(ctx, 2, 18, 4, 3, pal.body);
      p(ctx, 18, 18, 4, 3, pal.body);
      p(ctx, 2, 20, 4, 1, pal.dark);
      p(ctx, 18, 20, 4, 1, pal.dark);
      // Fire in left hand (orange/yellow)
      p(ctx, 0, 14, 4, 5, '#ff6600');
      p(ctx, 1, 13, 3, 3, '#ff9900');
      p(ctx, 0, 15, 2, 2, '#ffcc00');
      p(ctx, 1, 13, 2, 2, '#ffff80');  // bright core
      p(ctx, 1, 12, 1, 2, '#ffcc00');  // flame tip
      p(ctx, 3, 12, 1, 2, '#ff6600');  // flame tip r
      // Fire in right hand
      p(ctx, 20, 14, 4, 5, '#ff6600');
      p(ctx, 20, 13, 3, 3, '#ff9900');
      p(ctx, 22, 15, 2, 2, '#ffcc00');
      p(ctx, 21, 13, 2, 2, '#ffff80');
      p(ctx, 22, 12, 1, 2, '#ffcc00');
      p(ctx, 20, 12, 1, 2, '#ff6600');
      // Legs (short, clawed)
      p(ctx, 7, 20, 4, 5, pal.body);
      p(ctx, 13, 20, 4, 5, pal.body);
      p(ctx, 8, 20, 1, 4, pal.dark);
      p(ctx, 15, 20, 1, 4, pal.dark);
      // Tail (curling behind)
      p(ctx, 18, 20, 4, 3, pal.dark);
      p(ctx, 20, 23, 3, 2, pal.dark);
      p(ctx, 21, 25, 2, 2, pal.dark);
      p(ctx, 20, 25, 3, 1, pal.body);
      p(ctx, 22, 24, 1, 2, pal.body);
      // Tail tip (pointed, barbed)
      p(ctx, 21, 27, 3, 1, pal.dark);
      p(ctx, 23, 26, 1, 2, pal.dark);
      // Cloven hooves / claws
      p(ctx, 6, 24, 3, 2, pal.dark);
      p(ctx, 11, 24, 3, 2, pal.dark);
      p(ctx, 6, 25, 2, 2, '#1a0010');
      p(ctx, 11, 25, 2, 2, '#1a0010');
      // Magic glow aura
      p(ctx, 5, 11, 1, 1, pal.shine);
      p(ctx, 18, 10, 1, 1, pal.shine);
      p(ctx, 7, 19, 1, 1, pal.shine);
    }
  };

  // ─── PUBLIC API ────────────────────────────────────────────────

  const ROSTER_CONFIG = {
    ayaka: { forms: ['ayaka', 'aya'], cols: [0.28, 0.32, 0.40] },
    hutao: { forms: ['hutao', 'tao'], cols: [[0.28, 0.32, 0.40], [0.34, 0.26, 0.40]] },
    nilou: ['nilou', 'lulu'],
    xiao: ['xiao', 'rei'],
    rydia: ['rydia', 'ria'],
    lenneth: ['lenneth', 'valka'],
    kain: ['kain', 'drake'],
    leon: ['leon', 'rex']
  };

  const SPRITE_MANIFEST = {};
  const ANIMATED_SEARCH_INDEX = [];

  Object.entries(ROSTER_CONFIG).forEach(([baseId, data]) => {
    // Standardize data format
    const forms = Array.isArray(data) ? data : data.forms;
    const cols = data.cols || [0.28, 0.32, 0.40];
    const rows = data.rows || [0.5, 0.5];

    const config = {
      baseId: baseId,
      cols: cols,
      rows: rows
    };

    forms.forEach(f => {
      SPRITE_MANIFEST[f] = config;
      ANIMATED_SEARCH_INDEX.push(f);
    });
  });

  function drawHero(imgEl, charId, charData, classData) {
    const id = charId.toLowerCase();
    const config = SPRITE_MANIFEST[id];
    const isAnimated = !!config;

    // Always use the baseId for the filename (e.g., 'ayaka_sprite.png')
    const fileBase = isAnimated ? config.baseId : id;
    const fileName = isAnimated ? `${fileBase}_sprite.png` : `${fileBase}_spirit.png`;
    const pngPath = `images/characters/spirits/${fileName}`;

    if (isAnimated) {
      imgEl.dataset.animated = 'true';
      imgEl.dataset.spriteSheet = pngPath;
      imgEl.dataset.charId = id;
      imgEl.classList.add('party-sprite-animated');
    }

    const test = new Image();
    test.onload = () => {
      if (!isAnimated) {
        imgEl.style.backgroundImage = `url(${pngPath})`;
        imgEl.style.backgroundSize = 'contain';
        imgEl.style.backgroundPosition = 'center';
        imgEl.style.backgroundRepeat = 'no-repeat';
        const h = imgEl.offsetHeight > 0 ? imgEl.offsetHeight : 128;
        imgEl.style.width = h + 'px';
        imgEl.style.height = h + 'px';
      }
    };
    test.onerror = () => {
      if (!isAnimated) {
        // Fallback: render via canvas → dataURL
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 57;
        const ctx = canvas.getContext('2d');
        const fn = HEROES[charId] || HEROES['aria'];
        fn(ctx, charData, classData);
        imgEl.style.backgroundImage = `url(${canvas.toDataURL()})`;
        imgEl.style.backgroundSize = 'contain';
        imgEl.style.backgroundPosition = 'center';
        imgEl.style.backgroundRepeat = 'no-repeat';
        imgEl.style.width = '128px';
        imgEl.style.height = '128px';
      }
    };
    test.src = pngPath;
  }

  function drawEnemy(imgEl, enemyId, palette) {
    const pngPath = `images/enemies/${enemyId}.png`;
    const test = new Image();
    test.onload = () => {
      imgEl.src = pngPath;
    };
    test.onerror = () => {
      // Fallback: render via canvas → dataURL
      const canvas = document.createElement('canvas');
      canvas.width = 72;
      canvas.height = 84;
      const ctx = canvas.getContext('2d');
      const fn = ENEMIES[enemyId] || ENEMIES['slime'];
      fn(ctx, palette);
      imgEl.src = canvas.toDataURL();
    };
    test.src = pngPath;
  }

  function drawHeroToCanvas(charId, charData, classData) {
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 57;
    const ctx = canvas.getContext('2d');
    const fn = HEROES[charId] || HEROES['aria'];
    fn(ctx, charData, classData);
    return canvas;
  }

  function drawEnemyToCanvas(enemyId, palette) {
    const canvas = document.createElement('canvas');
    canvas.width = 72; canvas.height = 84;
    const ctx = canvas.getContext('2d');
    const fn = ENEMIES[enemyId] || ENEMIES['slime'];
    fn(ctx, palette);
    return canvas;
  }

  function setFrame(el, charId, frameNameOrCoords, customHeight = 0) {
    if (!el) return;
    const id = charId.toLowerCase();
    const manifest = SPRITE_MANIFEST[id];
    
    if (!manifest) {
      // Fallback for non-animated or unknown sprites
      el.style.backgroundImage = `url(images/characters/faces/${id}_face.png)`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      const h = customHeight || (el.offsetHeight > 0 ? el.offsetHeight : 80);
      el.style.width = `${h}px`;
      el.style.height = `${h}px`;
      return;
    }

    const frameMap = {
      'idle': [0, 0], 'prepare': [1, 0], 'attack': [2, 0],
      'magic': [0, 1], 'hurt': [1, 1], 'fallen': [2, 1]
    };

    const coords = Array.isArray(frameNameOrCoords) ? frameNameOrCoords : (frameMap[frameNameOrCoords] || [0, 0]);
    const [col, row] = coords;

    const cwRaw = manifest.cols; 
    const rh = manifest.rows;
    const cw = Array.isArray(cwRaw[0]) ? cwRaw[row] : cwRaw;
    
    const frameWidthPct = cw[col];
    const frameHeightPct = rh[row];
    const leftEdge = cw.slice(0, col).reduce((a, b) => a + b, 0);
    const topEdge = rh.slice(0, row).reduce((a, b) => a + b, 0);
    
    const baseHeight = customHeight || (el.offsetHeight > 0 ? el.offsetHeight : 128);
    const elWidth = (baseHeight / frameHeightPct) * frameWidthPct;
    
    const sizeX = (1 / frameWidthPct) * 100;
    const sizeY = (1 / frameHeightPct) * 100;
    const posX = frameWidthPct === 1 ? 0 : (leftEdge / (1 - frameWidthPct)) * 100;
    const posY = frameHeightPct === 1 ? 0 : (topEdge / (1 - frameHeightPct)) * 100;
    
    // Resolution-aware loading
    const suffix = getSuffix();
    el.style.backgroundImage = `url(images/characters/spirits/${manifest.baseId}${suffix})`;
    el.style.width = `${elWidth}px`;
    el.style.height = `${baseHeight}px`;
    el.style.backgroundSize = `${sizeX}% ${sizeY}%`;
    el.style.backgroundPosition = `${posX}% ${posY}%`;
    el.style.backgroundRepeat = 'no-repeat';
    
    if (typeof frameNameOrCoords === 'string') {
      const frames = ['frame-idle', 'frame-prepare', 'frame-attack', 'frame-magic', 'frame-hurt', 'frame-fallen'];
      frames.forEach(f => el.classList.remove(f));
      el.classList.add('frame-' + frameNameOrCoords);
    }
  }

  function getSuffix() {
    // Check both legacy G.settings and new G.graphics
    const qual = G.settings?.graphicsQuality || G.graphics || 'auto';
    const isLow = qual === 'low' || (qual === 'auto' && window.innerWidth < 800);
    return isLow ? '_sprite_low.webp' : '_sprite.png';
  }

  function registerHero(id, fn) { HEROES[id] = fn; }
  function registerEnemy(id, fn) { ENEMIES[id] = fn; }

  return { drawHero, drawEnemy, registerHero, registerEnemy, drawHeroToCanvas, drawEnemyToCanvas, SPRITE_MANIFEST, setFrame, getSuffix };
})();

