/**
 * @fileoverview Main entry point for the Obsidian Bookmark Manager.
 * @description QuickAdd User Script that orchestrates the full bookmark
 * workflow: clipboard → API → file management → done.
 *
 * Configured as a QuickAdd Macro User Script pointing to this file.
 *
 * @module addBookmark
 */

const config   = require('../utils/config');
const logger   = require('../utils/logger');
const utils    = require('../utils/utils');
const api      = require('../utils/api');
const parser   = require('./parser');
const updater  = require('./updater');
const { createFileManager } = require('../utils/fileManager');

/* ------------------------------------------------------------------ */
/*  Notice helper                                                      */
/* ------------------------------------------------------------------ */

/**
 * Display an Obsidian Notice if SHOW_NOTICES is enabled.
 *
 * @param {string} message  - Message to show.
 * @param {number} [duration=4000] - Duration in milliseconds.
 */
function notice(message, duration = 4000) {
    if (config.SHOW_NOTICES && typeof Notice !== 'undefined') {
        new Notice(message, duration);
    }
    logger.info(message);
}

/**
 * Display an error Notice (always shown regardless of SHOW_NOTICES).
 *
 * @param {string} message  - Error message.
 * @param {number} [duration=6000] - Duration in milliseconds.
 */
function errorNotice(message, duration = 6000) {
    if (typeof Notice !== 'undefined') {
        new Notice(`❌ ${message}`, duration);
    }
    logger.error(message);
}

/* ------------------------------------------------------------------ */
/*  Clipboard helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Attempt to read a URL from the system clipboard.
 *
 * Falls back to prompting the user if clipboard access is unavailable
 * (common on mobile or when the app is not focused).
 *
 * @param {object} quickAddApi - The QuickAdd API object.
 * @returns {Promise<string|null>} Trimmed URL string, or null.
 */
async function getUrlFromClipboard(quickAddApi) {
    let clipboardText = null;

    // Try clipboard API first
    try {
        notice('📋 Reading clipboard…');
        clipboardText = await navigator.clipboard.readText();
        clipboardText = (clipboardText || '').trim();
    } catch (err) {
        logger.debug('Clipboard read failed:', err.message);
    }

    // If clipboard had a valid URL, use it
    if (clipboardText && utils.isValidUrl(clipboardText)) {
        logger.debug('URL from clipboard:', clipboardText);
        return clipboardText;
    }

    // Fallback: prompt the user
    const prompted = await quickAddApi.inputPrompt(
        'Enter or paste bookmark URL',
        clipboardText || 'https://',
        clipboardText || ''
    );

    if (!prompted || !prompted.trim()) {
        return null;
    }

    return prompted.trim();
}

/* ------------------------------------------------------------------ */
/*  Main entry point — exported for QuickAdd                           */
/* ------------------------------------------------------------------ */

/**
 * QuickAdd User Script entry function.
 *
 * Workflow:
 *   1. Read URL from clipboard (or prompt).
 *   2. Validate the URL.
 *   3. POST to the Bookmark API.
 *   4. Ensure the bookmark folder exists.
 *   5. Determine the destination file (parser).
 *   6. Insert or update the bookmark (updater).
 *   7. Show success / error notice.
 *
 * @param {object} params            - QuickAdd parameters.
 * @param {object} params.app        - The Obsidian App instance.
 * @param {object} params.quickAddApi - QuickAdd helper API.
 */
async function addBookmark(params) {
    const { app, quickAddApi } = params;

    try {
        // 1. Get URL
        const url = await getUrlFromClipboard(quickAddApi);
        if (!url) {
            notice('Bookmark cancelled — no URL provided.');
            return;
        }

        // 2. Validate URL
        if (!utils.isValidUrl(url)) {
            errorNotice('Invalid URL. Please enter a valid http/https URL.');
            return;
        }

        logger.info('Processing URL:', url);

        // 3. Submit to API
        notice('📡 Submitting bookmark…');
        let bookmark;
        try {
            bookmark = await api.submitBookmark(url);
        } catch (apiError) {
            errorNotice(`API unavailable: ${apiError.message}`);
            return;
        }

        if (!bookmark || !bookmark.external_id) {
            errorNotice('API returned an invalid bookmark (missing external_id).');
            return;
        }

        logger.debug('Bookmark received:', bookmark.external_id, bookmark.title);

        // 4. Ensure bookmark folder exists
        const fm = createFileManager(app);
        const folder = config.BOOKMARK_FOLDER || 'Bookmarks';
        await fm.ensureFolder(folder);

        // 5. Determine destination file
        const filePath = parser.getDestinationPath(bookmark);
        logger.info('Destination:', filePath);

        // Ensure any sub-folders in the path exist
        const pathParts = filePath.split('/');
        if (pathParts.length > 2) {
            // Build intermediate folder path
            const subFolder = pathParts.slice(0, -1).join('/');
            await fm.ensureFolder(subFolder);
        }

        // 6. Upsert bookmark
        notice('📝 Saving bookmark…');
        const { action } = await updater.upsertBookmark(fm, filePath, bookmark);

        // 7. Success
        const title = bookmark.title || 'Untitled';
        if (action === 'updated') {
            notice(`🔄 Bookmark updated: ${title}`);
        } else {
            notice(`✅ Bookmark created: ${title}`);
        }

        logger.info(`Done — ${action}: "${title}" → ${filePath}`);

    } catch (error) {
        // Catch-all: never crash, always show a notice
        errorNotice(`Unexpected error: ${error.message}`);
        logger.error('Unhandled error:', error);
    }
}

module.exports = addBookmark;
