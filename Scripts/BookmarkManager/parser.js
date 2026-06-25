/**
 * @fileoverview Parser module for the Bookmark Manager.
 * @description Determines the destination markdown file for a bookmark
 * based on the configured GROUP_BY strategy.
 * @module parser
 */

const config = require('./config');
const utils = require('./utils');
const logger = require('./logger');

/**
 * Maps known bookmark_type values to display-friendly filenames (without extension).
 * @type {Object<string, string>}
 */
const TYPE_TO_FILENAME = {
    youtube:        'Youtube',
    github:         'GitHub',
    website:        'Websites',
    reddit:         'Reddit',
    amazon:         'Amazon',
    twitter:        'Twitter',
    stackoverflow:  'StackOverflow',
    wikipedia:      'Wikipedia',
    medium:         'Medium',
    article:        'Articles',
    video:          'Videos',
    image:          'Images',
    document:       'Documents',
    podcast:        'Podcasts',
    news:           'News',
    social:         'Social',
    shopping:       'Shopping',
    tool:           'Tools',
    reference:      'References',
    linkedin:       'LinkedIn',
};

/**
 * Maps well-known domains to display-friendly filenames.
 * Used as the primary strategy when GROUP_BY is "domain", and as a fallback
 * when GROUP_BY is "bookmark_type" but the type is unrecognized.
 * @type {Object<string, string>}
 */
const DOMAIN_TO_FILENAME = {
    'youtube.com':          'Youtube',
    'youtu.be':             'Youtube',
    'github.com':           'GitHub',
    'gitlab.com':           'GitLab',
    'reddit.com':           'Reddit',
    'old.reddit.com':       'Reddit',
    'amazon.com':           'Amazon',
    'amazon.co.uk':         'Amazon',
    'amazon.in':            'Amazon',
    'amazon.de':            'Amazon',
    'twitter.com':          'Twitter',
    'x.com':                'Twitter',
    'stackoverflow.com':    'StackOverflow',
    'stackexchange.com':    'StackOverflow',
    'wikipedia.org':        'Wikipedia',
    'en.wikipedia.org':     'Wikipedia',
    'medium.com':           'Medium',
    'linkedin.com':         'LinkedIn',
    'instagram.com':        'Instagram',
    'facebook.com':         'Facebook',
    'twitch.tv':            'Twitch',
    'vimeo.com':            'Vimeo',
    'notion.so':            'Notion',
    'figma.com':            'Figma',
    'dev.to':               'DevTo',
    'hackernews.com':       'HackerNews',
    'news.ycombinator.com': 'HackerNews',
    'pinterest.com':        'Pinterest',
    'tiktok.com':           'TikTok',
    'spotify.com':          'Spotify',
    'apple.com':            'Apple',
    'producthunt.com':      'ProductHunt',
};

/**
 * Resolve a filename from a domain string.
 * Tries an exact match first, then strips sub-domains progressively.
 * Falls back to a capitalized version of the base domain.
 *
 * @param {string} domain - Bare domain (no protocol, no www).
 * @returns {string} Display-friendly filename.
 */
function resolveFromDomain(domain) {
    if (!domain) return utils.capitalize(config.DEFAULT_BOOKMARK_TYPE);

    // Exact match
    if (DOMAIN_TO_FILENAME[domain]) return DOMAIN_TO_FILENAME[domain];

    // Strip leading sub-domains one level at a time
    const parts = domain.split('.');
    while (parts.length > 2) {
        parts.shift();
        const candidate = parts.join('.');
        if (DOMAIN_TO_FILENAME[candidate]) return DOMAIN_TO_FILENAME[candidate];
    }

    // Fallback: capitalize the second-level domain (e.g. "example" → "Example")
    const baseName = parts.length >= 2 ? parts[parts.length - 2] : domain;
    return utils.capitalize(baseName);
}

/**
 * Determine the destination filename (without extension) for a bookmark
 * using the "bookmark_type" strategy.
 *
 * @param {object} bookmark - Bookmark object from the API.
 * @returns {string} Filename.
 */
function groupByType(bookmark) {
    const type = (bookmark.bookmark_type || '').toLowerCase().trim();

    if (type && TYPE_TO_FILENAME[type]) {
        return TYPE_TO_FILENAME[type];
    }

    // Unknown type → fall back to domain-based resolution
    const domain = utils.extractDomain(bookmark.url || '');
    logger.debug(`Unknown bookmark_type "${type}", falling back to domain "${domain}"`);
    return resolveFromDomain(domain);
}

/**
 * Determine the destination filename using the "domain" strategy.
 *
 * @param {object} bookmark - Bookmark object from the API.
 * @returns {string} Filename.
 */
function groupByDomain(bookmark) {
    const domain = utils.extractDomain(bookmark.url || '');
    return resolveFromDomain(domain);
}

/**
 * Determine the destination filename using the "collection" strategy.
 * Falls back to bookmark_type if no collection is present.
 *
 * @param {object} bookmark - Bookmark object from the API.
 * @returns {string} Filename.
 */
function groupByCollection(bookmark) {
    const collections = bookmark.collections || [];
    if (Array.isArray(collections) && collections.length > 0) {
        const first = typeof collections[0] === 'string'
            ? collections[0]
            : collections[0].name || collections[0].title || '';
        if (first) {
            return utils.cleanFilename(utils.capitalize(first));
        }
    }

    // No collection available → fall back to type-based grouping
    logger.debug('No collection found, falling back to bookmark_type grouping');
    return groupByType(bookmark);
}

/**
 * Choose the destination markdown file for a bookmark.
 *
 * Returns the full vault-relative path including the configured
 * BOOKMARK_FOLDER and ".md" extension.
 *
 * @param {object} bookmark - Bookmark object returned by the API.
 * @returns {string} Vault-relative file path, e.g. "Bookmarks/Youtube.md".
 */
function getDestinationPath(bookmark) {
    const strategy = (config.GROUP_BY || 'bookmark_type').toLowerCase().trim();
    let fileName;

    switch (strategy) {
        case 'domain':
            fileName = groupByDomain(bookmark);
            break;
        case 'collection':
            fileName = groupByCollection(bookmark);
            break;
        case 'bookmark_type':
        default:
            fileName = groupByType(bookmark);
            break;
    }

    fileName = utils.cleanFilename(fileName);
    const folder = config.BOOKMARK_FOLDER || 'Bookmarks';
    const fullPath = `${folder}/${fileName}.md`;

    logger.debug(`Destination: "${fullPath}" (strategy: ${strategy})`);
    return fullPath;
}

module.exports = {
    getDestinationPath,
    // Exported for testing / extension
    TYPE_TO_FILENAME,
    DOMAIN_TO_FILENAME,
    resolveFromDomain,
};
