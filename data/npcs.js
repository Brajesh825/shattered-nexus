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
    name:   'Lady Essabella',
    color:  '#c4b5fd',
    sprite: 'images/characters/map/sheets/npc/essabela_sheet.png',
    dialogues: {

      // ── ARC 1 — Verdant Vale ──────────────────────────────────────
      // Essabella presents as a scholar mapping the corruption.
      // True purpose: observing whether the party is capable enough
      // to be a threat — or a tool. She sends them toward the Void Knight
      // knowing exactly what they will face.
      verdant_vale: [
        { speaker: 'Lady Essabella', text: 'You are not his. Good. I was beginning to think I\'d wait forever.' },
        { speaker: 'Aya',            text: 'You knew someone would come?' },
        { speaker: 'Lady Essabella', text: 'I calculated it. Someone always does, when the world is desperate enough to call.' },
        { speaker: 'Tao',            text: 'That is either very wise or very sad.' },
        { speaker: 'Lady Essabella', text: 'Both, usually.' },
        { speaker: 'Rei',            text: 'The Sacred Ruins. The Void Knight. Tell us what you know.' },
        { speaker: 'Lady Essabella', text: 'Direct. I appreciate that.' },
        { speaker: 'Lady Essabella', text: 'Valdris bound a soul to those ruins two years ago. A warrior. What guards the Fragment now is not what it once was — it has forgotten everything except the order it was given. You cannot reason with it. You can only end it.' },
        { speaker: 'Lady Essabella', text: 'I have been mapping the corruption\'s spread from here. It reaches further every week. You arrived at the right time — any later and the vale itself would have turned.' },
        { speaker: 'Lulu',           text: 'Will you be safe here, alone?' },
        { speaker: 'Lady Essabella', text: 'I have survived two years at the edge of his shadow. A few more hours will not change that. Go. The ruins are waiting.' },
      ],

      // ── ARC 2 — Crystal Cavern ────────────────────────────────────
      // Essabella reappears underground — supposedly still mapping
      // tunnel networks. She gives accurate intel on the Demon Lord,
      // then plants the first seed: she questions whether destroying
      // the Fragments is the right path. She frames it as academic
      // curiosity. It is not.
      crystal_cavern: [
        { speaker: 'Aya',            text: 'Lady Essabella. We did not expect to find you here.' },
        { speaker: 'Lady Essabella', text: 'The corruption spreads underground as readily as above. I follow it where it goes.' },
        { speaker: 'Tao',            text: 'Convenient timing.' },
        { speaker: 'Lady Essabella', text: 'I prefer thorough preparation. The Demon Lord is in the throne room — upper level, east wing. The fire Fragment is fused to him. He believes it makes him permanent. It does not.' },
        { speaker: 'Rei',            text: 'You have been inside the palace?' },
        { speaker: 'Lady Essabella', text: 'I study the corruption. That sometimes requires proximity.' },
        { speaker: 'Lady Essabella', text: 'The Fragment — when you take it from him, what do you intend to do with it?' },
        { speaker: 'Lulu',           text: 'The Oracle says to destroy them. Break his anchors.' },
        { speaker: 'Lady Essabella', text: 'Of course. The Oracle\'s way.' },
        { speaker: 'Lady Essabella', text: 'Academically speaking — a Seal Fragment is not merely an anchor for Valdris. It is compressed elemental memory. Destroying it means losing what it remembers. Permanently. I find that... worth considering.' },
        { speaker: 'Aya',            text: 'It is a kindness, not a loss. Something captured deserves to be freed.' },
        { speaker: 'Lady Essabella', text: 'Is it freed? Or is it simply ended? The distinction matters.' },
        { speaker: 'Lady Essabella', text: 'In any case — be careful in the east wing. The floor above the throne room is unstable. Go through the lower passage.' },
      ],

      // ── ARC 3 — Ember Wastes ──────────────────────────────────────
      // Essabella is no longer pretending to stumble across them.
      // She is ahead of them, waiting. She speaks more openly about
      // a faction that opposes Valdris differently than the Oracle does.
      // She does not name the Fallen Angels — but she is describing them.
      ember_wastes: [
        { speaker: 'Tao',            text: 'You again. You are either very dedicated or you are following us.' },
        { speaker: 'Lady Essabella', text: 'Dedicated. Though the two are not mutually exclusive.' },
        { speaker: 'Rei',            text: 'What do you want?' },
        { speaker: 'Lady Essabella', text: 'To tell you something the Oracle will not. There are others in Aethoria who oppose Valdris. Not through the Oracle\'s sanctioned path — through their own means. They have been fighting him longer than you have been summoned.' },
        { speaker: 'Aya',            text: 'Who are they?' },
        { speaker: 'Lady Essabella', text: 'A faction. They believe the Seal Fragments should not be destroyed. They believe a world left without anchors after Valdris falls will fracture anyway — differently, but just as completely. They want to claim the Fragments. Use them to rebuild the Seals from the inside.' },
        { speaker: 'Lulu',           text: 'That sounds reasonable. Why does the Oracle not work with them?' },
        { speaker: 'Lady Essabella', text: 'Because the Oracle\'s plan requires destruction. And this faction does not trust that anything destroyed can be trusted not to take something else with it.' },
        { speaker: 'Rei',            text: 'You speak about them as though you know them well.' },
        { speaker: 'Lady Essabella', text: 'I have studied many factions. The Dark Phoenix waits at the heart of these wastes — a creature of renewal, twisted into a creature of endless burning. It is not your enemy. What trapped it here is. Try to remember the difference when the fire finds you.' },
        { speaker: 'Lady Essabella', text: 'I will be watching. As I always am.' },
      ],

      // ── ARC 4 — Sunken Temple ─────────────────────────────────────
      // The last appearance before the reveal. Essabella gives the party
      // precise, almost suspicious intelligence on the Kraken — she knows
      // exactly where it patrols and why. She plants the seed: something
      // bound the Kraken here beyond Valdris's corruption. She does not
      // explain who. After the fight, her seal is found on the binding
      // chain — the first piece that makes everything retroactively clear.
      sunken_temple: [
        { speaker: 'Rei',            text: 'I felt you before I saw you. You have been in these ruins before.' },
        { speaker: 'Lady Essabella', text: 'Many times. I know every corridor.' },
        { speaker: 'Aya',            text: 'The Kraken — do you know where it holds?' },
        { speaker: 'Lady Essabella', text: 'The central hub. Flooded chamber, three levels down. It will not leave — it cannot. The binding goes deeper than Valdris\'s corruption.' },
        { speaker: 'Tao',            text: 'You sound very certain of that.' },
        { speaker: 'Lady Essabella', text: 'I have spent years studying what anchors things to places against their will. The Kraken\'s corruption is layered — Valdris is the outer layer. Beneath that, something else holds it.' },
        { speaker: 'Lady Essabella', text: 'It was a guardian once. These depths were its charge. Whatever bound it here originally believed that was worth preserving — even at cost.' },
        { speaker: 'Lulu',           text: 'That sounds like whoever did it had a reason. Even if the Kraken did not choose it.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'When it is over — look at what remains in the chamber. There is something there the Oracle has not told you about. Something worth understanding.' },
        { speaker: 'Rei',            text: 'What do you mean?' },
        { speaker: 'Lady Essabella', text: 'Go. You will see.' },
      ],

      // ── ARC 5 — Shadow Reach ──────────────────────────────────────
      // Post-reveal. The party now knows who she is. Essabella does not
      // pretend otherwise. Her faction is fighting Valdris too — but
      // trying to capture corrupted creatures rather than destroy them.
      // She reveals she has been feeding Valdris distractions to buy the
      // party time. First crack in her villain framing: she is not their
      // enemy. She is just not their ally. Not yet.
      shadow_reach: [
        { speaker: 'Aya',            text: 'Lady Essabella. Or should I say — Commander.' },
        { speaker: 'Lady Essabella', text: 'Either is accurate. I did not expect you to come this far.' },
        { speaker: 'Rei',            text: 'You knew we would find out.' },
        { speaker: 'Lady Essabella', text: 'I calculated it. The seal on the commander was a risk I accepted. I needed you to understand what the Fallen Angels are — not through my words, but through evidence.' },
        { speaker: 'Tao',            text: 'Evidence. You sent your own lieutenant to die.' },
        { speaker: 'Lady Essabella', text: 'She was already lost. Valdris had been inside her mind for months. I could not reach her. You gave her a cleaner ending than he would have.' },
        { speaker: 'Lulu',           text: 'That is a terrible thing to carry.' },
        { speaker: 'Lady Essabella', text: '...Yes. It is.' },
        { speaker: 'Lady Essabella', text: 'I have been feeding Valdris false positions — troop movements, patrol routes that do not exist. He has been hunting shadows for three weeks. That is what cleared your path here.' },
        { speaker: 'Aya',            text: 'Why help us? You believe we are wrong.' },
        { speaker: 'Lady Essabella', text: 'I believe your method is wrong. I believe you are the only ones capable of carrying it through. There is a difference.' },
        { speaker: 'Lady Essabella', text: 'My faction is taking losses I cannot replace. Whatever I planned — it is no longer possible. So I bought you time instead. Do not waste it.' },
      ],

      // ── ARC 6 — Void Citadel ──────────────────────────────────────
      // Essabella's plan has completely collapsed. Valdris has been
      // consuming Fallen Angel soldiers — her own people, turned into
      // enemies in the pools above. She is shaken. The calculation is
      // gone. What remains is the question she has always carried:
      // what happens to the world after Valdris falls?
      void_citadel: [
        { speaker: 'Rei',            text: 'The Fallen Angels in the enemy pools — those were yours.' },
        { speaker: 'Lady Essabella', text: 'Were. He found them faster than I anticipated. I underestimated how far his reach extended into the citadel.' },
        { speaker: 'Tao',            text: 'You watched them become what we fought.' },
        { speaker: 'Lady Essabella', text: 'I could not get to them in time. I could not —' },
        { speaker: 'Lady Essabella', text: '...The plan is finished. The Fragments I meant to preserve, the Seals I meant to rebuild from within — Valdris took everything I positioned. Two years of work. Gone.' },
        { speaker: 'Lulu',           text: 'I am sorry.' },
        { speaker: 'Lady Essabella', text: 'Do not be. I made calculations. They were wrong. That is mine to carry.' },
        { speaker: 'Lady Essabella', text: 'But I need you to answer something. When you destroy the last Fragment and Valdris falls — what fills the space he leaves? The Seals will be broken. The elemental anchors will be gone. Who holds the world together after?' },
        { speaker: 'Aya',            text: 'The Oracle believes the world will heal on its own. That the Seals were never meant to be permanent.' },
        { speaker: 'Lady Essabella', text: 'The Oracle believes many things. I have spent two years watching what happens when the anchors weaken. The answer is not healing. The answer is fracture.' },
        { speaker: 'Lady Essabella', text: 'I am not asking you to change your plan. I am asking you to have an answer ready for what comes after. Because someone will need to be there.' },
      ],

      // ── ARC 7 — Fortress Ramparts ─────────────────────────────────
      // The arc reveals Valdris was a scholar — afraid of death, who
      // consumed everything to escape it. There is a mirror at the core.
      // Essabella has been doing the same thing in a different direction:
      // controlling the Fragments to prevent catastrophe, refusing to
      // trust anything to chance. She sees herself in him.
      // She is broken. Honest. The calculation is completely gone.
      // She tells the party the Fallen Angels will stand down.
      fortress_ramparts: [
        { speaker: 'Aya',            text: 'You look different.' },
        { speaker: 'Lady Essabella', text: 'I found the scholar\'s chamber. The texts. The star maps.' },
        { speaker: 'Lady Essabella', text: 'He was studying death. Trying to understand it, catalogue it, find the mechanism so he could dismantle it. He was brilliant. He was afraid. And when the fear became unbearable, he stopped asking questions and started taking answers.' },
        { speaker: 'Tao',            text: 'You recognized something in that.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'I spent two years calculating how to save this world. Every variable. Every contingency. I refused to leave anything to chance because I did not trust chance. I did not trust the Oracle. I did not trust your party. I did not trust anything I could not control.' },
        { speaker: 'Lulu',           text: 'That sounds very lonely.' },
        { speaker: 'Lady Essabella', text: 'It was effective. Until it was not.' },
        { speaker: 'Rei',            text: 'And now?' },
        { speaker: 'Lady Essabella', text: 'The Fallen Angels are standing down. Whatever soldiers I have left, I am pulling them back. They will not interfere.' },
        { speaker: 'Lady Essabella', text: 'I still think the Oracle\'s way risks everything. I still think destroying the Fragments is a gamble you do not fully understand. But I have seen what happens when someone refuses to accept a risk they cannot control. I will not become that.' },
        { speaker: 'Aya',            text: 'Will you stay?' },
        { speaker: 'Lady Essabella', text: 'Someone should witness this. In case you are right and I am wrong. I would like to know what that looks like.' },
      ],

      // ── ARC 8 — Eternal Void ──────────────────────────────────────
      // Valdris releases everything and dissolves into light.
      // The consumed worlds are reborn. Essabella witnesses it —
      // and finally has her answer. The Fragments do not need to be
      // claimed or controlled. They need to be released.
      // She was wrong. She says so, plainly, without flinching.
      // Her last line is the end of her arc.
      eternal_void: [
        { speaker: 'Rei',            text: 'You came.' },
        { speaker: 'Lady Essabella', text: 'I said I wanted to see what it looked like if you were right.' },
        { speaker: 'Tao',            text: 'And?' },
        { speaker: 'Lady Essabella', text: 'I am still here. So I suppose we will find out together.' },
        { speaker: 'Lady Essabella', text: 'I have been thinking about what he said. In the texts. He sought immortality because he feared the emptiness after death. I sought control because I feared the emptiness after failure. We were both trying to fill the same hole with different tools.' },
        { speaker: 'Lulu',           text: 'Is that why you are afraid right now?' },
        { speaker: 'Lady Essabella', text: '...I am afraid that you will destroy the Fragments and something irreplaceable will be lost and no one will be there to rebuild it. I have been afraid of that since the very beginning.' },
        { speaker: 'Aya',            text: 'Then stay. After this. If the world needs someone to help rebuild the Seals — be that person. Not as a commander. As someone who chooses to.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'I spent two years calculating how to save this world. He spent six centuries refusing to let it go. We were both wrong in the same direction.' },
        { speaker: 'Lady Essabella', text: 'Go. End it. I will be here when you return.' },
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

  the_archivist: {
    name:   'The Archivist',
    color:  '#a5b4fc',
    sprite: 'images/characters/map/sheets/npc/archivist_sheet.png',
    dialogues: {
      crystal_cavern: [
        { speaker: 'The Archivist', text: 'Still here. Still here. I have been cataloguing the resonance patterns for… how long has it been.' },
        { speaker: 'Tao',           text: 'You are a ghost.' },
        { speaker: 'The Archivist', text: 'I am an unfinished record. There is a difference.' },
        { speaker: 'The Archivist', text: 'The Demon Lord — you are going to fight him. I can see it in the way you move. Let me save you time.' },
        { speaker: 'Rei',           text: 'We are listening.' },
        { speaker: 'The Archivist', text: 'He has fused a fire Fragment to his core. It does not make him stronger — it makes him saturated. He is running at the absolute limit of what a body can hold.' },
        { speaker: 'The Archivist', text: 'You cannot burn him. He absorbs it. But a system already at capacity cannot absorb more. Push more fire into him than he can process and the Fragment destabilises. He will not survive his own power.' },
        { speaker: 'Aya',           text: 'Overload him from the inside.' },
        { speaker: 'The Archivist', text: 'Precisely. Or hit him with the opposite — ice, cryo. Elemental contradiction causes a reaction he cannot suppress. Either way works. Either way hurts him.' },
        { speaker: 'The Archivist', text: 'That is all I have left to give. Go. Finish the record I could not.' },
      ],
    },
  },

  ghost_knight: {
    name:   'Ghost Knight',
    color:  '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/knight_of_the_vale_sheet.png',
    dialogues: {
      crystal_cavern: [
        { speaker: 'Ghost Knight', text: '...You are warm. I remember warm.' },
        { speaker: 'Lulu',         text: 'Can you hear us? Do you know where you are?' },
        { speaker: 'Ghost Knight', text: 'The passage. I was holding the passage. They sent something through and I… I held.' },
        { speaker: 'Rei',          text: 'How long have you been here?' },
        { speaker: 'Ghost Knight', text: 'I do not know how long. I know I was supposed to hold until they came back. No one came back.' },
        { speaker: 'Tao',          text: 'What did Valdris do to you?' },
        { speaker: 'Ghost Knight', text: 'He did not take everything. I think he tried. But I had one thing left — the order I was given. Hold the passage. He could not take that. So he left the rest of me hollow and moved on.' },
        { speaker: 'Aya',          text: 'You kept yourself alive through the order alone.' },
        { speaker: 'Ghost Knight', text: 'I kept the echo alive. I am not sure there is a difference anymore.' },
        { speaker: 'Ghost Knight', text: 'The passage is clear now. You can go through. That is what I was holding it for, I think. Someone like you.' },
        { speaker: 'Lulu',         text: 'You can rest now. You held long enough.' },
        { speaker: 'Ghost Knight', text: '...Yes. I suppose I did.' },
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
