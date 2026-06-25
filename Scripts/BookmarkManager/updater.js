/**
 * @fileoverview Updater module for the Bookmark Manager.
 * @description Handles inserting new bookmarks and updating existing ones.
 * Uses external_id exclusively for duplicate detection — never title, URL,
 * or description.
 * @module updater
 */

const logger = require('./logger');
const markdown = require('./markdown');
const sorter = require('./sorter');

/**
 * Build a regex that matches the full block for a given external_id.
 *
 * @param {string} externalId - The bookmark's external_id.
 * @returns {RegExp} A regex matching the full marker-wrapped block.
 */
function buildBlockRegex(externalId) {
    const escaped = externalId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(
        `<!-- BOOKMARK:${escaped} -->[\\s\\S]*?<!-- END BOOKMARK -->`,
        'g'
    );
}

/**
 * Check whether a bookmark with the given external_id already exists
 * in the file content.
 *
 * @param {string} content    - Current file content.
 * @param {string} externalId - The external_id to search for.
 * @returns {boolean} True if a matching bookmark block exists.
 */
function bookmarkExists(content, externalId) {
    if (!content || !externalId) return false;
    return buildBlockRegex(externalId).test(content);
}

/**
 * Insert or update a bookmark in a file.
 *
 * Detection is based solely on `external_id`:
 *   - If found → replace the existing block (update).
 *   - If not found → append a new block (insert).
 *
 * After the operation the file content is re-sorted by `created_at`.
 *
 * @param {object} fileManager - A FileManager instance (from fileManager.js).
 * @param {string} filePath    - Vault-relative path to the target file.
 * @param {object} bookmark    - Bookmark object from the API.
 * @returns {Promise<{ action: string }>}
 *   `action` — "updated" or "created".
 */
async function upsertBookmark(fileManager, filePath, bookmark) {
    const externalId = bookmark.external_id;
    if (!externalId) {
        throw new Error('Bookmark is missing external_id — cannot upsert.');
    }

    const newBlock = markdown.buildBookmarkBlock(bookmark);
    let content = '';
    let action;

    // Read existing content (or start with empty string for new files)
    if (fileManager.fileExists(filePath)) {
        content = await fileManager.readFile(filePath);
    }

    if (bookmarkExists(content, externalId)) {
        // --- UPDATE: replace the existing block ---
        logger.upsert('UPDATE', externalId, filePath);
        const regex = buildBlockRegex(externalId);
        content = content.replace(regex, newBlock);
        action = 'updated';
    } else {
        // --- INSERT: append the new block ---
        logger.upsert('INSERT', externalId, filePath);
        if (content.trim().length > 0) {
            content = content.trimEnd() + '\n\n' + newBlock + '\n';
        } else {
            content = newBlock + '\n';
        }
        action = 'created';
    }

    // Sort the entire file after every insert/update
    const { sorted, count } = sorter.sortBookmarks(content);
    logger.sort(filePath, count);

    // Write the result back
    await fileManager.writeFile(filePath, sorted);

    return { action };
}

module.exports = {
    upsertBookmark,
    bookmarkExists,
};
