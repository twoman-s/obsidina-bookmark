var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// Scripts/BookmarkManager/config.js
var require_config = __commonJS({
  "Scripts/BookmarkManager/config.js"(exports2, module2) {
    module2.exports = {
      /**
       * @type {string} Full URL of the bookmark API endpoint.
       * Example: "https://yourdomain.com/may/api/v1/bookmarks/"
       */
      API_URL: "https://comms.oopsops.in/may/api/v1/bookmarks/",
      /**
       * @type {string} API authentication token.
       * Sent as: Authorization: Token <API_TOKEN>
       */
      API_TOKEN: "",
      /**
       * @type {string} Root folder inside the Obsidian vault for bookmark files.
       * Created automatically if it does not exist.
       */
      BOOKMARK_FOLDER: "Bookmarks",
      /**
       * @type {string} Strategy for grouping bookmarks into files.
       * "bookmark_type" → group by type (Youtube.md, GitHub.md, etc.)
       * "domain"        → group by website domain
       * "collection"    → group by API-assigned collection
       */
      GROUP_BY: "bookmark_type",
      /** @type {boolean} Show Obsidian notices during operations. */
      SHOW_NOTICES: true,
      /**
       * @type {string} Sort order for bookmarks within each file.
       * "desc" → newest first (default)
       * "asc"  → oldest first
       */
      SORT_ORDER: "desc",
      /** @type {boolean} Enable local asset downloading (Version 2). */
      DOWNLOAD_LOCAL_ASSETS: false,
      /**
       * @type {boolean} Use locally-downloaded assets for images (Version 2).
       * When true, uses assets[].file instead of image_url.
       */
      USE_DOWNLOADED_ASSETS: false,
      /** @type {boolean} Enable verbose debug logging to the developer console. */
      DEBUG: false,
      /** @type {number} API request timeout in milliseconds. */
      API_TIMEOUT: 12e4,
      /** @type {string} Fallback bookmark type when the API does not provide one. */
      DEFAULT_BOOKMARK_TYPE: "website",
      /** @type {string} Date locale for formatting dates in bookmark cards. */
      DATE_LOCALE: "en-US"
    };
  }
});

// Scripts/BookmarkManager/logger.js
var require_logger = __commonJS({
  "Scripts/BookmarkManager/logger.js"(exports2, module2) {
    var config2 = require_config();
    var PREFIX = "[BookmarkManager]";
    var Logger = {
      /**
       * Log debug-level information (only when DEBUG is true).
       * @param {...*} args - Values to log.
       */
      debug(...args) {
        if (config2.DEBUG) {
          console.log(PREFIX, "[DEBUG]", ...args);
        }
      },
      /**
       * Log informational messages (only when DEBUG is true).
       * @param {...*} args - Values to log.
       */
      info(...args) {
        if (config2.DEBUG) {
          console.log(PREFIX, "[INFO]", ...args);
        }
      },
      /**
       * Log warnings (always emitted).
       * @param {...*} args - Values to log.
       */
      warn(...args) {
        console.warn(PREFIX, "[WARN]", ...args);
      },
      /**
       * Log errors (always emitted).
       * @param {...*} args - Values to log.
       */
      error(...args) {
        console.error(PREFIX, "[ERROR]", ...args);
      },
      /**
       * Log an outgoing API request (only when DEBUG is true).
       * @param {string} method - HTTP method (GET, POST, etc.).
       * @param {string} url    - Request URL.
       * @param {object} [body] - Request body.
       */
      request(method, url, body) {
        if (!config2.DEBUG) return;
        console.log(PREFIX, "[REQUEST]", method, url);
        if (body) {
          console.log(PREFIX, "[REQUEST BODY]", JSON.stringify(body, null, 2));
        }
      },
      /**
       * Log an API response (only when DEBUG is true).
       * @param {number} status - HTTP status code.
       * @param {object} [data] - Parsed response body.
       */
      response(status, data) {
        if (!config2.DEBUG) return;
        console.log(PREFIX, "[RESPONSE]", "Status:", status);
        if (data) {
          console.log(PREFIX, "[RESPONSE BODY]", JSON.stringify(data, null, 2));
        }
      },
      /**
       * Log a file-system operation (only when DEBUG is true).
       * @param {string} operation - e.g. "CREATE", "READ", "WRITE", "DELETE".
       * @param {string} path      - Vault-relative file path.
       */
      file(operation, path) {
        if (config2.DEBUG) {
          console.log(PREFIX, "[FILE]", operation.toUpperCase(), path);
        }
      },
      /**
       * Log a sorting operation (only when DEBUG is true).
       * @param {string} fileName - Name of the sorted file.
       * @param {number} count    - Number of bookmarks that were sorted.
       */
      sort(fileName, count) {
        if (config2.DEBUG) {
          console.log(PREFIX, "[SORT]", `Sorted ${count} bookmark(s) in ${fileName}`);
        }
      },
      /**
       * Log an update/insert operation (only when DEBUG is true).
       * @param {string} action     - "INSERT" or "UPDATE".
       * @param {string} externalId - The bookmark's external_id.
       * @param {string} fileName   - Destination file name.
       */
      upsert(action, externalId, fileName) {
        if (config2.DEBUG) {
          console.log(PREFIX, "[UPSERT]", action, externalId, "\u2192", fileName);
        }
      }
    };
    module2.exports = Logger;
  }
});

// Scripts/BookmarkManager/utils.js
var require_utils = __commonJS({
  "Scripts/BookmarkManager/utils.js"(exports2, module2) {
    var utils2 = {
      /**
       * Capitalize the first letter of a string, lowercasing the rest.
       * @param {string} str - Input string.
       * @returns {string} Capitalized string, or empty string for falsy input.
       */
      capitalize(str) {
        if (!str || typeof str !== "string") return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },
      /**
       * Convert a string to a URL-friendly slug.
       * @param {string} str - Input string.
       * @returns {string} Lowercased, hyphenated slug.
       */
      slugify(str) {
        if (!str || typeof str !== "string") return "";
        return str.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
      },
      /**
       * Format an ISO-8601 date string for human-readable display.
       * @param {string} isoString          - ISO date string.
       * @param {string} [locale='en-US']   - BCP 47 locale tag.
       * @param {Intl.DateTimeFormatOptions} [options] - Override formatting options.
       * @returns {string} Formatted date, or empty string on failure.
       */
      formatDate(isoString, locale = "en-US", options = {}) {
        if (!isoString) return "";
        try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return "";
          const defaults = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...options
          };
          return date.toLocaleDateString(locale, defaults);
        } catch {
          return "";
        }
      },
      /**
       * Validate whether a string is a well-formed HTTP(S) URL.
       * @param {string} str - String to validate.
       * @returns {boolean} True if the string is a valid http/https URL.
       */
      isValidUrl(str) {
        if (!str || typeof str !== "string") return false;
        try {
          const url = new URL(str.trim());
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      /**
       * Escape Markdown special characters so they render as literal text.
       * @param {string} str - Raw string.
       * @returns {string} Escaped string safe for Markdown content.
       */
      escapeMarkdown(str) {
        if (!str || typeof str !== "string") return "";
        return str.replace(/([\\*_~`|[\]])/g, "\\$1");
      },
      /**
       * Sanitize a string for use as a filename on all major operating systems.
       * Strips characters invalid on Windows, macOS, Linux, Android, and iOS.
       * @param {string} str - Proposed filename.
       * @returns {string} Cleaned filename, or "Untitled" if the result is empty.
       */
      cleanFilename(str) {
        if (!str || typeof str !== "string") return "Untitled";
        const cleaned = str.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, " ").trim();
        return cleaned || "Untitled";
      },
      /**
       * Extract the bare domain from a URL (strips "www." prefix).
       * @param {string} url - Full URL string.
       * @returns {string} Domain name, or empty string on failure.
       */
      extractDomain(url) {
        if (!url || typeof url !== "string") return "";
        try {
          return new URL(url.trim()).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      },
      /**
       * Produce a short deterministic hex hash from a string.
       * Used for bookmark markers (<!-- BOOKMARK:xxxxxxxx -->).
       * @param {string} str - Input string (typically the external_id).
       * @returns {string} 8-character hex hash.
       */
      shortHash(str) {
        if (!str) return "00000000";
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8);
      },
      /**
       * Safely read a nested property from an object using dot-notation.
       * @param {object} obj              - Source object.
       * @param {string} path             - Dot-separated key path (e.g. "a.b.c").
       * @param {*}      [defaultValue]   - Returned when the path does not resolve.
       * @returns {*} Resolved value or defaultValue.
       */
      get(obj, path, defaultValue = null) {
        if (!obj || !path) return defaultValue;
        let current = obj;
        for (const key of path.split(".")) {
          if (current == null || typeof current !== "object") return defaultValue;
          current = current[key];
        }
        return current !== void 0 ? current : defaultValue;
      },
      /**
       * Return the first non-empty, non-null value from a list.
       * @param {...*} values - Candidate values.
       * @returns {*} First truthy value, or null.
       */
      coalesce(...values) {
        for (const v of values) {
          if (v !== null && v !== void 0 && v !== "") return v;
        }
        return null;
      }
    };
    module2.exports = utils2;
  }
});

// Scripts/BookmarkManager/api.js
var require_api = __commonJS({
  "Scripts/BookmarkManager/api.js"(exports2, module2) {
    var config2 = require_config();
    var logger2 = require_logger();
    async function submitBookmark(url) {
      const endpoint = config2.API_URL;
      const token = config2.API_TOKEN;
      const timeout = config2.API_TIMEOUT || 12e4;
      if (!endpoint) {
        throw new Error("API_URL is not configured. Please update config.js.");
      }
      const body = JSON.stringify({ url });
      logger2.request("POST", endpoint, { url });
      let controller = null;
      let timeoutId = null;
      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeout);
      }
      try {
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
            // 'Authorization': `Token ${token}`,
          },
          body
        };
        if (controller) {
          fetchOptions.signal = controller.signal;
        }
        const response = await fetch(endpoint, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);
        logger2.response(response.status);
        if (!response.ok) {
          const errorBody = await response.text().catch(() => "No details");
          throw new Error(
            `API error ${response.status}: ${errorBody}`
          );
        }
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("API returned invalid JSON.");
        }
        if (!data || typeof data !== "object") {
          throw new Error("API returned an empty or malformed response.");
        }
        logger2.response(response.status, data);
        return data;
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          throw new Error(
            `API request timed out after ${Math.round(timeout / 1e3)}s.`
          );
        }
        if (error.message.startsWith("API")) throw error;
        throw new Error(`Network error: ${error.message}`);
      }
    }
    module2.exports = { submitBookmark };
  }
});

// Scripts/BookmarkManager/parser.js
var require_parser = __commonJS({
  "Scripts/BookmarkManager/parser.js"(exports2, module2) {
    var config2 = require_config();
    var utils2 = require_utils();
    var logger2 = require_logger();
    function resolveFromDomain(domain) {
      if (!domain) return utils2.capitalize(config2.DEFAULT_BOOKMARK_TYPE);
      const parts = domain.split(".");
      const baseName = parts.length >= 2 ? parts[parts.length - 2] : domain;
      return utils2.capitalize(baseName);
    }
    function getDestinationPath(bookmark) {
      const domain = utils2.extractDomain(bookmark.url || "");
      let fileName = resolveFromDomain(domain);
      fileName = utils2.cleanFilename(fileName);
      const folder = config2.BOOKMARK_FOLDER || "Bookmarks";
      const fullPath = `${folder}/${fileName}.md`;
      logger2.debug(`Destination: "${fullPath}" (domain: ${domain})`);
      return fullPath;
    }
    module2.exports = {
      getDestinationPath,
      resolveFromDomain
    };
  }
});

// Scripts/BookmarkManager/markdown.js
var require_markdown = __commonJS({
  "Scripts/BookmarkManager/markdown.js"(exports2, module2) {
    var config2 = require_config();
    var utils2 = require_utils();
    var MAX_DESCRIPTION_LENGTH = 150;
    function escapeHtml(str) {
      if (!str || typeof str !== "string") return "";
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function resolveImageUrl(bookmark) {
      const assets = Array.isArray(bookmark.assets) ? bookmark.assets : [];
      if (config2.USE_DOWNLOADED_ASSETS) {
        const localAsset = assets.find((a) => a && a.file);
        if (localAsset) return localAsset.file;
      }
      if (bookmark.image_url) return bookmark.image_url;
      const firstAsset = assets.find((a) => a && a.original_url);
      if (firstAsset) return firstAsset.original_url;
      return "";
    }
    function formatTags(tags) {
      if (!Array.isArray(tags) || tags.length === 0) return [];
      return tags.map((tag) => {
        const name = typeof tag === "string" ? tag : tag.name || tag.title || "";
        return name.trim();
      }).filter(Boolean);
    }
    function formatCollections(collections) {
      if (!Array.isArray(collections) || collections.length === 0) return [];
      return collections.map((col) => {
        const name = typeof col === "string" ? col : col.name || col.title || "";
        return name.trim();
      }).filter(Boolean);
    }
    function truncateDescription(text, maxLen = MAX_DESCRIPTION_LENGTH) {
      if (!text || text.length <= maxLen) return text || "";
      const cut = text.slice(0, maxLen);
      const lastSpace = cut.lastIndexOf(" ");
      return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "\u2026";
    }
    function buildImageWrapper(imageUrl) {
      if (imageUrl) {
        return `<div class="bookmark-image-wrapper">
    <img class="bookmark-image" src="${escapeHtml(imageUrl)}" alt="Bookmark thumbnail" referrerpolicy="no-referrer">
</div>`;
      }
      return `<div class="bookmark-image-wrapper">
    <div class="bookmark-placeholder">No Preview</div>
</div>`;
    }
    function buildHeader(domain, faviconUrl) {
      if (!domain) return "";
      const favicon = faviconUrl ? `
    <img class="bookmark-favicon" src="${escapeHtml(faviconUrl)}" alt="" referrerpolicy="no-referrer">` : "";
      return `<div class="bookmark-header">${favicon}
    <span class="bookmark-domain">${escapeHtml(domain)}</span>
</div>`;
    }
    function buildTags(tags) {
      if (!tags || tags.length === 0) return "";
      const spans = tags.map((t) => `    <span class="bookmark-tag">${escapeHtml(t)}</span>`).join("\n");
      return `<div class="bookmark-tags">
${spans}
</div>`;
    }
    function buildCollections(collections) {
      if (!collections || collections.length === 0) return "";
      const spans = collections.map((c) => `    <span class="bookmark-collection">${escapeHtml(c)}</span>`).join("\n");
      return `<div class="bookmark-collections">
${spans}
</div>`;
    }
    function buildFooter(dateStr, url) {
      if (!dateStr && !url) return "";
      const datePart = dateStr ? `
    <span class="bookmark-date">${escapeHtml(dateStr)}</span>` : "";
      const linkPart = url ? `
    <a class="bookmark-open" href="${escapeHtml(url)}" rel="noopener noreferrer">Open \u2192</a>` : "";
      return `<div class="bookmark-footer">${datePart}${linkPart}
</div>`;
    }
    function buildBookmarkBlock(bookmark) {
      const id = bookmark.external_id || utils2.shortHash(bookmark.url || "");
      const title = bookmark.title || "Untitled";
      const url = bookmark.url || "";
      const description = truncateDescription(bookmark.description || "");
      const domain = utils2.extractDomain(url);
      const imageUrl = resolveImageUrl(bookmark);
      const tags = formatTags(bookmark.tags);
      const collections = formatCollections(bookmark.collections);
      const faviconUrl = bookmark.favicon_url || "";
      const createdRaw = bookmark.created_at || "";
      const createdAt = utils2.formatDate(createdRaw, config2.DATE_LOCALE, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      const contentParts = [];
      contentParts.push(`<h3 class="bookmark-title">${escapeHtml(title)}</h3>`);
      const headerHtml = buildHeader(domain, faviconUrl);
      if (headerHtml) contentParts.push(headerHtml);
      if (description) {
        contentParts.push(`<p class="bookmark-description">${escapeHtml(description)}</p>`);
      }
      const tagsHtml = buildTags(tags);
      if (tagsHtml) contentParts.push(tagsHtml);
      const collectionsHtml = buildCollections(collections);
      if (collectionsHtml) contentParts.push(collectionsHtml);
      const footerHtml = buildFooter(createdAt, url);
      if (footerHtml) contentParts.push(footerHtml);
      const contentInner = contentParts.map((part) => part.split("\n").map((line) => "        " + line).join("\n")).join("\n\n");
      const innerHtml = `<article class="bookmark-card" data-created="${escapeHtml(createdRaw)}">

    ${buildImageWrapper(imageUrl).split("\n").map((l, i) => i === 0 ? l : "    " + l).join("\n")}

    <div class="bookmark-content">

${contentInner}

    </div>

</article>`;
      return `${innerHtml}`;
    }
    module2.exports = {
      buildBookmarkBlock,
      resolveImageUrl,
      formatTags,
      formatCollections
    };
  }
});

// Scripts/BookmarkManager/sorter.js
var require_sorter = __commonJS({
  "Scripts/BookmarkManager/sorter.js"(exports2, module2) {
    var config2 = require_config();
    var logger2 = require_logger();
    var BOOKMARK_BLOCK_REGEX = /<!-- BOOKMARK:[\w-]+ -->[\s\S]*?<!-- END BOOKMARK -->/g;
    var CREATED_AT_LINE_REGEX = /data-created="([^"]+)"/;
    function parseTimestamp(dateStr) {
      if (!dateStr) return 0;
      const ms = new Date(dateStr.trim()).getTime();
      return isNaN(ms) ? 0 : ms;
    }
    function extractTimestamp(block) {
      const match = block.match(CREATED_AT_LINE_REGEX);
      if (!match) return 0;
      return parseTimestamp(match[1]);
    }
    function sortBookmarks(content, order) {
      const sortOrder = (order || config2.SORT_ORDER || "desc").toLowerCase();
      const blocks = content.match(BOOKMARK_BLOCK_REGEX);
      if (!blocks || blocks.length <= 1) {
        return { sorted: content, count: blocks ? blocks.length : 0 };
      }
      const firstBlockStart = content.indexOf(blocks[0]);
      const lastBlock = blocks[blocks.length - 1];
      const lastBlockEnd = content.indexOf(lastBlock) + lastBlock.length;
      const header = content.slice(0, firstBlockStart);
      const footer = content.slice(lastBlockEnd);
      const sorted = [...blocks].sort((a, b) => {
        const tsA = extractTimestamp(a);
        const tsB = extractTimestamp(b);
        return sortOrder === "asc" ? tsA - tsB : tsB - tsA;
      });
      const body = sorted.join("\n\n");
      const result = header.trimEnd() + "\n\n" + body + "\n" + footer.trimStart();
      logger2.sort("file", sorted.length);
      return { sorted: result.trim() + "\n", count: sorted.length };
    }
    module2.exports = {
      sortBookmarks,
      extractTimestamp,
      BOOKMARK_BLOCK_REGEX
    };
  }
});

// Scripts/BookmarkManager/updater.js
var require_updater = __commonJS({
  "Scripts/BookmarkManager/updater.js"(exports2, module2) {
    var logger2 = require_logger();
    var markdown = require_markdown();
    var sorter = require_sorter();
    function buildBlockRegex(externalId) {
      const escaped = externalId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(
        `<!-- BOOKMARK:${escaped} -->[\\s\\S]*?<!-- END BOOKMARK -->`,
        "g"
      );
    }
    function bookmarkExists(content, externalId) {
      if (!content || !externalId) return false;
      return buildBlockRegex(externalId).test(content);
    }
    async function upsertBookmark(fileManager, filePath, bookmark) {
      const externalId = bookmark.external_id;
      if (!externalId) {
        throw new Error("Bookmark is missing external_id \u2014 cannot upsert.");
      }
      const newBlock = markdown.buildBookmarkBlock(bookmark);
      let content = "";
      let action;
      if (fileManager.fileExists(filePath)) {
        content = await fileManager.readFile(filePath);
      }
      if (bookmarkExists(content, externalId)) {
        logger2.upsert("UPDATE", externalId, filePath);
        const regex = buildBlockRegex(externalId);
        content = content.replace(regex, newBlock);
        action = "updated";
      } else {
        logger2.upsert("INSERT", externalId, filePath);
        if (content.trim().length > 0) {
          content = content.trimEnd() + "\n\n" + newBlock + "\n";
        } else {
          content = newBlock + "\n";
        }
        action = "created";
      }
      const { sorted, count } = sorter.sortBookmarks(content);
      logger2.sort(filePath, count);
      await fileManager.writeFile(filePath, sorted);
      return { action };
    }
    module2.exports = {
      upsertBookmark,
      bookmarkExists
    };
  }
});

// Scripts/BookmarkManager/fileManager.js
var require_fileManager = __commonJS({
  "Scripts/BookmarkManager/fileManager.js"(exports2, module2) {
    var logger2 = require_logger();
    function createFileManager2(app) {
      const vault = app.vault;
      return {
        /**
         * Ensure a folder exists, creating it (and parents) if necessary.
         * @param {string} folderPath - Vault-relative folder path.
         */
        async ensureFolder(folderPath) {
          const existing = vault.getAbstractFileByPath(folderPath);
          if (existing) return;
          logger2.file("CREATE FOLDER", folderPath);
          await vault.createFolder(folderPath);
        },
        /**
         * Check whether a file exists in the vault.
         * @param {string} filePath - Vault-relative file path.
         * @returns {boolean}
         */
        fileExists(filePath) {
          return vault.getAbstractFileByPath(filePath) != null;
        },
        /**
         * Read the full contents of a file.
         * @param {string} filePath - Vault-relative file path.
         * @returns {Promise<string>} File contents.
         * @throws {Error} If the file does not exist.
         */
        async readFile(filePath) {
          const file = vault.getAbstractFileByPath(filePath);
          if (!file) {
            throw new Error(`File not found: ${filePath}`);
          }
          logger2.file("READ", filePath);
          return await vault.read(file);
        },
        /**
         * Write content to a file, creating it if it does not exist,
         * or overwriting it entirely if it does.
         * @param {string} filePath - Vault-relative file path.
         * @param {string} content  - Full file content.
         */
        async writeFile(filePath, content) {
          const file = vault.getAbstractFileByPath(filePath);
          if (file) {
            logger2.file("WRITE", filePath);
            await vault.modify(file, content);
          } else {
            logger2.file("CREATE", filePath);
            await vault.create(filePath, content);
          }
        },
        /**
         * Append content to the end of an existing file.
         * If the file does not exist it is created with the given content.
         * @param {string} filePath - Vault-relative file path.
         * @param {string} content  - Content to append.
         */
        async appendToFile(filePath, content) {
          const file = vault.getAbstractFileByPath(filePath);
          if (file) {
            logger2.file("APPEND", filePath);
            const existing = await vault.read(file);
            const separator = existing.endsWith("\n") ? "\n" : "\n\n";
            await vault.modify(file, existing + separator + content);
          } else {
            logger2.file("CREATE (append)", filePath);
            await vault.create(filePath, content);
          }
        },
        /**
         * Replace a specific substring within a file's content.
         * @param {string} filePath   - Vault-relative file path.
         * @param {string} oldContent - Exact substring to find.
         * @param {string} newContent - Replacement substring.
         * @returns {Promise<boolean>} True if a replacement was made.
         */
        async replaceInFile(filePath, oldContent, newContent) {
          const file = vault.getAbstractFileByPath(filePath);
          if (!file) {
            throw new Error(`File not found: ${filePath}`);
          }
          const existing = await vault.read(file);
          if (!existing.includes(oldContent)) {
            logger2.debug(`Replace target not found in ${filePath}`);
            return false;
          }
          logger2.file("REPLACE", filePath);
          const updated = existing.replace(oldContent, newContent);
          await vault.modify(file, updated);
          return true;
        },
        /**
         * Get a TFile reference for a vault-relative path.
         * @param {string} filePath - Vault-relative file path.
         * @returns {object|null} Obsidian TFile or null.
         */
        getFile(filePath) {
          return vault.getAbstractFileByPath(filePath);
        }
      };
    }
    module2.exports = { createFileManager: createFileManager2 };
  }
});

// Scripts/BookmarkManager/addBookmark.js
var config = require_config();
var logger = require_logger();
var utils = require_utils();
var api = require_api();
var parser = require_parser();
var updater = require_updater();
var { createFileManager } = require_fileManager();
function notice(message, duration = 4e3) {
  if (config.SHOW_NOTICES && typeof Notice !== "undefined") {
    new Notice(message, duration);
  }
  logger.info(message);
}
function errorNotice(message, duration = 6e3) {
  if (typeof Notice !== "undefined") {
    new Notice(`\u274C ${message}`, duration);
  }
  logger.error(message);
}
async function getUrlFromClipboard(quickAddApi) {
  let clipboardText = null;
  try {
    notice("\u{1F4CB} Reading clipboard\u2026");
    clipboardText = await navigator.clipboard.readText();
    clipboardText = (clipboardText || "").trim();
  } catch (err) {
    logger.debug("Clipboard read failed:", err.message);
  }
  if (clipboardText && utils.isValidUrl(clipboardText)) {
    logger.debug("URL from clipboard:", clipboardText);
    return clipboardText;
  }
  const prompted = await quickAddApi.inputPrompt(
    "Enter or paste bookmark URL",
    clipboardText || "https://",
    clipboardText || ""
  );
  if (!prompted || !prompted.trim()) {
    return null;
  }
  return prompted.trim();
}
async function addBookmark(params) {
  const { app, quickAddApi } = params;
  try {
    const url = await getUrlFromClipboard(quickAddApi);
    if (!url) {
      notice("Bookmark cancelled \u2014 no URL provided.");
      return;
    }
    if (!utils.isValidUrl(url)) {
      errorNotice("Invalid URL. Please enter a valid http/https URL.");
      return;
    }
    logger.info("Processing URL:", url);
    notice("\u{1F4E1} Submitting bookmark\u2026");
    let bookmark;
    try {
      bookmark = await api.submitBookmark(url);
    } catch (apiError) {
      errorNotice(`API unavailable: ${apiError.message}`);
      return;
    }
    if (!bookmark || !bookmark.external_id) {
      errorNotice("API returned an invalid bookmark (missing external_id).");
      return;
    }
    logger.debug("Bookmark received:", bookmark.external_id, bookmark.title);
    const fm = createFileManager(app);
    const folder = config.BOOKMARK_FOLDER || "Bookmarks";
    await fm.ensureFolder(folder);
    const filePath = parser.getDestinationPath(bookmark);
    logger.info("Destination:", filePath);
    const pathParts = filePath.split("/");
    if (pathParts.length > 2) {
      const subFolder = pathParts.slice(0, -1).join("/");
      await fm.ensureFolder(subFolder);
    }
    notice("\u{1F4DD} Saving bookmark\u2026");
    const { action } = await updater.upsertBookmark(fm, filePath, bookmark);
    const title = bookmark.title || "Untitled";
    if (action === "updated") {
      notice(`\u{1F504} Bookmark updated: ${title}`);
    } else {
      notice(`\u2705 Bookmark created: ${title}`);
    }
    logger.info(`Done \u2014 ${action}: "${title}" \u2192 ${filePath}`);
  } catch (error) {
    errorNotice(`Unexpected error: ${error.message}`);
    logger.error("Unhandled error:", error);
  }
}
module.exports = addBookmark;
