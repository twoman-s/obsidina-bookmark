# QuickAdd Setup Guide

This guide explains how to configure QuickAdd to run the Bookmark Manager script. No prior QuickAdd knowledge is assumed.

---

## What is QuickAdd?

QuickAdd is an Obsidian community plugin that lets you run custom JavaScript scripts, create notes from templates, and build multi-step macros — all triggered from a single command.

We use its **Macro** feature to run our `addBookmark.js` script.

---

## Step-by-Step Setup

### 1. Open QuickAdd Settings

1. Open Obsidian.
2. Go to **Settings** (gear icon, bottom-left).
3. In the left sidebar under **Community Plugins**, click **QuickAdd**.

---

### 2. Create a Macro

A Macro is a container that runs one or more actions (in our case, a single User Script).

1. In the QuickAdd settings pane, find the text input at the top that says **"Name"**.
2. Type: `Add Bookmark`
3. In the dropdown next to it, select **Macro**.
4. Click **Add Choice**.

You should now see **"Add Bookmark"** in your choices list with a ⚙️ gear icon.

---

### 3. Configure the Macro

1. Click the **⚙️ gear icon** next to "Add Bookmark".
2. This opens the Macro configuration panel.
3. In the **User Scripts** section, you'll see a text input.
4. Click the dropdown or type: `Scripts/BookmarkManager/addBookmark.js`
5. Click **Add**.

The script should now appear in the macro's action list.

> **Note:** QuickAdd looks for `.js` files in your vault. Make sure the `Scripts/BookmarkManager/` folder is inside your vault root.

---

### 4. Enable the Command

Back on the main QuickAdd settings page:

1. Find your **"Add Bookmark"** choice.
2. Toggle the **⚡ lightning bolt** icon next to it to **ON**.

This registers it as an Obsidian command, making it accessible from the Command Palette.

---

### 5. Test It

1. Copy any URL to your clipboard (e.g., `https://github.com`).
2. Open the **Command Palette** (Ctrl/Cmd + P).
3. Type: `Add Bookmark`.
4. Select **"QuickAdd: Add Bookmark"**.
5. The script should:
   - Read the URL from your clipboard (or prompt you).
   - Submit it to your API.
   - Create a bookmark in `Bookmarks/GitHub.md`.
   - Show a success notice.

---

## Optional: Add to Mobile Toolbar

On **Android / iPhone / iPad**:

1. Go to **Settings → Mobile**.
2. Under **Manage Toolbar Buttons**, tap **+**.
3. Search for **"QuickAdd: Add Bookmark"**.
4. Add it to your toolbar.

Now you can tap the bookmark icon in the mobile toolbar to trigger the script.

---

## Optional: Assign a Hotkey

On **Desktop** (macOS / Windows / Linux):

1. Go to **Settings → Hotkeys**.
2. Search for **"QuickAdd: Add Bookmark"**.
3. Click the **+** button next to it.
4. Press your desired key combination (e.g., `Ctrl+Shift+B` or `Cmd+Shift+B`).

---

## Troubleshooting

| Problem                              | Solution                                                                |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Script not appearing in dropdown     | Ensure `addBookmark.js` is in `<vault>/Scripts/BookmarkManager/`       |
| "Add Bookmark" not in Command Palette | Toggle the ⚡ lightning bolt ON in QuickAdd settings                    |
| Script runs but nothing happens      | Set `DEBUG: true` in `config.js` and check the developer console        |
| Error: "API_URL is not configured"   | Edit `config.js` with your API endpoint and token                       |

---

## How It Looks

After setup, your QuickAdd settings should look like this:

```
QuickAdd Settings
─────────────────
Choices:
  ⚡ Add Bookmark  [Macro]  ⚙️

Macro Configuration:
  Actions:
    1. User Script — Scripts/BookmarkManager/addBookmark.js
```

That's it! Your bookmark manager is ready to use.
