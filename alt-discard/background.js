/* global browser */

// Track child tab IDs per opener tab ID
const tabChildren = {}; // { openerTabId: Set<childTabId> }

async function getInsertIndex(openerTabId, openerTabIndex) {
  const children = tabChildren[openerTabId];

  // No children yet — insert right after opener
  if (!children || children.size === 0) {
    return openerTabIndex + 1;
  }

  // Fetch real current positions of all surviving child tabs
  const results = await Promise.all(
    [...children].map((id) => browser.tabs.get(id).catch(() => null)),
  );

  const validTabs = results.filter(Boolean);

  // All children were deleted — reset to right after opener
  if (validTabs.length === 0) {
    return openerTabIndex + 1;
  }

  // Insert after the furthest child
  const maxIndex = Math.max(...validTabs.map((t) => t.index));
  return maxIndex + 1;
}

function registerChild(openerTabId, childTabId) {
  if (!tabChildren[openerTabId]) {
    tabChildren[openerTabId] = new Set();
  }
  tabChildren[openerTabId].add(childTabId);
}

// Open a discarded tab at the correct index
async function openDiscarded(url) {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  const index = await getInsertIndex(activeTab.id, activeTab.index);

  browser.tabs.create({ url, active: false, index }).then(function (tab) {
    registerChild(activeTab.id, tab.id);

    browser.tabs.discard(tab.id).catch(function () {
      function handler(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          browser.tabs.discard(tabId);
          browser.tabs.onUpdated.removeListener(handler);
        }
      }
      browser.tabs.onUpdated.addListener(handler);
    });
  });
}

// Open a regular tab at the correct index (Ctrl+Click)
async function openRegular(url) {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  const index = await getInsertIndex(activeTab.id, activeTab.index);

  browser.tabs.create({ url, active: false, index }).then(function (tab) {
    registerChild(activeTab.id, tab.id);
  });
}

// When a tab is closed — remove it from all parent sets
browser.tabs.onRemoved.addListener(function (tabId) {
  // Remove from parent's children
  for (const parentId in tabChildren) {
    tabChildren[parentId].delete(tabId);
  }
  // Clean up if this tab was itself a parent
  delete tabChildren[tabId];
});

// Listen for messages from content script
browser.runtime.onMessage.addListener(function (msg) {
  if (msg.action === "openDiscarded") {
    openDiscarded(msg.url);
  } else if (msg.action === "openRegular") {
    openRegular(msg.url);
  }
});

// Context menu item
browser.contextMenus.create({
  id: "open-discarded",
  title: "⭐ Open in Discarded Tab",
  contexts: ["link"],
});

browser.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === "open-discarded" && info.linkUrl) {
    openDiscarded(info.linkUrl);
  }
});
