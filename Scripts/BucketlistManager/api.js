const config = require('../utils/config');
const logger = require('../utils/logger');

async function scrapeBucketlist(url) {
    if (!url) {
        throw new Error('URL is required for scraping');
    }

    const payload = {
        url: url,
        headless: true,
        lang: "en"
    };

    const apiUrl = config.BUCKETLIST_API_URL || "http://127.0.0.1:8001/scrape";
    
    logger.debug(`Sending scrape request to ${apiUrl}`, payload);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logger.error('Scrape API error:', error);
        throw error;
    }
}

module.exports = {
    scrapeBucketlist
};
