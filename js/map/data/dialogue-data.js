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
