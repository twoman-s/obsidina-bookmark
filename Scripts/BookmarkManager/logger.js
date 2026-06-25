/**
 * @fileoverview Logging utility for the Bookmark Manager.
 * @description Provides structured, prefixed logging that respects the DEBUG
 * flag in config.js. When DEBUG is false only warnings and errors are emitted.
 * @module logger
 */

const config = require('./config');

/** @type {string} Prefix prepended to every log line. */
const PREFIX = '[BookmarkManager]';

/**
 * @namespace Logger
 */
const Logger = {
    /**
     * Log debug-level information (only when DEBUG is true).
     * @param {...*} args - Values to log.
     */
    debug(...args) {
        if (config.DEBUG) {
            console.log(PREFIX, '[DEBUG]', ...args);
        }
    },

    /**
     * Log informational messages (only when DEBUG is true).
     * @param {...*} args - Values to log.
     */
    info(...args) {
        if (config.DEBUG) {
            console.log(PREFIX, '[INFO]', ...args);
        }
    },

    /**
     * Log warnings (always emitted).
     * @param {...*} args - Values to log.
     */
    warn(...args) {
        console.warn(PREFIX, '[WARN]', ...args);
    },

    /**
     * Log errors (always emitted).
     * @param {...*} args - Values to log.
     */
    error(...args) {
        console.error(PREFIX, '[ERROR]', ...args);
    },

    /**
     * Log an outgoing API request (only when DEBUG is true).
     * @param {string} method - HTTP method (GET, POST, etc.).
     * @param {string} url    - Request URL.
     * @param {object} [body] - Request body.
     */
    request(method, url, body) {
        if (!config.DEBUG) return;
        console.log(PREFIX, '[REQUEST]', method, url);
        if (body) {
            console.log(PREFIX, '[REQUEST BODY]', JSON.stringify(body, null, 2));
        }
    },

    /**
     * Log an API response (only when DEBUG is true).
     * @param {number} status - HTTP status code.
     * @param {object} [data] - Parsed response body.
     */
    response(status, data) {
        if (!config.DEBUG) return;
        console.log(PREFIX, '[RESPONSE]', 'Status:', status);
        if (data) {
            console.log(PREFIX, '[RESPONSE BODY]', JSON.stringify(data, null, 2));
        }
    },

    /**
     * Log a file-system operation (only when DEBUG is true).
     * @param {string} operation - e.g. "CREATE", "READ", "WRITE", "DELETE".
     * @param {string} path      - Vault-relative file path.
     */
    file(operation, path) {
        if (config.DEBUG) {
            console.log(PREFIX, '[FILE]', operation.toUpperCase(), path);
        }
    },

    /**
     * Log a sorting operation (only when DEBUG is true).
     * @param {string} fileName - Name of the sorted file.
     * @param {number} count    - Number of bookmarks that were sorted.
     */
    sort(fileName, count) {
        if (config.DEBUG) {
            console.log(PREFIX, '[SORT]', `Sorted ${count} bookmark(s) in ${fileName}`);
        }
    },

    /**
     * Log an update/insert operation (only when DEBUG is true).
     * @param {string} action     - "INSERT" or "UPDATE".
     * @param {string} externalId - The bookmark's external_id.
     * @param {string} fileName   - Destination file name.
     */
    upsert(action, externalId, fileName) {
        if (config.DEBUG) {
            console.log(PREFIX, '[UPSERT]', action, externalId, '→', fileName);
        }
    },
};

module.exports = Logger;
