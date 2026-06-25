/**
 * @fileoverview General-purpose utility functions for the Bookmark Manager.
 * @description Pure helper functions with no side-effects and no dependency
 * on Obsidian or QuickAdd APIs.
 * @module utils
 */

const utils = {
    /**
     * Capitalize the first letter of a string, lowercasing the rest.
     * @param {string} str - Input string.
     * @returns {string} Capitalized string, or empty string for falsy input.
     */
    capitalize(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Convert a string to a URL-friendly slug.
     * @param {string} str - Input string.
     * @returns {string} Lowercased, hyphenated slug.
     */
    slugify(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Format an ISO-8601 date string for human-readable display.
     * @param {string} isoString          - ISO date string.
     * @param {string} [locale='en-US']   - BCP 47 locale tag.
     * @param {Intl.DateTimeFormatOptions} [options] - Override formatting options.
     * @returns {string} Formatted date, or empty string on failure.
     */
    formatDate(isoString, locale = 'en-US', options = {}) {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return '';
            const defaults = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                ...options,
            };
            return date.toLocaleDateString(locale, defaults);
        } catch {
            return '';
        }
    },

    /**
     * Validate whether a string is a well-formed HTTP(S) URL.
     * @param {string} str - String to validate.
     * @returns {boolean} True if the string is a valid http/https URL.
     */
    isValidUrl(str) {
        if (!str || typeof str !== 'string') return false;
        try {
            const url = new URL(str.trim());
            return url.protocol === 'http:' || url.protocol === 'https:';
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
        if (!str || typeof str !== 'string') return '';
        return str.replace(/([\\*_~`|[\]])/g, '\\$1');
    },

    /**
     * Sanitize a string for use as a filename on all major operating systems.
     * Strips characters invalid on Windows, macOS, Linux, Android, and iOS.
     * @param {string} str - Proposed filename.
     * @returns {string} Cleaned filename, or "Untitled" if the result is empty.
     */
    cleanFilename(str) {
        if (!str || typeof str !== 'string') return 'Untitled';
        const cleaned = str
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return cleaned || 'Untitled';
    },

    /**
     * Extract the bare domain from a URL (strips "www." prefix).
     * @param {string} url - Full URL string.
     * @returns {string} Domain name, or empty string on failure.
     */
    extractDomain(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            return new URL(url.trim()).hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    },

    /**
     * Produce a short deterministic hex hash from a string.
     * Used for bookmark markers (<!-- BOOKMARK:xxxxxxxx -->).
     * @param {string} str - Input string (typically the external_id).
     * @returns {string} 8-character hex hash.
     */
    shortHash(str) {
        if (!str) return '00000000';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
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
        for (const key of path.split('.')) {
            if (current == null || typeof current !== 'object') return defaultValue;
            current = current[key];
        }
        return current !== undefined ? current : defaultValue;
    },

    /**
     * Return the first non-empty, non-null value from a list.
     * @param {...*} values - Candidate values.
     * @returns {*} First truthy value, or null.
     */
    coalesce(...values) {
        for (const v of values) {
            if (v !== null && v !== undefined && v !== '') return v;
        }
        return null;
    },
};

module.exports = utils;
