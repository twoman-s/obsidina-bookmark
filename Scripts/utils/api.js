/**
 * @fileoverview API layer for the Bookmark Manager.
 * @description Handles all HTTP communication with the external bookmark API.
 * This module is responsible only for making requests, setting headers,
 * handling authentication, timeouts, and returning parsed JSON.
 * It must NOT contain any markdown, file, or UI logic.
 * @module api
 */

const config = require('./config');
const logger = require('./logger');

/**
 * Submit a URL to the bookmark API for metadata extraction.
 *
 * The API processes the URL synchronously — it blocks until metadata
 * extraction is complete, then returns the full bookmark object.
 * No polling is required.
 *
 * @param {string} url - The URL to bookmark.
 * @returns {Promise<object>} Resolved bookmark object from the API.
 * @throws {Error} On missing config, network failure, timeout, or bad response.
 */
async function submitBookmark(url) {
    const endpoint = config.API_URL;
    const token = config.API_TOKEN;
    const timeout = config.API_TIMEOUT || 120000;

    if (!endpoint) {
        throw new Error('API_URL is not configured. Please update config.js.');
    }
    // if (!token) {
    //     throw new Error('API_TOKEN is not configured. Please update config.js.');
    // }

    const body = JSON.stringify({ url });
    logger.request('POST', endpoint, { url });

    // Set up abort controller for timeout (supported in Electron & mobile WebView)
    let controller = null;
    let timeoutId = null;

    if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeout);
    }

    try {
        /** @type {RequestInit} */
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Token ${token}`,
            },
            body,
        };

        if (controller) {
            fetchOptions.signal = controller.signal;
        }

        const response = await fetch(endpoint, fetchOptions);

        if (timeoutId) clearTimeout(timeoutId);

        logger.response(response.status);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'No details');
            throw new Error(
                `API error ${response.status}: ${errorBody}`
            );
        }

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error('API returned invalid JSON.');
        }

        if (!data || typeof data !== 'object') {
            throw new Error('API returned an empty or malformed response.');
        }

        logger.response(response.status, data);
        return data;
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error(
                `API request timed out after ${Math.round(timeout / 1000)}s.`
            );
        }

        // Re-throw errors we already formatted
        if (error.message.startsWith('API')) throw error;

        // Wrap unexpected / network errors
        throw new Error(`Network error: ${error.message}`);
    }
}

module.exports = { submitBookmark };
