# Obsidian Bookmark Manager

A modular, production-quality bookmark manager for [Obsidian](https://obsidian.md) powered by [QuickAdd](https://github.com/chhoumann/quickadd) User Scripts.

Copy a URL → trigger the command → the bookmark is saved, organized, and sorted automatically.

---

## Features

- **One-command workflow** — copy a URL, run "Add Bookmark", done.
- **Automatic metadata extraction** — title, description, image, tags, collections via API.
- **Smart grouping** — bookmarks are filed by type (`Youtube.md`, `GitHub.md`, …), domain, or collection.
- **Duplicate detection** — uses `external_id` exclusively; existing bookmarks are updated in-place.
- **Auto-sorting** — newest bookmarks always appear first (configurable).
- **Rich Obsidian callouts** — each bookmark renders as a styled card with image, title, domain, tags, and more.
- **Custom CSS** — included snippet for beautiful bookmark cards in both light and dark mode.
- **Cross-platform** — works on macOS, Windows, Linux, Android, iPhone, and iPad.
- **No npm required** — runs directly inside Obsidian + QuickAdd.

### Version 2

- Local asset downloading support
- Downloaded asset rendering
- Favicon display
- Collection & tag badges
- Status badges
- Bookmark statistics

### Version 3 (Future)

- Favorites
- Search index
- Bookmark archive
- Collection files
- Incremental sync
- Bulk import / export
- Delete bookmark
- Rename groups
- Custom templates

---

## Folder Structure

```
Scripts/
├── BookmarkManager/
│   ├── addBookmark.js      ← QuickAdd entry point
│   ├── api.js              ← HTTP/API layer
│   ├── config.js           ← All configuration
│   ├── fileManager.js      ← Vault file operations
│   ├── markdown.js         ← Markdown builder
│   ├── parser.js           ← Grouping / destination logic
│   ├── sorter.js           ← Sort bookmarks by date
│   ├── updater.js          ← Insert / update logic
│   ├── utils.js            ← Utility functions
│   └── logger.js           ← Debug logging
├── README.md
├── INSTALL.md
├── QUICKADD_SETUP.md
└── CHANGELOG.md

CSS Snippets/
    bookmark-manager.css    ← Callout card styles
```

---

## How It Works

```
┌─────────────┐     ┌──────────┐     ┌───────────┐
│  Clipboard   │ ──► │  Validate │ ──► │  POST API │
└─────────────┘     └──────────┘     └─────┬─────┘
                                           │
                                     ┌─────▼─────┐
                                     │  Parse     │
                                     │  response  │
                                     └─────┬─────┘
                                           │
                              ┌────────────▼────────────┐
                              │  Determine destination   │
                              │  file (parser.js)        │
                              └────────────┬────────────┘
                                           │
                         ┌─────────────────▼──────────────────┐
                         │  Duplicate?                         │
                         │  YES → replace block (updater.js)   │
                         │  NO  → append block                 │
                         └─────────────────┬──────────────────┘
                                           │
                                     ┌─────▼─────┐
                                     │  Sort file │
                                     │ (sorter.js)│
                                     └─────┬─────┘
                                           │
                                     ┌─────▼─────┐
                                     │  Write to  │
                                     │  vault     │
                                     └─────┬─────┘
                                           │
                                     ┌─────▼─────┐
                                     │   Done ✅   │
                                     └───────────┘
```

---

## Architecture

| Module           | Responsibility                                          |
| ---------------- | ------------------------------------------------------- |
| `config.js`      | All configuration values (API URL, token, folder, etc.) |
| `logger.js`      | Structured debug logging, gated by `DEBUG` flag         |
| `utils.js`       | Pure utility functions (validate, format, escape, etc.) |
| `api.js`         | HTTP POST, auth headers, timeout, error handling        |
| `parser.js`      | Determine destination file from bookmark data           |
| `markdown.js`    | Build the Obsidian callout block for a bookmark         |
| `fileManager.js` | All Obsidian vault file operations                      |
| `sorter.js`      | Sort bookmark blocks by `created_at` within a file      |
| `updater.js`     | Insert or update bookmarks, duplicate detection         |
| `addBookmark.js` | Main orchestrator — the QuickAdd entry point            |

---

## Configuration

Edit `Scripts/BookmarkManager/config.js`:

| Key                     | Type    | Default          | Description                        |
| ----------------------- | ------- | ---------------- | ---------------------------------- |
| `API_URL`               | string  | `""`             | Your bookmark API endpoint         |
| `API_TOKEN`             | string  | `""`             | API authentication token           |
| `BOOKMARK_FOLDER`       | string  | `"Bookmarks"`    | Vault folder for bookmark files    |
| `GROUP_BY`              | string  | `"bookmark_type"`| Grouping strategy                  |
| `SHOW_NOTICES`          | boolean | `true`           | Show Obsidian notices              |
| `SORT_ORDER`            | string  | `"desc"`         | Sort order (desc = newest first)   |
| `DOWNLOAD_LOCAL_ASSETS` | boolean | `false`          | Download assets locally (V2)       |
| `USE_DOWNLOADED_ASSETS` | boolean | `false`          | Use local assets for images (V2)   |
| `DEBUG`                 | boolean | `false`          | Enable console debug logging       |
| `API_TIMEOUT`           | number  | `120000`         | Request timeout in ms              |
| `DATE_LOCALE`           | string  | `"en-US"`        | Locale for date formatting         |

---

## Grouping Strategies

### `bookmark_type` (default)

| Type       | File            |
| ---------- | --------------- |
| youtube    | `Youtube.md`    |
| github     | `GitHub.md`     |
| website    | `Websites.md`   |
| reddit     | `Reddit.md`     |
| amazon     | `Amazon.md`     |
| (unknown)  | Falls back to domain |

### `domain`

Groups by the website's domain name. Well-known domains map to friendly names; others use the capitalized domain.

### `collection`

Groups by the first collection assigned by the API. Falls back to `bookmark_type` if no collection exists.

---

## Troubleshooting

| Problem                         | Solution                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| "API_URL is not configured"     | Edit `config.js` and set your API endpoint                               |
| "API_TOKEN is not configured"   | Edit `config.js` and set your auth token                                 |
| Clipboard not working on mobile | The script will prompt you to paste the URL manually                     |
| Bookmark not appearing          | Check the correct file under `Bookmarks/` based on your `GROUP_BY`       |
| Duplicate bookmark appended     | Ensure the API returns a consistent `external_id`                        |
| CSS not applied                 | Enable the snippet in Settings → Appearance → CSS Snippets               |
| Timeout errors                  | Increase `API_TIMEOUT` in `config.js`                                    |
| Debug info needed               | Set `DEBUG: true` in `config.js`, then check the developer console       |

---

## FAQ

**Q: Does this require npm or Node.js?**
A: No. Everything runs directly inside Obsidian using QuickAdd's User Script feature.

**Q: Does this use Templater?**
A: No. This project uses only QuickAdd User Scripts.

**Q: What happens if I bookmark the same URL twice?**
A: The bookmark is detected by `external_id` and updated in-place. No duplicates are created.

**Q: Can I change the callout appearance?**
A: Yes — edit `CSS Snippets/bookmark-manager.css` or override styles in your own snippet.

**Q: Does it work offline?**
A: No — the API call requires an internet connection. Saved bookmarks are accessible offline.

**Q: How do I enable debug logging?**
A: Set `DEBUG: true` in `config.js`. Logs appear in the developer console (Ctrl/Cmd+Shift+I).

---

## License

MIT
