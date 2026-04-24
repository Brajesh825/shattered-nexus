/**
 * npcs.js — Global NPC database.
 * 
 * IDs should match the 'id' field in map-verdant-vale.js and other map files.
 * Each NPC defines:
 *   - name: Display name in game.
 *   - color: Theme color for UI and dialogue text.
 *   - sprite: Path to the 2x2 directional sprite sheet.
 *   - dialogues: Map of mapId -> array of dialogue lines.
 */

const NPC_DEFS = {
  essabella: {
    name:   'Lady Esabella',
    color:  '#f472b6',
    sprite: 'images/characters/map/sheets/npc/essabela_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Esabella', text: '…Oh. You aren\'t one of the ghosts, are you?' },
        { speaker: 'Rei',      text: 'Ghosts? We are travelers.' },
        { speaker: 'Esabella', text: 'Then you should leave before the fog grows thick. The Vale doesn\'t like the living much lately.' },
        { speaker: 'Tao',      text: 'We are looking for the Seal Fragment. Have you seen it?' },
        { speaker: 'Esabella', text: 'The Fragment… such a heavy burden for such small people. It rests in the eastern cave, guarded by the remains of those who tried to hide it.' },
        { speaker: 'Esabella', text: 'The fog will show you the way, if you listen to its song.' },
      ],
    },
  },

  elder_maren: {
    name:   'Elder Maren',
    color:  '#fbbf24',
    sprite: 'images/characters/map/sheets/npc/elder_maren_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Elder Maren', text: 'Travelers! Praise the stars, I thought we were the last ones left.' },
        { speaker: 'Aya',         text: 'The town is empty, Elder. Where did everyone go?' },
        { speaker: 'Elder Maren', text: 'Most fled west to the refugee settlement when the Bridge Ward flickered. The Void Knight… he passed through here like a cold wind.' },
        { speaker: 'Lulu',        text: 'Did he take the Seal Fragment?' },
        { speaker: 'Elder Maren', text: 'No. The Fragment is bound by light. He could not touch it — but he left his "children" to ensure no one else could either.' },
        { speaker: 'Rei',         text: 'We will retrieve it. The Nexus must be restored.' },
        { speaker: 'Elder Maren', text: 'Then go with caution. The East is no longer the home I remember.' },
      ],
    },
  },

  // --- GENERIC SOLDIERS ---
  // Using standardized 'soldier_sheet' with color variations

  soldier_1: {
    name:   'Soldier Davan',
    color:  '#94a3b8', // Slate Blue (Sentinel)
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Davan', text: '…Don\'t. Don\'t come closer. I need a moment.' },
        { speaker: 'Rei',           text: 'We mean no harm. What happened here?' },
        { speaker: 'Soldier Davan', text: 'The Void Knight came through three nights ago. My unit — eight men — we tried to hold the bridge.' },
        { speaker: 'Tao',           text: 'You\'re the only one standing.' },
        { speaker: 'Soldier Davan', text: 'He didn\'t kill them. That\'s what you need to understand. He emptied them. They\'re still there. Still breathing. But when you look in their eyes, there\'s nothing left.' },
        { speaker: 'Aya',           text: 'Void consumption. He is absorbing something from them.' },
        { speaker: 'Soldier Davan', text: 'One of them was my brother. He looked right through me. No recognition. Nothing.' },
        { speaker: 'Lulu',          text: 'I\'m so sorry.' },
        { speaker: 'Soldier Davan', text: 'Don\'t be sorry. Just stop him. Whatever he is taking from people — don\'t let him take more. Promise me that.' },
        { speaker: 'Rei',           text: 'We will stop him. You have my word.' },
        { speaker: 'Soldier Davan', text: '…Good. That\'s good. I\'ll hold the road here. In case my brother wakes up.' },
      ],
    },
  },
  
  soldier_2: {
    name:   'Soldier Kael',
    color:  '#64748b', // Darker Slate (Gate Guard)
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Kael', text: 'Halt! Identify yourselves before approaching the Town walls.' },
        { speaker: 'Aya',          text: 'We are travelers. We seek the Seal Fragment.' },
        { speaker: 'Soldier Kael', text: 'The Fragment... So the rumors are true. The Summoning Circle pulsed this morning.' },
        { speaker: 'Rei',           text: 'You guard this gate alone?' },
        { speaker: 'Soldier Kael', text: 'The rest are at the inner keep or the southern watch. We are stretched thin. If those things from the east cross the river, these walls won\'t be enough.' },
        { speaker: 'Soldier Kael', text: 'Enter quickly. And stay away from the eastern bridge if you value your souls.' },
      ],
    },
  },

  soldier_3: {
    name:   'Soldier Jace',
    color:  '#475569', // Deep Blue-Grey (Settlement Guard)
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Jace', text: 'Move along, travelers. This settlement is for refugees only.' },
        { speaker: 'Lulu',          text: 'We only wish to speak with those who escaped the East.' },
        { speaker: 'Soldier Jace', text: 'There isn\'t much to say. They saw the shadows move, then the screams started. We barely got the gate closed in time.' },
        { speaker: 'Tao',           text: 'Sounds like you\'ve seen better days.' },
        { speaker: 'Soldier Jace', text: 'I was stationed at the capital once. Now I guard a cluster of tents and a stone wall that feels far too short. But it\'s the only home left for these people.' },
        { speaker: 'Soldier Jace', text: 'Watch your back out there. The shadows have a way of following you.' },
      ],
    },
  },

  lira: {
    name:   'Lira',
    color:  '#4ade80',
    sprite: 'images/characters/map/sheets/npc/lira_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Lira', text: 'Oh! You look like you can actually handle yourselves in a fight.' },
        { speaker: 'Tao',  text: 'We\'ve had some practice. Why?' },
        { speaker: 'Lira', text: 'I lost my favorite locket in the tall grass east of the river. I’d go get it, but there are things crawling around over there that don’t like visitors.' },
        { speaker: 'Rei',  text: 'We are headed that way for the Fragment. We’ll keep an eye out.' },
        { speaker: 'Lira', text: 'You would? Oh, thank you! It’s silver, with a little blue gem. If you find it, I have some spare supplies I can give you!' },
      ],
    },
  },
};
