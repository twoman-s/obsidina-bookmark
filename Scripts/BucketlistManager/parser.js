const config = require('../utils/config');
const utils = require('../utils/utils');
const logger = require('../utils/logger');

function generateMarkdown(data) {
    const name = data.name || 'Unknown Location';
    const link = data.link || '#';
    const reviewsUrl = data.reviews_url || '#';
    const photos = data.photos && data.photos.length > 0 ? data.photos : (data.thumbnail ? [data.thumbnail] : []);
    
    // Create the images HTML
    let photosHtml = '';
    if (photos.length > 0) {
        const imagesStr = photos.map(url => `<img src="${url}" alt="Photo of ${name}" loading="lazy" referrerpolicy="no-referrer" />`).join('');
        photosHtml = `
<div class="bucketlist-carousel-wrapper">
    <div class="bucketlist-carousel">
        ${imagesStr}
    </div>
</div>`;
    }

    // Build the full card HTML
    const checked = data.isChecked ? 'x' : ' ';
    const completedClass = data.isChecked ? ' bucketlist-completed' : '';
    const html = `
- [${checked}] **${name}**
<div class="bucketlist-card${completedClass}">
    ${photosHtml}
    <div class="bucketlist-details">
        <h3><a href="${link}" target="_blank" rel="noopener">${name}</a></h3>
        <a href="${link}" class="bucketlist-main-btn" target="_blank">View on Maps</a>
    </div>
</div>
`;

    // Ensure there is an empty line before and after for proper markdown rendering
    return `\n${html.trim()}\n`;
}

module.exports = {
    generateMarkdown
};
