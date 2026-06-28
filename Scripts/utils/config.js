/**
 * @fileoverview Configuration for the Obsidian Bookmark Manager.
 * @description All configurable values live here. No other module should
 * contain hardcoded settings. Update these values to match your environment.
 * @module config
 */

module.exports = {
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
    API_TIMEOUT: 120000,

    /** @type {string} Fallback bookmark type when the API does not provide one. */
    DEFAULT_BOOKMARK_TYPE: "website",

    /** @type {string} Date locale for formatting dates in bookmark cards. */
    DATE_LOCALE: "en-US",
};
