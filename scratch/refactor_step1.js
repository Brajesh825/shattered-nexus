const fs = require('fs');

const FILE = 'js/battle/action-handler.js';
let content = fs.readFileSync(FILE, 'utf8');

// The goal: Extract the large `if (ab.type === ...)` block inside `heroAbility`
// and turn it into `ActionEngine.Processors`.

// We will inject the ActionEngine structure right after resolveOffensiveAction
const engineCode = `
/* ============================================================
   ACTION ENGINE (Phase 5)
   ============================================================ */
const ActionEngine = {
  execute(actor, targets, ab, element, moveConfig, isEnemyAction) {
    const type = ab.type || 'physical';
    if (this.Processors[type]) {
      this.Processors[type](actor, targets, ab, element, moveConfig, isEnemyAction);
    } else {
      BattleUI.setLog([\`\${actor.displayName || actor.name} uses \${ab.name}!\`], ['']);
      setTimeout(() => TurnManager.advance(), moveConfig.isUltimate ? 900 : 750);
    }
  },
  Processors: {}
};
`;

content = content.replace('/* ============================================================', engineCode + '\n/* ============================================================');

fs.writeFileSync(FILE, content);
console.log("ActionEngine stub injected.");
