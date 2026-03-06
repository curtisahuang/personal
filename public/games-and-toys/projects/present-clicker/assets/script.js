(function () {
  "use strict";

  /**
   * Thin entrypoint: delegates to the modular game implementation.
   * The actual logic now lives in:
   *  - assets/game-state.js
   *  - assets/game-logging.js
   *  - assets/game-ui.js
   *  - assets/game-dev-console.js
   */

  var PC = window.PRESENT_CLICKER;
  if (!PC || typeof PC.initGame !== "function") {
    return;
  }

  PC.initGame();
})();