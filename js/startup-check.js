/**
 * startup-check.js
 * Verifies that critical globals survived script load order.
 */
(function () {
  const REQUIRED_GLOBALS = [
    'G',
    'Save',
    'SpriteRenderer',
    'AssetPreloader',
    'CombatEngine',
    'StatusSystem',
    'BattleUI',
    'Story',
    'MapEngine'
  ];

  function showStartupError(missing) {
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed',
      'left:12px',
      'right:12px',
      'bottom:12px',
      'z-index:99999',
      'padding:12px 14px',
      'background:#28070a',
      'border:1px solid #ff6070',
      'color:#ffd8de',
      'font:13px/1.45 system-ui, sans-serif',
      'box-shadow:0 8px 24px rgba(0,0,0,.45)'
    ].join(';');
    banner.textContent = `Startup check failed. Missing: ${missing.join(', ')}`;
    document.body.appendChild(banner);
  }

  function verifyStartupGlobals() {
    console.log('%c[startup-check] Checking system health...', 'color: #7dd3fc; font-weight: bold;');
    
    const results = {};
    REQUIRED_GLOBALS.forEach(name => {
      let exists = false;
      try {
        // Try to access the variable directly to check if it exists in global scope
        exists = typeof window[name] !== 'undefined' || eval(`typeof ${name}`) !== 'undefined';
      } catch (e) {
        exists = false;
      }
      results[name] = exists;
      if (!exists) {
        console.error(`%c[startup-check] ❌ Missing Global: ${name}`, 'color: #ff4d4d;');
      } else {
        console.log(`%c[startup-check] ✅ Found: ${name}`, 'color: #4ade80;');
      }
    });

    const missing = REQUIRED_GLOBALS.filter(name => !results[name]);

    if (missing.length > 0) {
      console.warn(`[startup-check] Critical startup failure: ${missing.length} missing components.`);
      // Display visual error
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(20,0,0,0.9);color:white;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;padding:20px;text-align:center;';
      overlay.innerHTML = `
        <h2 style="color:#ff4d4d">CRITICAL BOOT FAILURE</h2>
        <p>The game could not initialize required systems.</p>
        <div style="background:#300;padding:15px;border-radius:5px;margin:15px;max-width:500px;text-align:left;">
          <strong>Missing Globals:</strong><br>${missing.join(', ')}
        </div>
        <p style="font-size:0.8em;color:#aaa">Check console for syntax errors in these files.</p>
        <button onclick="location.reload()" style="padding:10px 20px;background:#444;color:white;border:none;cursor:pointer;margin-top:10px">RETRY LOAD</button>
      `;
      document.body.appendChild(overlay);
    } else {
      console.log('%c[startup-check] All systems operational. Nexus link stable.', 'color: #4ade80; font-weight: bold;');
    }
  }

  // Use a slight delay to ensure all script parsing is finished
  window.addEventListener('load', () => {
     setTimeout(verifyStartupGlobals, 100);
  });
})();
