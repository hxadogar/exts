/* global browser */

(function () {
  "use strict";

  let altActive = false;
  let ctrlActive = false;

  // Unified click handler for both Alt and Ctrl
  function clickHandler(e) {
    const link = e.target.closest("a");
    if (!link || !link.href) return;

    if (e.altKey) {
      // Alt+Click → open discarded
      e.preventDefault();
      e.stopPropagation();
      browser.runtime.sendMessage({ action: "openDiscarded", url: link.href });
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl+Click → open regular tab but through our index tracker
      e.preventDefault();
      e.stopPropagation();
      browser.runtime.sendMessage({ action: "openRegular", url: link.href });
    }
  }

  document.addEventListener("click", clickHandler, true);

  // Detach on unload/blur to be clean
  window.addEventListener("unload", function () {
    document.removeEventListener("click", clickHandler, true);
  });
})();
