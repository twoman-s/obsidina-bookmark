# Installation Guide

Step-by-step instructions for installing the Obsidian Bookmark Manager on every supported platform.

---

## Prerequisites

1. **Obsidian** — [Download](https://obsidian.md) (v1.4+ recommended)
2. **QuickAdd plugin** — installed and enabled inside Obsidian

---

## Step 1 — Install QuickAdd

1. Open Obsidian.
2. Go to **Settings → Community Plugins → Browse**.
3. Search for **QuickAdd**.
4. Click **Install**, then **Enable**.

> If you already have QuickAdd installed, skip this step.

---

## Step 2 — Copy the Script Files

Copy the following folders into your Obsidian vault:

```
<your-vault>/
├── Scripts/
│   └── BookmarkManager/
│       ├── addBookmark.js
│       ├── api.js
│       ├── config.js
│       ├── fileManager.js
│       ├── markdown.js
│       ├── parser.js
│       ├── sorter.js
│       ├── updater.js
│       ├── utils.js
│       └── logger.js
└── .obsidian/
    └── snippets/
        └── bookmark-manager.css
```

### Where to place files

| File(s)                                | Destination                                 |
| -------------------------------------- | ------------------------------------------- |
| `Scripts/BookmarkManager/*.js`         | `<vault>/Scripts/BookmarkManager/`          |
| `CSS Snippets/bookmark-manager.css`    | `<vault>/.obsidian/snippets/`              |

> **Tip:** The `Scripts/` folder can be at the vault root or any sub-folder — just remember the path for QuickAdd configuration.

---

## Step 3 — Configure the Script

Open `Scripts/BookmarkManager/config.js` in any text editor and set:

```js
API_URL: "https://yourdomain.com/may/api/v1/bookmarks/",
API_TOKEN: "your-api-token-here",
```

All other settings have sensible defaults. See `README.md` for the full configuration reference.

---

## Step 4 — Enable the CSS Snippet

1. Open Obsidian **Settings → Appearance**.
2. Scroll to **CSS Snippets**.
3. Click the folder icon to open the snippets directory (confirm `bookmark-manager.css` is there).
4. Toggle **bookmark-manager** to **ON**.

---

## Step 5 — Set Up QuickAdd

See [QUICKADD_SETUP.md](./QUICKADD_SETUP.md) for detailed instructions.

---

## Platform-Specific Notes

### Desktop (macOS / Windows / Linux)

- Clipboard reading works automatically via `navigator.clipboard.readText()`.
- If Obsidian is not focused when you trigger the command, the clipboard read may fail — the script will prompt you to paste the URL instead.

### Android

1. Copy the script files into your vault (use a file manager or sync service).
2. The clipboard API may not work on all Android versions — the fallback prompt will appear.
3. QuickAdd commands can be triggered from the command palette or a pinned command.

### iPhone / iPad

1. Copy the script files into your vault via iCloud Drive, Files app, or your sync method.
2. Clipboard access requires Obsidian to be in the foreground.
3. If clipboard access is denied, the URL prompt will appear automatically.
4. Tip: Add the QuickAdd command to the mobile toolbar for quick access:
   - **Settings → Mobile → Manage Toolbar Buttons → Add "QuickAdd: Add Bookmark"**.

---

## Updating

To update the Bookmark Manager:

1. Replace the files in `Scripts/BookmarkManager/` with the new versions.
2. Your `config.js` changes will be overwritten — back it up first or re-apply your settings.
3. CSS snippet updates go into `.obsidian/snippets/`.

---

## Uninstalling

1. Delete `Scripts/BookmarkManager/`.
2. Delete `.obsidian/snippets/bookmark-manager.css`.
3. Remove the QuickAdd Macro in QuickAdd settings.
4. Your bookmarks in `Bookmarks/` are plain markdown and will remain.
