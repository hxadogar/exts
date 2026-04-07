/* global browser */

(function () {
  'use strict';

  let clickHandler = null;

  function attachClickListener() {
    if (clickHandler) return;

    clickHandler = function (e) {
      if (!e.altKey) return;

      const link = e.target.closest('a');
      if (!link || !link.href) return;

      e.preventDefault();
      e.stopPropagation();

      browser.runtime.sendMessage({
        action: 'openDiscarded',
        url: link.href
      });
    };

    document.addEventListener('click', clickHandler, true);
  }

  function detachClickListener() {
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
      clickHandler = null;
    }
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Alt' || e.key === 'AltGraph') {
      attachClickListener();
    }
  });

  window.addEventListener('keyup', function (e) {
    if (e.key === 'Alt' || e.key === 'AltGraph') {
      detachClickListener();
    }
  });

  window.addEventListener('blur', detachClickListener);
  window.addEventListener('unload', detachClickListener);
})();
