/* global browser */

// Open a tab and discard it immediately
function openDiscarded(url) {
  browser.tabs.create({ url: url, active: false }).then(function (tab) {
    browser.tabs.discard(tab.id).catch(function () {
      // Tab not ready yet — discard when it updates
      function handler(tabId, info) {
        if (tabId === tab.id && info.url) {
          browser.tabs.discard(tabId);
          browser.tabs.onUpdated.removeListener(handler);
        }
      }
      browser.tabs.onUpdated.addListener(handler);
    });
  });
}

// Listen for Alt+Click from content script
browser.runtime.onMessage.addListener(function (msg) {
  if (msg.action === 'openDiscarded') {
    openDiscarded(msg.url);
  }
});

// Context menu item
browser.contextMenus.create({
  id: 'open-discarded',
  title: '⭐ Open in Discarded Tab',
  contexts: ['link']
});

browser.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === 'open-discarded' && info.linkUrl) {
    openDiscarded(info.linkUrl);
  }
});
