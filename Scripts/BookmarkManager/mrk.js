/**
 * @fileoverview Markdown builder for the Bookmark Manager (V4 Horizontal Cards).
 * @description Renders each bookmark as raw semantic HTML in a horizontal
 * card layout — thumbnail on the left, content on the right — similar to
 * YouTube video lists and Raindrop.io list view.
 *
 * CSS class names (stable contract):
 *   .bookmark-card, .bookmark-image-wrapper, .bookmark-image,
 *   .bookmark-placeholder, .bookmark-content, .bookmark-header,
 *   .bookmark-favicon, .bookmark-domain, .bookmark-title,
 *   .bookmark-description, .bookmark-tags, .bookmark-tag,
 *   .bookmark-collections, .bookmark-collection, .bookmark-footer,
 *   .bookmark-date, .bookmark-open
 *
 * No file I/O or API logic belongs here.
 * @module markdown
 */

const config = require('./config');
const utils = require('./utils');

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** @type {number} Maximum characters for a truncated description. */
const MAX_DESCRIPTION_LENGTH = 160;

/* ------------------------------------------------------------------ */
/*  HTML escaping                                                      */
/* ------------------------------------------------------------------ */

/**
 * Escape a string for safe inclusion in HTML content and attributes.
 * @param {string} str - Raw string.
 * @returns {string} HTML-safe string.
 */
function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------ */
/*  Image resolution                                                   */
/* ------------------------------------------------------------------ */

/**
 * Resolve the best available image URL from a bookmark object.
 *
 * Priority:
 *   1. USE_DOWNLOADED_ASSETS → first asset with a `.file` property.
 *   2. bookmark.image_url
 *   3. First asset's original_url
 *   4. Empty string (no image)
 *
 * @param {object} bookmark - Bookmark object from the API.
 * @returns {string} Image URL or empty string.
 */
function resolveImageUrl(bookmark) {
    const assets = Array.isArray(bookmark.assets) ? bookmark.assets : [];

    if (config.USE_DOWNLOADED_ASSETS) {
        const localAsset = assets.find(a => a && a.file);
        if (localAsset) return localAsset.file;
    }

    if (bookmark.image_url) return bookmark.image_url;

    const firstAsset = assets.find(a => a && a.original_url);
    if (firstAsset) return firstAsset.original_url;

    return '';
}

/* ------------------------------------------------------------------ */
/*  Tag / Collection extractors                                        */
/* ------------------------------------------------------------------ */

/**
 * Extract tag names from the API's tag array.
 * @param {Array<string|object>} tags - Tag list from the API.
 * @returns {string[]} Cleaned tag name strings.
 */
function formatTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return [];
    return tags
        .map(tag => {
            const name = typeof tag === 'string' ? tag : (tag.name || tag.title || '');
            return name.trim();
        })
        .filter(Boolean);
}

/**
 * Extract collection names from the API's collection array.
 * @param {Array<string|object>} collections - Collection list from the API.
 * @returns {string[]} Cleaned collection name strings.
 */
function formatCollections(collections) {
    if (!Array.isArray(collections) || collections.length === 0) return [];
    return collections
        .map(col => {
            const name = typeof col === 'string' ? col : (col.name || col.title || '');
            return name.trim();
        })
        .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/*  Description truncation                                             */
/* ------------------------------------------------------------------ */

/**
 * Truncate a description to a maximum length, breaking at a word boundary.
 * @param {string} text     - Raw description.
 * @param {number} [maxLen] - Maximum character count.
 * @returns {string} Truncated text (with "…" if shortened).
 */
function truncateDescription(text, maxLen = MAX_DESCRIPTION_LENGTH) {
    if (!text || text.length <= maxLen) return text || '';
    const cut = text.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

/* ------------------------------------------------------------------ */
/*  Main builder                                                       */
/* ------------------------------------------------------------------ */

/**
 * Build the complete bookmark block as a horizontal card.
 *
 * Structure: fixed 16:9 thumbnail on the left, stacked content on the
 * right. Wrapped in <!-- BOOKMARK:id --> / <!-- END BOOKMARK --> markers
 * for the updater and sorter.
 *
 * @param {object} bookmark - Bookmark object from the API.
 * @returns {string} Full HTML string including markers.
 */
function buildBookmarkBlock(bookmark) {
    const id          = bookmark.external_id || utils.shortHash(bookmark.url || '');
    const title       = bookmark.title || 'Untitled';
    const url         = bookmark.url || '';
    const description = truncateDescription(bookmark.description || '');
    const domain      = utils.extractDomain(url);
    const imageUrl    = resolveImageUrl(bookmark);
    const tags        = formatTags(bookmark.tags);
    const collections = formatCollections(bookmark.collections);
    const faviconUrl  = bookmark.favicon_url || '';
    const createdRaw  = bookmark.created_at || '';
    const createdAt   = utils.formatDate(createdRaw, config.DATE_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // --- Image / placeholder ---
    const imageHtml = imageUrl
        ? `<div class="bookmark-image-wrapper"><img class="bookmark-image" src="${escapeHtml(imageUrl)}" alt="" referrerpolicy="no-referrer" loading="lazy"></div>`
        : `<div class="bookmark-image-wrapper"><div class="bookmark-placeholder">No Preview</div></div>`;

    // --- Header: favicon + domain ---
    let headerHtml = '';
    if (domain) {
        const faviconTag = faviconUrl
            ? `<img class="bookmark-favicon" src="${escapeHtml(faviconUrl)}" alt="" referrerpolicy="no-referrer">`
            : '';
        headerHtml = `<div class="bookmark-header">${faviconTag}<span class="bookmark-domain">${escapeHtml(domain)}</span></div>`;
    }

    // --- Title ---
    const titleHtml = `<h3 class="bookmark-title">${escapeHtml(title)}</h3>`;

    // --- Description ---
    const descHtml = description
        ? `<p class="bookmark-description">${escapeHtml(description)}</p>`
        : '';

    // --- Tags ---
    let tagsHtml = '';
    if (tags.length > 0) {
        const pills = tags.map(t => `<span class="bookmark-tag">${escapeHtml(t)}</span>`).join('');
        tagsHtml = `<div class="bookmark-tags">${pills}</div>`;
    }

    // --- Collections ---
    let collectionsHtml = '';
    if (collections.length > 0) {
        const pills = collections.map(c => `<span class="bookmark-collection">${escapeHtml(c)}</span>`).join('');
        collectionsHtml = `<div class="bookmark-collections">${pills}</div>`;
    }

    // --- Footer: date + open ---
    const datePart = createdAt ? `<span class="bookmark-date">${escapeHtml(createdAt)}</span>` : '';
    const openPart = url ? `<a class="bookmark-open" href="${escapeHtml(url)}" rel="noopener noreferrer">Open →</a>` : '';
    const footerHtml = (datePart || openPart)
        ? `<div class="bookmark-footer">${datePart}${openPart}</div>`
        : '';

    // --- Assemble card ---
    const card = `<article class="bookmark-card" data-created="${escapeHtml(createdRaw)}">${imageHtml}<div class="bookmark-content">${headerHtml}${titleHtml}${descHtml}${tagsHtml}${collectionsHtml}${footerHtml}</div></article>`;

    return `<!-- BOOKMARK:${id} -->\n\n${card}\n\n<!-- END BOOKMARK -->`;
}

module.exports = {
    buildBookmarkBlock,
    resolveImageUrl,
    formatTags,
    formatCollections,
};
