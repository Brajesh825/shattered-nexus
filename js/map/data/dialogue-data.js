/**
 * dialogue-data.js — The "Brain" of the NPC Dialogue System.
 * Handles state-aware branching based on G.flags or quest progress.
 */

const DialogueController = (() => {
  
  const DIALOGUES = {
    'verdant_vale': [
      {
        condition: () => G.clearedMaps && G.clearedMaps.includes('aethelgard'),
        lines: [
          { speaker: 'Essabella', text: 'You actually cleared those ruins? I can feel the curse lifting already.' },
          { speaker: 'Essabella', text: 'Maybe one day we can restore the kingdom to what it once was.' }
        ]
      },
      {
        condition: () => true, // Default
        lines: [
          { speaker: 'Essabella', text: 'Be careful near the river. The ruins of Aethelgard are crawling with goblins.' },
          { speaker: 'Essabella', text: 'They say the Gilded King still sits on his throne... though he is but a shadow now.' }
        ]
      }
    ],
    
    'elder_maren': [
      {
        condition: () => G.clearedMaps && G.clearedMaps.includes('aethelgard'),
        lines: [
          { speaker: 'Elder Maren', text: 'The Greed King is gone. You have done this land a great service, young one.' },
          { speaker: 'Elder Maren', text: 'Rest here for as long as you need. The Vale is safe once more.' }
        ]
      },
      {
        condition: () => true,
        lines: [
          { speaker: 'Elder Maren', text: 'Welcome to the Verdant Vale. We are a peaceful folk, but the world outside is changing.' },
          { speaker: 'Elder Maren', text: 'The fog... it hasn\'t been this thick since the Great Shattering.' }
        ]
      }
    ],

    'soldier_chat': [
      {
        condition: () => true,
        lines: [
          { speaker: 'Soldier', text: 'Maintain the perimeter! We can\'t let those zombified things reach the village.' },
          { speaker: 'Soldier', text: 'Stay safe out there, traveler.' }
        ]
      }
    ],

    // ── Arc 2 — Crystal Cavern ────────────────────────────────────────────
    'essabella_cavern': [
      {
        condition: () => true,
        lines: [
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
        ]
      }
    ],

    'the_archivist': [
      {
        condition: () => true,
        lines: [
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
        ]
      }
    ],

    'ghost_knight': [
      {
        condition: () => true,
        lines: [
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
        ]
      }
    ]
  };

  function getLines(key) {
    const entry = DIALOGUES[key];
    if (!entry) return [{ speaker: '???', text: '...' }];

    // Find the first matching condition
    const match = entry.find(d => d.condition());
    return match ? match.lines : [{ speaker: '???', text: '...' }];
  }

  return { getLines };
})();
