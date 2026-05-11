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

  // ════════════════════════════════════════════════════════════════
  //  ESSABELLA — Fallen Goddess. Full arc across all 8 regions.
  //  NOTE: void_citadel has two story beats merged into one scene.
  // ════════════════════════════════════════════════════════════════
  essabella: {
    name: 'Lady Essabella',
    color: '#c4b5fd',
    sprite: 'images/characters/map/sheets/npc/essabela_sheet.png',
    dialogues: {

      // ── ARC 1 — Verdant Vale ──────────────────────────────────────
      // Essabella presents as a scholar mapping the corruption.
      // True purpose: observing whether the party is capable enough
      // to be a threat — or a tool. She sends them toward the Void Knight
      // knowing exactly what they will face.
      verdant_vale: [
        { speaker: 'Lady Essabella', text: 'You are not his. Good. I was beginning to think I\'d wait forever.' },
        { speaker: 'Aya', text: 'You knew someone would come?' },
        { speaker: 'Lady Essabella', text: 'I calculated it. Someone always does, when the world is desperate enough to call. Though mortal logic is a poor substitute for the overview I once held.' },
        { speaker: 'Tao', text: 'What overview?' },
        { speaker: 'Lady Essabella', text: '...A scholar\'s overview. Nothing more.' },
        { speaker: 'Rei', text: 'The Sacred Ruins. The Void Knight. Tell us what you know.' },
        { speaker: 'Lady Essabella', text: 'Direct. I appreciate that.' },
        { speaker: 'Lady Essabella', text: 'Valdris bound a soul to those ruins two years ago. A warrior. What guards the Fragment now is not what it once was — it has forgotten everything except the order it was given. You cannot reason with it. You can only end it.' },
        { speaker: 'Lady Essabella', text: 'I have been mapping the corruption\'s spread from here. It reaches further every week. You arrived at the right time — any later and the vale itself would have turned.' },
        { speaker: 'Lulu', text: 'Will you be safe here, alone?' },
        { speaker: 'Lady Essabella', text: 'I have survived two years at the edge of his shadow. A few more hours will not change that. Go. The ruins are waiting.' },
      ],

      // ── ARC 2 — Crystal Cavern ────────────────────────────────────
      // Essabella reappears underground — supposedly still mapping
      // tunnel networks. She gives accurate intel on the Demon Lord,
      // then plants the first seed: she questions whether destroying
      // the Fragments is the right path. She frames it as academic
      // curiosity. It is not.
      crystal_cavern: [
        { speaker: 'Aya', text: 'Lady Essabella. We did not expect to find you here.' },
        { speaker: 'Lady Essabella', text: 'The corruption spreads underground as readily as above. I follow it where it goes.' },
        { speaker: 'Tao', text: 'Convenient timing.' },
        { speaker: 'Lady Essabella', text: 'I prefer thorough preparation. The Demon Lord is in the throne room — upper level, east wing. The fire Fragment is fused to him. He believes it makes him permanent. It does not.' },
        { speaker: 'Rei', text: 'You have been inside the palace?' },
        { speaker: 'Lady Essabella', text: 'I study the corruption. That sometimes requires proximity.' },
        { speaker: 'Lady Essabella', text: 'The Fragment — when you take it from him, what do you intend to do with it?' },
        { speaker: 'Lulu', text: 'The Oracle says to destroy them. Break his anchors.' },
        { speaker: 'Lady Essabella', text: 'Of course. The Oracle\'s way.' },
        { speaker: 'Lady Essabella', text: 'Academically speaking — a Seal Fragment is not merely an anchor for Valdris. It is compressed elemental memory. Destroying it means losing what it remembers. Permanently. I find that... worth considering.' },
        { speaker: 'Aya', text: 'It is a kindness, not a loss. Something captured deserves to be freed.' },
        { speaker: 'Lady Essabella', text: 'Is it freed? Or is it simply ended? The distinction matters.' },
        { speaker: 'Lady Essabella', text: 'In any case — be careful in the east wing. The floor above the throne room is unstable. Go through the lower passage.' },
      ],
      crystal_cavern_f3: [
        { speaker: 'Aya', text: 'Lady Essabella. We did not expect to find you here.' },
        { speaker: 'Lady Essabella', text: 'The corruption spreads underground as readily as above. I follow it where it goes.' },
        { speaker: 'Lady Essabella', text: 'The Spectral Guardian blocks the path to the surface. Defeat it, and you will reach the undercroft of Ashveil palace.' },
        { speaker: 'Lady Essabella', text: 'The Demon Lord waits above in the throne room. The fire Fragment is fused to him. He believes it makes him permanent. It does not.' },
        { speaker: 'Lady Essabella', text: 'The Fragment — when you take it from him, what do you intend to do with it? Destroy it, as the Oracle commands? Or do you see the loss in that destruction?' },
        { speaker: 'Lulu', text: 'We... we just want to help the people.' },
        { speaker: 'Lady Essabella', text: 'Helping people often requires understanding the tools you are breaking. Go. The guardian is waiting.' },
      ],

      // ── ARC 3 — Ember Wastes ──────────────────────────────────────
      // Essabella is no longer pretending to stumble across them.
      // She is ahead of them, waiting. She speaks more openly about
      // a faction that opposes Valdris differently than the Oracle does.
      // She does not name the Fallen Angels — but she is describing them.
      ember_wastes: [
        { speaker: 'Tao', text: 'You again. You are either very dedicated or you are following us.' },
        { speaker: 'Lady Essabella', text: 'Dedicated. Though the two are not mutually exclusive.' },
        { speaker: 'Rei', text: 'What do you want?' },
        { speaker: 'Lady Essabella', text: 'To tell you something the Oracle will not. There are others in Aethoria who oppose Valdris. Not through the Oracle\'s sanctioned path — through their own means. They have been fighting him longer than you have been summoned.' },
        { speaker: 'Aya', text: 'Who are they?' },
        { speaker: 'Lady Essabella', text: 'A faction. They believe the Seal Fragments should not be destroyed. They believe a world left without anchors after Valdris falls will fracture anyway — differently, but just as completely. They want to claim the Fragments. Use them to rebuild the Seals from the inside.' },
        { speaker: 'Lulu', text: 'That sounds reasonable. Why does the Oracle not work with them?' },
        { speaker: 'Lady Essabella', text: 'Because the Oracle\'s plan requires destruction. And this faction does not trust that anything destroyed can be trusted not to take something else with it.' },
        { speaker: 'Rei', text: 'You speak about them as though you know them well.' },
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
        { speaker: 'Rei', text: 'I felt you before I saw you. You have been in these ruins before.' },
        { speaker: 'Lady Essabella', text: 'Many times. I know every corridor.' },
        { speaker: 'Aya', text: 'The Kraken — do you know where it holds?' },
        { speaker: 'Lady Essabella', text: 'The central hub. Flooded chamber, three levels down. It will not leave — it cannot. The binding goes deeper than Valdris\'s corruption.' },
        { speaker: 'Tao', text: 'You sound very certain of that.' },
        { speaker: 'Lady Essabella', text: 'I have spent years studying what anchors things to places against their will. The Kraken\'s corruption is layered — Valdris is the outer layer. Beneath that, something else holds it.' },
        { speaker: 'Lady Essabella', text: 'It was a guardian once. These depths were its charge. Whatever bound it here originally believed that was worth preserving — even at cost.' },
        { speaker: 'Lulu', text: 'That sounds like whoever did it had a reason. Even if the Kraken did not choose it.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'When it is over — look at what remains in the chamber. There is something there the Oracle has not told you about. Something worth understanding.' },
        { speaker: 'Rei', text: 'What do you mean?' },
        { speaker: 'Lady Essabella', text: 'Go. You will see.' },
      ],

      // ── ARC 5 — Shadow Reach ──────────────────────────────────────
      // Post-reveal. The party now knows who she is. Essabella does not
      // pretend otherwise. First crack in her villain framing: she is not
      // their enemy. She is just not their ally. Not yet.
      shadow_reach: [
        { speaker: 'Aya', text: 'Lady Essabella. Or should I say — Commander.' },
        { speaker: 'Lady Essabella', text: 'Either is accurate. I did not expect you to come this far.' },
        { speaker: 'Rei', text: 'You knew we would find out.' },
        { speaker: 'Lady Essabella', text: 'I calculated it. The seal on the commander was a risk I accepted. I needed you to understand what the Fallen Angels are — not through my words, but through evidence.' },
        { speaker: 'Tao', text: 'Evidence. You sent your own lieutenant to die.' },
        { speaker: 'Lady Essabella', text: 'She was already lost. Valdris had been inside her mind for months. I could not reach her. You gave her a cleaner ending than he would have.' },
        { speaker: 'Lulu', text: 'That is a terrible thing to carry.' },
        { speaker: 'Lady Essabella', text: '...Yes. It is.' },
        { speaker: 'Lady Essabella', text: 'I have been feeding Valdris false positions — troop movements, patrol routes that do not exist. He has been hunting shadows for three weeks. That is what cleared your path here.' },
        { speaker: 'Aya', text: 'Why help us? You believe we are wrong.' },
        { speaker: 'Lady Essabella', text: 'I believe your method is wrong. I believe you are the only ones capable of carrying it through. There is a difference.' },
        { speaker: 'Lady Essabella', text: 'My faction is taking losses I cannot replace. Whatever I planned — it is no longer possible. So I bought you time instead. Do not waste it.' },
      ],

      // ── ARC 6 & ARC 7 — Void Citadel (merged) ───────────────────
      // Her plan has completely collapsed. Valdris consumed her soldiers.
      // She is shaken — then the goddess reveal, and the final briefing
      // before the party ascends to the end.
      void_citadel: [
        { speaker: 'Rei', text: 'The Fallen Angels in the enemy pools — those were yours.' },
        { speaker: 'Lady Essabella', text: 'Were. He found them faster than I anticipated. I underestimated how far his reach extended into the citadel.' },
        { speaker: 'Tao', text: 'You watched them become what we fought.' },
        { speaker: 'Lady Essabella', text: 'I could not get to them in time. I could not —' },
        { speaker: 'Lady Essabella', text: '...The plan is finished. The Fragments I meant to preserve, the Seals I meant to rebuild from within — Valdris took everything I positioned. Two years of work. Gone.' },
        { speaker: 'Lulu', text: 'I am sorry.' },
        { speaker: 'Lady Essabella', text: 'Do not be. I made calculations. They were wrong. That is mine to carry.' },
        { speaker: 'Lady Essabella', text: 'But I need you to answer something. When Valdris falls — what fills the space he leaves? The Seals will be broken. The elemental anchors will be gone. Who holds the world together after?' },
        { speaker: 'Aya', text: 'The Oracle believes the world will heal on its own. That the Seals were never meant to be permanent.' },
        { speaker: 'Lady Essabella', text: 'The Oracle believes many things. I have spent two years watching what happens when the anchors weaken. The answer is not healing. The answer is fracture.' },
        { speaker: 'Aya', text: 'The air here... it feels like it\'s being pulled toward the center.' },
        { speaker: 'Lady Essabella', text: 'He is phase-locked. The Grand Ritual has entered its final stage. He is forcing the Shadow Seal open by sheer elemental resonance.' },
        { speaker: 'Rei', text: 'Then we interrupt him.' },
        { speaker: 'Lady Essabella', text: 'It is not so simple. Valdris has injected the Living Core of the Nexus into his own heart. He is the archive now.' },
        { speaker: 'Lulu', text: 'If he dies... what happens to the Core?' },
        { speaker: 'Lady Essabella', text: 'I will be there to catch it.' },
        { speaker: 'Tao', text: 'A goddess? You?' },
        { speaker: 'Lady Essabella', text: 'A fallen one. But I still remember how the pieces fit together. Reclaim the Fragments from his body, and I will restore Aethoria. I took this mortal vessel specifically to repair the error I allowed to happen.' },
        { speaker: 'Lady Essabella', text: 'I am not asking you to change your plan. I am asking you to have an answer ready for what comes after. Because someone will need to be there.' },
      ],

      // ── ARC 7 — Fortress Ramparts ─────────────────────────────────
      // The scholar's chamber. Essabella sees herself in Valdris.
      // The calculation is completely gone. She tells them she is standing down.
      fortress_ramparts: [
        { speaker: 'Aya', text: 'You look different.' },
        { speaker: 'Lady Essabella', text: 'I found the scholar\'s chamber. The texts. The star maps.' },
        { speaker: 'Lady Essabella', text: 'He was studying death. Trying to understand it, catalogue it, find the mechanism so he could dismantle it. He was brilliant. He was afraid. And when the fear became unbearable, he stopped asking questions and started taking answers.' },
        { speaker: 'Tao', text: 'You recognized something in that.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'I spent two years calculating how to save this world. Every variable. Every contingency. I refused to leave anything to chance because I did not trust chance. I did not trust the Oracle. I did not trust your party. I did not trust anything I could not control.' },
        { speaker: 'Lulu', text: 'That sounds very lonely.' },
        { speaker: 'Lady Essabella', text: 'It was effective. Until it was not.' },
        { speaker: 'Rei', text: 'And now?' },
        { speaker: 'Lady Essabella', text: 'The Fallen Angels are standing down. Whatever soldiers I have left, I am pulling them back. They will not interfere.' },
        { speaker: 'Lady Essabella', text: 'I still think the Oracle\'s way risks everything. I still think destroying the Fragments is a gamble you do not fully understand. But I have seen what happens when someone refuses to accept a risk they cannot control. I will not become that.' },
        { speaker: 'Aya', text: 'Will you stay?' },
        { speaker: 'Lady Essabella', text: 'Someone should witness this. In case you are right and I am wrong. I would like to know what that looks like.' },
      ],

      // ── ARC 8 — Eternal Void ──────────────────────────────────────
      // Valdris releases everything and dissolves. Essabella witnesses it.
      // She was wrong. She says so, plainly. Her last line is the end of her arc.
      eternal_void: [
        { speaker: 'Rei', text: 'You came.' },
        { speaker: 'Lady Essabella', text: 'I said I wanted to see what it looked like if you were right.' },
        { speaker: 'Tao', text: 'And?' },
        { speaker: 'Lady Essabella', text: 'I am still here. So I suppose we will find out together.' },
        { speaker: 'Lady Essabella', text: 'I have been thinking about what he said. In the texts. He sought immortality because he feared the emptiness after death. I sought control because I feared the emptiness after failure. We were both trying to fill the same hole with different tools.' },
        { speaker: 'Lulu', text: 'Is that why you are afraid right now?' },
        { speaker: 'Lady Essabella', text: '...I am afraid that you will destroy the Fragments and something irreplaceable will be lost and no one will be there to rebuild it. I have been afraid of that since the very beginning.' },
        { speaker: 'Aya', text: 'Then stay. After this. If the world needs someone to help rebuild the Seals — be that person. Not as a commander. As someone who chooses to.' },
        { speaker: 'Lady Essabella', text: '...' },
        { speaker: 'Lady Essabella', text: 'I spent two years calculating how to save this world. He spent six centuries refusing to let it go. We were both wrong in the same direction.' },
        { speaker: 'Lady Essabella', text: 'Go. End it. I will be here when you return.' },
      ],

    },
  },

  // ════════════════════════════════════════════════════════════════
  //  VERDANT VALE NPCs
  // ════════════════════════════════════════════════════════════════

  azure_commander: {
    name: 'Azure Commander',
    color: '#3b82f6',
    sprite: 'images/characters/map/sheets/sera_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Azure Commander', text: 'You should not be here.' },
        { speaker: 'Aya', text: 'We are heading east. To the ruins.' },
        { speaker: 'Azure Commander', text: 'I know. I watched you cross the river bend. That road has not returned a single soldier in six hundred years.' },
        { speaker: 'Rei', text: 'Then why are you still standing on it?' },
        { speaker: 'Azure Commander', text: 'Because someone has to remember which way is back.' },
        { speaker: 'Azure Commander', text: 'The thing at the end of that road had a name before Valdris gave him the armor. If you reach him — remember that.' },
      ],
      verdant_vale_return: [
        { speaker: 'Azure Commander', text: 'The bridge is still standing. That is more than I expected.' },
        { speaker: 'Azure Commander', text: 'Go when you are ready. The ruins will not wait forever — and neither will what is inside them.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Azure Commander', text: 'I walked to the ruins after you left. Stood where he fell.' },
        { speaker: 'Azure Commander', text: 'Six hundred years of Azure commanders have carried his name. Arren. The one who held the road.' },
        { speaker: 'Tao', text: 'Did it feel different, knowing it was over?' },
        { speaker: 'Azure Commander', text: 'Yes. It felt like a door closing. The good kind — the kind you close because the house is safe again, not because you are locking something out.' },
        { speaker: 'Azure Commander', text: 'The Remnant marches east tomorrow. With Sera leading. The vigil ends. The work begins.' },
      ],
    },
  },

  elder_maren: {
    name: 'Elder Maren',
    color: '#fbbf24',
    sprite: 'images/characters/map/sheets/npc/elder_maren_sheet.png',
    quests: ['goblin_menace'],
    dialogues: {
      verdant_vale: [
        { speaker: 'Elder Maren', text: 'Travelers! Praise the stars, I thought we were the last ones left.' },
        { speaker: 'Aya', text: 'The town feels half-empty, Elder. What happened here?' },
        { speaker: 'Elder Maren', text: 'Most fled west when the Bridge Ward flickered. The Void Knight passed through like a cold wind and left his shadows behind to make sure nothing moved east.' },
        { speaker: 'Lulu', text: 'You stayed.' },
        { speaker: 'Elder Maren', text: 'Someone had to. I was the record-keeper before the fall — responsible for the calendar of songs, the harvest counts, the names of who lived where. When everyone runs, someone needs to stay and remember what the place was.' },
        { speaker: 'Rei', text: 'The Seal Fragment. The Void Knight could not take it?' },
        { speaker: 'Elder Maren', text: 'The Fragment is bound by light — the same light that governed this land for centuries before the Emperor dissolved into it. Whatever Valdris sent here could not touch it. But he left enough behind to make sure no one else could either.' },
        { speaker: 'Tao', text: 'So it\'s just been sitting there. Guarded by something that can\'t use it, stopping anyone who could.' },
        { speaker: 'Elder Maren', text: 'That is Valdris\'s way, from what I understand. He does not need to win. He only needs to make sure nobody else does.' },
        { speaker: 'Aya', text: 'We will retrieve it.' },
        { speaker: 'Elder Maren', text: 'Then go with every caution you have. The east is no longer the home I remember. But it is still worth remembering.' },
        { speaker: 'Elder Maren', text: 'If you find anything out there — a name, a record, something that tells you who someone was before — bring it back. Not to me. Just... carry it. Someone should.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Elder Maren', text: 'They said his name was Arren.' },
        { speaker: 'Elder Maren', text: 'Six centuries I have kept these records, and his name was never in any of them. Not once. And now I know it.' },
        { speaker: 'Lulu', text: 'Does it help?' },
        { speaker: 'Elder Maren', text: 'More than I expected. I thought the hole was too old to hurt. But hearing his name felt like a lock clicking open in the dark.' },
        { speaker: 'Elder Maren', text: 'Go safely. And if you ever need the Vale to remember something — or someone — you bring it back here. I will write it down.' },
      ],
    },
  },

  soldier_1: {
    name: 'Soldier Davan',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Davan', text: '…Don\'t. Don\'t come closer. I need a moment.' },
        { speaker: 'Rei', text: 'We mean no harm. What happened here?' },
        { speaker: 'Soldier Davan', text: 'The Void Knight came through three nights ago. My unit — eight men — we tried to hold the bridge.' },
        { speaker: 'Tao', text: 'You\'re the only one standing.' },
        { speaker: 'Soldier Davan', text: 'He didn\'t kill them. That\'s what you need to understand. He emptied them. They\'re still there. Still breathing. But when you look in their eyes, there\'s nothing left.' },
        { speaker: 'Aya', text: 'Void consumption. He is absorbing something from them.' },
        { speaker: 'Soldier Davan', text: 'One of them was my brother. He looked right through me. No recognition. Nothing.' },
        { speaker: 'Lulu', text: 'I\'m so sorry.' },
        { speaker: 'Soldier Davan', text: 'Don\'t be sorry. Just stop him. Whatever he is taking from people — don\'t let him take more. Promise me that.' },
        { speaker: 'Rei', text: 'We will stop him. You have my word.' },
        { speaker: 'Soldier Davan', text: '…Good. That\'s good. I\'ll hold the road here. In case my brother wakes up.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Davan', text: 'He said my name this morning.' },
        { speaker: 'Soldier Davan', text: 'My brother. He looked up from his cot and he said my name. He didn\'t know where he was. He didn\'t know what year it was. But he said my name.' },
        { speaker: 'Tao', text: 'That is how it starts. The soul finding its way back.' },
        { speaker: 'Soldier Davan', text: 'I\'ve been standing at this road for two weeks waiting for exactly that. I am not sure what I do now.' },
        { speaker: 'Rei', text: 'Sit down. That is usually the next thing.' },
        { speaker: 'Soldier Davan', text: '...Yeah. Yeah, that makes sense.' },
      ],
    },
  },

  soldier_2: {
    name: 'Soldier Kael',
    color: '#64748b',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Kael', text: 'Halt! Identify yourselves before you take another step.' },
        { speaker: 'Aya', text: 'We are travelers. Summoned here — we are looking for the Seal Fragment.' },
        { speaker: 'Soldier Kael', text: 'The Fragment. So the Summoning Circle did pulse. I thought I was imagining it.' },
        { speaker: 'Soldier Kael', text: 'You\'re the first people I\'ve seen come from outside in two weeks. Everything moving east gets emptied. Everything moving west is running.' },
        { speaker: 'Rei', text: 'How long have you held this gate alone?' },
        { speaker: 'Soldier Kael', text: 'Since the others went to reinforce the southern watch. That was six days ago. I\'m beginning to think they are not coming back.' },
        { speaker: 'Tao', text: 'That\'s a long time to hold a post on your own.' },
        { speaker: 'Soldier Kael', text: 'It\'s just a gate. The gate doesn\'t know I\'m alone. The refugees coming through don\'t know either. I keep the post because if I leave it, there\'s nothing between the settlement and whatever comes next.' },
        { speaker: 'Lulu', text: 'That is very brave.' },
        { speaker: 'Soldier Kael', text: 'It\'s a job. Enter quickly. And if you reach the eastern bridge — be ready for the fact that what the Void Knight left behind doesn\'t look like an enemy until it\'s too late.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Kael', text: 'East gate is open.' },
        { speaker: 'Soldier Kael', text: 'First time in two weeks. I opened it this morning and just... stood there for a moment. Watching the road go east with nothing on it.' },
        { speaker: 'Aya', text: 'How does it feel?' },
        { speaker: 'Soldier Kael', text: 'Quiet. Proper quiet, not the kind that means something is about to happen.' },
        { speaker: 'Soldier Kael', text: 'The others who went south — two of them came back this afternoon. Thought they might never. I\'m going to stop assuming the worst. Starting now.' },
      ],
    },
  },

  soldier_3: {
    name: 'Soldier Jace',
    color: '#475569',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Jace', text: 'Hold there. This settlement is for refugees. Are you running from the east?' },
        { speaker: 'Aya', text: 'We are moving toward it. We need what is in the ruins.' },
        { speaker: 'Soldier Jace', text: 'Moving toward it.' },
        { speaker: 'Soldier Jace', text: 'I\'ve spent two weeks turning people away from the east gate. You are the first ones asking me to open it going the other direction.' },
        { speaker: 'Tao', text: 'Does that change your answer?' },
        { speaker: 'Soldier Jace', text: 'It changes how I feel about your odds. The people who came through here told me what they saw. Shadows that follow you. Soldiers standing at their posts with no one inside. A bridge ward flickering for the first time in two hundred years.' },
        { speaker: 'Lulu', text: 'You were stationed at the capital once, weren\'t you.' },
        { speaker: 'Soldier Jace', text: '...How did you know that?' },
        { speaker: 'Lulu', text: 'The way you hold yourself. This is not the post you expected to end up at.' },
        { speaker: 'Soldier Jace', text: 'No. But it\'s the post that needs holding. Go on through. And come back, if you can. These people need to hear that someone made it to the east and came back.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Jace', text: 'You came back.' },
        { speaker: 'Aya', text: 'We said we would.' },
        { speaker: 'Soldier Jace', text: 'Yes. You did. I\'ve been a soldier long enough to stop expecting people to keep that.' },
        { speaker: 'Soldier Jace', text: '...I was afraid, you know. The whole time. Standing at this gate trying to look like I wasn\'t.' },
        { speaker: 'Lulu', text: 'That is what courage is. Not the absence of fear.' },
        { speaker: 'Soldier Jace', text: 'I know. I just needed someone else to say it.' },
      ],
    },
  },

  lira: {
    name: 'Lira',
    color: '#4ade80',
    sprite: 'images/characters/map/sheets/npc/lira_sheet.png',
    quests: ['locket_lost'],
    dialogues: {
      verdant_vale: [
        { speaker: 'Lira', text: 'Oh! You look like you can actually handle yourselves in a fight.' },
        { speaker: 'Tao', text: 'We\'ve had some practice. Why?' },
        { speaker: 'Lira', text: 'I lost my favorite locket in the tall grass east of the river. I\'d go get it, but there are things crawling around over there that don\'t like visitors.' },
        { speaker: 'Rei', text: 'We are headed that way for the Fragment. We will keep an eye out.' },
        { speaker: 'Lira', text: 'You would? Oh, thank you! It\'s silver, with a little blue gem. If you find it, I have some spare supplies I can give you!' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Lira', text: 'It\'s quieter in the east now. I walked to the edge of the wood this morning and just listened.' },
        { speaker: 'Tao', text: 'That takes courage after what you\'ve been through.' },
        { speaker: 'Lira', text: 'I\'ve been thinking about the locket you found for me. And about the knight — Arren. He didn\'t get to take anything with him.' },
        { speaker: 'Lira', text: 'I want to leave something at the ruins. Something small. An offering, I suppose. My grandmother would have understood.' },
        { speaker: 'Lira', text: 'When you are next heading east... would you carry it there for me? I\'m not ready to go myself yet. But something should mark that someone remembers.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  CRYSTAL CAVERN NPCs
  // ════════════════════════════════════════════════════════════════

  the_archivist: {
    name: 'The Archivist',
    color: '#a5b4fc',
    sprite: 'images/characters/map/sheets/npc/archivist_sheet.png',
    quests: ['bones_of_the_fallen'],
    dialogues: {
      crystal_cavern: [
        { speaker: 'The Archivist', text: 'Still here. Still here. I have been cataloguing the resonance patterns for… how long has it been.' },
        { speaker: 'Tao', text: 'You are a ghost.' },
        { speaker: 'The Archivist', text: 'I am an unfinished record. There is a difference.' },
        { speaker: 'The Archivist', text: 'The Demon Lord — you are going to fight him. I can see it in the way you move. Let me save you time.' },
        { speaker: 'Rei', text: 'We are listening.' },
        { speaker: 'The Archivist', text: 'He has fused a fire Fragment to his core. It does not make him stronger — it makes him saturated. He is running at the absolute limit of what a body can hold.' },
        { speaker: 'The Archivist', text: 'You cannot burn him. He absorbs it. But a system already at capacity cannot absorb more. Push more fire into him than he can process and the Fragment destabilises. He will not survive his own power.' },
        { speaker: 'Aya', text: 'Overload him from the inside.' },
        { speaker: 'The Archivist', text: 'Precisely. Or hit him with the opposite — ice, cryo. Elemental contradiction causes a reaction he cannot suppress. Either way works. Either way hurts him.' },
        { speaker: 'The Archivist', text: 'That is all I have left to give. Go. Finish the record I could not.' },
      ],
      crystal_cavern_f1: [
        { speaker: 'The Archivist', text: 'Still here. Still here. I have been cataloguing the resonance patterns for… how long has it been.' },
        { speaker: 'The Archivist', text: 'You seek the core. Go deeper. The Resonance Depths below are thick with the echo of the Fire Seal.' },
        { speaker: 'The Archivist', text: 'Beware the Spectral Guardian at the frozen core. It guards the path to Ashveil.' },
      ],
      sky_ruins: [
        { speaker: 'The Archivist', text: 'The storm hums with the same frequency as the Void Citadel. These ruins predate the five civilizations — I never finished documenting them.' },
        { speaker: 'Aya', text: 'Is this where the first rift opened?' },
        { speaker: 'The Archivist', text: 'One of many. But here, the gravity itself has forgotten its purpose. To move forward, you must align the Aerolith Crystals.' },
        { speaker: 'Tao', text: 'You followed us all the way up here?' },
        { speaker: 'The Archivist', text: 'An unfinished record goes where the data is. There is still so much left to document.' },
      ],
    },
  },

  ghost_knight: {
    name: 'Ghost Knight',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/knight_of_the_vale_sheet.png',
    dialogues: {
      crystal_cavern: [
        { speaker: 'Ghost Knight', text: '...You are warm. I remember warm.' },
        { speaker: 'Lulu', text: 'Can you hear us? Do you know where you are?' },
        { speaker: 'Ghost Knight', text: 'The passage. I was holding the passage. They sent something through and I… I held.' },
        { speaker: 'Rei', text: 'How long have you been here?' },
        { speaker: 'Ghost Knight', text: 'I do not know how long. I know I was supposed to hold until they came back. No one came back.' },
        { speaker: 'Tao', text: 'What did Valdris do to you?' },
        { speaker: 'Ghost Knight', text: 'He did not take everything. I think he tried. But I had one thing left — the order I was given. Hold the passage. He could not take that. So he left the rest of me hollow and moved on.' },
        { speaker: 'Aya', text: 'You kept yourself alive through the order alone.' },
        { speaker: 'Ghost Knight', text: 'I kept the echo alive. I am not sure there is a difference anymore.' },
        { speaker: 'Ghost Knight', text: 'The passage is clear now. You can go through. That is what I was holding it for, I think. Someone like you.' },
        { speaker: 'Lulu', text: 'You can rest now. You held long enough.' },
        { speaker: 'Ghost Knight', text: '...Yes. I suppose I did.' },
      ],
      crystal_cavern_f2: [
        { speaker: 'Ghost Knight', text: '...You are warm. I remember warm.' },
        { speaker: 'Ghost Knight', text: 'I was holding the passage to the core. But the shadows... they are thicker now.' },
        { speaker: 'Ghost Knight', text: 'Go. The Frozen Core is just beyond the next descent. The guardian waits for those who carry life.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  RIVERLANDS CROSSING NPCs
  // ════════════════════════════════════════════════════════════════

  old_guard: {
    name: 'Old Guard',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      riverlands_crossing: [
        { speaker: 'Old Guard', text: 'The bridge is out. Has been for three weeks. And the River King doesn\'t take kindly to people trying to cross what isn\'t there anymore.' },
        { speaker: 'Rex', text: 'What happened to the bridge?' },
        { speaker: 'Old Guard', text: 'The River King took it. Pulled it down into the water one plank at a time, slow as tide. We watched from this bank and couldn\'t do a thing.' },
        { speaker: 'Aya', text: 'The River King — it was neutral once. The lore says it let everyone through.' },
        { speaker: 'Old Guard', text: 'That\'s right. Neutral. Collected a truth as toll and let you pass. Couldn\'t cross while lying. The river always knew.' },
        { speaker: 'Old Guard', text: 'Then Valdris\'s corruption reached the water table. And the spirit that governed this crossing for two centuries... changed. Something in the agreement it made contaminated it. Now it guards the crossing for him.' },
        { speaker: 'Rei', text: 'A neutral party that made a deal with corruption became corrupt through the deal itself.' },
        { speaker: 'Old Guard', text: 'That\'s the part that keeps me up at night. It didn\'t choose wrong. It chose nothing. Tried to stay out of it. And that\'s what took it in the end.' },
        { speaker: 'Old Guard', text: 'The ford downstream is passable at low tide. Go at dusk. And don\'t make any deals with anything that speaks in the water.' },
      ],
    },
  },

  ghost_soldier: {
    name: 'Ghost Soldier',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/knight_of_the_vale_sheet.png',
    dialogues: {
      riverlands_crossing: [
        { speaker: 'Ghost Soldier', text: 'I was guarding the supply cache when the water turned black. My unit crossed the bridge before I did. I watched it from the east bank.' },
        { speaker: 'Lulu', text: 'What happened to them?' },
        { speaker: 'Ghost Soldier', text: 'The water didn\'t kill them. It changed them. They got to the other side and just... stood there. Facing the river. Waiting for orders that weren\'t coming.' },
        { speaker: 'Tao', text: 'And you? You didn\'t cross.' },
        { speaker: 'Ghost Soldier', text: 'I was holding the cache. That was my post. I held it. Even after the bridge went down. Even after I understood there was nobody left to deliver the supplies to.' },
        { speaker: 'Ghost Soldier', text: 'I\'m still holding it, I suppose. Old habit.' },
        { speaker: 'Aya', text: 'What was in the cache?' },
        { speaker: 'Ghost Soldier', text: 'Field rations. Bandages. A letter I was supposed to deliver to someone in the southern settlement. I never found out if she received it.' },
        { speaker: 'Lulu', text: 'We\'ll finish what you started. All of it.' },
        { speaker: 'Ghost Soldier', text: '...There\'s a loose stone in the east wall. What\'s behind it is yours now. It\'s not doing anyone any good with me.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  ASHEN FOOTHILLS NPCs
  // ════════════════════════════════════════════════════════════════

  cursed_miner: {
    name: 'Cursed Miner',
    color: '#fbbf24',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      ashen_foothills: [
        { speaker: 'Cursed Miner', text: 'Don\'t go deeper. The basalt has grown over the south tunnel again. That\'s the third time this week.' },
        { speaker: 'Rex', text: 'You\'re still mining? After everything?' },
        { speaker: 'Cursed Miner', text: 'We kept running the shaft for two years after the Forge Lords fell. Waiting for collection that never came. Nobody told us to stop. So we didn\'t.' },
        { speaker: 'Cursed Miner', text: 'Then the basalt started moving. Slow at first — a crack here, a seal there. Now it shifts like it\'s breathing.' },
        { speaker: 'Aya', text: 'The Void-metal contamination. It spread into the stone.' },
        { speaker: 'Cursed Miner', text: 'I don\'t know what it is. I just know that three of my crew went into the deep shaft to check the lower ore vein and didn\'t come back the same. They\'re still down there. Working. Just... working. No food. No rest. No answer when you call their names.' },
        { speaker: 'Tao', text: 'The Golem is in those shafts.' },
        { speaker: 'Cursed Miner', text: 'There is something in there. We hear it at night — a sound like hammering that doesn\'t stop, not for hours, not for days. Whatever it\'s making, it never finishes.' },
        { speaker: 'Cursed Miner', text: 'I keep thinking — the Forge Lords devoted their whole civilization to making something permanent. And now whatever is down there is permanent, and it doesn\'t know what to do with that.' },
        { speaker: 'Rex', text: 'We\'ll handle what\'s in the deep shaft. Stay near the entrance.' },
        { speaker: 'Cursed Miner', text: 'I\'m not going anywhere. This shaft is all I know.' },
      ],
    },
  },

  flame_spirit: {
    name: 'Flame Spirit',
    color: '#ef4444',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      ashen_foothills: [
        { speaker: 'Flame Spirit', text: '...We remember the forge fires. We are what the forge fires became when there was no forge left to tend.' },
        { speaker: 'Lulu', text: 'You were part of the Forge Lords?' },
        { speaker: 'Flame Spirit', text: 'We were the warmth of their work. Every flame that lit an anvil, every spark from a hammer — we were there. When they hardened and stopped feeling the heat, the heat became us.' },
        { speaker: 'Tao', text: 'You\'re the grief they couldn\'t feel anymore.' },
        { speaker: 'Flame Spirit', text: 'We are what they burned off when their connection to fire completed the transition. They made the indestructible thing they always wanted. We are what they gave up to do it.' },
        { speaker: 'Flame Spirit', text: 'The Golem in the deep shaft — she was first. She became permanent before she understood that permanent and finished are different things. She is still making something. She has been making it for a very long time.' },
        { speaker: 'Aya', text: 'What is she making?' },
        { speaker: 'Flame Spirit', text: 'We do not know. We do not think she knows either. The instruction her mind could hold at the end was: keep working. So she does. The heat is still generous down there, if you walk through without flinching. Embrace what remains of it. It is the last of what they were.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  NORTHERN HIGHLANDS NPCs
  // ════════════════════════════════════════════════════════════════

  highland_monk: {
    name: 'Highland Monk',
    color: '#a78bfa',
    sprite: 'images/characters/map/sheets/npc/archivist_sheet.png',
    dialogues: {
      northern_highlands: [
        { speaker: 'Highland Monk', text: 'You are early. Dawn prayer is not finished.' },
        { speaker: 'Rei', text: 'Who do you pray for?' },
        { speaker: 'Highland Monk', text: 'The dragon. I pray for the dragon every morning at dawn. I have done so for eleven years.' },
        { speaker: 'Tao', text: 'You pray for the thing that destroyed this place?' },
        { speaker: 'Highland Monk', text: 'I pray for the thing that was left after the others faded. Before the Shattering, there were seven. The six who could not adapt to the failing elemental balance — they simply ceased. The one remaining survived by absorbing void energy in place of what it could no longer find.' },
        { speaker: 'Highland Monk', text: 'It is still alive. It is also no longer purely what it was. I am no longer certain what I am praying to.' },
        { speaker: 'Lulu', text: 'Then why continue?' },
        { speaker: 'Highland Monk', text: 'Because something that absorbed six hundred years of void energy to survive deserves to have someone acknowledge that it is still here. Even if I can no longer name what it has become. Maybe especially because of that.' },
        { speaker: 'Highland Monk', text: 'The Highlands wind carries voices. I have been here long enough to recognize which ones are grief and which ones are the wind simply being wind. Today there is more grief than usual. Something is coming.' },
        { speaker: 'Rei', text: 'We are going to face the dragon.' },
        { speaker: 'Highland Monk', text: 'I know. I will finish the prayer before you go. It seems appropriate.' },
      ],
    },
  },

  fallen_climber: {
    name: 'Fallen Climber',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      northern_highlands: [
        { speaker: 'Fallen Climber', text: 'Don\'t go to the summit. I know you\'re thinking about the summit. Don\'t.' },
        { speaker: 'Drake', text: 'What happened to you?' },
        { speaker: 'Fallen Climber', text: 'I almost made it. The view from the upper ridge — I saw it for about thirty seconds before the shadow crossed the sky. I thought it was a stormcloud. It wasn\'t.' },
        { speaker: 'Fallen Climber', text: 'The dragon doesn\'t attack from anger. It doesn\'t attack from territory. I\'m not sure it attacks at all, in the way we use that word. It just moves through the space you\'re in, and if you\'re in its path you\'re in its path.' },
        { speaker: 'Aya', text: 'What did you see from the ridge? Before it came.' },
        { speaker: 'Fallen Climber', text: 'The full spread of the Highlands. Every range, all the way to the northern edge of the world. And below them — the places where the other six dragons were. Not the dragons. Just the... shapes their absence left in the landscape. Like a weight that lifts and leaves an impression in the ground.' },
        { speaker: 'Fallen Climber', text: 'I did not expect it to be beautiful. I still think about it.' },
        { speaker: 'Drake', text: 'Sounds like it was worth it.' },
        { speaker: 'Fallen Climber', text: 'I broke three ribs getting back down. And I would go again.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  LIGHTHOUSE ISLES NPCs
  // ════════════════════════════════════════════════════════════════

  old_mariner: {
    name: 'Old Mariner',
    color: '#36a7c8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      lighthouse_isles: [
        { speaker: 'Old Mariner', text: 'You\'re here just before midnight. That\'s good. Or bad. Depends on how you feel about ghost ships.' },
        { speaker: 'Tao', text: 'Explain.' },
        { speaker: 'Old Mariner', text: 'Every midnight, the Ghost Ship comes around the outer reef. Last merchant vessel to leave the Southern Isles before the flooding. Crew died in the crossing. Ship kept sailing.' },
        { speaker: 'Old Mariner', text: 'It has completed its route thousands of times since. Looking for a port that doesn\'t exist. Looking for a crew that doesn\'t live.' },
        { speaker: 'Lulu', text: 'That is terribly sad.' },
        { speaker: 'Old Mariner', text: 'It is. I\'ve been tending this lighthouse for thirty years. Watching it every night.' },
        { speaker: 'Old Mariner', text: 'It comes closer each year. I\'ve measured it. Not by much — a few feet of bearing — but consistently. Every year, closer.' },
        { speaker: 'Rex', text: 'What do you think that means?' },
        { speaker: 'Old Mariner', text: 'I have not decided yet whether to be afraid of what it means or grateful that something is still trying to find its way home.' },
        { speaker: 'Old Mariner', text: 'I keep the lighthouse lit because of that ship. Not for the living sailors — the living ones know where the rocks are. For that ship. So if it does finally find what it\'s looking for, the light will be on.' },
        { speaker: 'Aya', text: 'You have tended this light for thirty years for a ship that cannot see it.' },
        { speaker: 'Old Mariner', text: 'I tend it in case that changes. There is a difference between cannot and has not yet.' },
      ],
    },
  },

  sea_spirit: {
    name: 'Sea Spirit',
    color: '#2dd4bf',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      lighthouse_isles: [
        { speaker: 'Sea Spirit', text: 'You smell of inland. Of stone and fire and earth. The sea has not claimed you yet.' },
        { speaker: 'Aya', text: 'Are you a remnant of the Tide civilization?' },
        { speaker: 'Sea Spirit', text: 'I am a remnant of the water. The civilization was built around me, not the other way. When the Tide Priests fell, the water remained. Contaminated. Grieving, in the way that water grieves — by moving differently than it did.' },
        { speaker: 'Sea Spirit', text: 'The lighthouse used to guide the living home. Merchants. Healers traveling between the temple and the outer isles. A whole network of people who trusted the light.' },
        { speaker: 'Lulu', text: 'Now?' },
        { speaker: 'Sea Spirit', text: 'Now it guides the lost. Not the living. The ones who cannot find the shore because they have forgotten which direction shore is. The water keeps them. The light reminds them something is still there.' },
        { speaker: 'Sea Spirit', text: 'The Seal Fragment from this region still carries the ocean\'s elemental memory. Oremis wanted to heal using the deep water\'s knowledge. He found it. It consumed him. But the desire behind it — that was real. What he wanted was real.' },
        { speaker: 'Sea Spirit', text: 'When you free what he became — remember that. Whatever he is now, it started as someone who wanted the suffering to stop.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  SOUTHERN ISLES NPCs
  // ════════════════════════════════════════════════════════════════

  survivor: {
    name: 'Survivor',
    color: '#fcd34d',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Survivor', text: 'The tide pulled us into the trench. My ship. All eleven of us. I\'m the only one who climbed back out.' },
        { speaker: 'Lulu', text: 'I\'m sorry. How long have you been here alone?' },
        { speaker: 'Survivor', text: 'I stopped counting. Long enough that I\'ve named the rock formations. Long enough that I\'ve started talking to them.' },
        { speaker: 'Survivor', text: 'The southern coast used to be ports. The whole landmass — it wasn\'t islands. It was one continuous shoreline with cities on it. Trading cities. The kind where the market never fully closed because there was always a ship coming in from somewhere.' },
        { speaker: 'Rex', text: 'What happened to it?' },
        { speaker: 'Survivor', text: 'The Wind Seal weakened and the storm patterns shifted over three generations. What was coast became archipelago. What were port cities became reefs.' },
        { speaker: 'Survivor', text: 'The Sunken Leviathan was already here when Valdris arrived. Drew to the concentrated elemental resonance of the submerged buildings. He just made sure it stayed.' },
        { speaker: 'Aya', text: 'The buildings are still there. Under the water.' },
        { speaker: 'Survivor', text: 'Everything is still there. The market stalls. The dock rings. A bell tower that still rings at high tide because the current moves through it the right way. I can hear it from here on clear nights.' },
        { speaker: 'Survivor', text: 'I stay because I am not ready to stop hearing that bell.' },
      ],

      // The Fisherman — western beach, practical and quiet
      southern_isles_fisher: [
        { speaker: 'Survivor', text: 'Still pulling fish from these waters. The storm took the boats, not the fish.' },
        { speaker: 'Aya', text: 'How long have you been here?' },
        { speaker: 'Survivor', text: 'Long enough that I stopped thinking of it as being stranded. Long enough that I built this.' },
        { speaker: 'Survivor', text: 'The western cove — used to be a loading bay. The city sent grain out from there every harvest. It had a name. I can\'t remember it now. That feels like its own kind of flooding.' },
        { speaker: 'Lulu', text: 'Do you want to leave?' },
        { speaker: 'Survivor', text: 'I want the Leviathan free and the gate open. After that? Ask me again. I haven\'t had an after that in a very long time.' },
      ],

      // The Lookout — high ground north, watches the trench obsessively
      southern_isles_lookout: [
        { speaker: 'Survivor', text: 'You can see it move from here. If you watch long enough. The water shifts in one direction, then — very slowly — the other. Something enormous breathing.' },
        { speaker: 'Rex', text: 'You\'ve been watching the Leviathan.' },
        { speaker: 'Survivor', text: 'Someone had to keep count. Seven years. It surfaces twice a tide cycle and descends again. Always the same depth. Always the same arc.' },
        { speaker: 'Survivor', text: 'It\'s not restless. It\'s patient. There\'s a difference. Restless means it wants out. Patient means it trusts something will change.' },
        { speaker: 'Rei', text: 'What does it trust?' },
        { speaker: 'Survivor', text: 'I used to think it was waiting for the bell. Now I think the bell is how it recognizes that someone worth waiting for has finally arrived.' },
      ],

      // The Child — near old dock remnants, grew up here after the flooding
      southern_isles_child: [
        { speaker: 'Survivor', text: 'My mother told me this used to be a street. Right here. I tried to imagine it but I couldn\'t. There\'s too much sky where the buildings would be.' },
        { speaker: 'Lulu', text: 'You were born after the flooding?' },
        { speaker: 'Survivor', text: 'My mother wasn\'t. She remembers the ports. She says the market bell used to ring every morning at the third hour. She says you could hear it across the whole city.' },
        { speaker: 'Survivor', text: 'Now it only rings at high tide. From underwater. I\'ve only ever heard it that way.' },
        { speaker: 'Survivor', text: 'She says that\'s sad. I don\'t think it is. I think it\'s the same bell learning to be something different.' },
        { speaker: 'Aya', text: 'That\'s a good way to think about it.' },
        { speaker: 'Survivor', text: 'Can you free it? The big creature? It sounds lonely when it breathes.' },
      ],
    },
  },

  guardian: {
    name: 'Coral Guardian',
    color: '#a78bfa',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Coral Guardian', text: 'The deep paths are sealed. The Abyssal Gate requires a shell that hums with the sea\'s resonance. Do you carry such a thing?' },
        { speaker: 'Aya', text: 'We carry elemental resonance from the Seals we have already freed.' },
        { speaker: 'Coral Guardian', text: '...That is not what I expected to hear from surface-walkers.' },
        { speaker: 'Coral Guardian', text: 'I was the border-guard of the old coastal civilization — before the flooding, before the Leviathan, before the reef claimed the market squares. My purpose was to protect the deep passage from those who would disturb the ocean\'s memory.' },
        { speaker: 'Rex', text: 'You\'ve been guarding an underwater gate since the flooding?' },
        { speaker: 'Coral Guardian', text: 'The gate does not know the city above it drowned. Neither do I, in the way that matters. Purpose does not require context to persist.' },
        { speaker: 'Coral Guardian', text: 'The Leviathan is below. It is not Valdris\'s creature — it was drawn here by the concentrated resonance of a thousand submerged buildings and it stayed. Valdris only ensured the gate was sealed so it could not leave. He needed it here as an anchor.' },
        { speaker: 'Coral Guardian', text: 'You carry freed Fragment resonance. The gate will read it as passage rights. Go. Whatever you free from the deep will make the ocean remember what it was for.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  EASTERN WETLANDS NPCs
  // ════════════════════════════════════════════════════════════════

  mire_witch: {
    name: 'Mire Witch',
    color: '#a78bfa',
    sprite: 'images/characters/map/sheets/npc/mire_witch_sheet.png',
    dialogues: {
      eastern_wetlands: [
        { speaker: 'Mire Witch', text: 'You want something. Everyone who finds this fire wants something.' },
        { speaker: 'Lulu', text: 'We need to pass through the deep mire. The path is corrupted.' },
        { speaker: 'Mire Witch', text: 'All the paths are corrupted. That stopped being useful information about six years ago.' },
        { speaker: 'Mire Witch', text: 'I can give you the spores to clear the fog in the deep mire. They\'ll cost you a memory you don\'t need.' },
        { speaker: 'Tao', text: 'How do you know which memories we don\'t need?' },
        { speaker: 'Mire Witch', text: 'I ask. You\'d be surprised how many people know exactly which memory they\'ve been carrying that does them no good and haven\'t had anyone to give it to.' },
        { speaker: 'Mire Witch', text: 'I keep them in the jars. Over there by the fire — those aren\'t potions. Those are what people left behind.' },
        { speaker: 'Lulu', text: 'Why keep them? If they\'re given up—' },
        { speaker: 'Mire Witch', text: 'In case someone comes back for them. No one has yet. But I was a healer once, and healers hold things for people who might need them again later.' },
        { speaker: 'Aya', text: 'You were with the Tide Priests.' },
        { speaker: 'Mire Witch', text: 'I was a water-healer from the temple. Fled inland when the flooding started. The wetlands were as far as I got before I understood I wasn\'t running toward anything — just away from something.' },
        { speaker: 'Mire Witch', text: 'I\'ve adapted to the mire. Adaptation here is a negotiation. You give something, you get something. It hasn\'t killed me yet. I take that as encouragement.' },
        { speaker: 'Mire Witch', text: 'The spores. A memory you don\'t need. That\'s my price. Take your time deciding.' },
      ],
    },
  },

  lost_soul: {
    name: 'Lost Soul',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      eastern_wetlands: [
        { speaker: 'Lost Soul', text: 'The swamp is so soft... it feels like a blanket. I stopped walking three days ago. Or maybe three weeks.' },
        { speaker: 'Lulu', text: 'You need to keep moving. If you stay too long the mire pulls you in.' },
        { speaker: 'Lost Soul', text: 'I know. I kept moving for a long time. I moved for months. East to west, west to east. Trying to find the part of the world that wasn\'t like this.' },
        { speaker: 'Lost Soul', text: 'I think that part is gone.' },
        { speaker: 'Tao', text: 'It\'s not gone. We came from outside the mire. It exists.' },
        { speaker: 'Lost Soul', text: 'I used to be a cartographer. I made maps of the five civilizations. Beautiful maps — hand-inked, with proper borders and trade routes and the names of everything.' },
        { speaker: 'Lost Soul', text: 'None of those maps are accurate anymore. All the borders are wrong. All the routes lead somewhere they shouldn\'t.' },
        { speaker: 'Lost Soul', text: 'I kept trying to update them and there was always something new that had changed. I got tired.' },
        { speaker: 'Aya', text: 'A map drawn after the world is restored would be worth making.' },
        { speaker: 'Lost Soul', text: '...I hadn\'t thought about that.' },
        { speaker: 'Lost Soul', text: 'That would be a map worth the ink.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  SKY RUINS NPCs
  // ════════════════════════════════════════════════════════════════

  sentinel: {
    name: 'Spectral Sentinel',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/knight_of_the_vale_sheet.png',
    dialogues: {
      sky_ruins: [
        { speaker: 'Spectral Sentinel', text: 'You are not erased. That is more than I can say for most who reach this altitude.' },
        { speaker: 'Rei', text: 'What are these ruins? They predate the five civilizations.' },
        { speaker: 'Spectral Sentinel', text: 'They predate everything with a name. The people who built them had no name in any record I have found. They built in places where gravity works differently because they understood something about the relationship between height and memory that no civilization after them ever rediscovered.' },
        { speaker: 'Aya', text: 'You have been here since before the five civilizations?' },
        { speaker: 'Spectral Sentinel', text: 'I have been here since the last person who understood these ruins asked me to remain. That was long before Valdris. Long before the Seals.' },
        { speaker: 'Tao', text: 'What are you guarding?' },
        { speaker: 'Spectral Sentinel', text: 'Records. The builders recorded events at altitude because at sufficient height, the elemental interference is minimal. The record is cleaner. Purer. Less likely to be overwritten.' },
        { speaker: 'Spectral Sentinel', text: 'The Storm Sentinel guards the apex — the highest archive. It is not Valdris\'s creature. It is the ruins\' own defense, still running the last instruction it was given: nothing reaches the apex that intends harm to the record.' },
        { speaker: 'Rei', text: 'We do not intend harm to records. We are trying to restore them.' },
        { speaker: 'Spectral Sentinel', text: 'Then the Sentinel will read you correctly. Move forward. The Aerolith Crystals need to be aligned before the upper path will hold weight. Approach each one with elemental resonance, not force. The ruins respond to acknowledgment, not assault.' },
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  SOUTHERN ISLES NPCs
  // ════════════════════════════════════════════════════════════════

  si_elder: {
    name: 'Elder',
    color: '#fcd34d',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    quests: ['naga_threat'],
    dialogues: {
      southern_isles: [
        { speaker: 'Elder', text: 'I was seven when the first market closed. Not because there were no buyers — because the docks were six feet underwater and you needed a skiff to reach the stalls.' },
        { speaker: 'Aya', text: 'You\'ve been here since before the flooding?' },
        { speaker: 'Elder', text: 'I have been here since the flooding was a rumor that old sailors laughed at. Then since it was a problem. Then since it was the shape of the world.' },
        { speaker: 'Elder', text: 'The bell tower. The one you can hear at high tide. Do you know what it was called? The Aethon Bell. Named for the sea current that runs through the trench. Aethon means \'the patient one\' in the old coastal dialect.' },
        { speaker: 'Rex', text: 'The patient one. Like the Leviathan.' },
        { speaker: 'Elder', text: 'Or like us. We are all Aethon here. We are all things that stayed when it would have been easier to go.' },
        { speaker: 'Elder', text: 'Free the creature below. The bell has been ringing for it long enough. It is time the sound meant something again.' },
      ],
    },
  },

  si_healer: {
    name: 'Healer',
    color: '#6ee7b7',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Healer', text: 'I need you to understand something before you go north. The Naga in the water — some of them were ours.' },
        { speaker: 'Lulu', text: 'What do you mean?' },
        { speaker: 'Healer', text: 'The shadow resonance from the trench. It bleeds into the water. People who spend too long wading the deep channels start changing. Slower first. Colder. Their eyes take longer to respond to light.' },
        { speaker: 'Healer', text: 'I have treated the early stages. I have not managed to reverse the late ones. I lost three people this year alone.' },
        { speaker: 'Tao', text: 'That\'s why you stay on high ground.' },
        { speaker: 'Healer', text: 'That\'s why I stay on high ground. And why I tell everyone who will listen: don\'t wade the trench water. Don\'t drink from the northern lagoon. Come back before dark.' },
        { speaker: 'Healer', text: 'When you reach the gate — whatever you do down there, do it quickly. The longer the trench stays active, the more of us it takes.' },
        { speaker: 'Aya', text: 'We\'ll move fast.' },
        { speaker: 'Healer', text: 'I know you will. You\'re the first people in seven years who came here with a plan instead of a shipwreck.' },
      ],
    },
  },

  si_builder: {
    name: 'Builder',
    color: '#93c5fd',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Builder', text: 'The northern bridges. Don\'t run on them.' },
        { speaker: 'Rex', text: 'Why?' },
        { speaker: 'Builder', text: 'Because I built them and I know which boards are lying about their structural integrity. The third plank from the east on the second span — it sounds fine. It is not fine. Step on the edge.' },
        { speaker: 'Lulu', text: 'How old are these bridges?' },
        { speaker: 'Builder', text: 'The original ones? Older than me. I\'ve been replacing planks as they go. It\'s a philosophical question at this point — when you\'ve replaced every board is it still the same bridge? Personally I think yes, because the intention is the same.' },
        { speaker: 'Builder', text: 'The intention is: get across without drowning. That hasn\'t changed.' },
        { speaker: 'Builder', text: 'I\'ll be honest with you. I don\'t know how much longer I can maintain the northern spans. If you\'re going to use them, go soon. And step lightly. And don\'t tell me if anything breaks because I won\'t have the materials to fix it and I prefer not knowing.' },
        { speaker: 'Rei', text: 'That\'s a very specific kind of optimism.' },
        { speaker: 'Builder', text: 'Fourteen years of structural maintenance will do that to a person.' },
      ],
    },
  },

  market_ghost: {
    name: 'Market Trader',
    color: '#e2e8f0',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Market Trader', text: 'Good morning! Excellent timing — the morning catch just came in. Fresh reef-cod, salted kelp, tide-pearl clusters — all at the standard harbor rate.' },
        { speaker: 'Aya', text: 'The market... there\'s nothing here. The stall is empty.' },
        { speaker: 'Market Trader', text: 'Nonsense. I stocked this morning same as always. The reef-cod is on the left. Don\'t let the kelp touch the pearls — the salt transfers and ruins the luster.' },
        { speaker: 'Lulu', text: 'Can you... can you see us clearly?' },
        { speaker: 'Market Trader', text: 'Of course. You\'re the first customers of the day. Always good to see travelers. Are you off the northern ferry? The schedule changed — they run every second tide now, not every first.' },
        { speaker: 'Rex', text: 'There is no northern ferry. The port is underwater.' },
        { speaker: 'Market Trader', text: '...' },
        { speaker: 'Market Trader', text: 'The northern ferry runs every second tide.' },
        { speaker: 'Lulu', text: 'I\'m sorry.' },
        { speaker: 'Market Trader', text: 'Will you be wanting the reef-cod? It doesn\'t keep past midday.' },
      ],
    },
  },

  kaelen: {
    name: 'Kaelen',
    color: '#f59e0b',
    sprite: 'images/characters/map/sheets/npc/kaelen_sheet.png',
    dialogues: {
      ember_wastes: [
        { speaker: 'Kaelen', text: 'My crawler is running smoothly now. Thanks again.' }
      ]
    }
  },

  scholar_vane: {
    name: 'Scholar Vane',
    color: '#60a5fa',
    sprite: 'images/characters/map/sheets/npc/vane_sheet.png',
    dialogues: {
      crystal_cavern_f2: [
        { speaker: 'Scholar Vane', text: 'The resonance is stable. The Archive is communicating.' }
      ]
    }
  },

  isle_merchant: {
    name: 'Isle Merchant',
    color: '#10b981',
    sprite: 'images/characters/map/sheets/npc/merchant_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Isle Merchant', text: 'Trade is finally flowing again. The tides are kind.' }
      ]
    }
  }
};
