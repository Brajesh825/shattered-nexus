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
        { speaker: 'Soldier Davan', text: 'Hold there. Give me a second to look you over.' },
        { speaker: 'Rei', text: 'We\'re not corrupted. What happened at the bridge?' },
        { speaker: 'Soldier Davan', text: 'Void Knight came through three nights back. My unit — eight of us — tried to hold it. He didn\'t kill them. He emptied them. They\'re still breathing. Standing at their posts. Just... not there anymore.' },
        { speaker: 'Aya', text: 'Void consumption. He drains something out of them.' },
        { speaker: 'Soldier Davan', text: 'One of them is my brother. We carried him back here. The medic doesn\'t know if it reverses.' },
        { speaker: 'Lulu', text: 'I\'m so sorry.' },
        { speaker: 'Soldier Davan', text: 'Save the sympathy for after. Right now we need that knight gone before he comes back for the rest of the settlement. Can you do it?' },
        { speaker: 'Rei', text: 'We will.' },
        { speaker: 'Soldier Davan', text: 'Then go. I\'ll hold this stretch of road. Watch for the empty ones on the way — they don\'t fight, but they don\'t move aside either.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Davan', text: 'My brother ate breakfast this morning. First time in three weeks. Couldn\'t hold a spoon yet, but he ate.' },
        { speaker: 'Tao', text: 'That\'s a good sign.' },
        { speaker: 'Soldier Davan', text: 'The medics say the empty ones are coming back the same way — slow. Recognition first, names second, hands last. Six others in the infirmary now.' },
        { speaker: 'Rei', text: 'And the bridge?' },
        { speaker: 'Soldier Davan', text: 'Patched the two planks Kael was worried about. Hauled new ones up from the carpenter. The eastern road is open again, properly this time.' },
      ],
    },
  },

  soldier_2: {
    name: 'Soldier Kael',
    color: '#64748b',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'Soldier Kael', text: 'Halt. Names and direction of travel.' },
        { speaker: 'Aya', text: 'Travelers, summoned. Heading east to the ruins for the Seal Fragment.' },
        { speaker: 'Soldier Kael', text: 'East. Right.' },
        { speaker: 'Soldier Kael', text: 'You\'re the first people in two weeks moving that direction on purpose. Refugees come through this gate seven, eight a day — all of them heading the other way.' },
        { speaker: 'Rei', text: 'How long have you held this post alone?' },
        { speaker: 'Soldier Kael', text: 'Six days. Three others rotated south to reinforce the watch. Haven\'t heard back. Could mean the road\'s cut, could mean they got busy.' },
        { speaker: 'Tao', text: 'That\'s a lot of unknowns.' },
        { speaker: 'Soldier Kael', text: 'It\'s a gate. Gate needs someone at it. The math is simple.' },
        { speaker: 'Soldier Kael', text: 'Go through. If you spot any of my people on the eastern road — Mira, Tem, or Sergeant Holt — tell them to come home.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Kael', text: 'East gate is open. First refugee caravan came through at dawn — sixty-three people, half of them sick, all of them tired.' },
        { speaker: 'Aya', text: 'You handled it alone?' },
        { speaker: 'Soldier Kael', text: 'Davan came down from the bridge to help with the count. Two of the southern scouts walked in behind them — Mira and Tem. Thought we\'d lost them.' },
        { speaker: 'Soldier Kael', text: 'Eastern wall needs reinforcing before winter. We\'ve been making lists. Lumber, salt, three more bunks for the infirmary. Honest work, for once.' },
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
        { speaker: 'Aya', text: 'We\'re moving toward it. We need what\'s in the ruins.' },
        { speaker: 'Soldier Jace', text: 'Toward it. Right. Let me make a note for the count.' },
        { speaker: 'Soldier Jace', text: 'Refugees coming through report the same three things. Shadows that pace them along the road. Patrol checkpoints with soldiers still standing but unresponsive. The bridge ward flickering at sundown.' },
        { speaker: 'Soldier Jace', text: 'We\'re short on food, short on bandages, and the eastern wall has two breaches we can\'t fix until the threat\'s gone. If you can clear what\'s in those ruins, you\'ll be doing the carpenters and the cooks a favor.' },
        { speaker: 'Lulu', text: 'You were stationed at the capital, weren\'t you?' },
        { speaker: 'Soldier Jace', text: '...How did you know?' },
        { speaker: 'Lulu', text: 'The way you keep notes. Capital records officer?' },
        { speaker: 'Soldier Jace', text: 'Quartermaster. Same idea. Go on through — and bring back word, if you can. People here need to know the east is solvable.' },
      ],
      verdant_vale_post_arc: [
        { speaker: 'Soldier Jace', text: 'You came back. That makes — let me check the list — eleven people through this gate who said they would and did.' },
        { speaker: 'Aya', text: 'You\'re keeping count?' },
        { speaker: 'Soldier Jace', text: 'Habit from the capital. You log every patrol in and out. Some habits are worth keeping.' },
        { speaker: 'Soldier Jace', text: 'Food shipment from the western farms came through yesterday. First proper grain we\'ve seen since the harvest. The cooks are baking again.' },
        { speaker: 'Lulu', text: 'That sounds like something close to normal.' },
        { speaker: 'Soldier Jace', text: 'Close enough. I\'ll take close enough.' },
      ],
    },
  },

  lira: {
    name: 'Lira',
    color: '#4ade80',
    sprite: 'images/characters/map/sheets/npc/lira_sheet.png',
    quests: ['locket_lost', 'lira_second_chance'],
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
    dissolveAfterQuest: 'bones_of_the_fallen',
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
      crystal_cavern_f1_post_arc: [
        { speaker: 'The Archivist', text: 'The heat has broken. I can feel the ice coming back to the walls. The Demon Lord... he is no longer part of the resonance.' },
        { speaker: 'The Archivist', text: 'Solvan. That was his name. He was the head of this archive once. He wanted to preserve everything. In the end, he preserved nothing but his own fire.' },
        { speaker: 'The Archivist', text: 'I will stay. There is a new entry to write. A victory. It has been a long time since I had one of those to record.' },
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
      crystal_cavern_f2_post_arc: [
        { speaker: 'Ghost Knight', text: 'The screaming... it stopped. The fire is gone.' },
        { speaker: 'Ghost Knight', text: 'I remember Solvan. He was... a good man, before the Fragment. He spent forty years in the dark just to make sure we weren\'t forgotten.' },
        { speaker: 'Ghost Knight', text: 'The Cavern is quiet. For the first time in a century, it is just a cave again. Thank you.' },
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
        { speaker: 'Old Guard', text: 'Bridge has been out three weeks. The River King doesn\'t like people trying to cross what isn\'t there.' },
        { speaker: 'Rex', text: 'What happened to the bridge?' },
        { speaker: 'Old Guard', text: 'River King took it. Pulled the planks under one by one. We watched from this bank — couldn\'t stop it.' },
        { speaker: 'Aya', text: 'The River King was neutral once. The records say it let everyone through.' },
        { speaker: 'Old Guard', text: 'Right. Took a truth as toll. Couldn\'t cross while lying — the river always knew.' },
        { speaker: 'Old Guard', text: 'Then Valdris\'s corruption hit the water table. Two centuries of fair crossings, gone in a week.' },
        { speaker: 'Rei', text: 'It tried to stay neutral. The corruption took it anyway.' },
        { speaker: 'Old Guard', text: 'Aye. Some fights you can\'t sit out. Learned that the hard way.' },
        { speaker: 'Old Guard', text: 'The ford downstream is passable at low tide. Go at dusk. Don\'t make deals with anything that talks in the water.' },
      ],
    },
  },

  ghost_soldier: {
    name: 'Ghost Soldier',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/knight_of_the_vale_sheet.png',
    dialogues: {
      riverlands_crossing: [
        { speaker: 'Ghost Soldier', text: 'Was guarding the supply cache when the water turned black. My unit had crossed already. I watched from the east bank.' },
        { speaker: 'Lulu', text: 'What happened to them?' },
        { speaker: 'Ghost Soldier', text: 'Water didn\'t kill them. Changed them. They reached the other side and just stood there. Waiting for orders.' },
        { speaker: 'Tao', text: 'And you?' },
        { speaker: 'Ghost Soldier', text: 'I held the cache. That was my post. Held it after the bridge went down. Held it after I knew nobody was coming for the supplies.' },
        { speaker: 'Ghost Soldier', text: 'Still holding, I suppose. Old habit.' },
        { speaker: 'Aya', text: 'What was in the cache?' },
        { speaker: 'Ghost Soldier', text: 'Field rations. Bandages. A letter for someone in the southern settlement. Never found out if she got it.' },
        { speaker: 'Lulu', text: 'We\'ll finish what you started.' },
        { speaker: 'Ghost Soldier', text: '...Loose stone in the east wall. What\'s behind it is yours now. Better with you than with me.' },
      ],
      crystal_cavern_f3_soldier: [
        { speaker: 'Ghost Soldier', text: 'Shh... stay low. The Guardian patrols the South West passage.' },
        { speaker: 'Ghost Soldier', text: 'It shatters into shards when pushed to the limit, but the core... the core always reforms. We cannot breach it alone.' },
        { speaker: 'Ghost Soldier', text: 'Vane is trying to calibrate the resonance to help. Speak to him.' }
      ]
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
        { speaker: 'Cursed Miner', text: 'Don\'t go deeper. The basalt sealed the south tunnel again — third time this week.' },
        { speaker: 'Rex', text: 'You\'re still mining? After everything?' },
        { speaker: 'Cursed Miner', text: 'We worked the shaft two years after the Forge Lords fell. No one told us to stop, so we didn\'t.' },
        { speaker: 'Cursed Miner', text: 'Then the basalt started shifting. The stone moves on its own now — slow, but it moves.' },
        { speaker: 'Aya', text: 'The Void-metal contamination. It spread into the stone.' },
        { speaker: 'Cursed Miner', text: 'Three of my crew went down to check the lower ore vein last week. They\'re still down there.' },
        { speaker: 'Cursed Miner', text: 'They keep swinging picks at empty rock. Won\'t answer when called. Won\'t come up for food.' },
        { speaker: 'Tao', text: 'The Golem is in those shafts.' },
        { speaker: 'Cursed Miner', text: 'Something\'s in there. We hear hammering all night long. Whatever it\'s building, it never ships.' },
        { speaker: 'Rex', text: 'We\'ll handle what\'s in the deep shaft. Stay near the entrance.' },
        { speaker: 'Cursed Miner', text: 'I\'ll keep the lift hoist ready. Bring my crew back if you can. They have families east.' },
      ],
    },
  },

  flame_spirit: {
    name: 'Flame Spirit',
    color: '#ef4444',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      ashen_foothills: [
        { speaker: 'Flame Spirit', text: '...The forge fires. We are what was left when the forges went cold.' },
        { speaker: 'Lulu', text: 'You were part of the Forge Lords?' },
        { speaker: 'Flame Spirit', text: 'Every anvil flame. Every hammer-spark. When the smiths turned to metal themselves, the heat had nowhere to go.' },
        { speaker: 'Tao', text: 'So you\'re the warmth they left behind.' },
        { speaker: 'Flame Spirit', text: 'We are what they discarded. They wanted to be indestructible. The cost was the fire that made them human.' },
        { speaker: 'Flame Spirit', text: 'The Golem in the deep shaft was their First Smith. Her last order was to keep working. She still does.' },
        { speaker: 'Aya', text: 'What is she making down there?' },
        { speaker: 'Flame Spirit', text: 'Nothing finishable. The order outlived the project. Watch your step — the heat thins the air, but it will not burn you if you walk steady.' },
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
        { speaker: 'Highland Monk', text: 'You\'re early. Dawn prayer isn\'t finished.' },
        { speaker: 'Rei', text: 'Who do you pray for?' },
        { speaker: 'Highland Monk', text: 'The last dragon. Every morning, eleven years running. Force of habit by now.' },
        { speaker: 'Tao', text: 'You pray for the thing that wrecked this place?' },
        { speaker: 'Highland Monk', text: 'Seven of them once. Six couldn\'t adapt when the elements failed. They starved. Only one found a way to keep going.' },
        { speaker: 'Highland Monk', text: 'It survived by absorbing void energy. Whatever it became, it\'s still up there. Hungry.' },
        { speaker: 'Lulu', text: 'And the prayers help?' },
        { speaker: 'Highland Monk', text: 'They keep me sharp. The wind up here will hollow you out if you don\'t have a rhythm to hold.' },
        { speaker: 'Highland Monk', text: 'My scouts haven\'t come back from the western ridge in four days. Watch your footing — the trails crumble after every storm.' },
        { speaker: 'Rei', text: 'We are going to face the dragon.' },
        { speaker: 'Highland Monk', text: 'Then take warm cloaks from the chest by the shrine. The pass freezes by dusk.' },
      ],
    },
  },

  fallen_climber: {
    name: 'Fallen Climber',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      northern_highlands: [
        { speaker: 'Fallen Climber', text: 'Don\'t try the summit. I know you\'re thinking about it. Don\'t.' },
        { speaker: 'Drake', text: 'What happened to you?' },
        { speaker: 'Fallen Climber', text: 'Got within thirty paces of the upper ridge. Thirty seconds of view, then a shadow crossed the sky. Wasn\'t a cloud.' },
        { speaker: 'Fallen Climber', text: 'The dragon doesn\'t hunt. It just moves. If you\'re in its line, you\'re finished. No malice. Just weight.' },
        { speaker: 'Aya', text: 'What did you see from the ridge? Before it came.' },
        { speaker: 'Fallen Climber', text: 'The whole range, all the way to the northern edge. Six empty hollows where the other dragons used to roost. Big enough to walk a fortress into.' },
        { speaker: 'Fallen Climber', text: 'It was beautiful. I\'ll give it that.' },
        { speaker: 'Drake', text: 'Sounds like it was worth the climb.' },
        { speaker: 'Fallen Climber', text: 'Three broken ribs and a busted ankle. Worth every bone. Take the eastern switchback — west side\'s collapsed.' },
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
        { speaker: 'Old Mariner', text: 'Just before midnight — perfect timing if you\'re curious about ghost ships.' },
        { speaker: 'Tao', text: 'Ghost ships?' },
        { speaker: 'Old Mariner', text: 'Every midnight, the same merchant vessel rounds the outer reef. Last one to leave the Southern Isles before the flooding.' },
        { speaker: 'Old Mariner', text: 'Crew died crossing. Ship kept sailing. Same route, every night, for a hundred years.' },
        { speaker: 'Lulu', text: 'That\'s heartbreaking.' },
        { speaker: 'Old Mariner', text: 'I\'ve tended this lighthouse thirty years. Watched it every night.' },
        { speaker: 'Old Mariner', text: 'And here\'s the strange part — it\'s drifting closer. A few feet of bearing each year. Like it\'s finally finding the path.' },
        { speaker: 'Rex', text: 'You think it\'s steering home?' },
        { speaker: 'Old Mariner', text: 'Maybe. I keep the lamp lit so it has a beacon if it ever does.' },
        { speaker: 'Old Mariner', text: 'Living sailors know the reef. The dead might still need a light. Costs me nothing to leave it burning.' },
        { speaker: 'Aya', text: 'A thirty-year vigil for a single ship.' },
        { speaker: 'Old Mariner', text: 'Lighthouse work is mostly waiting. Better to wait for something than for nothing.' },
      ],
    },
  },

  sea_spirit: {
    name: 'Sea Spirit',
    color: '#2dd4bf',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      lighthouse_isles: [
        { speaker: 'Sea Spirit', text: 'You smell of stone and fire. The sea hasn\'t taken you yet.' },
        { speaker: 'Aya', text: 'Are you a remnant of the Tide civilization?' },
        { speaker: 'Sea Spirit', text: 'I\'m a remnant of the water itself. The Tide Priests built their order around me. When they fell, the water stayed. Just sicker.' },
        { speaker: 'Sea Spirit', text: 'This lighthouse used to guide trade routes — merchants, healers, the whole isle network depended on it.' },
        { speaker: 'Lulu', text: 'And now?' },
        { speaker: 'Sea Spirit', text: 'Now it marks the wrecks. The corrupted currents drag ships off-course. Most don\'t come back.' },
        { speaker: 'Sea Spirit', text: 'The Seal Fragment here still carries clean ocean memory. Oremis tried to heal using deep-water knowledge. The Fragment swallowed him before he could.' },
        { speaker: 'Sea Spirit', text: 'When you face what he became — remember he started out wanting to help. The intention was real, even if the result wasn\'t.' },
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
        { speaker: 'Survivor', text: 'The tide pulled my ship into the trench. Eleven of us aboard. I\'m the only one who climbed back out.' },
        { speaker: 'Lulu', text: 'I\'m so sorry. How long have you been alone?' },
        { speaker: 'Survivor', text: 'Lost track. Long enough to name every rock on this beach. Long enough to talk to them on slow days.' },
        { speaker: 'Survivor', text: 'This was all coastline once. Ports, cities, harbor towns — one big shoreline stretched east to west.' },
        { speaker: 'Rex', text: 'What happened to it?' },
        { speaker: 'Survivor', text: 'Wind Seal weakened over three generations. Storms shifted. The shore broke apart and the cities went under.' },
        { speaker: 'Survivor', text: 'The Sunken Leviathan was already here when Valdris arrived. He just sealed the trench so it couldn\'t leave.' },
        { speaker: 'Aya', text: 'The buildings are still down there.' },
        { speaker: 'Survivor', text: 'Whole markets. Dock rings. A bell tower the current still rings at high tide — sounds carry up on clear nights.' },
        { speaker: 'Survivor', text: 'That bell is why I stay. Until it stops, I figure something\'s still alive down there.' },
      ],

      // The Fisherman — western beach, practical and quiet
      southern_isles_fisher: [
        { speaker: 'Survivor', text: 'Still pulling fish from these waters. The storm took the boats, not the fish.' },
        { speaker: 'Aya', text: 'How long have you been here?' },
        { speaker: 'Survivor', text: 'Long enough to stop calling it being stranded. Long enough to build this shack.' },
        { speaker: 'Survivor', text: 'The western cove used to be a loading bay. Sent grain out every harvest. Had a name once — I forget it.' },
        { speaker: 'Lulu', text: 'Do you want to leave?' },
        { speaker: 'Survivor', text: 'I want the Leviathan freed and the gate open. After that? Ask me later. I\'ll have a thought ready.' },
      ],

      // The Lookout — high ground north, watches the trench obsessively
      southern_isles_lookout: [
        { speaker: 'Survivor', text: 'From up here you can see it move. Water shifts one way, then back. Something huge, breathing.' },
        { speaker: 'Rex', text: 'You\'ve been watching the Leviathan.' },
        { speaker: 'Survivor', text: 'Seven years. Surfaces twice a tide cycle, same depth, same arc. Predictable as a clock.' },
        { speaker: 'Survivor', text: 'It\'s not raging. It\'s waiting. Big difference. Whatever it\'s waiting for, it expects it to come.' },
        { speaker: 'Rei', text: 'Any guess what?' },
        { speaker: 'Survivor', text: 'Used to think it was the old market bell. Now I think it might be you lot. Don\'t make it wait much longer.' },
      ],

      // The Child — near old dock remnants, grew up here after the flooding
      southern_isles_child: [
        { speaker: 'Survivor', text: 'Mum says this used to be a street. I can\'t picture it. Too much sky where the buildings should be.' },
        { speaker: 'Lulu', text: 'You were born after the flooding?' },
        { speaker: 'Survivor', text: 'Mum wasn\'t. She remembers the market bell ringing every morning at third hour. Says you could hear it across the city.' },
        { speaker: 'Survivor', text: 'Now it only rings at high tide. From under the water. That\'s the only bell I\'ve ever known.' },
        { speaker: 'Survivor', text: 'Mum says that\'s sad. I think it\'s just a different kind of bell.' },
        { speaker: 'Aya', text: 'That\'s a good way to think about it.' },
        { speaker: 'Survivor', text: 'Can you free the big creature? It sounds lonely when it breathes.' },
      ],
    },
  },

  guardian: {
    name: 'Coral Guardian',
    color: '#a78bfa',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'Coral Guardian', text: 'The deep paths are sealed. The Abyssal Gate needs a shell humming with sea-resonance. Do you carry one?' },
        { speaker: 'Aya', text: 'We carry resonance from the Seals we have already freed.' },
        { speaker: 'Coral Guardian', text: '...Not what I expected from surface-walkers.' },
        { speaker: 'Coral Guardian', text: 'I was border-guard of the old coastal civilization. Before the flooding. Before the Leviathan. My job was to keep the deep passage clear.' },
        { speaker: 'Rex', text: 'You\'ve been guarding it underwater all these centuries?' },
        { speaker: 'Coral Guardian', text: 'The gate doesn\'t know the city above drowned. I keep the post the same way I always did. Simpler that way.' },
        { speaker: 'Coral Guardian', text: 'The Leviathan is below. Not Valdris\'s — it came on its own, drawn by the buildings\' resonance. He just locked the gate so it couldn\'t leave.' },
        { speaker: 'Coral Guardian', text: 'Your Fragment-resonance will read as a valid pass. Go. Free what\'s down there. The ocean has been waiting.' },
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
        { speaker: 'Mire Witch', text: 'Everyone who finds this fire wants something. Let\'s skip the small talk.' },
        { speaker: 'Lulu', text: 'We need to pass through the deep mire. The path\'s corrupted.' },
        { speaker: 'Mire Witch', text: 'Every path is corrupted. Has been for six years. The trick is which corruption you can outlast.' },
        { speaker: 'Mire Witch', text: 'I have clearing-spores that handle the fog. Price: one memory you don\'t need. Your choice which.' },
        { speaker: 'Tao', text: 'How do you know which we don\'t need?' },
        { speaker: 'Mire Witch', text: 'I ask. Most people know exactly which memory has been weighing them down.' },
        { speaker: 'Mire Witch', text: 'I store them in jars by the fire. Not potions — those are what travelers left behind.' },
        { speaker: 'Lulu', text: 'Why keep them?' },
        { speaker: 'Mire Witch', text: 'In case anyone comes back for them. No one has yet, but old habits die hard. I was a healer in another life.' },
        { speaker: 'Aya', text: 'You were with the Tide Priests.' },
        { speaker: 'Mire Witch', text: 'Water-healer from the temple. When the flooding started, I ran inland. The mire was as far as my legs would carry.' },
        { speaker: 'Mire Witch', text: 'The wetland trades fair if you trade honest. I haven\'t died yet — I take that as a good sign.' },
        { speaker: 'Mire Witch', text: 'Spores for a memory. Take your time deciding. The fog isn\'t going anywhere.' },
      ],
    },
  },

  lost_soul: {
    name: 'Lost Soul',
    color: '#94a3b8',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    dialogues: {
      eastern_wetlands: [
        { speaker: 'Lost Soul', text: 'The mud\'s soft here. Sat down three days ago. Or three weeks. Hard to say.' },
        { speaker: 'Lulu', text: 'You have to keep moving. The mire pulls you under if you stay too long.' },
        { speaker: 'Lost Soul', text: 'I walked for months. East to west, west to east. Trying to find ground that wasn\'t rotting.' },
        { speaker: 'Lost Soul', text: 'Never found any. Gave up looking.' },
        { speaker: 'Tao', text: 'There\'s clean ground. We just walked from it. It exists.' },
        { speaker: 'Lost Soul', text: 'I was a cartographer once. Hand-inked maps of the five civilizations. Borders, trade routes, every village named.' },
        { speaker: 'Lost Soul', text: 'None of them are accurate now. Borders shifted, towns drowned, routes lead nowhere.' },
        { speaker: 'Lost Soul', text: 'I kept trying to redraw them. The world kept changing faster than my ink dried.' },
        { speaker: 'Aya', text: 'A map of the world after it\'s restored would be worth drawing.' },
        { speaker: 'Lost Soul', text: '...Hadn\'t thought of it that way.' },
        { speaker: 'Lost Soul', text: 'That would be a map worth the ink. Maybe I\'ll stand up for that one.' },
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
        { speaker: 'Spectral Sentinel', text: 'You\'re still solid. That\'s rare at this altitude.' },
        { speaker: 'Rei', text: 'What are these ruins? They predate the five civilizations.' },
        { speaker: 'Spectral Sentinel', text: 'Older than any record I\'ve found. The builders left no name. They worked up here because thin air keeps records clean.' },
        { speaker: 'Aya', text: 'You\'ve been here that long?' },
        { speaker: 'Spectral Sentinel', text: 'Since the last keeper asked me to stay. Long before Valdris. Long before the Seals.' },
        { speaker: 'Tao', text: 'What\'s the job?' },
        { speaker: 'Spectral Sentinel', text: 'Guarding the archive. Up here, the elemental interference is low — the writing stays legible. Down below, everything gets overwritten.' },
        { speaker: 'Spectral Sentinel', text: 'The Storm Sentinel guards the apex. Old defense system, not Valdris\'s. Its standing order: stop anyone who means harm to the record.' },
        { speaker: 'Rei', text: 'We don\'t mean harm. We\'re trying to restore the world.' },
        { speaker: 'Spectral Sentinel', text: 'Then it will let you through. Align the Aerolith Crystals before the upper path will bear weight. Use resonance, not force — these stones answer to touch, not pressure.' },
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
        { speaker: 'Elder', text: 'I was seven when the first market closed. Docks went under — needed a skiff to reach the stalls.' },
        { speaker: 'Aya', text: 'You\'ve been here since before the flooding?' },
        { speaker: 'Elder', text: 'Before it was a rumor. Before it was a problem. Before it was just the shape of things.' },
        { speaker: 'Elder', text: 'That bell at high tide? Aethon Bell. Named for the trench current. \'Aethon\' meant \'the patient one\' in the old coastal tongue.' },
        { speaker: 'Rex', text: 'The patient one. Like the Leviathan.' },
        { speaker: 'Elder', text: 'Or like us. Everyone here stayed when leaving would\'ve been smarter.' },
        { speaker: 'Elder', text: 'Free the creature below. The bell\'s been calling for it long enough. Time the sound meant something.' },
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
        { speaker: 'Market Trader', text: 'Morning! Catch just came in — reef-cod, salted kelp, tide-pearls. All at harbor rate.' },
        { speaker: 'Aya', text: 'The stall... it\'s empty. There\'s nothing here.' },
        { speaker: 'Market Trader', text: 'Nonsense. Stocked it this morning. Reef-cod on the left. Keep the kelp off the pearls — salt ruins the luster.' },
        { speaker: 'Lulu', text: 'Can you... see us clearly?' },
        { speaker: 'Market Trader', text: 'Of course! First customers of the day. Did you come in on the northern ferry? Schedule changed — runs every second tide now.' },
        { speaker: 'Rex', text: 'There is no northern ferry. The port is underwater.' },
        { speaker: 'Market Trader', text: '...' },
        { speaker: 'Market Trader', text: 'The northern ferry runs every second tide.' },
        { speaker: 'Lulu', text: 'I\'m so sorry.' },
        { speaker: 'Market Trader', text: 'Will you be wanting the reef-cod? Doesn\'t keep past midday.' },
      ],
    },
  },

  kaelen: {
    name: 'Kaelen',
    color: '#f59e0b',
    sprite: 'images/characters/map/sheets/npc/kaelen_sheet.png',
    quests: ['forge_relics'],
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
    quests: ['resonance_cull'],
    dialogues: {
      crystal_cavern_f2: [
        { speaker: 'Scholar Vane', text: 'The resonance is stable. The Archive is communicating.' }
      ],
      crystal_cavern_f2_post_arc: [
        { speaker: 'Scholar Vane', text: 'The signal! It\'s clear! The Fire Seal\'s interference has vanished.' },
        { speaker: 'Scholar Vane', text: 'I can finally hear the baseline of the world again. We have a lot of work to do. Ashveil is finally reachable!' },
      ],
      crystal_cavern_f3_vane: [
        { speaker: 'Scholar Vane', text: 'You! You made it deeper than any of my scouts.' },
        { speaker: 'Scholar Vane', text: 'The resonance down here is suffocating. Those crystal shards... they are siphoning the core\'s data and feeding it back as static.' },
        { speaker: 'Scholar Vane', text: 'Clear out 5 of those resonant shards. If I can get a clean reading, I might be able to find the frequency that shatters the Guardian\'s armor.' },
        { speaker: 'Aya', text: 'We\'re on it, Vane.' }
      ]
    }
  },

  isle_merchant: {
    name: 'Isle Merchant',
    color: '#10b981',
    sprite: 'images/characters/map/sheets/npc/merchant_sheet.png',
    quests: ['tide_clearance'],
    dialogues: {
      southern_isles: [
        { speaker: 'Isle Merchant', text: 'Trade is finally flowing again. The tides are kind.' }
      ],
      riverlands_crossing: [
        { speaker: 'Isle Merchant', text: 'Ah, travelers! You must have steady footing to walk the Great Cascade\'s ledge.' },
        { speaker: 'Isle Merchant', text: 'The River King sits on the keystone ahead. I\'d sell you passage wares, but no coin buys favor from a water spirit that has forgotten its original pact.' }
      ]
    }
  },
  ruin_closure: {
    name: 'Offering Point',
    color: '#ffffff',
    sprite: 'images/environment/png/offering_point.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'narrator', text: 'The air here is clear of shadow. You place Lira\'s locket among the stone fragments of the eastern bridge.' },
        { speaker: 'narrator', text: 'For a second, the blue gem pulses with a soft, warm light \u2014 the light of a home that was never forgotten.' },
        { speaker: 'narrator', text: 'Rest well, Arren. The road is yours no longer.' }
      ]
    }
  },

  galdor_decree_stone: {
    name: 'Weathered Slab',
    color: '#eab308',
    sprite: 'images/environment/png/offering_point.png',
    dialogues: {
      verdant_vale: [
        { speaker: 'narrator', text: 'Deep runic carvings glint with faint golden residue upon the stone.' },
        { speaker: 'Rune Stone', text: '"Decree of Sovereign Galdor: Let every vault be unsealed. The metal of the stars offers immunity against the coming rot. We trade our names for weight."' },
        { speaker: 'Rei', text: 'He traded his civilization\'s humanity to fuse with Void-Gild... thinking it would save them.' },
        { speaker: 'Aya', text: 'It saved them from dying. But it didn\'t save them from the Void.' }
      ]
    }
  },

  dying_royal_guard: {
    name: 'Fallen Guard',
    color: '#9ca3af',
    sprite: 'images/characters/map/sheets/npc/soldier_sheet.png',
    quests: ['the_hollow_guard'],
    dissolveAfterQuest: 'the_hollow_guard',
    dialogues: {
      verdant_vale: [
        { speaker: 'Fallen Guard', text: 'The air feels lighter now... my squad\'s resonance has faded into peace.' }
      ]
    }
  },

  holographic_log_orb: {
    name: 'Crystal Orb',
    color: '#38bdf8',
    sprite: 'images/characters/map/sheets/npc/holographic_log_orb_sheet.png',
    dialogues: {
      crystal_cavern_f1: [
        { speaker: 'narrator', text: 'A smooth crystalline sphere rests upon a stone pedestal. Touching its surface triggers a faint, shimmering projection.' },
        { speaker: 'Hologram Echo', text: '"Archive Log 409: The core data relay is failing. Solvan insists on routing secondary logic strings through the Fire Fragment interface to preserve access. He does not see that the interface is siphoning our identities."' },
        { speaker: 'Tao', text: 'Solvan became the Demon Lord because he refused to let the Sky Archive go offline.' },
        { speaker: 'Lulu', text: 'A desire to preserve knowledge... twisted into endless burning.' }
      ]
    }
  },

  ancient_tide_bell: {
    name: 'Tide Bell',
    color: '#0ea5e9',
    sprite: 'images/characters/map/sheets/npc/ancient_tide_bell_sheet.png',
    dialogues: {
      southern_isles: [
        { speaker: 'narrator', text: 'You strike the rusted metal of the ancient Tide Bell. A deep, crystalline chime reverberates down through the ocean layers.' },
        { speaker: 'narrator', text: 'The shallow waters swirl. A massive, peaceful Sea Turtle surfaces near the stilt platform, drawn by the pure frequency.' },
        { speaker: 'Sea Turtle', text: '✦ BLESSING OF THE DEEP GRANTED: Maximum party HP buffers reinforced permanently (+5 Max HP).' },
        { speaker: 'Lulu', text: 'It remembers the old trade paths... before the Leviathan took the channel.' }
      ]
    }
  },

  toll_bridge_marker: {
    name: 'River Marker',
    color: '#06b6d4',
    sprite: 'images/characters/map/sheets/npc/toll_bridge_marker_sheet.png',
    dialogues: {
      riverlands_crossing: [
        { speaker: 'narrator', text: 'A carved stone pillar rises from the rushing water, blocking the bridge keystone.' },
        { speaker: 'River Spirit Echo', text: '"Who passes the neutral domain? Deliver your tribute of truth or forfeit your kinetic weight to the current."' },
        { speaker: 'Tao', text: 'We owe nothing to a king who surrendered his borders to Void-Gild.' },
        { speaker: 'narrator', text: '⚠ The water swirls violently! High-level water elementals manifest upon the bridge planks!' }
      ]
    }
  },

  guilt_ridden_merchant: {
    name: 'Guilt-Ridden Merchant',
    color: '#f59e0b',
    sprite: 'images/characters/map/sheets/npc/merchant_sheet.png',
    quests: ['price_of_neutrality'],
    dialogues: {
      riverlands_crossing: [
        { speaker: 'Guilt-Ridden Merchant', text: 'Thank you for breaking the idol\'s hold. The waters are clear for crossing.' }
      ]
    }
  },

  bone_shard: {
    name: 'Bone Shard',
    color: '#e2e8f0',
    sprite: 'images/characters/map/sheets/npc/bone_shard_sheet.png',
    dissolveOnGather: true,
    dialogues: {
      crystal_cavern_f1: [
        { speaker: 'narrator', text: 'You carefully retrieve a crystalline bone fragment from the cavern floor. A faint hum resonates inside the marrow.' }
      ]
    }
  },

  silver_locket: {
    name: 'Silver Locket',
    color: '#38bdf8',
    sprite: 'images/characters/map/sheets/npc/silver_locket_sheet.png',
    dissolveOnGather: true,
    dialogues: {
      verdant_vale: [
        { speaker: 'narrator', text: 'You uncover a delicate silver locket with a small blue gem resting in the dirt. It feels strangely warm.' }
      ]
    }
  },

  squad_insignia: {
    name: 'Squad Insignia',
    color: '#eab308',
    sprite: 'images/characters/map/sheets/npc/squad_insignia_sheet.png',
    dissolveOnGather: true,
    dialogues: {
      verdant_vale: [
        { speaker: 'narrator', text: 'You recover a mud-stained, golden insignia of the Royal Vanguard. A cold resonance dissipates from the metal.' }
      ]
    }
  },

  cursed_idol: {
    name: 'Cursed Idol',
    color: '#ef4444',
    sprite: 'images/characters/map/sheets/npc/cursed_idol_sheet.png',
    dissolveOnGather: true,
    dialogues: {
      riverlands_crossing: [
        { speaker: 'narrator', text: 'You pry the Void-sealed idol from the tangled river weeds. Purifying its core shatters the River King\'s ambient barrier.' }
      ]
    }
  },
  spectral_collector: {
    name: 'Spectral Collector',
    color: '#a0aec0',
    sprite: 'images/characters/map/sheets/npc/vane_sheet.png',
    dialogues: {
      crystal_cavern_f3_toll: [
        { speaker: 'Spectral Collector', text: 'Stop. The Archive is not a public thoroughfare.' },
        { speaker: 'Tao', text: 'We noticed. The welcoming committee tried to eat us.' },
        { speaker: 'Spectral Collector', text: 'They are merely ensuring that only those with resonant weight may proceed. Do you carry the frequency of the surface, or the silence of the void?' },
        { speaker: 'Aya', text: 'We carry the light of the Shattered Nexus.' },
        { speaker: 'Spectral Collector', text: '...Acceptable. You may pass, but your presence is noted in the Ledger of the Fallen. Move quickly. The Guardian does not like being ignored.' },
      ]
    }
  }
};
