# Changelog

All notable changes to the Obsidian Bookmark Manager are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] — 2026-06-25

### Added

- **Core workflow**: clipboard → API → file → sort → done.
- **config.js**: Centralized configuration (API_URL, API_TOKEN, BOOKMARK_FOLDER, GROUP_BY, SHOW_NOTICES, SORT_ORDER, DEBUG, etc.).
- **api.js**: POST request with Token authentication, AbortController timeout, structured error handling.
- **parser.js**: Three grouping strategies — `bookmark_type`, `domain`, `collection` — with fallback logic.
- **markdown.js**: Obsidian callout builder (`[!bookmark]`) with image, title, domain, type, URL, description, tags, collections, and date.
- **fileManager.js**: Vault file operations — ensureFolder, read, write, append, replace.
- **sorter.js**: Sort bookmark blocks by `created_at` (newest first by default).
- **updater.js**: Insert or update bookmarks using `external_id` for duplicate detection.
- **addBookmark.js**: QuickAdd entry point orchestrating the full pipeline.
- **utils.js**: capitalize, slugify, formatDate, isValidUrl, escapeMarkdown, cleanFilename, extractDomain, shortHash, get, coalesce.
- **logger.js**: Debug logging gated by `DEBUG` flag with per-concern helpers (request, response, file, sort, upsert).
- **bookmark-manager.css**: Custom CSS for the `[!bookmark]` callout — card layout, hero image, tags, dark mode, mobile responsiveness, print styles.
- **Documentation**: README.md, INSTALL.md, QUICKADD_SETUP.md.

### Version 2 Hooks (implemented but disabled by default)

- `USE_DOWNLOADED_ASSETS` config flag for local asset rendering.
- `DOWNLOAD_LOCAL_ASSETS` config flag placeholder.
- CSS classes for favicon (`.bookmark-favicon`), collections (`.bookmark-collection`), status badges (`.bookmark-status`), and statistics (`.bookmark-stats`).

### Version 3 Hooks (architecture placeholders)

- Modular design supports future: favorites, search index, archive, collection files, incremental sync, bulk import/export, delete, rename groups, custom templates.
