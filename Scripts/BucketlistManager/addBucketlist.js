const config   = require('../utils/config');
const logger   = require('../utils/logger');
const utils    = require('../utils/utils');
const api      = require('./api');
const updater  = require('./updater');
const { createFileManager } = require('../utils/fileManager');

function notice(message, duration = 4000) {
    if (config.SHOW_NOTICES && typeof Notice !== 'undefined') {
        new Notice(message, duration);
    }
    logger.info(message);
}

function errorNotice(message, duration = 6000) {
    if (typeof Notice !== 'undefined') {
        new Notice(`❌ ${message}`, duration);
    }
    logger.error(message);
}

async function addBucketlist(params) {
    const { app, quickAddApi } = params;

    try {
        // Prompt for URL explicitly
        const prompted = await quickAddApi.inputPrompt(
            'Enter Google Maps URL for Bucketlist',
            'https://maps.app.goo.gl/...',
            ''
        );

        if (!prompted || !prompted.trim()) {
            notice('Bucketlist cancelled — no URL provided.');
            return;
        }

        const url = prompted.trim();

        if (!utils.isValidUrl(url)) {
            errorNotice('Invalid URL. Please enter a valid http/https URL.');
            return;
        }

        logger.info('Processing URL:', url);
        notice('📡 Fetching from Maps...');

        let data;
        try {
            data = await api.scrapeBucketlist(url);
        } catch (apiError) {
            errorNotice(`API unavailable: ${apiError.message}`);
            return;
        }

        if (!data || !data.link) {
            errorNotice('API returned invalid data (missing link).');
            return;
        }

        logger.debug('Data received:', data.name);

        const fm = createFileManager(app);
        const folder = config.BUCKETLIST_FOLDER || 'Bucketlist';
        await fm.ensureFolder(folder);

        // For bucketlists, we save everything centrally into googlemaps.md
        const filePath = `${folder}/googlemaps.md`;
        logger.info('Destination:', filePath);

        notice('📝 Saving bucketlist item…');
        const { action } = await updater.upsertBucketlist(fm, filePath, data);

        const title = data.name || 'Untitled';
        if (action === 'updated') {
            notice(`🔄 Updated: ${title}`);
        } else {
            notice(`✅ Created: ${title}`);
        }

    } catch (error) {
        errorNotice(`Unexpected error: ${error.message}`);
        logger.error('Unhandled error:', error);
    }
}

module.exports = addBucketlist;
