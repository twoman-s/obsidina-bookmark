/**
 * @fileoverview Markdown builder for the Bookmark Manager (V4 Horizontal List).
 * @description Renders each bookmark as raw semantic HTML.
 * The layout uses horizontal cards (image on left, content on right).
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

const config = require('../utils/config');
const utils = require('../utils/utils');

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** @type {number} Maximum characters for a truncated description. */
const MAX_DESCRIPTION_LENGTH = 150;

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
/*  HTML fragment builders                                             */
/* ------------------------------------------------------------------ */

/**
 * Build the image wrapper — real image or placeholder.
 * @param {string} imageUrl - Resolved image URL (may be empty).
 * @returns {string} HTML fragment.
 */
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

/**
 * Build the header row — favicon + domain.
 * @param {string} domain     - Bare domain (e.g. "github.com").
 * @param {string} faviconUrl - Favicon URL (may be empty).
 * @returns {string} HTML fragment (empty if no domain).
 */
function buildHeader(domain, faviconUrl) {
    if (!domain) return '';
    const favicon = faviconUrl
        ? `\n    <img class="bookmark-favicon" src="${escapeHtml(faviconUrl)}" alt="" referrerpolicy="no-referrer">`
        : '';
    return `<div class="bookmark-header">${favicon}
    <span class="bookmark-domain">${escapeHtml(domain)}</span>
</div>`;
}

/**
 * Build tag pills.
 * @param {string[]} tags - Tag names.
 * @returns {string} HTML fragment (empty if no tags).
 */
function buildTags(tags) {
    if (!tags || tags.length === 0) return '';
    const spans = tags
        .map(t => `    <span class="bookmark-tag">${escapeHtml(t)}</span>`)
        .join('\n');
    return `<div class="bookmark-tags">\n${spans}\n</div>`;
}

/**
 * Build collection pills.
 * @param {string[]} collections - Collection names.
 * @returns {string} HTML fragment (empty if no collections).
 */
function buildCollections(collections) {
    if (!collections || collections.length === 0) return '';
    const spans = collections
        .map(c => `    <span class="bookmark-collection">${escapeHtml(c)}</span>`)
        .join('\n');
    return `<div class="bookmark-collections">\n${spans}\n</div>`;
}

/**
 * Build the footer — date (left) + open link (right).
 * @param {string} dateStr - Formatted display date.
 * @param {string} url     - Bookmark URL for the "Open →" link.
 * @returns {string} HTML fragment (empty if nothing to show).
 */
function buildFooter(dateStr, url) {
    if (!dateStr && !url) return '';
    const datePart = dateStr
        ? `\n    <span class="bookmark-date">${escapeHtml(dateStr)}</span>`
        : '';
    const linkPart = url
        ? `\n    <a class="bookmark-open" href="${escapeHtml(url)}" rel="noopener noreferrer">Open →</a>`
        : '';
    return `<div class="bookmark-footer">${datePart}${linkPart}\n</div>`;
}

/* ------------------------------------------------------------------ */
/*  Main builder                                                       */
/* ------------------------------------------------------------------ */

/**
 * Build the complete bookmark block as raw HTML.
 *
 * No Obsidian callouts, no blockquote prefixes. The output is pure
 * semantic HTML wrapped in `<!-- BOOKMARK:id -->` / `<!-- END BOOKMARK -->`
 * markers that the updater and sorter depend on.
 *
 * The `data-created` attribute carries the raw ISO timestamp for
 * reliable sorting regardless of display locale.
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

    // --- Assemble the <article> HTML ---
    const contentParts = [];

    // Title
    contentParts.push(`<h3 class="bookmark-title">${escapeHtml(title)}</h3>`);

    // Header: favicon + domain
    const headerHtml = buildHeader(domain, faviconUrl);
    if (headerHtml) contentParts.push(headerHtml);

    // Description
    if (description) {
        contentParts.push(`<p class="bookmark-description">${escapeHtml(description)}</p>`);
    }

    // Tags
    const tagsHtml = buildTags(tags);
    if (tagsHtml) contentParts.push(tagsHtml);

    // Collections
    const collectionsHtml = buildCollections(collections);
    if (collectionsHtml) contentParts.push(collectionsHtml);

    // Footer: date + open link
    const footerHtml = buildFooter(createdAt, url);
    if (footerHtml) contentParts.push(footerHtml);

    // Indent content parts for readability
    const contentInner = contentParts
        .map(part => part.split('\n').map(line => '        ' + line).join('\n'))
        .join('\n\n');

    const innerHtml = `<article class="bookmark-card" data-created="${escapeHtml(createdRaw)}">

    ${buildImageWrapper(imageUrl).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n')}

    <div class="bookmark-content">

${contentInner}

    </div>

</article>`;

    // --- Final block with markers ---
    return `${innerHtml}`;
}

module.exports = {
    buildBookmarkBlock,
    resolveImageUrl,
    formatTags,
    formatCollections,
};
