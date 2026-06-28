const logger = require('../utils/logger');
const parser = require('./parser');

function buildBlockRegex(link) {
    const escaped = link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(
        `<!-- BUCKETLIST:${escaped} -->[\\s\\S]*?<!-- END BUCKETLIST -->`,
        'g'
    );
}

function itemExists(content, link) {
    if (!content || !link) return false;
    return buildBlockRegex(link).test(content);
}

async function upsertBucketlist(fileManager, filePath, data) {
    const link = data.link;
    if (!link) {
        throw new Error('Data is missing link — cannot upsert.');
    }

    const newBlock = parser.generateMarkdown(data);
    let content = '';
    let action;

    if (fileManager.fileExists(filePath)) {
        content = await fileManager.readFile(filePath);
    }

    if (itemExists(content, link)) {
        logger.upsert('UPDATE', link, filePath);
        const regex = buildBlockRegex(link);
        
        // Preserve checkbox state
        const match = content.match(regex);
        if (match && match[0].includes('- [x]')) {
            data.isChecked = true;
        }

        const newBlock = parser.generateMarkdown(data);
        content = content.replace(regex, newBlock);
        action = 'updated';
    } else {
        logger.upsert('INSERT', link, filePath);
        if (content.trim().length > 0) {
            content = content.trimEnd() + '\n\n' + newBlock + '\n';
        } else {
            content = newBlock + '\n';
        }
        action = 'created';
    }

    await fileManager.writeFile(filePath, content);
    return { action };
}

module.exports = {
    upsertBucketlist,
    itemExists
};
