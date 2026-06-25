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
 * Resolve a filename from a domain string by extracting the base name.
 * For example, "github.com" -> "Github", "abc.com" -> "Abc"
 *
 * @param {string} domain - Bare domain (no protocol, no www).
 * @returns {string} Display-friendly filename.
 */
function resolveFromDomain(domain) {
    if (!domain) return utils.capitalize(config.DEFAULT_BOOKMARK_TYPE);

    const parts = domain.split('.');
    // Extract the second-level domain (e.g. "abc" from "abc.com")
    const baseName = parts.length >= 2 ? parts[parts.length - 2] : domain;
    return utils.capitalize(baseName);
}

/**
 * Choose the destination markdown file for a bookmark.
 *
 * Returns the full vault-relative path including the configured
 * BOOKMARK_FOLDER and ".md" extension.
 *
 * @param {object} bookmark - Bookmark object returned by the API.
 * @returns {string} Vault-relative file path, e.g. "Bookmarks/Github.md".
 */
function getDestinationPath(bookmark) {
    const domain = utils.extractDomain(bookmark.url || '');
    let fileName = resolveFromDomain(domain);

    fileName = utils.cleanFilename(fileName);
    const folder = config.BOOKMARK_FOLDER || 'Bookmarks';
    const fullPath = `${folder}/${fileName}.md`;

    logger.debug(`Destination: "${fullPath}" (domain: ${domain})`);
    return fullPath;
}

module.exports = {
    getDestinationPath,
    resolveFromDomain,
};
