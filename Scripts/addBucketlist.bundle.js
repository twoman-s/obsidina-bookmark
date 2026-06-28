var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// Scripts/utils/config.js
var require_config = __commonJS({
  "Scripts/utils/config.js"(exports2, module2) {
    module2.exports = {
      /**
       * @type {string} Full URL of the bookmark API endpoint.
       * Example: "https://yourdomain.com/may/api/v1/bookmarks/"
       */
      API_URL: "https://comms.oopsops.in/may/api/v1/bookmarks/",
      /**
       * @type {string} Full URL of the bucketlist API endpoint.
       */
      BUCKETLIST_API_URL: "https://gmapsscraper.oopsops.in/extract",
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
       * @type {string} Root folder inside the Obsidian vault for bucketlist files.
       * Created automatically if it does not exist.
       */
      BUCKETLIST_FOLDER: "Bucketlist",
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

// Scripts/utils/logger.js
var require_logger = __commonJS({
  "Scripts/utils/logger.js"(exports2, module2) {
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

// Scripts/utils/utils.js
var require_utils = __commonJS({
  "Scripts/utils/utils.js"(exports2, module2) {
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

// Scripts/BucketlistManager/api.js
var require_api = __commonJS({
  "Scripts/BucketlistManager/api.js"(exports2, module2) {
    var config2 = require_config();
    var logger2 = require_logger();
    async function scrapeBucketlist(url) {
      if (!url) {
        throw new Error("URL is required for scraping");
      }
      const payload = {
        url,
        headless: true,
        lang: "en"
      };
      const apiUrl = config2.BUCKETLIST_API_URL || "http://127.0.0.1:8001/scrape";
      logger2.debug(`Sending scrape request to ${apiUrl}`, payload);
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        logger2.error("Scrape API error:", error);
        throw error;
      }
    }
    module2.exports = {
      scrapeBucketlist
    };
  }
});

// Scripts/BucketlistManager/parser.js
var require_parser = __commonJS({
  "Scripts/BucketlistManager/parser.js"(exports2, module2) {
    var config2 = require_config();
    var utils2 = require_utils();
    var logger2 = require_logger();
    function generateMarkdown(data) {
      const name = data.name || "Unknown Location";
      const link = data.link || "#";
      const reviewsUrl = data.reviews_url || "#";
      const photos = data.photos && data.photos.length > 0 ? data.photos : data.thumbnail ? [data.thumbnail] : [];
      let photosHtml = "";
      if (photos.length > 0) {
        const imagesStr = photos.map((url) => `<img src="${url}" alt="Photo of ${name}" loading="lazy" referrerpolicy="no-referrer" />`).join("");
        photosHtml = `
<div class="bucketlist-carousel-wrapper">
    <div class="bucketlist-carousel">
        ${imagesStr}
    </div>
</div>`;
      }
      const checked = data.isChecked ? "x" : " ";
      const completedClass = data.isChecked ? " bucketlist-completed" : "";
      const html = `
- [${checked}] **${name}**
<div class="bucketlist-card${completedClass}">
    ${photosHtml}
    <div class="bucketlist-details">
        <h3><a href="${link}" target="_blank" rel="noopener">${name}</a></h3>
        <a href="${link}" class="bucketlist-main-btn" target="_blank">View on Maps</a>
    </div>
</div>
`;
      return `
${html.trim()}
`;
    }
    module2.exports = {
      generateMarkdown
    };
  }
});

// Scripts/BucketlistManager/updater.js
var require_updater = __commonJS({
  "Scripts/BucketlistManager/updater.js"(exports2, module2) {
    var logger2 = require_logger();
    var parser = require_parser();
    function buildBlockRegex(link) {
      const escaped = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(
        `<!-- BUCKETLIST:${escaped} -->[\\s\\S]*?<!-- END BUCKETLIST -->`,
        "g"
      );
    }
    function itemExists(content, link) {
      if (!content || !link) return false;
      return buildBlockRegex(link).test(content);
    }
    async function upsertBucketlist(fileManager, filePath, data) {
      const link = data.link;
      if (!link) {
        throw new Error("Data is missing link \u2014 cannot upsert.");
      }
      const newBlock = parser.generateMarkdown(data);
      let content = "";
      let action;
      if (fileManager.fileExists(filePath)) {
        content = await fileManager.readFile(filePath);
      }
      if (itemExists(content, link)) {
        logger2.upsert("UPDATE", link, filePath);
        const regex = buildBlockRegex(link);
        const match = content.match(regex);
        if (match && match[0].includes("- [x]")) {
          data.isChecked = true;
        }
        const newBlock2 = parser.generateMarkdown(data);
        content = content.replace(regex, newBlock2);
        action = "updated";
      } else {
        logger2.upsert("INSERT", link, filePath);
        if (content.trim().length > 0) {
          content = content.trimEnd() + "\n\n" + newBlock + "\n";
        } else {
          content = newBlock + "\n";
        }
        action = "created";
      }
      await fileManager.writeFile(filePath, content);
      return { action };
    }
    module2.exports = {
      upsertBucketlist,
      itemExists
    };
  }
});

// Scripts/utils/fileManager.js
var require_fileManager = __commonJS({
  "Scripts/utils/fileManager.js"(exports2, module2) {
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

// Scripts/BucketlistManager/addBucketlist.js
var config = require_config();
var logger = require_logger();
var utils = require_utils();
var api = require_api();
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
async function addBucketlist(params) {
  const { app, quickAddApi } = params;
  try {
    const prompted = await quickAddApi.inputPrompt(
      "Enter Google Maps URL for Bucketlist",
      "https://maps.app.goo.gl/...",
      ""
    );
    if (!prompted || !prompted.trim()) {
      notice("Bucketlist cancelled \u2014 no URL provided.");
      return;
    }
    const url = prompted.trim();
    if (!utils.isValidUrl(url)) {
      errorNotice("Invalid URL. Please enter a valid http/https URL.");
      return;
    }
    logger.info("Processing URL:", url);
    notice("\u{1F4E1} Fetching from Maps...");
    let data;
    try {
      data = await api.scrapeBucketlist(url);
    } catch (apiError) {
      errorNotice(`API unavailable: ${apiError.message}`);
      return;
    }
    if (!data || !data.link) {
      errorNotice("API returned invalid data (missing link).");
      return;
    }
    logger.debug("Data received:", data.name);
    const fm = createFileManager(app);
    const folder = config.BUCKETLIST_FOLDER || "Bucketlist";
    await fm.ensureFolder(folder);
    const filePath = `${folder}/googlemaps.md`;
    logger.info("Destination:", filePath);
    notice("\u{1F4DD} Saving bucketlist item\u2026");
    const { action } = await updater.upsertBucketlist(fm, filePath, data);
    const title = data.name || "Untitled";
    if (action === "updated") {
      notice(`\u{1F504} Updated: ${title}`);
    } else {
      notice(`\u2705 Created: ${title}`);
    }
  } catch (error) {
    errorNotice(`Unexpected error: ${error.message}`);
    logger.error("Unhandled error:", error);
  }
}
module.exports = addBucketlist;
