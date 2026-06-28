/**
 * @fileoverview Sorter module for the Bookmark Manager.
 * @description Sorts bookmark blocks within a markdown file by their
 * `created_at` timestamp. Called after every insert or update.
 * @module sorter
 */

const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Regular expression that matches a complete bookmark block including markers.
 *
 * Captures:
 *   Group 0 — full block from <!-- BOOKMARK:… --> to <!-- END BOOKMARK -->
 *
 * Uses the "dotAll" flag (s) so `.` matches newlines.
 * @type {RegExp}
 */
const BOOKMARK_BLOCK_REGEX = /<!-- BOOKMARK:[\w-]+ -->[\s\S]*?<!-- END BOOKMARK -->/g;

/**
 * Regular expression to extract the created_at value from within a bookmark block.
 * Matches the `data-created` attribute on the `.bookmark-card` div.
 * @type {RegExp}
 */
const CREATED_AT_LINE_REGEX = /data-created="([^"]+)"/;

/**
 * Parse a date string into a Unix timestamp (milliseconds).
 * Returns 0 for unparseable dates so they sort to the end.
 *
 * @param {string} dateStr - Date string (any format parseable by Date).
 * @returns {number} Milliseconds since epoch, or 0.
 */
function parseTimestamp(dateStr) {
    if (!dateStr) return 0;
    const ms = new Date(dateStr.trim()).getTime();
    return isNaN(ms) ? 0 : ms;
}

/**
 * Extract the created_at timestamp from a rendered bookmark block.
 *
 * Looks for the "📅 …" line that the markdown builder emits.
 * Falls back to 0 if no date line is found.
 *
 * @param {string} block - Full bookmark block (including markers).
 * @returns {number} Timestamp in milliseconds.
 */
function extractTimestamp(block) {
    const match = block.match(CREATED_AT_LINE_REGEX);
    if (!match) return 0;
    return parseTimestamp(match[1]);
}

/**
 * Sort all bookmark blocks within a file's content by `created_at`.
 *
 * Any text before the first bookmark block and after the last one is
 * preserved (e.g. YAML front-matter or headers).
 *
 * @param {string} content   - Full file content.
 * @param {string} [order]   - "desc" (newest first) or "asc" (oldest first).
 *                              Defaults to config.SORT_ORDER.
 * @returns {{ sorted: string, count: number }}
 *   `sorted` — the complete file content with bookmarks re-ordered.
 *   `count`  — number of bookmark blocks found.
 */
function sortBookmarks(content, order) {
    const sortOrder = (order || config.SORT_ORDER || 'desc').toLowerCase();
    const blocks = content.match(BOOKMARK_BLOCK_REGEX);

    if (!blocks || blocks.length <= 1) {
        return { sorted: content, count: blocks ? blocks.length : 0 };
    }

    // Identify the region that contains all bookmarks
    const firstBlockStart = content.indexOf(blocks[0]);
    const lastBlock = blocks[blocks.length - 1];
    const lastBlockEnd = content.indexOf(lastBlock) + lastBlock.length;

    const header = content.slice(0, firstBlockStart);
    const footer = content.slice(lastBlockEnd);

    // Sort blocks by timestamp
    const sorted = [...blocks].sort((a, b) => {
        const tsA = extractTimestamp(a);
        const tsB = extractTimestamp(b);
        return sortOrder === 'asc' ? tsA - tsB : tsB - tsA;
    });

    // Reassemble: header + sorted blocks separated by double newlines + footer
    const body = sorted.join('\n\n');
    const result = header.trimEnd() + '\n\n' + body + '\n' + footer.trimStart();

    logger.sort('file', sorted.length);

    return { sorted: result.trim() + '\n', count: sorted.length };
}

module.exports = {
    sortBookmarks,
    extractTimestamp,
    BOOKMARK_BLOCK_REGEX,
};
