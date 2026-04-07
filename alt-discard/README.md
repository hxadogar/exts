# AltDiscard

A lightweight Firefox extension. Hold **Alt+Click** on any link to open it in a **discarded (unloaded)** state — saving memory, CPU, and network until you're ready.

## Why?

When you open many tabs in the background, each one loads fully even if you don't need it right away. AltDiscard lets you defer that cost until you actually switch to the tab.

## Usage

| Action | What Happens |
|---|---|
| **Alt + Click** on a link | Opens in a new (discarded tab) |
| **Right-click** → ⭐ Open in Discarded Tab | Same as Alt+Click |
| **Regular click** | Opens normally (no change) |
| **Ctrl + Click** | Opens normally in a new tab |

## How It Works

```
Alt+Click detected → browser.tabs.create({ active: false })
                   → browser.tabs.discard(tabId)
                   → tab sits in unloaded state
                   → you click it → it loads normally
```

No tracking. No storage. No state. One-shot discard action.
