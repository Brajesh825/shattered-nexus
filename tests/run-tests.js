require('./input-manager.test.js');
require('./focus-manager.test.js');
require('./party.test.js');
require('./passive-combat.test.js');
require('./status-system.test.js');
require('./reaction-effects.test.js');
require('./action-handler.test.js');
require('./turn-state.test.js');
require('./rules-contract.test.js');
require('./high-level-scaling.test.js');
require('./mitigation-defense.test.js');
require('./sw-cache-contract.test.js');
require('./data-contract.test.js');
require('./settings-save-contract.test.js');
require('./save-migration.test.js');
require('./scene-system.test.js');
require('./shop-economy.test.js');

const { run } = require('./test-harness.js');

run().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
